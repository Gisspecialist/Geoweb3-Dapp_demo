# GeoWeb3 Application Skin Switcher

This build includes a user-facing skin switcher so non-technical users, board members, field users, and accessibility users can change the interface for easier viewing without editing code.

## How to use it

1. Start the app with `RUN_PREBUILT_WINDOWS.bat` or `npm run dev`.
2. Open `http://127.0.0.1:3000`.
3. Click the floating **🎨 Skins** button at the bottom-right corner of the screen.
4. Select a color skin, text size, spacing level, and motion setting.

## Included skins

- Geo Dark: original Web3-style interface.
- Clean Light: bright office/projector view.
- Ocean Blue: lower-glare blue viewing mode.
- Forest Green: conservation/GIS-friendly color palette.
- Desert Amber: warm low-light palette.
- High Contrast: maximum readability mode.

## Accessibility options

- Normal, Comfort, Large, and XL text scaling.
- Normal, Compact, and Spacious spacing.
- Reduce animations for users who prefer less motion.

## Persistence

Selections are saved in browser `localStorage` under `geoweb3_view_skin_v1`, so the app remembers the user's viewing preference on the same computer/browser.

## Implementation files

- `public/skin-switcher.css`
- `public/skin-switcher.js`
- `dist/skin-switcher.css`
- `dist/skin-switcher.js`

The root `index.html` and the prebuilt `dist/index.html` both load the skin switcher, so it works in development mode and in the no-install prebuilt Windows mode.
