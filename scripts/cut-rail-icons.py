from PIL import Image
import numpy as np
from pathlib import Path

src_dir = Path(r"C:\Users\LENOVO\.cursor\projects\c-ResumeForgeAi\assets")
out_dir = Path(r"c:\ResumeForgeAi\ai-resume-builder\public\rail")
out_dir.mkdir(parents=True, exist_ok=True)

names = ["rail-overview", "rail-omni", "rail-resume", "rail-jobs", "rail-apps", "rail-account"]


def shift(mask, dy, dx):
    out = np.zeros_like(mask)
    h, w = mask.shape
    y0s, y0d = max(0, dy), max(0, -dy)
    x0s, x0d = max(0, dx), max(0, -dx)
    y1s, y1d = h - y0d, h - y0s
    x1s, x1d = w - x0d, w - x0s
    out[y0d:y1d, x0d:x1d] = mask[y0s:y1s, x0s:x1s]
    return out


def dilate(mask):
    out = mask.copy()
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            out |= shift(mask, dy, dx)
    return out


def grow(core, allow, steps):
    mask = core.copy()
    for _ in range(steps):
        nxt = dilate(mask) & allow
        nxt |= core
        if np.array_equal(nxt, mask):
            break
        mask = nxt
    return mask


def hole_fill(mask):
    inv = ~mask
    bg = np.zeros_like(mask)
    bg[0, :] = inv[0, :]
    bg[-1, :] = inv[-1, :]
    bg[:, 0] = inv[:, 0]
    bg[:, -1] = inv[:, -1]
    for _ in range(mask.shape[0] + mask.shape[1]):
        nxt = dilate(bg) & inv
        if np.array_equal(nxt, bg):
            break
        bg = nxt
    return mask | (inv & ~bg)


for name in names:
    im = Image.open(src_dir / f"{name}.jpg").convert("RGB")
    rgb = np.asarray(im).astype(np.float32)
    lum = 0.2126 * rgb[:, :, 0] + 0.7152 * rgb[:, :, 1] + 0.0722 * rgb[:, :, 2]
    core = lum > 32
    grown = grow(core, lum > 8, 70)
    filled = hole_fill(grown)
    holes = filled & ~grown
    alpha = np.zeros(lum.shape, np.float32)
    alpha[filled] = 255
    shadow = filled & ~core & ~holes & (lum < 24)
    alpha[shadow] = np.clip((lum[shadow] - 8) / 16 * 255, 0, 255)
    edge = dilate(filled) & ~filled
    alpha[edge] = 40

    ys, xs = np.where(alpha > 20)
    pad = int(max(xs.max() - xs.min(), ys.max() - ys.min()) * 0.1)
    x0 = max(0, int(xs.min()) - pad)
    y0 = max(0, int(ys.min()) - pad)
    x1 = min(lum.shape[1], int(xs.max()) + pad + 1)
    y1 = min(lum.shape[0], int(ys.max()) + pad + 1)
    crop_rgb = rgb[y0:y1, x0:x1].astype(np.uint8)
    crop_a = alpha[y0:y1, x0:x1].astype(np.uint8)
    rgba = np.dstack([crop_rgb, crop_a])
    out = Image.fromarray(rgba, "RGBA")
    side = max(out.size)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - out.size[0]) // 2, (side - out.size[1]) // 2), out)
    canvas = canvas.resize((256, 256), Image.Resampling.LANCZOS)
    dest = out_dir / f"{name}.png"
    canvas.save(dest, "PNG")
    print(name, canvas.size, dest.stat().st_size)
