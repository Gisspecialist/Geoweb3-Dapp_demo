# Windows Vite Command Fix

If you saw this error:

```text
usage: vite [options]
vite: error: unrecognized arguments: --host 127.0.0.1 --port 3000
```

it means Windows was launching a different/global `vite` command or an incompatible Vite CLI. This package no longer passes `--host` or `--port` through the command line.

Use:

```bat
FIX_WINDOWS_INSTALL.bat
RUN_WINDOWS.bat
```

Or run manually:

```bat
npm install --registry=https://registry.npmjs.org/
npm run dev
```

The app will start the frontend using:

```text
node scripts/start-frontend.mjs
```

The host and port are controlled inside the Node startup script, not through CLI flags.
