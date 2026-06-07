# Windows npm install fix

The previous package-lock file was generated in a sandbox and pointed to an internal OpenAI npm registry. On your Windows machine, npm tried to download from that private URL and timed out.

This fixed package removes that lock file and adds `.npmrc` so npm uses the public registry:

```txt
https://registry.npmjs.org/
```

## Recommended clean install

Open Command Prompt in the project folder and run:

```bat
FIX_WINDOWS_INSTALL.bat
```

Or run manually:

```bat
cd C:\geoweb3-dapp
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm config set registry https://registry.npmjs.org/
npm install --registry=https://registry.npmjs.org/
npm run dev
```

Then open:

```txt
http://127.0.0.1:3000
```

## Why the earlier errors happened

1. `ETIMEDOUT ... packages.applied-caas-gateway1.internal.api.openai.org`  
   The package lock pointed to an internal registry that your PC cannot access.

2. `EPERM: operation not permitted, rmdir ... node_modules\json5`  
   Windows had a file locked during npm cleanup. Closing VS Code terminals, Node processes, and browsers usually fixes it. The batch file removes `node_modules` before reinstalling.

3. `vite: error: argument cmd: invalid choice: '0.0.0.0'`  
   Your machine was likely running a different/global `vite` command because local installation failed. The script now calls Vite using the `serve` command explicitly:

```json
"dev": "vite serve --host 127.0.0.1 --port 3000"
```
