/**------------------------ofuscar files-------------------------- */
const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const directoryPath = path.join(__dirname,'src');  // Carpeta de tus archivos JS
const outputPath = path.join(__dirname, 'dist', 'PLUS 1.0.3', 'resources', 'app', 'src');  

fs.readdirSync(directoryPath).forEach(file => {
    const filePath = path.join(directoryPath, file);
    if (fs.lstatSync(filePath).isFile() && filePath.endsWith('.js')) {
        const code = fs.readFileSync(filePath, 'utf-8');
        const obfuscatedCode = JavaScriptObfuscator.obfuscate(code).getObfuscatedCode();
        fs.writeFileSync(path.join(outputPath, file), obfuscatedCode);
    }
});