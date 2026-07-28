const fs = require('fs');
const c = fs.readFileSync('问答.html','utf8');
const s = c.indexOf('var qaData');
const e = c.indexOf('// ===== 状态变量', s);
const js = c.substring(s, e);
try {
  new Function(js);
  console.log('OK');
} catch(err) {
  console.log('Error:', err.message, 'at line', err.lineNumber);
  // Find the problematic line
  const lines = js.split('\n');
  for (let i = 0; i < lines.length; i++) {
    try {
      new Function(lines.slice(0, i+1).join('\n'));
    } catch(e2) {
      console.log('Line ' + (i+1) + ': ' + lines[i].substring(0, 100));
      break;
    }
  }
}