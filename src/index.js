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

//------------------initializations-----------------------------------------//
const app=express();
require('./lib/passport');
//require('./lib/addFrom');
require('./lib/editFrom');

//-----------------------------------------------------------settings-----------------------------------------//
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


//-----------------------------------------------------------middlewares-----------------------------------------//
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

//-----------------------------------------------------------activate the our library-----------------------------------------// 
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


//-----------------------------------------------------------global variables-----------------------------------------//
app.use((req,res,next)=>{
    app.locals.success=req.flash('success');
    app.locals.message=req.flash('message');
    app.locals.user=req.user;
    app.locals.company=req.company;
    app.locals.pack_company = 0;
    app.locals.pack_branch = 0;
    next();
});


//-----------------------------------------chat online-----------------------------------------//
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const users = {}; // object for  mapear users IDs with Socket IDs

io.on('connection', (socket) => {
    // save the relation with the user and his socket ID
    socket.on('registerUser', (userId) => {
        users[userId] = socket.id;
    });

    //send the message to a user in specific
    socket.on('sendMessageToUser', ({ toUserId, message }) => {
        const recipientSocketId = users[toUserId];

        //we will see if exist the user in the socket for send a message or save in the database
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('privateMessage', message);
        } else {
            console.log(`Usuario ${toUserId} no está conectado.`);
        }
    });

    // delete to the user of the registry when disconnecting
    socket.on('disconnect', () => {
        for (const userId in users) {
            if (users[userId] === socket.id) {
                delete users[userId];
                console.log(`Usuario ${userId} desconectado y eliminado de la lista.`);
                break;
            }
        }
    });

    // Escuchar un mensaje enviado por un usuario
    socket.on('sendNotification', (notification) => {
        console.log('Nueva notificación:', notification);

        // Emitir la notificación a todos los demás usuarios
        socket.broadcast.emit('newNotification', notification); 
    });

    socket.on('disconnect', () => {
        console.log('Un usuario se ha desconectado');
    });
});
//-----------------------------------------------------------routes-----------------------------------------//
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