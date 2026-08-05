const fs = require('fs');
const path = require('path');

const read = (file) => fs.readFileSync(path.join(__dirname, file), 'utf8');
const animations = read('animations.css');

const styles = {};
fs.readdirSync(__dirname)
    .filter((file) => file.endsWith('.css') && file !== 'animations.css')
    .forEach((file) => {
        const themeName = path.basename(file, '.css');
        styles[themeName] = read(file) + animations;
    });

module.exports = (theme = 'default') => styles[theme] || styles.default;