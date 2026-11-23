#!/usr/bin/env bash
# Build a flashable USB disk image for Tri-Cass OS (tree path: portable-ai-os/).
# Default: MBR + extlinux (BIOS / CSM) — proven v1 path.
# Opt-in HAP-64: ENABLE_UEFI=1 adds GPT ESP with dual-signed shim+GRUB and keeps BIOS.
# Usage: bash scripts/build-usb-image.sh [x86_64|i686]
#        ENABLE_UEFI=1 bash scripts/build-usb-image.sh x86_64
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ARCH="${1:-x86_64}"
OUT_DIR="${PORTABLE_AI_IMAGE_DIR:-/agent/portable-ai-os-images}"
WORK="${PORTABLE_AI_BUILD_ROOT:-/tmp/portable-ai-os-build}/usb-${ARCH}"
# virtual/686 kernel avoids huge linux-firmware blobs; leave room for SmolLM2 + AI_DATA
SIZE_MB="${IMAGE_SIZE_MB:-3072}"
ENABLE_UEFI="${ENABLE_UEFI:-0}"

case "$ARCH" in
  x86_64|amd64)
    DEB_ARCH=amd64
    QEMU_BIN=qemu-system-x86_64
    LINUX_PKG="linux-image-virtual"
    SUITE="${DEBOOTSTRAP_SUITE:-noble}"
    MIRROR="${DEBOOTSTRAP_MIRROR:-http://archive.ubuntu.com/ubuntu}"
    RUNTIME_BIN_SRC="${PORTABLE_AI_RUNTIME:-/agent/portable-ai-os-runtime}/bin"
    ;;
  i686|i386)
    # Ubuntu dropped full i386 kernels; use Debian bookworm for true 32-bit XP-era boxes
    DEB_ARCH=i386
    QEMU_BIN=qemu-system-i386
    LINUX_PKG="linux-image-686"
    SUITE="${DEBOOTSTRAP_SUITE:-bookworm}"
    MIRROR="${DEBOOTSTRAP_MIRROR:-http://deb.debian.org/debian}"
    RUNTIME_BIN_SRC="${PORTABLE_AI_RUNTIME:-/agent/portable-ai-os-runtime}/bin-i686"
    ;;
  *) echo "arch must be x86_64 or i686" >&2; exit 1 ;;
esac

IMG="$OUT_DIR/portable-ai-os-${ARCH}.img"
mkdir -p "$OUT_DIR" "$WORK"
echo "==> Building $IMG (${SIZE_MB}MB, $DEB_ARCH, suite=$SUITE)"

need() { command -v "$1" >/dev/null || { echo "missing $1" >&2; exit 1; }; }
need debootstrap
need sfdisk
need mkfs.ext4
need extlinux
need losetup
need rsync

if [[ "$ENABLE_UEFI" == "1" ]]; then
  if [[ "$DEB_ARCH" != "amd64" ]]; then
    echo "ENABLE_UEFI=1 is x86_64/amd64 only (i686 stays BIOS)" >&2
    exit 1
  fi
  need mkfs.vfat
  if [[ ! -d "$ROOT/build/uefi/vendor/esp-binaries" ]]; then
    echo "UEFI vendor binaries missing — run: bash $ROOT/scripts/fetch-uefi-shim.sh" >&2
    exit 1
  fi
  echo "==> HAP-64 UEFI+Secure Boot path enabled (BIOS extlinux retained)"
fi

# Ensure llama + rescue model exist on host for bundling
RUNTIME="${PORTABLE_AI_RUNTIME:-/agent/portable-ai-os-runtime}"
if [[ ! -x "$RUNTIME_BIN_SRC/llama-server" ]]; then
  if [[ "$DEB_ARCH" == "i386" ]]; then
    echo "ERROR: missing i686 llama at $RUNTIME_BIN_SRC — build with -m32 first" >&2
    exit 1
  fi
  echo "Building llama.cpp into runtime..."
  if [[ "${LLAMA_BUILD_ALL_VARIANTS:-0}" == "1" ]]; then
    bash "$ROOT/scripts/build-llama-all-variants.sh"
  else
    bash "$ROOT/scripts/build-llama.sh"
  fi
  RUNTIME_BIN_SRC="$RUNTIME/bin"
fi
if ! ls "$RUNTIME/models"/SmolLM2*.gguf >/dev/null 2>&1; then
  echo "Downloading rescue models..."
  PORTABLE_AI_MODELS="$RUNTIME/models" bash "$ROOT/scripts/download-models.sh" rescue
fi

# --- create sparse image + partitions ---
rm -f "$IMG"
dd if=/dev/zero of="$IMG" bs=1M count=0 seek="$SIZE_MB" status=none
DATA_MB=384
ESP_MB=256
if [[ "$ENABLE_UEFI" == "1" ]]; then
  # GPT: ESP + root + AI_DATA (HAP-64). BIOS still uses extlinux on root + hybrid MBR.
  ESP_SECTORS=$(( ESP_MB * 1024 * 1024 / 512 ))
  DATA_SECTORS=$(( DATA_MB * 1024 * 1024 / 512 ))
  ROOT_SECTORS=$(( (SIZE_MB - ESP_MB - DATA_MB) * 1024 * 1024 / 512 ))
  ESP_START=2048
  ROOT_START=$(( ESP_START + ESP_SECTORS ))
  DATA_START=$(( ROOT_START + ROOT_SECTORS ))
  sfdisk "$IMG" <<EOF
label: gpt
unit: sectors
start=$ESP_START, size=$ESP_SECTORS, type=C12A7328-F81F-11D2-BA4B-00A0C93EC93B, name=TRI_CASS_ESP
start=$ROOT_START, size=$ROOT_SECTORS, type=0FC63DAF-8483-4772-8E79-3D69D8477DE4, name=AI_SYS, bootable
start=$DATA_START, size=$DATA_SECTORS, type=0FC63DAF-8483-4772-8E79-3D69D8477DE4, name=AI_DATA
EOF
else
  # MBR: p1 root (most of disk), p2 AI_DATA (~384MB) — sector math for SIZE_MB
  ROOT_SECTORS=$(( (SIZE_MB - DATA_MB) * 1024 * 1024 / 512 ))
  sfdisk "$IMG" <<EOF
label: dos
unit: sectors
start=2048, size=$ROOT_SECTORS, type=83, bootable
start=$((2048 + ROOT_SECTORS)), type=83
EOF
fi

LOOP=$(sudo losetup -f --show -P "$IMG")
echo "Loop: $LOOP"
# Ensure partition nodes exist (some kernels need partx after -P)
sudo partx -u "$LOOP" 2>/dev/null || sudo partx -a "$LOOP" 2>/dev/null || true
sudo kpartx -av "$LOOP" 2>/dev/null || true
cleanup() {
  sync || true
  sudo umount "$WORK/mnt/efi" 2>/dev/null || true
  sudo umount "$WORK/mnt/data" 2>/dev/null || true
  sudo umount "$WORK/mnt/dev/pts" 2>/dev/null || true
  sudo umount "$WORK/mnt/dev" 2>/dev/null || true
  sudo umount "$WORK/mnt/proc" 2>/dev/null || true
  sudo umount "$WORK/mnt/sys" 2>/dev/null || true
  sudo umount "$WORK/mnt" 2>/dev/null || true
  sudo kpartx -d "$LOOP" 2>/dev/null || true
  sudo partx -d "$LOOP" 2>/dev/null || true
  sudo losetup -d "$LOOP" 2>/dev/null || true
}
trap cleanup EXIT

# Resolve partition device paths (loopNp1 or mapper/loopNp1)
resolve_part() {
  local n="$1"
  local p="${LOOP}p${n}"
  if [[ ! -b "$p" ]]; then
    local base
    base=$(basename "$LOOP")
    p="/dev/mapper/${base}p${n}"
  fi
  echo "$p"
}

if [[ "$ENABLE_UEFI" == "1" ]]; then
  P_ESP="$(resolve_part 1)"
  P_ROOT="$(resolve_part 2)"
  P_DATA="$(resolve_part 3)"
else
  P_ESP=""
  P_ROOT="$(resolve_part 1)"
  P_DATA="$(resolve_part 2)"
fi
P1="$P_ROOT"
P2="$P_DATA"
for i in $(seq 1 30); do
  if [[ "$ENABLE_UEFI" == "1" ]]; then
    [[ -b "$P_ESP" && -b "$P_ROOT" && -b "$P_DATA" ]] && break
  else
    [[ -b "$P_ROOT" && -b "$P_DATA" ]] && break
  fi
  sleep 0.2
done
if [[ "$ENABLE_UEFI" == "1" ]]; then
  [[ -b "$P_ESP" && -b "$P_ROOT" && -b "$P_DATA" ]] || {
    echo "partition devices missing: $P_ESP $P_ROOT $P_DATA" >&2
    ls -l ${LOOP}* /dev/mapper/"$(basename "$LOOP")"* 2>/dev/null || true
    exit 1
  }
  echo "Partitions: ESP=$P_ESP ROOT=$P_ROOT DATA=$P_DATA"
  sudo mkfs.vfat -F32 -n TRI_CASS_ESP "$P_ESP"
else
  [[ -b "$P_ROOT" && -b "$P_DATA" ]] || {
    echo "partition devices missing: $P_ROOT $P_DATA" >&2
    exit 1
  }
  echo "Partitions: ROOT=$P_ROOT DATA=$P_DATA"
fi
sudo mkfs.ext4 -F -L AI_SYS "$P_ROOT"
sudo mkfs.ext4 -F -L AI_DATA "$P_DATA"

mkdir -p "$WORK/mnt"
sudo mount "$P_ROOT" "$WORK/mnt"
sudo mkdir -p "$WORK/mnt/data"
sudo mount "$P_DATA" "$WORK/mnt/data"
if [[ "$ENABLE_UEFI" == "1" ]]; then
  sudo mkdir -p "$WORK/mnt/efi"
  sudo mount "$P_ESP" "$WORK/mnt/efi"
fi

# --- debootstrap ---
CACHE="$WORK/debootstrap-cache"
mkdir -p "$CACHE"
echo "==> debootstrap $SUITE/$DEB_ARCH"
if [[ "$DEB_ARCH" == "i386" ]]; then
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq qemu-user-static binfmt-support 2>/dev/null || true
  sudo debootstrap --arch="$DEB_ARCH" --variant=minbase --components=main,universe \
    "$SUITE" "$WORK/mnt" "$MIRROR"
else
  sudo debootstrap --arch="$DEB_ARCH" --variant=minbase --components=main,universe \
    "$SUITE" "$WORK/mnt" "$MIRROR"
fi

# apt sources
if [[ "$SUITE" == "bookworm" ]]; then
  sudo tee "$WORK/mnt/etc/apt/sources.list" >/dev/null <<EOF
deb $MIRROR $SUITE main contrib
deb http://security.debian.org/debian-security $SUITE-security main contrib
deb $MIRROR $SUITE-updates main contrib
EOF
else
  sudo tee "$WORK/mnt/etc/apt/sources.list" >/dev/null <<EOF
deb $MIRROR $SUITE main universe
deb $MIRROR $SUITE-updates main universe
deb $MIRROR $SUITE-security main universe
EOF
fi

# Bind mounts for chroot
sudo mkdir -p "$WORK/mnt/dev/pts"
sudo mount --bind /dev "$WORK/mnt/dev"
sudo mount -t devpts devpts "$WORK/mnt/dev/pts" 2>/dev/null || true
sudo mount -t proc proc "$WORK/mnt/proc"
sudo mount -t sysfs sys "$WORK/mnt/sys"

# Install packages inside — keep lean (no linux-firmware mega set)
sudo chroot "$WORK/mnt" /bin/bash -c "
set -e
export DEBIAN_FRONTEND=noninteractive
export LC_ALL=C
apt-get update -qq
apt-get install -y -qq --no-install-recommends \
  $LINUX_PKG initramfs-tools \
  systemd systemd-sysv \
  python3 python3-minimal curl ca-certificates \
  libstdc++6 sudo \
  extlinux syslinux-common \
  iproute2 e2fsprogs
# Ensure initrd exists (virtual metapackage may not generate it alone)
KVER=\$(ls /lib/modules | head -1)
update-initramfs -c -k \"\$KVER\" || update-initramfs -u -k all || true
apt-get clean
rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*.deb
df -h /
ls -la /boot
"

# fstab
ROOT_UUID=$(sudo blkid -s UUID -o value "$P1")
DATA_UUID=$(sudo blkid -s UUID -o value "$P2")
sudo tee "$WORK/mnt/etc/fstab" >/dev/null <<EOF
UUID=$ROOT_UUID / ext4 defaults,noatime 0 1
UUID=$DATA_UUID /data ext4 defaults,noatime 0 2
proc /proc proc defaults 0 0
sysfs /sys sysfs defaults 0 0
EOF

# Hostname + hosts
echo "portable-ai-os" | sudo tee "$WORK/mnt/etc/hostname" >/dev/null
sudo tee "$WORK/mnt/etc/hosts" >/dev/null <<EOF
127.0.0.1 localhost portable-ai-os
::1 localhost
EOF

# Root password empty / autologin on tty1
sudo chroot "$WORK/mnt" /bin/bash -c "passwd -d root"

# Payload
sudo mkdir -p "$WORK/mnt/opt/portable-ai-os/runtime/"{bin,models} \
  "$WORK/mnt/data/"{config,models,memory,images,logs,knowledge/raw,notes,projects}
# Branding alias (keep portable-ai-os path for compatibility)
sudo ln -sfn /opt/portable-ai-os "$WORK/mnt/opt/nexus-os"
sudo rsync -a --exclude 'models/*.gguf' --exclude 'build/alpine' \
  "$ROOT"/catalog "$ROOT"/configs "$ROOT"/tui "$ROOT"/scripts "$ROOT"/docs \
  "$ROOT"/knowledge "$ROOT"/projects "$ROOT"/assets \
  "$ROOT"/versions.lock "$ROOT"/README.md "$ROOT"/LICENSE \
  "$WORK/mnt/opt/portable-ai-os/"
# Runtime bins (arch-matched) + rescue models only (keep image small)
sudo rsync -a "$RUNTIME_BIN_SRC/" "$WORK/mnt/opt/portable-ai-os/runtime/bin/"
# Bundle SmolLM2 (+ optional Qwen 0.5B if IMAGE_BUNDLE_MORE=1)
for f in "$RUNTIME/models"/SmolLM2*.gguf; do
  [[ -f "$f" ]] && sudo cp -a "$f" "$WORK/mnt/opt/portable-ai-os/runtime/models/"
done
if [[ "${IMAGE_BUNDLE_MORE:-0}" == "1" ]]; then
  for f in "$RUNTIME/models"/Qwen2.5-0.5B*.gguf; do
    [[ -f "$f" ]] && sudo cp -a "$f" "$WORK/mnt/opt/portable-ai-os/runtime/models/"
  done
fi
sudo cp -f "$ROOT/catalog/catalog.json" "$WORK/mnt/opt/portable-ai-os/runtime/models/catalog.json"
sudo cp -f "$ROOT/catalog/catalog.json" "$WORK/mnt/data/models/catalog.json"
sudo cp -f "$ROOT/configs/ui.toml" "$WORK/mnt/data/config/ui.toml"
sudo cp -f "$ROOT/configs/model-policy.toml" "$WORK/mnt/data/config/model-policy.toml"
# Knowledge Vault starter pack → AI_DATA (users can add more later)
if [[ -d "$ROOT/knowledge/starter" ]]; then
  sudo mkdir -p "$WORK/mnt/data/knowledge/raw"
  sudo cp -a "$ROOT/knowledge/starter/"*.md "$WORK/mnt/data/knowledge/raw/" 2>/dev/null || true
fi
# Record which llama arch was baked
file "$WORK/mnt/opt/portable-ai-os/runtime/bin/llama-server" | sudo tee "$WORK/mnt/opt/portable-ai-os/runtime/LLAMA_FILE.txt" >/dev/null

# env defaults for scripts on stick
sudo tee "$WORK/mnt/etc/profile.d/portable-ai.sh" >/dev/null <<'EOF'
export PORTABLE_AI_ROOT=/opt/portable-ai-os
export PORTABLE_AI_RUNTIME=/opt/portable-ai-os/runtime
export PORTABLE_AI_MODELS=/opt/portable-ai-os/runtime/models
export AI_DATA=/data
export LD_LIBRARY_PATH=/opt/portable-ai-os/runtime/bin:${LD_LIBRARY_PATH:-}
export PATH=/opt/portable-ai-os/runtime/bin:$PATH
EOF
sudo chmod +x "$WORK/mnt/opt/portable-ai-os/scripts/"*.sh || true
sudo chmod +x "$WORK/mnt/opt/portable-ai-os/scripts/guest-autostart.sh"
sudo chmod +x "$WORK/mnt/opt/portable-ai-os/tui/"*.py || true
sudo chmod +x "$WORK/mnt/opt/portable-ai-os/runtime/bin/"* || true

# systemd: getty autologin + portable-ai service
sudo mkdir -p "$WORK/mnt/etc/systemd/system/getty@tty1.service.d"
sudo tee "$WORK/mnt/etc/systemd/system/getty@tty1.service.d/override.conf" >/dev/null <<'EOF'
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin root --noclear %I \$TERM
EOF

sudo tee "$WORK/mnt/etc/systemd/system/portable-ai.service" >/dev/null <<'EOF'
[Unit]
Description=Tri-Cass OS Hub TUI
After=local-fs.target
Wants=network-pre.target

[Service]
Type=idle
Environment=PORTABLE_AI_ROOT=/opt/portable-ai-os
Environment=PORTABLE_AI_RUNTIME=/opt/portable-ai-os/runtime
Environment=PORTABLE_AI_MODELS=/opt/portable-ai-os/runtime/models
Environment=AI_DATA=/data
Environment=LD_LIBRARY_PATH=/opt/portable-ai-os/runtime/bin
Environment=N_CTX=512
Environment=N_THREADS=1
WorkingDirectory=/opt/portable-ai-os
ExecStartPre=-/bin/bash -c '/opt/portable-ai-os/scripts/start-infer.sh || true'
ExecStart=/opt/portable-ai-os/scripts/guest-autostart.sh
Restart=on-failure
RestartSec=2
StandardInput=tty
StandardOutput=tty
StandardError=tty
TTYPath=/dev/tty1
TTYReset=yes
TTYVHangup=yes

[Install]
WantedBy=multi-user.target
EOF

sudo chroot "$WORK/mnt" /bin/bash -c "systemctl enable portable-ai.service getty@tty1.service"

# Also drop a login shell helper
sudo tee "$WORK/mnt/root/.profile" >/dev/null <<'EOF'
# If TUI service not active, offer start
if [ -z "$PORTABLE_AI_TUI" ] && [ "$(tty)" = "/dev/tty1" ]; then
  export PORTABLE_AI_TUI=1
  exec /opt/portable-ai-os/scripts/guest-autostart.sh
fi
EOF

# --- bootloader: extlinux on root ---
sudo mkdir -p "$WORK/mnt/boot/extlinux"
# Find kernel/initrd
KERNEL=$(sudo chroot "$WORK/mnt" bash -c 'ls -1 /boot/vmlinuz-* 2>/dev/null | grep -v '\''.old'\'' | head -1')
INITRD=$(sudo chroot "$WORK/mnt" bash -c 'ls -1 /boot/initrd.img-* 2>/dev/null | grep -v '\''.old'\'' | head -1')
KVER=$(basename "$KERNEL" | sed 's/vmlinuz-//')
echo "Kernel=$KERNEL Initrd=$INITRD"
if [[ -z "$INITRD" || "$INITRD" == "ls:"* ]]; then
  echo "ERROR: initrd missing after build" >&2
  sudo chroot "$WORK/mnt" ls -la /boot >&2 || true
  exit 1
fi
INITRD_BASE=$(basename "$INITRD")

sudo tee "$WORK/mnt/boot/extlinux/extlinux.conf" >/dev/null <<EOF
DEFAULT portable-ai
PROMPT 1
TIMEOUT 20

LABEL portable-ai
  MENU LABEL Tri-Cass OS
  LINUX /boot/vmlinuz-$KVER
  INITRD /boot/$INITRD_BASE
  APPEND root=UUID=$ROOT_UUID rw quiet console=tty0 console=ttyS0,115200n8
EOF

# Install extlinux into the partition + MBR (kept for BIOS/CSM even with UEFI)
sudo extlinux --install "$WORK/mnt/boot/extlinux"
# dd MBR (also written on GPT images as a hybrid protective/legacy boot aid)
MBR_BIN=""
for c in /usr/lib/EXTLINUX/mbr.bin /usr/lib/syslinux/mbr/mbr.bin /usr/lib/syslinux/mbr.bin; do
  [[ -f "$c" ]] && MBR_BIN="$c" && break
done
[[ -n "$MBR_BIN" ]] || { echo "mbr.bin not found" >&2; exit 1; }
sudo dd if="$MBR_BIN" of="$LOOP" bs=440 count=1 conv=notrunc status=none

BOOT_NOTE="BIOS/MBR extlinux"
if [[ "$ENABLE_UEFI" == "1" ]]; then
  bash "$ROOT/scripts/install-uefi-esp.sh" "$WORK/mnt/efi"
  # Symlink-friendly names for GRUB search of vmlinuz/initrd
  sudo ln -sfn "vmlinuz-$KVER" "$WORK/mnt/boot/vmlinuz"
  sudo ln -sfn "$INITRD_BASE" "$WORK/mnt/boot/initrd.img"
  BOOT_NOTE="UEFI shim+GRUB (Secure Boot) + BIOS/MBR extlinux"
fi

# Unmount binds before finishing
sudo umount "$WORK/mnt/dev/pts" || true
sudo umount "$WORK/mnt/dev" || true
sudo umount "$WORK/mnt/proc" || true
sudo umount "$WORK/mnt/sys" || true
sudo umount "$WORK/mnt/efi" 2>/dev/null || true
sudo umount "$WORK/mnt/data" || true
sudo umount "$WORK/mnt" || true
sudo kpartx -d "$LOOP" 2>/dev/null || true
sudo partx -d "$LOOP" 2>/dev/null || true
sudo losetup -d "$LOOP"
trap - EXIT

sync
# Checksums
(cd "$OUT_DIR" && sha256sum "$(basename "$IMG")" > "SHA256SUMS-${ARCH}")
# Also write store-side pointer
STORE_IMG_DIR="$ROOT/build/images"
mkdir -p "$STORE_IMG_DIR"
cp -f "$OUT_DIR/SHA256SUMS-${ARCH}" "$STORE_IMG_DIR/"
cat > "$STORE_IMG_DIR/ARTIFACT-${ARCH}.txt" <<EOF
artifact=$IMG
arch=$ARCH
size_mb=$SIZE_MB
sha256=$(cut -d' ' -f1 "$OUT_DIR/SHA256SUMS-${ARCH}")
built=$(date -u +%Y-%m-%dT%H:%M:%SZ)
bundled_models=$(ls "$RUNTIME/models"/SmolLM2*.gguf 2>/dev/null | xargs -n1 basename | tr '\n' ' ')
boot=$BOOT_NOTE
enable_uefi=$ENABLE_UEFI
persistence=AI_DATA (ext4 LABEL)
EOF

# Optional xz (keep original for QEMU)
if [[ "${XZ_IMAGE:-0}" == "1" ]]; then
  echo "==> xz compress"
  xz -T0 -k -f -e -6 "$IMG"
fi

ls -lh "$IMG" "$OUT_DIR/SHA256SUMS-${ARCH}"
echo "==> Flashable image ready: $IMG"
echo "    dd if=$IMG of=/dev/sdX bs=4M status=progress conv=fsync"
echo "    Test: bash $ROOT/scripts/test-usb-qemu.sh $ARCH"
