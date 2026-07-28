const fs = require('fs');
const c = fs.readFileSync('问答.html', 'utf8');
const s = c.indexOf('var qaData');
const e = c.indexOf('// ===== 状态变量', s);
const js = c.substring(s, e);
try {
  eval(js);
  console.log('OK');
} catch(err) {
  console.log('Error: ' + err.message);
  console.log('At line: ' + (err.lineNumber || 'unknown'));
}