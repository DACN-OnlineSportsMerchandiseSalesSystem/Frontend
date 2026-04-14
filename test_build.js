import { execSync } from 'child_process';
try {
  execSync('npx tsc -b', { encoding: 'utf-8' });
} catch (e) {
  console.log(e.stdout);
}
