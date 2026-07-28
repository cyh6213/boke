const fs = require('fs');
const c = fs.readFileSync('问答.html','utf8');
const s = c.indexOf('var qaData');
const e = c.indexOf('// ===== 状态变量', s);
const js = c.substring(s, e);
// Count brackets
const openBrace = (js.match(/\{/g) || []).length;
const closeBrace = (js.match(/\}/g) || []).length;
const openBracket = (js.match(/\[/g) || []).length;
const closeBracket = (js.match(/\]/g) || []).length;
console.log('{ : ' + openBrace + ', } : ' + closeBrace);
console.log('[ : ' + openBracket + ', ] : ' + closeBracket);
console.log('Diff {}: ' + (openBrace - closeBrace));
console.log('Diff []: ' + (openBracket - closeBracket));