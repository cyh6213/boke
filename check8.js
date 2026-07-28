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
      }
    }
  }
  if (depth < 0) {
    console.log('NEGATIVE at line ' + (i + 1) + ': ' + line.substring(0, 100));
    break;
  }
}
console.log('Final depth: ' + depth);
// Find all lines where depth decreases
depth = 0;
inString = false;
stringChar = null;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let prevDepth = depth;
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
      }
    }
  }
  if (prevDepth > 0 && depth === 0 && i < lines.length - 3) {
    console.log('DEPTH ZERO at line ' + (i + 1) + ': ' + line.substring(0, 100));
  }
}