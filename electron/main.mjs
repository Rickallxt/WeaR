import { app, BrowserWindow, Menu, shell } from 'electron';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isDev = !app.isPackaged;
const API_PORT = process.env.PORT ?? '8787';
const usesExternalApi = process.env.WEAR_EXTERNAL_API === '1';

/* ── Vite dev server URL ───────────────────────────────────────── */
const VITE_URL = 'http://localhost:5173';

let mainWindow = null;
let apiProcess = null;

/* ── Start the WeaR API server ─────────────────────────────────── */
function startApiServer() {
  if (usesExternalApi) {
    console.log('[api] using externally managed dev server');
    return;
  }

  const serverPath = isDev
    ? join(__dirname, '..', 'server', 'appServer.mjs')
    : join(process.resourcesPath, 'server', 'appServer.mjs');

  // Electron's executable is not plain Node; run it in Node mode for the API child.
  apiProcess = spawn(process.execPath, [serverPath], {
    env: {
      ...process.env,
      PORT: API_PORT,
      ELECTRON_RUN_AS_NODE: '1',
    },
    stdio: 'pipe',
  });

  apiProcess.stdout?.on('data', (d) => console.log('[api]', d.toString().trimEnd()));
  apiProcess.stderr?.on('data', (d) => console.error('[api]', d.toString().trimEnd()));
  apiProcess.on('error', (error) => console.error('[api] failed to start', error));
  apiProcess.on('exit', (code) => console.log('[api] exited', code));
}

/* ── Create the main window ────────────────────────────────────── */
function createWindow() {
  mainWindow = new BrowserWindow({
    /* Stage presentation — wide enough for branding + phone + caption */
    width: 860,
    height: 980,
    minWidth: 860,
    minHeight: 700,
    resizable: true,
    frame: false,
    transparent: false,
    backgroundColor: '#06060a',
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
    /* Load the Vite dev server directly — no iframe, so mouse events reach
       React components natively. PresentationStage renders the phone frame
       as a React overlay using CSS transform to contain position:fixed. */
    mainWindow.loadURL(`${VITE_URL}?demo=1&present=1`);
  } else {
    mainWindow.loadFile(join(__dirname, '..', 'dist', 'index.html'), {
      query: { demo: '1', present: '1' },
    });
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());

  /* Keyboard shortcuts */
  mainWindow.webContents.on('before-input-event', (_e, input) => {
    if (input.key === 'Escape') mainWindow?.close();
    if ((input.control || input.meta) && input.key === 'q') app.quit();
  });

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
