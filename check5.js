const fs = require('fs');
const c = fs.readFileSync('问答.html', 'utf8');
const s = c.indexOf('var qaData');
const e = c.indexOf('// ===== 状态变量', s);
const js = c.substring(s, e);

// Try to parse as JavaScript
try {
  // Wrap in a function to avoid variable declaration issues
  new Function(js);
  console.log('SYNTAX OK');
} catch (err) {
  console.log('SYNTAX ERROR: ' + err.message);
  
  // Find the exact line by binary search
  const lines = js.split('\n');
  let lo = 0, hi = lines.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    try {
      new Function(lines.slice(0, mid + 1).join('\n'));
      lo = mid + 1;
    } catch {
      hi = mid;
    }
  }
  console.log('Error at line ' + (lo + 1) + ' (file line ' + (s + 1 + lo) + '):');
  console.log(lines[lo]?.substring(0, 150));
  
  // Show context
  for (let i = Math.max(0, lo - 2); i <= Math.min(lines.length - 1, lo + 2); i++) {
    const marker = i === lo ? '>>>' : '   ';
    console.log(marker + ' ' + (i + 1) + ': ' + lines[i].substring(0, 150));
  }
}