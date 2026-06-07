The error "Cannot find package 'vite'" means dependencies were not installed in this folder.

Fastest way to run the app:
1. Open Command Prompt.
2. cd into the folder that contains package.json.
3. Run: RUN_PREBUILT_WINDOWS.bat
4. Open: http://127.0.0.1:3000

For development mode:
1. Close VS Code terminals and any running Node windows.
2. Run: FIX_WINDOWS_INSTALL.bat
3. Confirm node_modules\vite exists.
4. Run: RUN_WINDOWS.bat

This package also patches npm run dev so it will automatically fall back to the prebuilt dist frontend when Vite is missing.
