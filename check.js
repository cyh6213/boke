const fs = require('fs');
const content = fs.readFileSync('问答.html', 'utf-8');
const start = content.indexOf('var qaData = {');
const end = content.indexOf('// ===== 状态变量', start);
const dataStr = content.substring(start, end);
try {
    eval(dataStr);
    console.log('Syntax OK');
} catch(e) {
    console.log('Error:', e.message);
    // Find line number
    const lines = dataStr.split('\n');
    for (let i = 0; i < lines.length; i++) {
        try {
            eval(lines.slice(0, i+1).join('\n') + '\n;');
        } catch(e2) {
            console.log('Line', i+1, ':', lines[i].substring(0, 80));
            break;
        }
    }
}