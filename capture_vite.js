import fs from "fs";
import cp from "child_process";

try {
  cp.execSync("npx vite build", { encoding: "utf8" });
} catch(e) {
  const err = e.stdout + "\n" + e.stderr;
  fs.writeFileSync("vite_errors.txt", err.replace(/\x1B\[[0-9;]*[mK]/g, ''));
}
