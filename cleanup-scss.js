const fs = require('fs');
const path = require('path');

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.scss') && !file.startsWith('_')) {
            const underscoreFile = path.join(dir, '_' + file);
            if (fs.existsSync(underscoreFile)) {
                fs.unlinkSync(filePath);
                console.log('Deleted duplicate:', filePath);
            }
        }
    });
}

const scssDir = path.join(__dirname, 'src', 'assets', 'scss');
if (fs.existsSync(scssDir)) {
    walk(scssDir);
} else {
    console.error('SCSS directory not found:', scssDir);
}
