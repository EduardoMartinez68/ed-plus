const system=require('./lib/system');
const thiIsADemo=false;

//----------------------desktop application
const { app, BrowserWindow, dialog, ipcMain  } = require('electron');


//----------------------server application
const express=require('express');
const morgan=require('morgan');
const {engine}=require('express-handlebars');
const multer=require('multer');
const flash=require('connect-flash');
const session=require('express-session');
const passport=require('passport');
const { database } = require('./keys');

const { v4: uuid } = require('uuid');
const path=require('path');

//ReCAPTCHA of Google
const { RecaptchaV2 } = require('express-recaptcha');

//this is for create a demo of PLUS
const nodePersist = require('node-persist');
nodePersist.init({
  dir: path.join(__dirname, 'data')
});

//*------------------TOKEN-----------------------------------------//
async function initialize_software() {
    const initialToken = await nodePersist.get('installToken');

    //we will see if exist the token in the database
    if (!initialToken) {
      await nodePersist.set('installToken', 'false');
    }
}

async function the_software_have_a_token() {
    const initialToken = await nodePersist.get('installToken');
    if (!initialToken) {
      return false;
    }
    
    return initialToken!='false';
}

async function create_expiration_date_of_the_token(date){
    const expirationDateOFTheToken = await nodePersist.get('expirationDateOFTheToken');

    //we will see if exist the token in the database
    if (!expirationDateOFTheToken) {
      await nodePersist.set('expirationDateOFTheToken', date);
    }
}

async function token_expired(){
    const expirationDateOFTheToken = await nodePersist.get('expirationDateOFTheToken');
    const expirationDate = new Date(expirationDateOFTheToken);
    const currentDate = new Date();
    return (currentDate < expirationDate);
}

async function remove_install_token() {
    await nodePersist.removeItem('installToken');
    await nodePersist.removeItem('expirationDateOFTheToken');
    console.log('installToken eliminado');
}

async function initialize_token(token) {
    const installDate = await nodePersist.get('installToken');
    await nodePersist.set('installToken', token);
}

async function initialize_demo() {
    const installDate = await nodePersist.get('installDemo');

    if (!installDate) {
      // Si no existe la fecha de instalación, la guarda
      const currentDate = new Date().toISOString();
      await nodePersist.set('installDate', currentDate);
      console.log("Fecha de instalación guardada:", currentDate);
    } else {
      console.log("Fecha de instalación existente:", installDate);
    }
}

async function is_demo_expired() {
    const installDate = await nodePersist.get('installDemo');
    if (!installDate) {
      console.log("No se encontró la fecha de instalación");
      return false;
    }
  
    const installDateObj = new Date(installDate);
    const currentDate = new Date();
    const diffTime = currentDate - installDateObj;
    const diffDays = diffTime / (1000 * 60 * 60 * 24); // Convertir la diferencia a días
  
    if (diffDays > 30) {
      console.log("La demo ha expirado.");
      return true;
    } else {
      console.log("La demo aún está activa.");
      return false;
    }
}

async function this_software_count_have_a_count(){

}

async function the_user_have_a_token_active_in_the_database(){

}

async function verify_membership_of_user(){
    //this is for initialize the token of the software when the user the install for first time
    initialize_software();
    
    //now we will see if the user have a token in the count of the user
    if(await the_software_have_a_token()){
        return await token_expired();
    }

    return false;

    /*
    //now we will see if the user have a token in the count of the user
    if(await this_software_count_have_a_count()){
        if(await the_software_have_a_token()){
            //if the software have a token, we will see if the token expired
            if(await token_expired()){
                //if the token not is expired, we can show the software
                return true;
            }else{
                //if the token is expired, we will see if in the database is active a new token
                if(await the_user_have_a_token_active_in_the_database()){
                    //if the user have a token active in the database, we will update the data of token 
                    await actualizarToken();
                    await initialize_token();
                }else{
                    return false;
                }
            }
        }else{
            //we will see if the user have a token active in the database
        }
    }else{
        return false;
    }
    */
}


//*------------------UPDATES-----------------------------------------//
const simpleGit = require('simple-git');
const fs = require('fs');

const repoPath = path.join(__dirname); //this change when are a version of desktop
const git = simpleGit(repoPath);

//this is for get the repository of github
const repoURL = 'https://github.com/EduardoMartinez68/VERSIONES_PLUS'; // Reemplaza con la URL de tu repositorio
const remote = 'origin';

//if not have a repository remote, we can setting her
git.addRemote(remote, repoURL).then(() => {
    console.log('Repositorio remoto configurado correctamente');
}).catch(err => {
    console.error('Error al agregar el repositorio remoto', err);
});

async function check_if_exist_updates() {
    try {
        // Asegúrate de que el repositorio remoto esté configurado correctamente
        await git.fetch(remote);

        // Obtener el último commit del repositorio remoto
        const remoteLog = await git.log([`${remote}/main`, '-1']);
        const localLog = await git.log(['HEAD', '-1']);

        // Compara los commits local y remoto
        if (remoteLog.latest.hash !== localLog.latest.hash) {
            console.log('🔄 Nueva versión encontrada, actualizando...');

            // Resetear cualquier cambio local y sincronizar con el repositorio remoto
            await git.raw(['reset', '--hard', `${remote}/main`]); // Esto descarta los cambios locales y sincroniza con el remoto

            // Realiza el pull para obtener la última versión
            await git.pull('origin', 'main', { '--rebase': null });

            // Mostrar mensaje informando que se ha descargado la nueva versión
            dialog.showMessageBoxSync({
                type: 'info',
                title: 'Actualización',
                message: 'Se ha descargado una nueva versión. Reinicia la aplicación para aplicar los cambios.',
                buttons: ['Reiniciar ahora']
            });

            app.relaunch();
            app.quit();
        } else {
            console.log('✅ La aplicación ya está actualizada.');
        }
    } catch (error) {
        const logFilePath = path.join(__dirname, 'logfile.txt'); // Ruta para el archivo de log
        fs.appendFileSync(logFilePath, `Error verificando actualizaciones: ${error.message}\n${error.stack}\n\n`, 'utf8');
        console.error('❌ Error verificando actualizaciones:', error);

        // Mostrar mensaje de error
        dialog.showMessageBoxSync({
            type: 'warning',  // Tipo de mensaje (puede ser 'info', 'warning', 'error', etc.)
            title: 'Error verificando actualizaciones!',  // Título de la ventana
            message: `Error verificando actualizaciones: ${error.message}\n${error.stack}\n\n` // Mensaje que se mostrará
        });
    }
}

//*------------------initializations-----------------------------------------//
const serverExpress =express();

require('./lib/passport');
//require('./lib/addFrom');
require('./lib/editFrom');

//*-----------------------------------------------------------settings-----------------------------------------//
serverExpress.set('port',process.env.PORT || 4000);
serverExpress.set('views',path.join(__dirname,'views'))
serverExpress.engine('.hbs',engine({ //we will create the engine for the web
    defaultLayout:'main',
    layoutsDir: path.join(serverExpress.get('views'),'layouts'),
    partialsDir: path.join(serverExpress.get('views'),'partials'),
    extname: '.hbs',
    helpers:require('./lib/handlebars')
}))
serverExpress.set('view engine','.hbs');


//*-----------------------------------------------------------middlewares-----------------------------------------//
const crypto = require('crypto');

// Path file .env
const envPath = path.resolve(__dirname, '../../../.env');

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


require('dotenv').config();
const {APP_PG_USER,APP_PG_HOST,APP_PG_DATABASE,APP_PG_PASSWORD,APP_PG_PORT, TOKEN}=process.env; //this code is for get the data of the database

const pg = require('pg');
//const fs = require('fs');

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

const { create_update_of_the_database } = require('./characterDatabase');

//this is for create the table EDPLUS in the database of postgres
const createDatabase = async () => {
    const result = await adminPool.query("SELECT 1 FROM pg_database WHERE datname = 'edplus'");
    //we will see if the database exist
    if (result.rowCount === 0) {
      await adminPool.query('CREATE DATABASE EDPLUS'); //if not exist, we will create the database
      importSQLFile(adminPool); //this is for import the database of EDPLUS.sql
      console.log('📦 Base de datos EDPLUS creada');
    } else {
      console.log('📂 La base de datos EDPLUS ya existe, no se creó nuevamente.');

      //if the user has PLUS installed, now we will update the database
      await create_update_of_the_database(adminPool); 
    }
};
createDatabase(); //if not exist the database we will create the database


//const pg = require('pg');
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


serverExpress.use(session({
    secret: 'FudSession',
    resave: false ,
    saveUninitialized:false,
    store: new (require('connect-pg-simple')(session))({
        pool : pgPool,
        tableName : 'session'  
      }),
    //store: new MySQLStore(pool)
}));

/*
--------------CAPTCHA--------------
const {MY_SITE_KEYS,MY_SECRET_KEY}=process.env; //this code is for get the data of the database
const recaptcha = new RecaptchaV2(MY_SITE_KEYS, MY_SECRET_KEY); //this is for load the Recaptcha in the web for delete to the bots
serverExpress.use(recaptcha.middleware.verify);
*/

//*-----------------------------------------------------------activate the our library-----------------------------------------// 
serverExpress.use(flash());
serverExpress.use(morgan('dev'));
serverExpress.use(express.urlencoded({extended:false}));
serverExpress.use(express.json());
serverExpress.use(passport.initialize());
serverExpress.use(passport.session());

const storage=multer.diskStorage({ //this function is for load a image in the forms
    destination: path.join(__dirname,'public/img/uploads'),
    filename: (req,file,cb,filename)=>{
        cb(null,uuid()+path.extname(file.originalname));
    }
});

serverExpress.use(multer({storage: storage}).single('image'));



//*-----------------------------------------------------------global variables-----------------------------------------//
serverExpress.use((req,res,next)=>{
    serverExpress.locals.success=req.flash('success');
    serverExpress.locals.message=req.flash('message');
    serverExpress.locals.user=req.user;
    serverExpress.locals.company=req.company;
    serverExpress.locals.pack_company = 0;
    serverExpress.locals.pack_branch = 0;
    next();
});


//*-----------------------------------------chat online-----------------------------------------//
const http = require('http');
const server = http.createServer(serverExpress);
const { Server } = require("socket.io");
const io = new Server(server);
const users = {}; // object for  mapear users IDs with Socket IDs
const connectedEmployees = {}; //this is for that we know how many employees is connection
const companyLimitsCache = {}; //this is for save the limit of employees for company. This is for that we not need to search in the database

const chat = require('./services/chat.js');

io.on('connection', async(socket) =>{

    //*-----------------------------------LOGIN-----------------------------------
    // save the relation with the user and his socket ID
    socket.on('registerUser', async(userId,companyId) => {
        //we will see if exist the list company, if the list not exist we will create the list of the company
        const companyConnections = connectedEmployees[companyId] || []; 

        //we will see if the user is connecting to this company. 
        //This is for that only search the max of employees of the company for one when a new user is connecting
        const userAlreadyConnected = companyConnections.some(
            (connection) => connection.userId === userId
        );

        //if the user is connecting in other device we will send a message of rejection
        if (userAlreadyConnected) {
            socket.emit(
            "connectionRejected",
            "Ups, parece que ya estás conectado en otro dispositivo."
            );
            return;
        }

        //we will see if the user is in DESKTOP 
        if(system!='desktop'){ //if the user not is in the desktop, we is in the server
            // we will see if exist the limit of employees in caché
            if (!companyLimitsCache[companyId]) {
                // if not exist in the caché, we will get from the database
                companyLimitsCache[companyId] = await chat.get_max_employee_of_this_company(companyId); // save in the caché
            }

            //her we will get the max employees from the database
            const maxEmployees= companyLimitsCache[companyId];

            //we will see if the company is to limit of connected devices
            if (companyConnections.length >= maxEmployees) {
                socket.emit(
                "connectionRejected",
                "Ups, parece que alcanzaste tu límite de dispositivos conectados. Por favor, actualiza tu membresía."
                );
                return;
            }
        }

        // Relate the socket to the company
        socket.companyId = companyId;

        // add the user to the connection of the company
        companyConnections.push({ userId, socketId: socket.id });
        connectedEmployees[companyId] = companyConnections;

        //if the user is connection, we will get all the new notifications of the user for send to the frontend
        const notifications=await chat.get_the_first_notification(userId,10);
        io.to(userId).emit('privateNotifications', {notifications});
    });

    async function create_to_user(toUserEmail){
        //we will see if exist the email in the database of socket for know if is connection
        const theUserIsConnect = users[toUserEmail];

        let canSend=theUserIsConnect; //this is for know if can send the notification

        //we will see if exist the user in the socket for send a message or save in the database
        if (!theUserIsConnect) {
            //if the user not is connection we will see if exist this email in the database 
            canSend=await chat.this_email_exist(toUserId);
        }
        
        //we going to make the to User for know the answer of search. 
        //We will see if can send a message to user because exist in the database or is connection now
        const toUser={
            canSend,
            theUserIsConnect
        }
        return toUser;
    }


    //*-----------------------------------NOTIFICATIONS-----------------------------------
    //send the new notification to a user in specific
    socket.on('sendNotificationToUser', async({ userEmail, toUserEmail, message }) => {
        const toUser=await create_to_user(toUserEmail);

        //we will see if we can send the notification when see if the email exist in the web or in the database
        if(toUser.canSend){
            //we will see if can save the new notification in the database redis 
            if(await chat.create_notification(userEmail, toUserEmail, message)){
                //if the user is connection send the notification to his frontend
                if(toUser.theUserIsConnect){
                    io.to(recipientSocketId).emit('privateMessage', {userId,message});
                }

                //return a answer success for the frontend of the user that send the message
                socket.emit('messageStatus', { success: true, message: 'Mensaje enviado con éxito. 👌' });
            }
            else{
                //if we not can save the notification we will send a message of error
                socket.emit('messageStatus', { success: false, message: `No pudimos enviar el mensaje al usuario '${toUserEmail}'. Inténtalo de nuevo. 😳` });
            }
        }else{
            //if the user not exist send a answer of error
            socket.emit('messageStatus', { success: false, message: `El usuario '${toUserEmail}' no existe. 🤔` });
        }
    });

    //send the new notification to a user in specific
    socket.on('getTheFirstTenNotifications', async({ userEmail}) => {
        const notifications=await chat.get_the_first_notification(userEmail,10);
        io.to(recipientSocketId).emit('privateNotifications', {notifications});
    });


    //*-----------------------------------MESSAGES-----------------------------------
    //send the message to a user in specific
    socket.on('sendMessageToUser', async({ userId, toUserId, message }) => {
        //we will see if exist the email in the database of socket
        const recipientSocketId = users[toUserId];
        let canSend=recipientSocketId; //this is for know if can be send

        //we will see if exist the user in the socket for send a message or save in the database
        if (!recipientSocketId) {
            //if the user not is connection we will see if exist this email in the database 
            canSend=await chat.this_email_exist(toUserId);
        }

        //if the email exist we will to save the message in the database
        if(canSend){
            // get the data of the  sender (user that send the message)
            const chatId = await chat.create_new_chat(userId, toUserId); //Method to obtain or create a chat between both users

            //we will see if can save the new message in the database
            if(await chat.send_new_message(chatId, userId, message)){
                //if the user is connection send the notification 
                if(recipientSocketId){
                    io.to(recipientSocketId).emit('privateMessage', {userId,message});
                }
            }
            
            //return a answer success for the frontend
            socket.emit('messageStatus', { success: true, message: 'Mensaje enviado con éxito' });
        }else{
            //if the user not exist send a answer of error
            socket.emit('messageStatus', { success: false, message: `Este email '${toUserId}' no existe 🤔` });
        }
    });

    // delete to the user of the registry when disconnecting
    socket.on('disconnect', () => {
        // Obtener el ID de la empresa asociado al socket
        const { companyId } = socket;

        if (companyId && connectedEmployees[companyId]) {
            // Filtrar la lista para eliminar al usuario desconectado
            connectedEmployees[companyId] = connectedEmployees[companyId].filter(
            (connection) => connection.socketId !== socket.id
            );

            // Si no quedan conexiones en esta empresa, eliminar la entrada del objeto
            if (connectedEmployees[companyId].length === 0) {
                delete connectedEmployees[companyId];
            }
        } else {
            console.log(
            `Socket ${socket.id} desconectado, pero no estaba asociado a ninguna empresa.`
            );
        }
    });

    // Escuchar un mensaje enviado por un usuario
    socket.on('sendNotification', (notification) => {
        console.log('Nueva notificación:', notification);

        // Emitir la notificación a todos los demás usuarios
        socket.broadcast.emit('newNotification', notification); 
    });

});

//*-----------------------------------------------------------routes-----------------------------------------//
const companyName='/links' //links
serverExpress.use(require('./router'))
serverExpress.use(require('./router/authentication'))
serverExpress.use(companyName,require('./router/links'))

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

//serverExpress.use(companyName,require('./router/links/orders'))

serverExpress.use(require('./lib/addFrom'));

//add database
//app.use(companyName,require('./router/addDatabase'))

//public
serverExpress.use(express.static(path.join(__dirname,'public')));

//*-----------------------------------------------------------Server application-----------------------------------------//
/*
    SETTING IN PACKAGE.JSON
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

//starting the server in the computer
/*
serverExpress.listen(serverExpress.get('port'), '0.0.0.0', () => {
    console.log(`Server running on http://${getLocalIP()}:${serverExpress.get('port')}`);
});
*/
//*------------------------------------------------------------DATABASE SERVER--------------------------------------------//
const axios = require('axios');

async function get_answer_of_my_api(api,data){
    const logFilePath = path.join(__dirname, 'logfile.txt'); // Ruta para el archivo de log
    fs.appendFileSync(logFilePath, `ENTRE`, 'utf8');
    try {
        const rows = await axios.post(`https://www.pluspuntodeventa.com/api/${api}`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Guardar los resultados en un archivo de log
        fs.appendFileSync(logFilePath, `Error verificando actualizaciones: ${rows.data}\n\n\n`, 'utf8');

        return rows;
    } catch (error) {
        fs.appendFileSync(logFilePath, `Error verificando actualizaciones: ${error.message}\n${error.stack}\n\n`, 'utf8');
        return { success: false, message: "Hubo un error al hacer la solicitud." };
    }
}

//*-----------------------------------------------------------Desktop application-----------------------------------------//
//we will see if the APP is for desktop
/*
    SETTING IN PACKAGE.JSON
  "main": "src/index_desktop.js",
  "scripts": {
    "start": "npx electron .",
    "dev": "nodemon src/",
    "electron": "electron ."
  },


  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
*/
//this is for create the UI in the windows
let mainWindow;
let activationWindow;
let loginWindow;
const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
    });

    //This is to make the screen grow to full screen
    mainWindow.maximize();

    // load the URL of the server Express
    mainWindow.loadURL(`http://localhost:${serverExpress.get('port')}`);
};

//*-----------------------------------------------------------Save Token and user in the application-----------------------------------------//
const createMainWindowRegister = () => {
    loginWindow = new BrowserWindow({
        width: 800,
        height: 600,
        parent: mainWindow,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    //This is to make the screen grow to full screen
    loginWindow.maximize();

    loginWindow.loadFile(path.join(__dirname, 'activation.html')); // load the form of login
};

// this is for that we know if the user login from the same computer use a UUID
//const { v4: uuidv4 } = require('uuid');
const { machineIdSync } = require('node-machine-id');
const deviceId = machineIdSync();//uuidv4();
ipcMain.on('get_my_deviceId', async (event) => {
    console.log("📥 Petición recibida para obtener el deviceId");
    event.reply('answer_get_my_deviceId', deviceId);
});

ipcMain.on('update_data_of_the_token_in_this_drive', async (event, datos) => {
    const dataToken=datos.dataToken; //this is for get the data of the token

    //her we will save all the information of the software
    await initialize_token(dataToken.token); //this is for save the token in the software
    await create_expiration_date_of_the_token(dataToken.expiration_date); //this is for save the expiration date of the token in the software
    const message='Datos actualizados con éxito. Cierra y vuelve a abrir el programa 😄'

    event.reply('update_data_of_the_token_in_this_drive', message);
});





ipcMain.on('login-from-render-token', async (event, datos) => {
    //her we will save all the information of the software
    const token=datos.token;
    const answer=await see_if_exist_this_token_in_the_database_of_the_web(token); //send a message to the server for get the data of the token

    //we will see if exist a token of activation in our database in the web server 
    if(answer.token){
        let canUpdate=true; //this is for know if the token not have a drive activate in the database

        //now we will see if the user is login from the same computer
        if (answer.uuid){

            //we will see if the uuid is the same that the uuid of the token. Only one user can be login in one computer with the token
            if(answer.uuid !== deviceId) {
                answer.message='Este usuario ya tiene un TOKEN registrado en un equipo.'
                canUpdate=false;
            }
        }

        //if the token not have any drive, we will save this uui in the database
        if(canUpdate){
            //this is for burn the Token and that not can used again
            if(await save_the_uui_of_the_user_in_the_database(token,deviceId)){
                //now save all the information of the user in the website
                await initialize_token(token); //this is for save the token in the software
                await create_expiration_date_of_the_token(answer.activation_date); //this is for save the expiration date of the token in the software
                answer.message='Datos actualizados con éxito. Cierra y vuelve a abrir el programa 😄'
            }
        }
    }

    // answer to the server
    event.reply('answer-from-login-render-token', answer.message);
});

ipcMain.on('login-from-render', async (event, datos) => {
    //her we will save all the information of the software
    const email=datos.username;
    const password=datos.password;
    const answer=await see_if_exist_this_user_in_the_database_of_the_web(email,password);

    //we will see if exist a token of activation
    if(answer.token){
        //now we will see if the user is login from the same computer
        if (answer.uuid &&  answer.uuid !== deviceId) {
            answer.message='Este usuario ya tiene un TOKEN registrado en un equipo.'
        }else{
            //save the uui in the database
            if(await save_the_uui_of_the_user_in_the_database(email,deviceId)){
                //now save all the information of the user in the website
            }
        }
    }

    // answer to the server
    event.reply('answer-from-login-render', answer.message);
});

const bcrypt = require('bcrypt'); //this is for encrypt the password of the user
async function see_if_exist_this_user_in_the_database_of_the_web(email, password) {
    try {
        //now we will send to my api in the server for get the data of the user
        const rows = await get_answer_of_my_api('get_information_of_the_user.php', {email: email});

        //we will see if the user exist in the database
        if (!rows.data.success) {
            return {token:null,message:'Usuario no encontrado.'};
        }

        //convert the answer of the server to a object
        const user = rows.data;

        //Compare the password with the one stored in the database
        const match = await bcrypt.compare(password, user.hashedPassword);
        if (!match) {
            return {token:null,message:'Contraseña incorrecta.'};
        }

        //get the data of the token from the database
        const rowsTokens = await get_answer_of_my_api('get_data_of_the_token_with_the_user_id.php', {userId: user.id});
        if (rowsTokens.data.success) {
            return {token:null,message:'Este usuario no tiene ningun Token activo.'};
        }

        //convert the answer of the server to a object
        const tokensData = rowsTokens.data;

        //we will see if the user is activated in the database
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);//We subtract 1 year from the current date
        if (new Date(user.activation_date) < oneYearAgo) {
            return { token: null, message: 'Suscripción expirada. Por favor, vuelve a activar tu membresía.' };
        }

        console.log('Usuario autenticado con éxito.');
        return {
            token: tokensData.token,
            type_membresy: tokensData.type_membresy,
            message:'Usuario autenticado con éxito.'
        };
    } catch (err) {
        console.error('Error al verificar usuario:', err);
        return {token:null};
    }
}

async function see_if_exist_this_token_in_the_database_of_the_web(token) {
    try {
        //send a message to our api in the web for get the data of the token
        const rows = await get_answer_of_my_api('see_if_exist_this_token_in_the_database_of_the_web.php', {token: token});

        //we will see if the token exist in the database
        if (!rows.data.success) {
            return {token:null,message:'Token no encontrado.'};
        }

        //convert the answer of the server to a object 
        const user = rows.data;

        //we will see if the user is active
        const oneYearAgo = new Date();

        //change the date for the date of the token
        if(user.type_membresy==0){
            oneYearAgo.setDate(oneYearAgo.getDate() - 30); //We add 30 days to the current date. This is for demos
        }else{
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1); //We subtract 1 year from the current date. This is for customers
        }
        
        //we will see if the activation_date is expired
        if (user.activation_date!='0000-00-00' && new Date(user.activation_date) < oneYearAgo) {
            return { token: null, message: 'Suscripción expirada. Por favor, vuelve a activar tu membresía.' };
        }


        //see if the activation_date not have date of expiration, if not have date, we will set the date of expiration to 1 year or 30 days if is a demo
        if (user.activation_date === '0000-00-00') {
            const suscripcion = new Date(); //current date

            //change the date for the date of the token
            if(user.type_membresy==0){
                suscripcion.setDate(oneYearAgo.getDate() + 30); //We add 30 days to the current date. This is for demos
            }else{
                suscripcion.setFullYear(suscripcion.getFullYear() + 1); //We add 1 year to the current date
            }

            //upate the expiration_date in the database with our api
            const answerApiActivationDate=await get_answer_of_my_api('update_activation_date.php', {suscripcion: suscripcion.toISOString().split('T')[0],token:token});
            
            //we will see if we caned update the activation_date in the database
            if(answerApiActivationDate.data.success){
                user.activation_date=suscripcion; //update the activation_date;
                console.log('Usuario autenticado con éxito.');
                //retur  the answer of the server for save in the software
                return {
                    token: true,
                    type_membresy: user.type_membresy,
                    uuid:user.device_id,
                    activation_date:user.activation_date,
                    message:'Usuario autenticado con éxito.'
                };
            }else{
                return {token:null, message: 'Ocurrio un error al verificar tu Token en el ultimo paso, intentalo otra vez.' };
            }
        }
    } catch (err) {
        console.error('Error al verificar usuario:', err);
        return {token:null,message:err};
    }
}

async function save_the_uui_of_the_user_in_the_database(token, deviceId) {
    // Consulta para actualizar el device_id del usuario en la base de datos
    try {
        const rows = await get_answer_of_my_api('see_if_exist_this_token_in_the_database_of_the_web.php', {token: token,deviceId:deviceId});
        return rows.data.success;
    } catch (err) {
        console.error('Error al actualizar el UUID del dispositivo:', err);
        return false;
    }
}

// Manejar la validación del token desde la ventana de activación
async function verificarTokenActivo() {
    const query = `
        SELECT * FROM pagos 
        WHERE token = ?
    `;

    try {
        const results = await pool.query(query, [TOKEN]);
        console.log(results[0])

        if (results[0].active === 1) {
            console.log('Token encontrado y activo.');
            return true;  // El token está activo
        } else {
            console.log('El token no está activo o no existe.');
            return false;  // El token no está activo o no existe
        }
    } catch (err) {
        console.error('Error al verificar el token:', err);
        return false;  // Si hay un error, retorna false
    }
}

async function actualizarToken() {
    const query = `
        UPDATE pagos 
        SET active = false
        WHERE token = ?
    `;
    
    await pool.query(query, [TOKEN]);
}


// whne Electron is ready, load the web in the screen
app.on('ready', async () => {

    //this is for update the code from github
    await check_if_exist_updates();

    //we will see if the software is a demo
    if(thiIsADemo){
        //start the demo when the exe open for first time
        await initialize_demo();


        //we will see if the demo expired
        if (await is_demo_expired()) {
            dialog.showMessageBoxSync({
                type: 'warning',
                title: 'Demo Expirada',
                message: 'Tu demo de 30 días ha expirado. Por favor, compra la versión completa y sigue creciendo con ED PLUS 🚀.',
            });
            app.quit(); // close the application
            return;
        }
    }else{
        //await remove_install_token();

        //we going to watch if the user have a membreship in this drive
        if(await verify_membership_of_user()){

            //open the server of the application
            serverExpress.listen(serverExpress.get('port'), '0.0.0.0', () => {
                console.log(`Server running on http://${getLocalIP()}:${serverExpress.get('port')}`);
            });
            createMainWindow(); //create the UI of electron 
        }else{
            //if the user not have a membership, we will show the form of login
            createMainWindowRegister();
        }
    }
});

// clouse the screen
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/*
server.listen(app.get('port'), () => {
    console.log('Servidor corriendo en http://localhost:' + app.get('port'));
});
*/