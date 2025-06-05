//----------------------first we will create the folder of PLUS in the systme 
require('dotenv').config();
const {TYPE_DATABASE}=process.env;
const fs = require('fs');
const path=require('path');
const sqlite3 = require('sqlite3').verbose();

//get the path home of the system 
const homeDir = process.env.HOME || process.env.USERPROFILE;
const nameDatabase=name_database_lite();

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

async function create_the_database_lite() {
  const dbPath = path.join(plusFolder, nameDatabase);

  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      return console.error('Error al crear la base de datos:', err.message);
    }
    console.log('Base de datos SQLite creada en:', dbPath);
    /*
    // Aquí ejecutamos el comando para renombrar la columna
    const renameColumnSQL = `ALTER TABLE session RENAME COLUMN expired TO expires ;`;

    db.run(renameColumnSQL, (err) => {
      if (err) {
        // Si da error aquí, es probable que tu versión de SQLite no soporte esta función
        console.error('Error renombrando la columna:', err.message);
      } else {
        console.log('Columna renombrada correctamente.');
      }

      // Cierra la conexión después de ejecutar
      db.close((err) => {
        if (err) {
          return console.error(err.message);
        }
        console.log('Conexión cerrada.');
      });
    });
    */
  });
}

function get_path_folder_upload(){
    const newFolderUpload = path.join(plusFolder, 'uploads');
    return newFolderUpload;
}

function get_path_of_folder_upload(){

    //her we will see if the software is desktop, or it is in the cloud
    if(TYPE_DATABASE=='mysqlite'){
        return path.join(plusFolder, 'uploads');
    }

    //if the software is in the cloud
    return path.join(__dirname, 'public/img/uploads')
}

function get_path_folder_plus(){
    return plusFolder;
}

function get_path_database(){
    return path.join(plusFolder, nameDatabase);
}

function name_database_lite(){
    return 'edpluslite.sqlite'
}


module.exports = {
    create_all_the_file,
    get_path_of_folder_upload,
    get_path_folder_upload,
    get_path_folder_plus,
    get_path_database,
    name_database_lite
};