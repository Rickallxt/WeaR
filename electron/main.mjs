import { app, BrowserWindow, Menu, shell } from 'electron';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isDev = !app.isPackaged;

/* ── Vite dev server URL ───────────────────────────────────────── */
const VITE_URL = 'http://localhost:5173';

let mainWindow = null;
let apiProcess = null;

/* ── Start the WeaR API server ─────────────────────────────────── */
function startApiServer() {
  const serverPath = isDev
    ? join(__dirname, '..', 'server', 'appServer.mjs')
    : join(process.resourcesPath, 'server', 'appServer.mjs');

  apiProcess = spawn(process.execPath, [serverPath], {
    env: { ...process.env, PORT: '8787' },
    stdio: 'pipe',
  });

  apiProcess.stdout?.on('data', (d) => console.log('[api]', d.toString().trimEnd()));
  apiProcess.stderr?.on('data', (d) => console.error('[api]', d.toString().trimEnd()));
  apiProcess.on('exit', (code) => console.log('[api] exited', code));
}

/* ── Create the main window ────────────────────────────────────── */
function createWindow() {
  mainWindow = new BrowserWindow({
    /* S25 Ultra shell dimensions — device (418px) + comfortable padding */
    width: 480,
    height: 980,
    minWidth: 480,
    minHeight: 700,
    maxWidth: 480,          /* lock width — it's a phone, not a resizable app */
    resizable: false,
    frame: false,           /* frameless — the shell renders its own chrome */
    transparent: false,
    backgroundColor: '#080808',
    show: false,
    center: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      /* Allow the shell iframe to load the Vite dev server */
      webSecurity: isDev ? false : true,
      allowRunningInsecureContent: isDev,
      preload: join(__dirname, 'preload.mjs'),
    },
  });

  /* Remove the native menu bar */
  Menu.setApplicationMenu(null);

  if (isDev) {
    /* Load the S25 Ultra shell — pass the app URL as a URI-encoded hash.
       Use pathToFileURL so Windows paths with spaces are handled correctly. */
    const shellFileUrl = pathToFileURL(join(__dirname, 'shell.html')).href;
    mainWindow.loadURL(`${shellFileUrl}#${encodeURIComponent(VITE_URL)}`);
  } else {
    /* Production: load the built app directly at phone size */
    mainWindow.loadFile(join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());

  /* Open external links in the OS browser */
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });
}

/* ── App lifecycle ─────────────────────────────────────────────── */
app.whenReady().then(() => {
  startApiServer();
  /* Give the API server ~600 ms to bind before the UI starts calling it */
  setTimeout(createWindow, 600);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  apiProcess?.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => apiProcess?.kill());
