const fs = require('fs');
const file = 'src/app/api/diagnostics/route.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "const newExpiry = new Date(now.getTime() - 60000);",
  "const newExpiry = new Date(now.getTime() - 60000);\n          // Send RESTART signal to ensure bot picks up the new global_drafts timer\n          await query(`INSERT INTO portal_jobs (job_type, status, payload) VALUES ('SIGNAL_RESTART', 'pending', '{}') ON CONFLICT DO NOTHING`).catch(() => {});"
);
fs.writeFileSync(file, content);
console.log("Patched!");
