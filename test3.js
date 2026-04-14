import fs from 'fs';
import { execSync } from 'child_process';
try {
  execSync('npx tsc --noEmit --project tsconfig.app.json');
} catch (e) {
  fs.writeFileSync('errors.txt', e.stdout.toString(), 'utf8');
}
