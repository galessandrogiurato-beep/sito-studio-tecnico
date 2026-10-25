import asyncio
from playwright.async_api import async_playwright
import os

async def convert_svgs():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1080, "height": 1080})
        
        for name in ["ig_post_catasto", "ig_post_drone"]:
            svg_path = os.path.abspath(f"{name}.svg")
            png_path = os.path.abspath(f"{name}.png")
            await page.goto(f"file://{svg_path}")
            await page.screenshot(path=png_path, type="png")
            print(f"Converted {name}.svg to {name}.png successfully!")
            
        await browser.close()

asyncio.run(convert_svgs())
