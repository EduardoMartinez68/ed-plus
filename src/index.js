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

//*------------------initializations-----------------------------------------//
const app=express();
require('./lib/passport');
//require('./lib/addFrom');
require('./lib/editFrom');

//*-----------------------------------------------------------settings-----------------------------------------//
app.set('port',process.env.PORT || 4000);
app.set('views',path.join(__dirname,'views'))
app.engine('.hbs',engine({ //we will create the engine for the web
    defaultLayout:'main',
    layoutsDir: path.join(app.get('views'),'layouts'),
    partialsDir: path.join(app.get('views'),'partials'),
    extname: '.hbs',
    helpers:require('./lib/handlebars')
}))
app.set('view engine','.hbs');


//*-----------------------------------------------------------middlewares-----------------------------------------//
require('dotenv').config();
const {APP_PG_USER,APP_PG_HOST,APP_PG_DATABASE,APP_PG_PASSWORD,APP_PG_PORT}=process.env; //this code is for get the data of the database

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
app.use(session({
    secret: 'FudSession',
    resave: false ,
    saveUninitialized:false,
    store: new (require('connect-pg-simple')(session))({
        pool : pgPool,
        tableName : 'session'  
      }),
    //store: new MySQLStore(pool)
}));

const {MY_SITE_KEYS,MY_SECRET_KEY}=process.env; //this code is for get the data of the database
const recaptcha = new RecaptchaV2(MY_SITE_KEYS, MY_SECRET_KEY); //this is for load the Recaptcha in the web for delete to the bots
app.use(recaptcha.middleware.verify);

//*-----------------------------------------------------------activate the our library-----------------------------------------// 
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

const storage=multer.diskStorage({ //this function is for load a image in the forms
    destination: path.join(__dirname,'public/img/uploads'),
    filename: (req,file,cb,filename)=>{
        cb(null,uuid()+path.extname(file.originalname));
    }
});

app.use(multer({storage: storage}).single('image'));


//*-----------------------------------------------------------global variables-----------------------------------------//
app.use((req,res,next)=>{
    app.locals.success=req.flash('success');
    app.locals.message=req.flash('message');
    app.locals.user=req.user;
    app.locals.company=req.company;
    app.locals.pack_company = 0;
    app.locals.pack_branch = 0;
    next();
});


//*-----------------------------------------chat online-----------------------------------------//
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const users = {}; // object for  mapear users IDs with Socket IDs
const connectedEmployees = {}; //this is for that we know how many employees is connection

const chat = require('./services/chat.js');

io.on('connection', async(socket) =>{

    // save the relation with the user and his socket ID
    socket.on('registerUser', async(userId,companyId) => {
        //her we will get the max employees from the database
        const MaxEmployees=await chat.get_max_employee_of_this_company(companyId);

        
        
        //we will see if the user can loading or if the company is to limit
        if (connectedEmployees[companyId] && connectedEmployees[companyId].length >= MaxEmployees) {
            // send a message of rejection to the client
            socket.emit("connectionRejected", "Ups, parece que alcanzaste tu límite de dispositivos conectados. Por favor, actualiza tu membresía.");
            return;
        }

        // add the employee to the map
        socket.companyId = companyId;

        //if the company not exist, we will start the counter from 0
        if (!connectedEmployees[companyId]) {
            connectedEmployees[companyId] = []; //create the list of the employees
        }

        connectedEmployees[companyId].push(socket.id);//if the company exist we will add one more employee

        //we will see if the user exist connect
        if(!users[userId]){
            users[userId] = socket.id; //save the user in the socket
            console.log('usuario agregado');
        }
        else{
            // send a message of rejection to the client
            socket.emit("connectionRejected", "Ups, parece que alcanzaste tu límite de dispositivos conectados. Por favor, actualiza tu membresía.");
            return;
        }


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
        console.log(`Socket desconectado: ${socket.id}`);
      
        // Eliminar al usuario de todas las empresas donde esté conectado
        for (const idEmpresa in connectedEmployees) {
          // Filtrar para eliminar el socket.id desconectado
          connectedEmployees[idEmpresa] = connectedEmployees[idEmpresa].filter(
            (id) => id !== socket.id
          );
      
          // Si no quedan usuarios conectados a esta empresa, eliminarla del objeto
          if (connectedEmployees[idEmpresa].length === 0) {
            delete connectedEmployees[idEmpresa];
            console.log(`Empresa ${idEmpresa} sin usuarios conectados.`);
          }
        }
      
        // Eliminar al usuario del registro 'users'
        for (const userId in users) {
          if (users[userId] === socket.id) {
            delete users[userId];
            console.log(`Usuario ${userId} desconectado y eliminado de la lista.`);
            break; // Salimos del bucle porque ya encontramos al usuario
          }
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
app.use(require('./router'))
app.use(require('./router/authentication'))
app.use(companyName,require('./router/links'))
app.use(companyName,require('./router/links/fudone'))
app.use(companyName,require('./router/links/ceo'))
app.use(companyName,require('./router/links/branch'))
app.use(companyName,require('./router/links/subscription'))
app.use(companyName,require('./router/links/store'))
app.use(companyName,require('./router/links/delivery'))
app.use(companyName,require('./router/links/app'))
app.use(companyName,require('./router/links/CRM'))

app.use(require('./lib/addFrom'));

//add database
//app.use(companyName,require('./router/addDatabase'))

//public
app.use(express.static(path.join(__dirname,'public')));

//---------------------------------------------------------------------------------------------------------------------------

//starting the server
/*
app.listen(app.get('port'),()=>{
    console.log('server on port:',app.get('port'));
});
*/

server.listen(app.get('port'), () => {
    console.log('Servidor corriendo en http://localhost:' + app.get('port'));
});