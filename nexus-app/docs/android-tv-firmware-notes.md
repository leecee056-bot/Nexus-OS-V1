# Android TV box firmware — research notes (HAP-60)

Status: **research only**. Default support is **stock Android TV / Google TV +
Tri-Cass Companion APK**.

| Family | Typical SoCs | Unlock notes |
|--------|--------------|--------------|
| Amlogic | S905x / S905y | Some boxes expose USB burning tool; vendor-locked bootloaders common |
| Rockchip | RK3328 / RK3528 | Official unlock rare on cheap sticks; risk of brick |
| Allwinner | H313 / H618 | Mixed; many “Android 12” images are OEM forks |
| Fire TV | Amazon | Sideload possible; leanback UX differs; follow Amazon policies |

**Guidance for users:** Prefer boxes that already run stock Google TV or allow
unknown sources. Do not unlock bootloaders unless you accept full device loss.
Tri-Cass will not ship unsigned OEM firmware images.
