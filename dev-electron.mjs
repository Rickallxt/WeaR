/**
 * dev-electron.mjs
 *
 * Starts three processes together for Electron development:
 *   1. WeaR API server  (port 8787)
 *   2. Vite dev server  (port 5173)
 *   3. Electron (loads http://localhost:5173 once Vite is ready)
 *
 * Usage: npm run electron:dev
 */

import { spawn } from 'node:child_process';

const processes = [];
let isShuttingDown = false;

function startProcess(label, command, args, opts = {}) {
  const child = spawn(command, args, { stdio: 'inherit', ...opts });
  processes.push({ label, child });

  child.on('exit', (code, signal) => {
    if (isShuttingDown) return;
    const detail = signal ? `signal ${signal}` : `code ${code ?? 0}`;
    console.error(`[dev-electron] ${label} exited (${detail}) — shutting down.`);
    shutdown(signal ?? 'SIGTERM');
    process.exitCode = typeof code === 'number' ? code : 1;
  });

  return child;
}

function shutdown(signal = 'SIGTERM') {
  if (isShuttingDown) return;
  isShuttingDown = true;
  for (const { child } of processes) {
    if (!child.killed) child.kill(signal);
  }
}

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const shellOpt = process.platform === 'win32' ? { shell: true } : {};

/* 1. API */
startProcess('api', process.execPath, ['server/appServer.mjs'], {
  env: { ...process.env, PORT: '8787' },
});

/* 2. Vite */
startProcess('vite', npm, ['run', 'dev:web'], shellOpt);

/* 3. Electron — give Vite ~3 s to start before opening the window */
setTimeout(() => {
  startProcess('electron', npm, ['exec', 'electron', '--', '.'], shellOpt);
}, 3000);

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
