#!/usr/bin/env bash
# Build a flashable Tri-Cass OS disk image for Raspberry Pi (aarch64).
# Layout: p1 bootfs (FAT) + p2 AI_SYS (ext4) + p3 AI_DATA (ext4)
#
# Usage (on an x86_64 builder with sudo + qemu-user-static):
#   bash scripts/build-rpi-image.sh aarch64
#
# Status: scaffold — run on hub-shell / image builder, not the website-only VM.
# Do not publish Download links until QEMU or hardware smoke passes.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ARCH="${1:-aarch64}"
OUT_DIR="${PORTABLE_AI_IMAGE_DIR:-/agent/portable-ai-os-images}"
WORK="${PORTABLE_AI_BUILD_ROOT:-/tmp/portable-ai-os-build}/rpi-${ARCH}"
SIZE_MB="${IMAGE_SIZE_MB:-4096}"
BOOT_MB="${BOOT_SIZE_MB:-512}"
DATA_MB="${DATA_SIZE_MB:-1024}"

case "$ARCH" in
  aarch64|arm64)
    DEB_ARCH=arm64
    SUITE="${DEBOOTSTRAP_SUITE:-bookworm}"
    MIRROR="${DEBOOTSTRAP_MIRROR:-http://deb.debian.org/debian}"
    RUNTIME_BIN_SRC="${PORTABLE_AI_RUNTIME:-/agent/portable-ai-os-runtime}/bin-aarch64"
    IMG_NAME="portable-ai-os-aarch64.img"
    ;;
  *)
    echo "arch must be aarch64 (Pi 3/4/5 64-bit). armhf = later track." >&2
    exit 1
    ;;
esac

IMG="$OUT_DIR/$IMG_NAME"
mkdir -p "$OUT_DIR" "$WORK"

need() { command -v "$1" >/dev/null || { echo "missing $1" >&2; exit 1; }; }
need debootstrap
need sfdisk
need mkfs.ext4
need mkfs.vfat
need losetup
need rsync
need qemu-aarch64-static

RUNTIME="${PORTABLE_AI_RUNTIME:-/agent/portable-ai-os-runtime}"
if [[ ! -x "$RUNTIME_BIN_SRC/llama-server" ]]; then
  echo "ERROR: missing aarch64 llama at $RUNTIME_BIN_SRC" >&2
  echo "Build with: CROSS=aarch64 bash scripts/build-llama.sh   # (extend script) or chroot build" >&2
  exit 1
fi
if ! ls "$RUNTIME/models"/SmolLM2*.gguf >/dev/null 2>&1; then
  echo "Downloading rescue models..."
  PORTABLE_AI_MODELS="$RUNTIME/models" bash "$ROOT/scripts/download-models.sh" rescue
fi

echo "==> Building $IMG (${SIZE_MB}MB, $DEB_ARCH, suite=$SUITE)"
echo "==> NOTE: This scaffold creates partitions + debootstrap; firmware/cmdline must be verified on hardware or qemu."

rm -f "$IMG"
dd if=/dev/zero of="$IMG" bs=1M count=0 seek="$SIZE_MB" status=none

# GPT-friendly DOS label still works on Pi with firmware; use MBR for Imager familiarity.
BOOT_SECTORS=$(( BOOT_MB * 1024 * 1024 / 512 ))
DATA_SECTORS=$(( DATA_MB * 1024 * 1024 / 512 ))
# p1 boot, p2 root, p3 data
sfdisk "$IMG" <<EOF
label: dos
unit: sectors
start=8192, size=$BOOT_SECTORS, type=c, bootable
start=$((8192 + BOOT_SECTORS)), size=$(( (SIZE_MB * 1024 * 1024 / 512) - 8192 - BOOT_SECTORS - DATA_SECTORS )), type=83
start=$((8192 + BOOT_SECTORS + ( (SIZE_MB * 1024 * 1024 / 512) - 8192 - BOOT_SECTORS - DATA_SECTORS) )), type=83
EOF

LOOP=$(sudo losetup -f --show "$IMG")
echo "Loop: $LOOP"
sudo partx -u "$LOOP" 2>/dev/null || sudo partx -a "$LOOP" 2>/dev/null || true
sudo kpartx -av "$LOOP" 2>/dev/null || true
cleanup() {
  sync || true
  sudo umount "$WORK/mnt/boot" 2>/dev/null || true
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

P1="${LOOP}p1"
P2="${LOOP}p2"
P3="${LOOP}p3"
if [[ ! -b "$P1" ]]; then
  base=$(basename "$LOOP")
  P1="/dev/mapper/${base}p1"
  P2="/dev/mapper/${base}p2"
  P3="/dev/mapper/${base}p3"
fi
for i in $(seq 1 50); do
  [[ -b "$P1" && -b "$P2" && -b "$P3" ]] && break
  sleep 0.2
done
[[ -b "$P1" && -b "$P2" && -b "$P3" ]] || {
  echo "partition devices missing: $P1 $P2 $P3" >&2
  ls -l ${LOOP}* /dev/mapper/$(basename "$LOOP")* 2>/dev/null || true
  exit 1
}
echo "Partitions: $P1 $P2 $P3"

# Host kernel may lack vfat — format FAT now, populate via mtools at the end.
sudo mkfs.vfat -F 32 -n bootfs "$P1"
sudo mkfs.ext4 -F -L AI_SYS "$P2"
sudo mkfs.ext4 -F -L AI_DATA "$P3"

mkdir -p "$WORK/mnt"
sudo mount "$P2" "$WORK/mnt"
# /boot stays on AI_SYS during bake (staging); copied to FAT before finalize.
sudo mkdir -p "$WORK/mnt/boot" "$WORK/mnt/data"
sudo mount "$P3" "$WORK/mnt/data"
need mcopy
need mmd

echo "==> debootstrap $SUITE/$DEB_ARCH (qemu-user)"
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  qemu-user-static binfmt-support debian-archive-keyring 2>/dev/null || true
# Ensure binfmt registered (cloud VMs often lack systemd-binfmt)
if [[ ! -e /proc/sys/fs/binfmt_misc/qemu-aarch64 ]]; then
  mountpoint -q /proc/sys/fs/binfmt_misc || sudo mount -t binfmt_misc binfmt_misc /proc/sys/fs/binfmt_misc
  grep '^:' /usr/lib/binfmt.d/qemu-aarch64.conf | sudo tee /proc/sys/fs/binfmt_misc/register >/dev/null || true
fi
sudo debootstrap --arch="$DEB_ARCH" --variant=minbase --foreign \
  --components=main,contrib,non-free-firmware \
  --keyring=/usr/share/keyrings/debian-archive-keyring.gpg \
  "$SUITE" "$WORK/mnt" "$MIRROR" \
  || sudo debootstrap --arch="$DEB_ARCH" --variant=minbase --foreign \
       --components=main,contrib,non-free-firmware \
       "$SUITE" "$WORK/mnt" "$MIRROR"
sudo cp -a /usr/bin/qemu-aarch64-static "$WORK/mnt/usr/bin/"
sudo chroot "$WORK/mnt" /debootstrap/debootstrap --second-stage

sudo tee "$WORK/mnt/etc/apt/sources.list" >/dev/null <<EOF
deb $MIRROR $SUITE main contrib non-free-firmware
deb http://security.debian.org/debian-security $SUITE-security main contrib non-free-firmware
deb $MIRROR $SUITE-updates main contrib non-free-firmware
EOF

sudo mkdir -p "$WORK/mnt/dev/pts"
sudo mount --bind /dev "$WORK/mnt/dev"
sudo mount -t devpts devpts "$WORK/mnt/dev/pts" 2>/dev/null || true
sudo mount -t proc proc "$WORK/mnt/proc"
sudo mount -t sysfs sys "$WORK/mnt/sys"

# Kernel + Pi firmware (Debian). /boot is a normal dir on AI_SYS during bake.
sudo chroot "$WORK/mnt" /bin/bash -c "
set -e
export DEBIAN_FRONTEND=noninteractive LC_ALL=C
apt-get update -qq
apt-get install -y -qq --no-install-recommends \\
  linux-image-arm64 initramfs-tools firmware-brcm80211 \\
  raspi-firmware \\
  systemd systemd-sysv \\
  python3 python3-minimal curl ca-certificates \\
  libstdc++6 libgomp1 libcurl4 sudo iproute2 e2fsprogs dosfstools kmod
apt-get install -y -qq --no-install-recommends raspi-utils 2>/dev/null || true
KVER=\$(ls /lib/modules | head -1)
update-initramfs -c -k \"\$KVER\" || update-initramfs -u -k all || true
if [[ -d /usr/lib/raspi-firmware ]]; then
  cp -a /usr/lib/raspi-firmware/. /boot/
fi
if [[ -d /usr/lib/linux-image-\$KVER ]]; then
  mkdir -p /boot/overlays
  cp -a /usr/lib/linux-image-\$KVER/broadcom/*.dtb /boot/ 2>/dev/null || true
  cp -a /usr/lib/linux-image-\$KVER/overlays/* /boot/overlays/ 2>/dev/null || true
fi
VML=\$(ls /boot/vmlinuz-* 2>/dev/null | head -1)
if [[ -n \"\$VML\" ]]; then
  cp -f \"\$VML\" /boot/kernel8.img
fi
ls -la /boot | head -40
apt-get clean
rm -rf /var/lib/apt/lists/*
"

ROOT_UUID=$(sudo blkid -s UUID -o value "$P2")
DATA_UUID=$(sudo blkid -s UUID -o value "$P3")
sudo tee "$WORK/mnt/etc/fstab" >/dev/null <<EOF
UUID=$ROOT_UUID / ext4 defaults,noatime 0 1
UUID=$DATA_UUID /data ext4 defaults,noatime 0 2
LABEL=bootfs /boot vfat defaults,noatime 0 2
proc /proc proc defaults 0 0
sysfs /sys sysfs defaults 0 0
EOF

# Pi boot config — kernel8.img + initramfs (set after packages exist)
VMLINUZ_NAME=$(sudo bash -c "ls '$WORK/mnt/boot'/vmlinuz-* 2>/dev/null | xargs -n1 basename | head -1")
INITRD_NAME=$(sudo bash -c "ls '$WORK/mnt/boot'/initrd.img-* 2>/dev/null | xargs -n1 basename | head -1")
sudo tee "$WORK/mnt/boot/cmdline.txt" >/dev/null <<EOF
console=serial0,115200 console=tty1 root=UUID=$ROOT_UUID rootfstype=ext4 fsck.repair=yes rootwait
EOF
sudo tee "$WORK/mnt/boot/config.txt" >/dev/null <<EOF
# Tri-Cass OS Raspberry Pi (aarch64) — Pi 4 / Pi 5
arm_64bit=1
kernel=kernel8.img
${INITRD_NAME:+initramfs $INITRD_NAME followkernel}
dtparam=audio=on
# Pi 5
[pi5]
kernel=kernel8.img
EOF
echo "boot: kernel=$VMLINUZ_NAME initrd=$INITRD_NAME root=UUID=$ROOT_UUID"

echo "nexus-os" | sudo tee "$WORK/mnt/etc/hostname" >/dev/null
sudo chroot "$WORK/mnt" /bin/bash -c "passwd -d root"

# Payload (same as PC image)
sudo mkdir -p "$WORK/mnt/opt/portable-ai-os/runtime/"{bin,models} \
  "$WORK/mnt/data/"{config,models,memory,images,logs,knowledge/raw,notes,projects}
sudo ln -sfn /opt/portable-ai-os "$WORK/mnt/opt/nexus-os"
sudo rsync -a --exclude 'models/*.gguf' --exclude 'build/alpine' \
  "$ROOT"/catalog "$ROOT"/configs "$ROOT"/tui "$ROOT"/scripts "$ROOT"/docs \
  "$ROOT"/knowledge "$ROOT"/projects "$ROOT"/assets \
  "$ROOT"/versions.lock "$ROOT"/README.md "$ROOT"/LICENSE \
  "$WORK/mnt/opt/portable-ai-os/"
sudo rsync -a "$RUNTIME_BIN_SRC/" "$WORK/mnt/opt/portable-ai-os/runtime/bin/"
for f in "$RUNTIME/models"/SmolLM2*.gguf; do
  [[ -f "$f" ]] && sudo cp -a "$f" "$WORK/mnt/opt/portable-ai-os/runtime/models/"
done
sudo cp -f "$ROOT/catalog/catalog.json" "$WORK/mnt/opt/portable-ai-os/runtime/models/catalog.json" 2>/dev/null || true
sudo cp -f "$ROOT/configs/ui.toml" "$WORK/mnt/data/config/ui.toml" 2>/dev/null || true
# Knowledge Vault starter pack → AI_DATA
if [[ -d "$ROOT/knowledge/starter" ]]; then
  sudo mkdir -p "$WORK/mnt/data/knowledge/raw"
  sudo cp -a "$ROOT/knowledge/starter/"*.md "$WORK/mnt/data/knowledge/raw/" 2>/dev/null || true
fi

sudo tee "$WORK/mnt/etc/profile.d/portable-ai.sh" >/dev/null <<'EOF'
export PORTABLE_AI_ROOT=/opt/portable-ai-os
export PORTABLE_AI_RUNTIME=/opt/portable-ai-os/runtime
export PORTABLE_AI_MODELS=/opt/portable-ai-os/runtime/models
export AI_DATA=/data
export LD_LIBRARY_PATH=/opt/portable-ai-os/runtime/bin:${LD_LIBRARY_PATH:-}
export PATH=/opt/portable-ai-os/runtime/bin:$PATH
EOF

# Reuse PC systemd unit pattern
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

[Service]
Type=idle
Environment=PORTABLE_AI_ROOT=/opt/portable-ai-os
Environment=PORTABLE_AI_RUNTIME=/opt/portable-ai-os/runtime
Environment=PORTABLE_AI_MODELS=/opt/portable-ai-os/runtime/models
Environment=AI_DATA=/data
Environment=LD_LIBRARY_PATH=/opt/portable-ai-os/runtime/bin
Environment=N_CTX=512
Environment=N_THREADS=2
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
sudo chmod +x "$WORK/mnt/opt/portable-ai-os/scripts/"*.sh "$WORK/mnt/opt/portable-ai-os/tui/"*.py "$WORK/mnt/opt/portable-ai-os/runtime/bin/"* || true

# Drop build-only qemu emulator from guest
sudo rm -f "$WORK/mnt/usr/bin/qemu-aarch64-static"

# --- Populate FAT bootfs via mtools (host may lack vfat mount) ---
echo "==> Copying /boot staging → FAT bootfs (mtools)"
BOOT_STAGE="$WORK/boot-fat"
sudo rm -rf "$BOOT_STAGE"
sudo mkdir -p "$BOOT_STAGE"
sudo rsync -a "$WORK/mnt/boot/" "$BOOT_STAGE/"
# Ensure cmdline/config already written into mnt/boot above; re-sync
sudo rsync -a "$WORK/mnt/boot/" "$BOOT_STAGE/"
# Recursive copy onto partition
export MTOOLS_SKIP_CHECK=1
# Create overlays dir if present
if [[ -d "$BOOT_STAGE/overlays" ]]; then
  sudo -E mmd -i "$P1" ::overlays 2>/dev/null || true
  sudo -E mcopy -i "$P1" -s "$BOOT_STAGE/overlays/"* ::overlays/ 2>/dev/null || \
    sudo -E mcopy -i "$P1" -s "$BOOT_STAGE/overlays" ::
fi
# Top-level files (skip overlays dir if already handled)
sudo -E bash -c "
  shopt -s nullglob
  for f in '$BOOT_STAGE'/*; do
    base=\$(basename \"\$f\")
    [[ \"\$base\" == overlays ]] && continue
    if [[ -d \"\$f\" ]]; then
      mmd -i '$P1' ::\$base 2>/dev/null || true
      mcopy -i '$P1' -s \"\$f\"/* ::\$base/ 2>/dev/null || mcopy -i '$P1' -s \"\$f\" ::
    else
      mcopy -i '$P1' \"\$f\" ::
    fi
  done
  mdir -i '$P1' | head -40
"

# Leave /boot empty on rootfs so fstab can mount FAT there on device
sudo find "$WORK/mnt/boot" -mindepth 1 -delete
sudo mkdir -p "$WORK/mnt/boot"

df -h "$WORK/mnt" "$WORK/mnt/data" || true

# Artifact notes
{
  echo "artifact=$IMG"
  echo "arch=aarch64"
  echo "platform=raspberry-pi"
  echo "boards=pi4,pi5"
  echo "size_bytes=$(stat -c%s "$IMG")"
  echo "sha256=$(sha256sum "$IMG" | awk '{print $1}')"
  echo "built=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "note=Tri-Cass OS RPi aarch64 — smoke before claiming Download"
} | tee "$OUT_DIR/ARTIFACT-aarch64.txt"
sha256sum "$IMG" | tee "$OUT_DIR/SHA256SUMS-aarch64"

echo "==> Done: $IMG"
echo "==> Next: smoke (qemu-user hub/chat or qemu-system-aarch64); xz + GitHub Release v1.0.0-pi."
