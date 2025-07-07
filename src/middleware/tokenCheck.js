//const system=require('./lib/system');
const fs = require('fs');
const path = require('path');

//----------------------her we will see if exist a token in the system
const homeDir = process.env.HOME || process.env.USERPROFILE;
const tokenFilePath = path.join(homeDir, 'token_p1lt.key');


function tokenExists() {
  return fs.existsSync(tokenFilePath);
}

function getToken() {
  try {
    if (fs.existsSync(tokenFilePath)) {
      return fs.readFileSync(tokenFilePath, 'utf8').trim();
    } else {
      console.warn('El archivo del token no existe.');
      return null;
    }
  } catch (err) {
    console.error('Error al leer el token:', err.message);
    return null;
  }
}

function saveToken(token) {
  fs.writeFileSync(tokenFilePath, token.trim());
}

module.exports = { tokenExists, getToken, saveToken };
