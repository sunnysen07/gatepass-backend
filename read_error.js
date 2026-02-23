const fs = require('fs');
const content = fs.readFileSync('error.txt', 'utf8');
console.log('--- ERROR DETAILS ---');
const lines = content.split('\n');
for (const line of lines) {
    if (line.includes('KeyPattern:')) {
        console.log('KEY PATTERN FOUND:');
        console.log(line.trim());
    }
    if (line.includes('Code:')) console.log(line.trim());
}
console.log('--- END ---');
