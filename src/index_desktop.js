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
        // Make sure the remote repository is configured correctly
        await git.fetch(remote);

        // Ignore changes in the folder 'img/'
        await git.raw(['update-index', '--assume-unchanged', 'src/public/img/uploads/']);

        // Stash local changes to avoid rebase errors
        await git.stash();

        // Compare if there are remote changes
        const log = await git.log(['origin/main', '-1']);
        const localLog = await git.log(['HEAD', '-1']);

        // Check if the current commit is the same as the remote commit
        if (log.latest.hash !== localLog.latest.hash) {
            console.log('🔄 Nueva versión encontrada, actualizando...');

            await git.pull('origin', 'main', { '--rebase': null });

            // Show a dialog to inform the user that an update is available
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

        // Apply stashed changes (if any)
        await git.stash(['pop']);
    } catch (error) {
        console.error('❌ Error verificando actualizaciones:', error);
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
require('dotenv').config();
const {APP_PG_USER,APP_PG_HOST,APP_PG_DATABASE,APP_PG_PASSWORD,APP_PG_PORT, TOKEN}=process.env; //this code is for get the data of the database

const pg = require('pg');
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
serverExpress.use(companyName,require('./router/links/fudone'))
serverExpress.use(companyName,require('./router/links/ceo'))
serverExpress.use(companyName,require('./router/links/branch'))
serverExpress.use(companyName,require('./router/links/subscription'))
serverExpress.use(companyName,require('./router/links/store'))
serverExpress.use(companyName,require('./router/links/delivery'))
serverExpress.use(companyName,require('./router/links/app'))
serverExpress.use(companyName,require('./router/links/CRM'))
serverExpress.use(companyName,require('./router/links/desktop'))
serverExpress.use(companyName,require('./router/links/boutique'))
serverExpress.use(companyName,require('./router/links/cashCut'))

serverExpress.use(require('./lib/addFrom'));

//add database
//app.use(companyName,require('./router/addDatabase'))

//public
serverExpress.use(express.static(path.join(__dirname,'public')));

//*-----------------------------------------------------------Server application-----------------------------------------//
/*
    SETTING IN PACKAGE.JSON
  "main": "index_desktop.js",
  "scripts": {
    "start": "node src/index_desktop.js",
    "dev": "nodemon src/"
  },
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
const mysql = require('mysql');
const { promisify } = require('util');
const pool = mysql.createPool({
    host: '193.203.166.165',
    user: 'u995592926_bestpoint',
    password: 'Bobesponja48*',
    database: 'u995592926_bestpoint',
    waitForConnections: true,
    connectionLimit: 10,  // Puedes ajustar el número según tus necesidades
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('La conexión a la base de datos fue cerrada.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('La base de datos tiene muchas conexiones.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('La conexión a la base de datos fue rechazada.');
        }
    }

    if (connection) {
        connection.release();
        console.log('Conexión a la base de datos exitosa MYSQL.');
    }

    return;
})

pool.query=promisify(pool.query)

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

ipcMain.on('login-from-render-token', async (event, datos) => {
    //her we will save all the information of the software
    const token=datos.token;
    const answer=await see_if_exist_this_token_in_the_database_of_the_web(token);

    //we will see if exist a token of activation
    if(answer.token){
        let canUpdate=true;

        //now we will see if the user is login from the same computer
        if (answer.uuid){
            if(answer.uuid !== deviceId) {
                answer.message='Este usuario ya tiene un TOKEN registrado en un equipo.'
                canUpdate=false;
            }
        }

        //save the uui in the database
        if(canUpdate){
            if(await save_the_uui_of_the_user_in_the_database(token,deviceId)){
                //now save all the information of the user in the website
                await initialize_token(token);
                await create_expiration_date_of_the_token(answer.activation_date);
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
    const query = `
        SELECT token, type_membresy, password AS hashedPassword, activation_date 
        FROM users 
        WHERE email = ?
    `;

    try {
        const rows = await pool.query(query, [email]); // pool.query devuelve un array de resultados
        if (rows.length === 0) {
            return {token:null,message:'Usuario no encontrado.'};
        }

        const user = rows[0];

        // Comparar la contraseña con la almacenada en la base de datos
        const match = await bcrypt.compare(password, user.hashedPassword);
        if (!match) {
            return {token:null,message:'Contraseña incorrecta.'};
        }

        // Verificar si el usuario está activo
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1); // Restamos 1 año a la fecha actual
        
        if (new Date(user.activation_date) < oneYearAgo) {
            return { token: null, message: 'Suscripción expirada. Por favor, vuelve a activar tu membresía.' };
        }

        console.log('Usuario autenticado con éxito.');
        return {
            token: user.token,
            type_membresy: user.type_membresy,
            message:'Usuario autenticado con éxito.'
        };
    } catch (err) {
        console.error('Error al verificar usuario:', err);
        return {token:null};
    }
}

async function see_if_exist_this_token_in_the_database_of_the_web(token) {
    const query = `
        SELECT token, type_membresy, activation_date , device_id
        FROM pagos 
        WHERE token = ?
    `;

    try {
        const rows = await pool.query(query, [token]); // pool.query devuelve un array de resultados
        if (rows.length === 0) {
            return {token:null,message:'Token no encontrado.'};
        }

        const user = rows[0];

        // Verificar si el usuario está activo
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1); // Restamos 1 año a la fecha actual
        
        if (user.activation_date!='0000-00-00' && new Date(user.activation_date) < oneYearAgo) {
            return { token: null, message: 'Suscripción expirada. Por favor, vuelve a activar tu membresía.' };
        }

        //see if the activation_date not have date of expiration
        if (user.activation_date === '0000-00-00') {
            const suscripcion = new Date(); // Fecha actual
            suscripcion.setFullYear(suscripcion.getFullYear() + 1); // Sumamos 1 año a la fecha actual
        
            // Actualizar la fecha en la base de datos
            const updateQuery = `
                UPDATE users 
                SET activation_date = ?
                WHERE token = ?
            `;
            await pool.query(updateQuery, [suscripcion.toISOString().split('T')[0], user.token]);

            user.activation_date=suscripcion; //update the activation_date;
        }
        

        console.log('Usuario autenticado con éxito.');
        return {
            token: true,
            type_membresy: user.type_membresy,
            uuid:user.device_id,
            activation_date:user.activation_date,
            message:'Usuario autenticado con éxito.'
        };
    } catch (err) {
        console.error('Error al verificar usuario:', err);
        return {token:null};
    }
}


async function save_the_uui_of_the_user_in_the_database(token, deviceId) {
    // Consulta para actualizar el device_id del usuario en la base de datos
    const query = `
        UPDATE pagos 
        SET device_id = ? , active = false
        WHERE token = ?
    `;

    try {
        // Ejecuta la consulta de actualización
        const result = await pool.query(query, [deviceId, token]);
        return true;
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
        if(await verify_membership_of_user()){
            serverExpress.listen(serverExpress.get('port'), '0.0.0.0', () => {
                console.log(`Server running on http://${getLocalIP()}:${serverExpress.get('port')}`);
            });
            createMainWindow();
        }else{
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