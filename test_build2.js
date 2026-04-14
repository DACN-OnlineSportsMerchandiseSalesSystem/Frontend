import { execSync } from 'child_process';
try {
  execSync('npx tsc -b', { encoding: 'utf-8' });
} catch (e) {
  const clean = e.stdout.replace(/\x1B\[[0-9;]*[mK]/g, '');
  require('fs').writeFileSync('clean_errors.log', clean);
}
