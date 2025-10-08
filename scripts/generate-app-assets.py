#!/usr/bin/env python3
"""
Generate placeholder app icon and splash screen for CoreTet app
Requires: pip install pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Design tokens from your app
BLUE_COLOR = (49, 130, 206)  # #3182ce
WHITE_COLOR = (255, 255, 255)

def create_app_icon(size=1024):
    """Create a simple app icon: blue circle with white 'C'"""
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    # Draw blue circle with some padding
    padding = size * 0.05
    draw.ellipse(
        [padding, padding, size - padding, size - padding],
        fill=BLUE_COLOR
    )

    # Draw white 'C' letter
    try:
        # Try to use a nice font
        font_size = int(size * 0.6)
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        # Fallback to default font
        font = ImageFont.load_default()

    # Calculate text position (centered)
    text = "C"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = (size - text_width) / 2 - bbox[0]
    y = (size - text_height) / 2 - bbox[1]

    draw.text((x, y), text, fill=WHITE_COLOR, font=font)

    return img

def create_splash_screen(size=2732):
    """Create splash screen with CoreTet branding"""
    img = Image.new('RGB', (size, size), WHITE_COLOR)
    draw = ImageDraw.Draw(img)

    # Draw blue circle logo (smaller, positioned higher)
    circle_size = size * 0.25
    circle_x = (size - circle_size) / 2
    circle_y = size * 0.25  # Position at 25% from top

    draw.ellipse(
        [circle_x, circle_y,
         circle_x + circle_size, circle_y + circle_size],
        fill=BLUE_COLOR
    )

    # Draw white 'C' letter in circle
    try:
        c_font_size = int(circle_size * 0.6)
        c_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", c_font_size)
    except:
        c_font = ImageFont.load_default()

    text = "C"
    bbox = draw.textbbox((0, 0), text, font=c_font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    c_x = (size - text_width) / 2 - bbox[0]
    c_y = circle_y + (circle_size - text_height) / 2 - bbox[1]

    draw.text((c_x, c_y), text, fill=WHITE_COLOR, font=c_font)

    # Draw "CoreTet" text
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 120)
    except:
        title_font = ImageFont.load_default()

    title = "CoreTet"
    bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = bbox[2] - bbox[0]
    title_x = (size - title_width) / 2 - bbox[0]
    title_y = circle_y + circle_size + 80

    draw.text((title_x, title_y), title, fill=BLUE_COLOR, font=title_font)

    # Draw "Collaboration For Bands" subtitle
    try:
        subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 60)
    except:
        subtitle_font = ImageFont.load_default()

    subtitle = "Collaboration For Bands"
    bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = bbox[2] - bbox[0]
    subtitle_x = (size - subtitle_width) / 2 - bbox[0]
    subtitle_y = title_y + 150

    draw.text((subtitle_x, subtitle_y), subtitle, fill=(100, 100, 100), font=subtitle_font)

    # Draw "So Easy, Even a Drummer Can Do It" in small italic
    try:
        # Try to load italic font
        tagline_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
    except:
        tagline_font = ImageFont.load_default()

    tagline = "So Easy, Even a Drummer Can Do It"
    bbox = draw.textbbox((0, 0), tagline, font=tagline_font)
    tagline_width = bbox[2] - bbox[0]
    tagline_x = (size - tagline_width) / 2 - bbox[0]
    tagline_y = subtitle_y + 120

    draw.text((tagline_x, tagline_y), tagline, fill=(150, 150, 150), font=tagline_font)

    return img

def main():
    # Output directories
    app_icon_dir = "ios/App/App/Assets.xcassets/AppIcon.appiconset"
    splash_dir = "ios/App/App/Assets.xcassets/Splash.imageset"

    print("🎨 Generating CoreTet app assets...")

    # Generate app icon
    print("📱 Creating app icon (1024x1024)...")
    app_icon = create_app_icon(1024)
    app_icon_path = os.path.join(app_icon_dir, "AppIcon-512@2x.png")
    app_icon.save(app_icon_path, "PNG")
    print(f"   ✅ Saved to {app_icon_path}")

    # Generate splash screen
    print("🖼️  Creating splash screen (2732x2732)...")
    splash = create_splash_screen(2732)

    splash_files = [
        "splash-2732x2732.png",
        "splash-2732x2732-1.png",
        "splash-2732x2732-2.png"
    ]

    for filename in splash_files:
        splash_path = os.path.join(splash_dir, filename)
        splash.save(splash_path, "PNG")
        print(f"   ✅ Saved to {splash_path}")

    print("\n✨ Done! Assets generated successfully.")
    print("📲 Next steps:")
    print("   1. Run: npx vite build")
    print("   2. Run: npx cap sync ios")
    print("   3. Run: npx cap open ios")
    print("   4. In Xcode, select a simulator and press ▶️ to run")

if __name__ == "__main__":
    main()
