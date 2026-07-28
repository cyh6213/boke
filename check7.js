const fs = require('fs');
const c = fs.readFileSync('问答.html', 'utf8');
const s = c.indexOf('var qaData');
const e = c.indexOf('// ===== 状态变量', s);
const js = c.substring(s, e);
const lines = js.split('\n');
let depth = 0;
let inString = false;
let stringChar = null;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (inString) {
      if (ch === '\\') { j++; continue; }
      if (ch === stringChar) inString = false;
    } else {
      if (ch === "'" || ch === '"') {
        inString = true;
        stringChar = ch;
      } else if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth < 0) {
          console.log('Extra } at line ' + (i + 1) + ' (file line ' + (s + 1 + i) + '):');
          console.log(line.substring(0, 120));
          process.exit(0);
        }
      }
    }
  }
}
console.log('Final depth: ' + depth);
if (depth > 0) console.log('Missing ' + depth + ' }');
if (depth < 0) console.log('Extra ' + (-depth) + ' }');