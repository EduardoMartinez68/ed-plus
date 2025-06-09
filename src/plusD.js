const fs = require('fs');
const path = require('path');
const os = require('os');

// Ruta donde guardarás el archivo de control
const licenseFilePath = path.join(os.homedir(), '.edplus_license.json');

// Días de prueba permitidos
const TRIAL_DAYS = 30;

function checkTrialStatus() {
    // Si el archivo no existe, lo creamos con la fecha actual
    if (!fs.existsSync(licenseFilePath)) {
        const data = {
            installed_at: new Date().toISOString()
        };
        fs.writeFileSync(licenseFilePath, JSON.stringify(data), 'utf-8');
        return true; // Todavía en período de prueba
    }

    // Leer archivo y comparar fechas
    const raw = fs.readFileSync(licenseFilePath);
    const data = JSON.parse(raw);
    const installedDate = new Date(data.installed_at);
    const now = new Date();

    const diffTime = now - installedDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= TRIAL_DAYS) {
        return false; // Expirado
    }

    return true; // Todavía dentro del período de prueba
}



module.exports = {
    checkTrialStatus
};