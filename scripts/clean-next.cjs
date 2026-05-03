/**
 * Remove caches do Next (corrige "Cannot find module './NNN.js'" e 500 em layout.js).
 * Importante: pare o `next dev` / `next start` antes de correr, senão o Windows pode
 * deixar ficheiros presos e a pasta .next fica inconsistente.
 */
const fs = require("fs");
const path = require("path");

function rm(p) {
  try {
    fs.rmSync(p, { recursive: true, force: true });
    console.log("Removido:", p);
  } catch (e) {
    if (e && e.code !== "ENOENT") console.warn(e.message);
  }
}

rm(path.join(process.cwd(), ".next"));
rm(path.join(process.cwd(), "node_modules", ".cache"));
