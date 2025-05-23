const system=require('./lib/system');

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


//*------------------initializations-----------------------------------------//
const serverExpress=express();

require('./lib/passport');
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
const fs = require('fs');
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

require('dotenv').config();
const {APP_PG_USER,APP_PG_HOST,APP_PG_DATABASE,APP_PG_PASSWORD,APP_PG_PORT}=process.env; //this code is for get the data of the database

const pg = require('pg');


//this is for know if the APP is in the desktop or in the server
const adminPool = new pg.Pool({
    user: APP_PG_USER,
    host: APP_PG_HOST,
    password: APP_PG_PASSWORD,
    port: APP_PG_PORT,
    database: APP_PG_DATABASE // base por defecto
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
      await adminPool.query('CREATE DATABASE edplus'); //if not exist, we will create the database
      importSQLFile(adminPool); //this is for import the database of EDPLUS.sql
      console.log('📦 Base de datos EDPLUS creada');
    } else {
      console.log('📂 La base de datos EDPLUS ya existe, no se creó nuevamente.');
      
      //if the user has PLUS installed, now we will update the database
      await create_update_of_the_database(adminPool); 
    }
};
createDatabase(); //if not exist the database we will create the database

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

const storageImages = multer.diskStorage({
    destination: path.join(__dirname, 'public/img/uploads'),
    filename: (req, file, cb) => {
        cb(null, uuid() + path.extname(file.originalname));
    }
});

serverExpress.use(multer({storage: storageImages}).single('image'));

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


io.on('connection', async(socket) =>{
    console.log('Un usuario se ha conectado');
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


    //*-----------------------------------ORDERS-----------------------------------
    // Recibir nuevas comandas del cliente
    socket.on('sendAllTheOrders', message => {
        socket.emit('getAllTheOrders', {orderKitchen});
    });

    socket.on('saveANewOrder', order => {
        const newOrder = JSON.parse(order);
        newOrder.id = orderKitchen.length + 1; // Asigna un nuevo ID
        orderKitchen.push(newOrder);
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

//add database
//app.use(companyName,require('./router/addDatabase'))

//public
serverExpress.use(express.static(path.join(__dirname,'public')));

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

//starting the server in the computer
serverExpress.listen(serverExpress.get('port'), '0.0.0.0', () => {
    console.log(`Server running on http://${getLocalIP()}:${serverExpress.get('port')}`);
});


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
