//----------------------first we will create the folder of PLUS in the systme 
const system=require('./lib/system');
const fs = require('fs');
const path=require('path');
const sqlite3 = require('sqlite3').verbose();

//get the path home of the system 
const homeDir = process.env.HOME || process.env.USERPROFILE;

//we will create the folder of PLUS in the system 
const plusFolder = path.join(homeDir, 'PLUSPOS');

async function create_all_the_file(){
    create_folder_home();
    create_the_folder_upload();
    await create_the_database_lite();
}

function create_folder_home(){
    //we will create the folder of PLUS in the system 
    if (!fs.existsSync(plusFolder)) {
        fs.mkdirSync(plusFolder);
        console.log('Carpeta principal creada:', plusFolder);
    } else {
        console.log('La carpeta principal ya existe.');
    }
}

function create_the_folder_upload(){
    //now we will create the folder of upload 
    const newFolderUpload = path.join(plusFolder, 'uploads');

    if (!fs.existsSync(newFolderUpload)) {
        fs.mkdirSync(newFolderUpload);
        console.log('Carpeta upload creada:', newFolderUpload);
    } else {
        console.log('La carpeta upload ya existe.');
    }
}

async function create_the_database_lite(){
    //now we will create a database SQLite 
    const dbPath = path.join(plusFolder, 'plus.db');

    //her is for that we will create the database
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            return console.error('Error al crear la base de datos:', err.message);
        }
        console.log('Base de datos SQLite creada en:', dbPath);
    });

    //we will create all the database
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                correo TEXT UNIQUE NOT NULL,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error al crear tabla:', err.message);
            } else {
                console.log('Tabla "usuarios" creada o ya existía.');
            }
        });
    });

    //close the connect
    db.close();
}

function get_path_folder_upload(){

}

function get_path_of_folder_upload(){
    //her we will see if the software is desktop, or it is in the cloud
    if(system!='desktop'){
        return path.join(plusFolder, 'upload');
    }

    //if the software is in the cloud
    return path.join(__dirname, 'public/img/uploads')
}


module.exports = {
    create_all_the_file,
    get_path_of_folder_upload
};