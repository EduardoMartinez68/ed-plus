//const system=require('./lib/system');
const fs = require('fs');
const path = require('path');

//----------------------first we will create the folder of PLUS in the systme 
/*
This is for when the user would like have a version lite of PLUS for do a app all in one.
her we will not use posgreSQL, we use SQLite and create the folder in the system 
*/
const { create_all_the_file, get_path_of_folder_upload, get_path_folder_upload, get_path_folder_plus, get_path_database, name_database_lite } = require('./initialAppForDesktop');
create_all_the_file();


//----------------------server application
//her we will start the server and his character 
const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const multer = require('multer');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');



//------------------------------------------------------create database---------------------------------------------------//
require('dotenv').config();
const nameDatabase = 'EDPLUS'; //name of the database
const { APP_PG_USER, APP_PG_HOST, APP_PG_DATABASE, APP_PG_PASSWORD, APP_PG_PORT, TYPE_DATABASE, TYPE_SYSTME } = process.env; //this code is for get the data of the database

//this is for connect when posgresql when the user have the server version 
if (TYPE_DATABASE == 'posgresql') {
  const pg = require('pg');
  const { create_update_of_the_database } = require('./characterDatabase');


  //this is for know if the APP is in the desktop or in the server
  const adminPool = new pg.Pool({
    user: APP_PG_USER,
    host: APP_PG_HOST,
    password: APP_PG_PASSWORD,
    port: APP_PG_PORT,
    database: 'postgres' // base por defecto
  });

  //now import the database
  const importSQLFile = async (pool) => {
    const filePath = path.join(__dirname, 'database', 'edplus.sql');
    // Leemos el archivo SQL
    const sql = fs.readFileSync(filePath, 'utf8');

    // Dividimos el archivo en sentencias SQL
    const statements = sql
      .split(/;\s*$/m)  // Divide por el punto y coma seguido de espacio (cada sentencia SQL)
      .map(stmt => stmt.trim())  // Quitamos los espacios extra
      .filter(stmt => stmt.length > 0);  // Eliminamos las sentencias vacías

    // Conectamos al pool de PostgreSQL
    const client = await pool.connect();
    try {
      // Ejecutamos cada sentencia SQL
      for (const stmt of statements) {
        await client.query(stmt);
      }
      console.log('✅ SQL ejecutado correctamente');
    } catch (err) {
      console.error('❌ Error ejecutando SQL:', err.message);
    } finally {
      client.release();  // Liberamos la conexión
    }
  };



  //this is for create the table EDPLUS in the database of postgres
  const createDatabase = async () => {
    const result = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE LOWER(datname) = LOWER($1)`,
      [nameDatabase]
    );

    //we will see if the database exist
    if (result.rowCount === 0) {
      console.log(`📦 No existe la base de datos ${nameDatabase}`);
      await adminPool.query(`CREATE DATABASE "${nameDatabase}"`); //if not exist, we will create the database
      console.log(`📦 Base de datos ${nameDatabase} creada`);

      const edplusPool = getEDPLUSPool(); //we will create the pool of the database EDPLUS
      importSQLFile(edplusPool); //this is for import the database of EDPLUS.sql
      await create_update_of_the_database(edplusPool); //we will create the database of EDPLUS
      console.log(`📦 Base de datos ${nameDatabase} actualizada`);
    } else {
      console.log(`📂 La base de datos ${nameDatabase} ya existe, no se creó nuevamente.`);

      //if the user has PLUS installed, now we will update the database
      const edplusPool = getEDPLUSPool(); //we will create the pool of the database EDPLUS
      await create_update_of_the_database(edplusPool);
      console.log(`📦 Base de datos ${nameDatabase} actualizada`);
    }
  };

  const getEDPLUSPool = () => {
    return new pg.Pool({
      user: APP_PG_USER,
      host: APP_PG_HOST,
      database: nameDatabase, // Conexión directa a la nueva base de datos
      password: APP_PG_PASSWORD,
      port: APP_PG_PORT
    });
  };


  createDatabase();
}





//--------------------------------server application---------------------------------------------------//




const { v4: uuid } = require('uuid');


//this is for create a demo of PLUS
const nodePersist = require('node-persist');
nodePersist.init({
  dir: path.join(__dirname, 'data')
});


//*------------------initializations-----------------------------------------//
const serverExpress = express();
require('./lib/passport');

//*-----------------------------------------------------------settings-----------------------------------------//
serverExpress.set('port', process.env.PORT || 4000);
serverExpress.set('views', path.join(__dirname, 'views'))
serverExpress.engine('.hbs', engine({ //we will create the engine for the web
  defaultLayout: 'main',
  layoutsDir: path.join(serverExpress.get('views'), 'layouts'),
  partialsDir: path.join(serverExpress.get('views'), 'partials'),
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}))
serverExpress.set('view engine', '.hbs');


//*-----------------------------------------------------------middlewares-----------------------------------------//
const crypto = require('crypto');

// Path file .env
const envPath = path.resolve(__dirname, '../.env');

//read the container update of the file .env
let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

if (!envContent.includes('ENCRYPTION_KEY=')) {
  // Generar clave de 32 bytes (256 bits) y codificarla en hexadecimal
  const newKey = crypto.randomBytes(32).toString('hex');

  // Agregar la nueva clave al final del archivo .env
  envContent += `\nENCRYPTION_KEY=${newKey}\n`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ ENCRYPTION_KEY generado y guardado en .env');
} else {
  console.log('🔐 ENCRYPTION_KEY ya existe en .env');
}


if (TYPE_DATABASE == 'mysqlite') {
  //this is for mysqlite
  const SQLiteStore = require('connect-sqlite3')(session);

  serverExpress.use(session({
    store: new SQLiteStore({
      db: 'session.sqlite',//name_database_lite(),        // Archivo SQLite
      dir: get_path_folder_plus(),         // Carpeta donde se guarda
      table: 'session'              // Nombre de la tabla de sesiones
    }),
    secret: 'FudSession',
    resave: false,
    saveUninitialized: false
  }));


} else {
  //her now we will connect with the database of EDPLUS when be created
  const pgPool = new pg.Pool({
    user: APP_PG_USER,
    host: APP_PG_HOST,
    database: APP_PG_DATABASE,
    password: APP_PG_PASSWORD,
    port: APP_PG_PORT,
    /*
    ssl: {
        rejectUnauthorized: false,
    }*/

  });

  //this is for posgresql
  serverExpress.use(session({
    secret: 'FudSession',
    resave: false,
    saveUninitialized: false,
    store: new (require('connect-pg-simple')(session))({
      pool: pgPool,
      tableName: 'session'
    }),
    //store: new MySQLStore(pool)
  }));
}



//*-----------------------------------------------------------activate the our library-----------------------------------------// 
require('./lib/editFrom');
serverExpress.use(flash());
serverExpress.use(morgan('dev'));
serverExpress.use(express.urlencoded({ extended: false }));
serverExpress.use(express.json());
serverExpress.use(passport.initialize());
serverExpress.use(passport.session());

const storageImages = multer.diskStorage({
  destination: get_path_of_folder_upload(),
  filename: (req, file, cb) => {
    cb(null, uuid() + path.extname(file.originalname));
  }
});

serverExpress.use(multer({ storage: storageImages }).single('image'));

//*-----------------------------------------------------------global variables-----------------------------------------//
serverExpress.use((req, res, next) => {
  serverExpress.locals.success = req.flash('success');
  serverExpress.locals.message = req.flash('message');
  serverExpress.locals.user = req.user;
  serverExpress.locals.company = req.company;
  next();
});


//*-----------------------------------------chat online-----------------------------------------//
const http = require('http');
const serverSocket = http.createServer(serverExpress);
const { Server } = require("socket.io");
const io = new Server(serverSocket);
const users = {}; // object for  mapear users IDs with Socket IDs
const connectedEmployees = {}; //this is for that we know how many employees is connection
const companyLimitsCache = {}; //this is for save the limit of employees for company. This is for that we not need to search in the database
const orderKitchen = {};
const chat = require('./services/chat.js');

serverSocket.listen(serverExpress.get('port'), () => {
  console.log(`Server running on port ${serverExpress.get('port')}`);
});

//*-----------------------------------------------------------routes-----------------------------------------//
const companyName = '/links' //links
serverExpress.use(require('./router'))
serverExpress.use(require('./router/authentication'))
serverExpress.use(companyName, require('./router/links'))

const routesPath = path.join(__dirname, 'router/links');

//her we will read all the file of the links
fs.readdirSync(routesPath).forEach(file => {
  const filePath = path.join(routesPath, file);

  //we will see if the file is a js file
  if (fs.statSync(filePath).isFile() && file.endsWith('.js')) {
    serverExpress.use(companyName, require(filePath)); //run the file
  }
});

serverExpress.use(require('./lib/addFrom'));

//add database
//app.use(companyName,require('./router/addDatabase'))

//public
serverExpress.use(express.static(path.join(__dirname, 'public')));

const pathFolder = get_path_folder_upload()
serverExpress.use('/uploads', express.static(pathFolder)); //this is for that the web can read all the file in the folder of the desktop

//*-----------------------------------------------------------Server application-----------------------------------------//
/*
*/

//this is for get the IP of the computer that is the server
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let iface in interfaces) {
    for (let i = 0; i < interfaces[iface].length; i++) {
      const address = interfaces[iface][i];
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  return '127.0.0.1';
}

// starting the server in the computer
//const open = (...args) => import('open').then(mod => mod.default(...args));

serverExpress.listen(serverExpress.get('port'), '0.0.0.0', () => {
  const url = `http://${getLocalIP()}:${serverExpress.get('port')}`;
  console.log(`Server running on ${url}`);

  //her we will see if the user have the version desktop 
  if (TYPE_SYSTME == 'desktop') {
    open(url);
  }

  //open(url);
});


/*
let previousCpuUsage = process.cpuUsage();

setInterval(() => {
  const currentCpuUsage = process.cpuUsage();
  const memory = process.memoryUsage();

  // Diferencia desde la última medición
  const userDiff = currentCpuUsage.user - previousCpuUsage.user;
  const systemDiff = currentCpuUsage.system - previousCpuUsage.system;

  previousCpuUsage = currentCpuUsage; // actualiza para la próxima vez

  console.clear();
  console.log('--- Uso del sistema ---');
  console.log(`Memoria RSS: ${(memory.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Heap Total: ${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Heap Usado: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`CPU User Desde el inicio: ${(currentCpuUsage.user / 1000).toFixed(2)} ms`);   // incremento real
  console.log(`CPU User real: ${(userDiff / 1000).toFixed(2)} ms`);   // incremento real
  console.log(`CPU System: ${(systemDiff / 1000).toFixed(2)} ms`); // incremento real
}, 3000);
*/

//*-----------------------------------------------------------Desktop application-----------------------------------------//
//we will see if the APP is for desktop
/*
    SETTING IN PACKAGE.JSON
  "main": "src/index.js",
  "scripts": {
    "start": "npx electron .",
    "dev": "nodemon src/",
    "electron": "electron .",
    "build": "electron-builder"
  },


  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "build": "electron-builder"
  },
*/


/*
server.listen(app.get('port'), () => {
    console.log('Servidor corriendo en http://localhost:' + app.get('port'));
});
*/
