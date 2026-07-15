"""Generates assets/img/og-image.jpg matching the ToolShoppy crimson/rose-gold brand."""
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SS = 2  # supersample factor for crisp edges/text
W, H = 1200 * SS, 630 * SS

PRIMARY = (225, 29, 72)      # #E11D48
PRIMARY_DARK = (190, 18, 60)  # #BE123C
PRIMARY_DARKER = (159, 18, 57)  # #9F1239
ACCENT = (245, 158, 11)      # #F59E0B
WHITE = (255, 255, 255)
PINK_TINT = (255, 228, 233)  # #FFE4E9
ROSE_MIST = (255, 241, 242)  # #FFF1F2
AMBER_LIGHT = (253, 230, 138)  # #FDE68A


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def diagonal_gradient(w, h, c1, c2, c3):
    img = Image.new("RGB", (w, h))
    px = img.load()
    max_d = w + h
    for y in range(h):
        row_base = y
        for x in range(w):
            t = (x + row_base) / max_d
            if t < 0.55:
                col = lerp(c1, c2, t / 0.55)
            else:
                col = lerp(c2, c3, (t - 0.55) / 0.45)
            px[x, y] = col
    return img


def radial_glow(w, h, cx, cy, r, color, max_alpha):
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    steps = 60
    for i in range(steps, 0, -1):
        frac = i / steps
        alpha = int(max_alpha * (1 - frac) ** 2)
        rad = r * frac
        gd.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=(*color, alpha))
    return glow


base = diagonal_gradient(W, H, PRIMARY, PRIMARY_DARK, PRIMARY_DARKER)
img = base.convert("RGBA")

img.alpha_composite(radial_glow(W, H, int(1040 * SS), int(70 * SS), int(280 * SS), ACCENT, 110))
img.alpha_composite(radial_glow(W, H, int(90 * SS), int(600 * SS), int(220 * SS), WHITE, 14))
img.alpha_composite(radial_glow(W, H, int(1120 * SS), int(560 * SS), int(150 * SS), WHITE, 14))

draw = ImageDraw.Draw(img)

border_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
bd = ImageDraw.Draw(border_layer)
bd.rounded_rectangle(
    [60 * SS, 60 * SS, 1140 * SS, 596 * SS],
    radius=28 * SS,
    outline=(255, 255, 255, 26),
    width=2 * SS,
)
img.alpha_composite(border_layer)

logo = Image.open("assets/img/logo.png").convert("RGBA")
logo_d = 100 * SS
logo = logo.resize((logo_d, logo_d), Image.LANCZOS)

cx, cy = 600 * SS, 178 * SS
halo_r = 74 * SS
halo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
hd = ImageDraw.Draw(halo)
hd.ellipse([cx - halo_r, cy - halo_r, cx + halo_r, cy + halo_r], fill=(255, 255, 255, 36))
img.alpha_composite(halo)
img.alpha_composite(logo, (cx - logo_d // 2, cy - logo_d // 2))

draw = ImageDraw.Draw(img)


def font(path, size):
    return ImageFont.truetype(path, size)


f_word_bold = font("C:/Windows/Fonts/segoeuib.ttf", 84 * SS)
f_tagline = font("C:/Windows/Fonts/segoeui.ttf", 32 * SS)
f_pill = font("C:/Windows/Fonts/seguisb.ttf", 25 * SS)
f_url = font("C:/Windows/Fonts/segoeui.ttf", 24 * SS)


def draw_centered(draw_obj, xc, y, parts, font_obj, letter_spacing=0):
    total_w = 0
    widths = []
    for text, _ in parts:
        w = draw_obj.textlength(text, font=font_obj) + letter_spacing * max(0, len(text) - 1)
        widths.append(w)
        total_w += w
    x = xc - total_w / 2
    for (text, color), w in zip(parts, widths):
        if letter_spacing:
            cx2 = x
            for ch in text:
                draw_obj.text((cx2, y), ch, font=font_obj, fill=color)
                cx2 += draw_obj.textlength(ch, font=font_obj) + letter_spacing
        else:
            draw_obj.text((x, y), text, font=font_obj, fill=color)
        x += w
    return total_w


draw_centered(
    draw, 600 * SS, 282 * SS,
    [("Tool", WHITE), ("Shoppy", PINK_TINT)],
    f_word_bold,
)

tagline = "Your one-stop shop for every free tool"
tw = draw.textlength(tagline, font=f_tagline)
draw.text((600 * SS - tw / 2, 402 * SS), tagline, font=f_tagline, fill=ROSE_MIST)

pill_text = "No signup \u00b7 No upload \u00b7 100% free"
pw = draw.textlength(pill_text, font=f_pill)
pill_pad_x = 40 * SS
pill_w = pw + pill_pad_x * 2
pill_h = 48 * SS
pill_cx, pill_cy = 600 * SS, 490 * SS
pill_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
pld = ImageDraw.Draw(pill_layer)
pld.rounded_rectangle(
    [pill_cx - pill_w / 2, pill_cy - pill_h / 2, pill_cx + pill_w / 2, pill_cy + pill_h / 2],
    radius=pill_h / 2,
    fill=(255, 255, 255, 30),
)
img.alpha_composite(pill_layer)
draw = ImageDraw.Draw(img)
draw.text((pill_cx - pw / 2, pill_cy - 14 * SS), pill_text, font=f_pill, fill=AMBER_LIGHT)

url_text = "toolshoppy.com"
uw = draw_centered(draw, 600 * SS, 557 * SS, [(url_text, (255, 255, 255))], f_url, letter_spacing=1 * SS)

final = img.convert("RGB").resize((1200, 630), Image.LANCZOS)
final = final.filter(ImageFilter.SMOOTH_MORE) if False else final
final.save("assets/img/og-image.jpg", "JPEG", quality=90, optimize=True)
print("Saved og-image.jpg", final.size)
