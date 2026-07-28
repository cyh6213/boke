const fs = require('fs');
const c = fs.readFileSync('问答.html','utf8');
const s = c.indexOf('var qaData');
const e = c.indexOf('// ===== 状态变量', s);
const js = c.substring(s, e);
const lines = js.split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/\{/g) || []).length;
  const closes = (line.match(/\}/g) || []).length;
  const newDepth = depth + opens - closes;
  if (newDepth < 0) {
    console.log('Extra } at line ' + (i+1) + ': ' + line.substring(0, 120));
    break;
  }
  depth = newDepth;
}
if (depth !== 0) {
  console.log('Final depth: ' + depth + ' (should be 0)');
}