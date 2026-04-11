import { spawn } from 'node:child_process';

const processes = [];
let isShuttingDown = false;

function startProcess(label, command, args) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: process.env,
    shell: false,
  });

  const entry = { label, child };
  processes.push(entry);

  child.on('exit', (code, signal) => {
    if (isShuttingDown) {
      return;
    }

    const detail = signal ? `signal ${signal}` : `code ${code ?? 0}`;
    console.error(`[dev] ${label} exited with ${detail}. Shutting down the other process.`);
    shutdown(signal ?? 'SIGTERM');
    process.exitCode = typeof code === 'number' ? code : 1;
  });

  return child;
}

function shutdown(signal = 'SIGTERM') {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  for (const { child } of processes) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

startProcess('api', process.execPath, ['server.mjs']);
startProcess('web', process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev:web']);

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
