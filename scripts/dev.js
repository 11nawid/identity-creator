const { execSync, spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || '3000';

function killPort(port) {
  let out = '';
  try {
    out = execSync('netstat -ano', { encoding: 'utf8' });
  } catch {
    return;
  }
  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    if (line.includes(`:${port}`) && line.includes('LISTENING')) {
      const pid = line.trim().split(/\s+/).pop();
      if (pid && /^\d+$/.test(pid)) pids.add(pid);
    }
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F /T`, { stdio: 'ignore' });
      console.log(`[dev] freed port ${port} (killed PID ${pid})`);
    } catch (e) {
      // already gone or no permission
    }
  }
}

killPort(PORT);

const nextBin = path.join(__dirname, '..', 'node_modules', '.bin', 'next');
const child = spawn(nextBin, ['dev'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

const shutdown = () => {
  child.kill('SIGTERM');
  setTimeout(() => process.exit(0), 500);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
child.on('exit', (code) => process.exit(code ?? 0));