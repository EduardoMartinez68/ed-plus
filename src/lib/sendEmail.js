const nodemailer = require('nodemailer'); //this is for send emails 


async function email_to_recover_password(email,token) {
    const toEmail = email;//'fud-technology@hotmail.com' //email
    const subjectEmail = 'Restablecimiento de Password';
    const message = `
        <html>
        <head>
            <style>
                /* Estilos CSS para el correo electrónico */
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 10px;
                    background-color: #f9f9f9;
                }
                .header {
                    background-color: #1648FF;
                    color: #fff;
                    text-align: center;
                    padding: 10px;
                    border-radius: 10px 10px 0 0;
                }
                .content {
                    padding: 20px 0;
                }
                .footer {
                    text-align: center;
                    color: #777;
                    font-size: 14px;
                }
                .token-box {
                    border: 2px solid #1648FF;
                    border-radius: 5px;
                    padding: 10px;
                    text-align: center;
                    margin: 0 auto; /* Centrar el cuadro */
                    max-width: 400px; /* Establecer el ancho máximo */
                }
                .token{
                    font-size: 25px;
                }
            </style>
            <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.2.0/uicons-solid-rounded/css/uicons-solid-rounded.css'>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Restablecimiento de contraseña</h1>
                </div>
                <div class="content">
                    <p>Hola!! 👋, Somos el equipo de {ED} Plus 🚀</p>
                    <p>¿Has solicitado restablecer tu contraseña? Utiliza el siguiente token para completar el proceso:</p>
                    <div class="token-box">
                        <strong class="token">${token}</strong>
                    </div>
                    <div><p>Si no has solicitado este restablecimiento, puedes ignorar este correo.</p></div>
                    <p>Saludos, Equipo de Soporte y mucha suerte!! 😉❤️</p>
                </div>
                <div class="footer">
                    <p>Este es un mensaje automático, por favor no responda a este correo.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    //we will watching can sen a token to the email of the user 
    return await send_email(toEmail, subjectEmail, message);
}

async function welcome_email(email,name) {
    const toEmail = email;//'fud-technology@hotmail.com' //email
    const subjectEmail = '🚀 ¡Bienvenido a {ED} PLUS! 🚀';
    const message = `
        <html>
        <head>
            <style>
                /* Estilos CSS para el correo electrónico */
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 10px;
                    background-color: #f9f9f9;
                }
                .header {
                    background-color: #FF002A;
                    color: #fff;
                    text-align: center;
                    padding: 10px;
                    border-radius: 10px 10px 0 0;
                }
                .content {
                    padding: 20px;
                }
                .footer {
                    text-align: center;
                    color: #777;
                    font-size: 14px;
                }
                .button {
                    display: inline-block;
                    background-color: #FF002A;
                    color: #fff;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    text-align: center;
                }
                .icon {
                    display: block;
                    margin: 0 auto 20px;
                    width: 100px; /* ajusta el tamaño de la imagen según sea necesario */
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Bienvenido a Füd Technology!</h1>
                </div>
                <div class="content">
                    <img class="icon" src="https://cdn-icons-png.flaticon.com/256/2274/2274543.png" alt="Ícono de Füd Technology">
                    <hr>
                    <h2 style="color: #FF002A; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Hola, ${name}! 👋</h2>
                    <p>Te damos una cálida bienvenida a la mejor plataforma gastronomica de Mexico. 💪</p>
                    <p>En Füd Technology, estamos comprometidos a proporcionarte la mejor experiencia posible y nos comprometemos a 
                    ofrecerte las herramientas y recursos necesarios para alcanzar tus objetivos.</p>
                    <br>
                    <center>⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐</center>
                    <br>
                    <p>Estamos aquí para ayudarte en cada paso del camino. 😉</p>
                    <p>Para comenzar, te invitamos a explorar nuestra plataforma y descubrir todo lo que tenemos para ofrecerte.</p>

                    <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. 🤗</p>
                    <p>¡Gracias por unirte a {ED PLUS} y esperamos que tengas una experiencia increíble con nosotros! ❤️</p>
                    <br><br>
                    <a class="button" href="https://fud-tech.cloud">Explora Ahora 🚀</a>
                </div>
                <div class="footer">
                    <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    //we will watching can sen a token to the email of the user 
    return await send_email(toEmail, subjectEmail, message);
}

async function welcome_email_ad(email,name,password) {
    const toEmail = email;//'fud-technology@hotmail.com' //email
    const subjectEmail = '🚀 ¡Bienvenido a Füd Technology! 🚀';
    const message = `
        <html>
        <head>
            <style>
                /* Estilos CSS para el correo electrónico */
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 10px;
                    background-color: #f9f9f9;
                }
                .header {
                    background-color: #FF002A;
                    color: #fff;
                    text-align: center;
                    padding: 10px;
                    border-radius: 10px 10px 0 0;
                }
                .content {
                    padding: 20px;
                }
                .footer {
                    text-align: center;
                    color: #777;
                    font-size: 14px;
                }
                .button {
                    display: inline-block;
                    background-color: #FF002A;
                    color: #fff;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    text-align: center;
                }
                .icon {
                    display: block;
                    margin: 0 auto 20px;
                    width: 100px; /* ajusta el tamaño de la imagen según sea necesario */
                }
                .token-box {
                    border: 2px solid #FF002A;
                    border-radius: 5px;
                    padding: 10px;
                    text-align: center;
                    margin: 0 auto; /* Centrar el cuadro */
                    max-width: 400px; /* Establecer el ancho máximo */
                }
                .token{
                    font-size: 25px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Bienvenido a Füd Technology!</h1>
                </div>
                <div class="content">
                    <img class="icon" src="https://cdn-icons-png.flaticon.com/256/2274/2274543.png" alt="Ícono de Füd Technology">
                    <hr>
                    <h2 style="color: #FF002A; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Hola, ${name}! 👋</h2>
                    <p>Te damos una cálida bienvenida a la mejor plataforma gastronomica de Mexico. 💪</p>
                    <p>En Füd Technology, estamos comprometidos a proporcionarte la mejor experiencia posible y nos comprometemos a 
                    ofrecerte las herramientas y recursos necesarios para alcanzar tus objetivos.</p>
                    <br>
                    <center>⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐</center>
                    <br>
                    <div class="token-box">
                        <p>PASSWORD:</p>
                        <strong class="token">${password}</strong>
                    </div>
                    <br>
                    <p>Estamos aquí para ayudarte en cada paso del camino. 😉</p>
                    <p>Para comenzar, te invitamos a explorar nuestra plataforma y descubrir todo lo que tenemos para ofrecerte.</p>

                    <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. 🤗</p>
                    <p>¡Gracias por unirte a Füd y esperamos que tengas una experiencia increíble con nosotros! ❤️</p>
                    <br><br>
                    <a class="button" href="https://fud-tech.cloud/fud/login">Explora Ahora 🚀</a>
                </div>
                <div class="footer">
                    <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    //we will watching can sen a token to the email of the user 
    return await send_email(toEmail, subjectEmail, message);
}

async function send_email(toEmail, subjectEmail, message) {
    //get the data of the email from the file .env
    const { APP_PASSWORD_EMAIL,APP_EMAIL_EMAIL } = process.env;

    //this is for email google
    const transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: APP_EMAIL_EMAIL,
            pass: APP_PASSWORD_EMAIL
        }
    });
    //we will to connecting with the email 
    /*
    const transport = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false, // true para el puerto 465, false para otros puertos
        auth: {
          user: 'fud-technology@hotmail.com', // Tu dirección de correo electrónico desde donde enviarás el mensaje
          pass: APP_PASSWORD_EMAIL // La contraseña de tu cuenta de correo electrónico
        }
      });*/

    //we will to create the content of the message 
    const mailOptions = {
        from: 'Füd Technology 🛎️',
        to: toEmail,
        subject: subjectEmail,
        html: message
    };

    //send 
    transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo electrónico:', error);
        } else {
            console.log('Correo electrónico enviado:', info.response);
        }
    });

    return true;
}

async function send_email_for_parthner(email,name) {
    const toEmail = email;//'fud-technology@hotmail.com' //email
    const subjectEmail = '🚀 ¡Haz crecer tu negocio con PLUS! 🚀';
    const message = `
            <!DOCTYPE html>
            <html lang='es'>
            <head>
            <meta charset='UTF-8'>
            <style>
                body {
                font-family: 'Segoe UI', sans-serif;
                background-color: #f4f6f8;
                margin: 0;
                padding: 0;
                }
                .container {
                background-color: #ffffff;
                max-width: 650px;
                margin: 40px auto;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 8px 20px rgba(0,0,0,0.08);
                }
                .header {
                background: linear-gradient(90deg, #0576F8, #00C8FF);
                color: #ffffff;
                padding: 30px;
                text-align: center;
                }
                .header h1 {
                margin: 0;
                font-size: 32px;
                letter-spacing: 1px;
                }
                .image-banner {
                width: 60%;
                height: auto;
                margin-top: 20px;
                }
                .content {
                padding: 30px;
                color: #333333;
                }
                .welcome-box {
                background: linear-gradient(to right, #e3f2fd, #f0f7ff);
                border-left: 6px solid #0576F8;
                border-radius: 12px;
                padding: 20px 25px;
                margin-bottom: 30px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }
                .welcome-box p {
                margin: 10px 0;
                font-size: 16px;
                line-height: 1.6;
                }
                .welcome-box strong {
                color: #0576F8;
                }
                .content h2 {
                color: #0576F8;
                margin-bottom: 10px;
                }
                .content p {
                line-height: 1.6;
                }
                .cta {
                background-color: #0576F8;
                color: #ffffff;
                padding: 15px 25px;
                border-radius: 8px;
                text-align: center;
                text-decoration: none;
                font-weight: bold;
                display: inline-block;
                margin-top: 20px;
                }
                ul {
                margin-top: 15px;
                padding-left: 20px;
                }
                ul li {
                margin-bottom: 10px;
                }
                .footer {
                background-color: #f1f5f9;
                color: #555555;
                text-align: center;
                padding: 20px;
                font-size: 14px;
                }

                .img-information{
                    width: 100%;
                    height: auto;
                }
                .cta {
                  background-color: #0576F8;
                  color: #ffffff;
                  padding: 12px 25px;
                  border-radius: 8px;
                  text-decoration: none;
                  display: inline-block;
                  margin-top: 25px;
                  font-weight: bold;
                }
            </style>
            </head>
            <body>

            <div class='container'>
                <div class='header'>
                <h1>¡Haz crecer tu negocio con PLUS!</h1>
                </div>
                <center>
                    <img src='https://www.pluspuntodeventa.com/img/home.webp' alt='Licencia Servidor PLUS' class='image-banner'>
                </center>

                <div class='content'>

                <div class='welcome-box'>
                    <p><strong>Hola, ${name} 👋</strong></p>
                    <p>Estamos muy emocionados de enviarte esta propuesta para que formes parte de nuestra red de distribuidores oficiales de <strong>PLUS</strong> ❤️. 
                    Creemos que tu empresa es ideal para representar un sistema innovador, rentable y fácil de vender 🌟</p>
                </div>

                <h2>¿Qué es PLUS? 🤔</h2>
                <p><strong>PLUS</strong> es el <strong>mejor sistema de punto de venta</strong> diseñado especialmente para <span style='color:#0576F8;font-weight:bold'>farmacias, tiendas de abarrotes, ferreterías, papelerías, tlapalerías y más</span>. Rápido, confiable y fácil de usar. Una solución completa para controlar ventas, inventarios, clientes y mucho más 🤩</p>

                <h2>¿Por qué ser distribuidor oficial? ⭐</h2>
                <ul>
                    <li>✅ Aumenta tus ingresos ofreciendo una solución confiable y de alta demanda</li>
                    <li>✅ Recibe soporte personalizado y materiales de venta</li>
                    <li>✅ Descuentos desde el 35% hasta el 50% (según las licencias adquiridas).</li>
                    <li>✅ Recibe acompañamiento técnico y comercial en todo momento.</li>
                    <li>✅ ¡PLUS se vende solo!</li>
                </ul>
                
                  <p>¿Quieres ver cómo funciona PLUS en acción? Mira este breve video de presentación:</p>
                  <a class='cta' href='https://www.youtube.com/@bestpointsoftwarepuntodeve2638' target='_blank'>🎬 Ver el trailer de PLUS</a>
                  
                  
                <p>Buscamos negocios, técnicos y emprendedores que quieran <strong>representar nuestra marca</strong> en distintas regiones del país 🇲🇽.</p>
                <center>
                    <img src='https://www.pluspuntodeventa.com/img/parthner/parthner.webp' alt='' class='img-information'>
                </center>
                <br>
                <p style='margin-top: 30px;'>Para más información, contáctanos por WhatsApp:<br>
                    <strong style='font-size: 18px;'>+52 444 304 2129</strong>
                </p>
                </div>

                <div class='footer'>
                Visítanos en <a href='https://pluspuntodeventa.com/parthner.php' target='_blank' style='color:#0576F8;text-decoration:none;'><strong>www.pluspuntodeventa.com</strong></a><br>
                Tecnología con un toque de magia 💫
                </div>
            </div>

            </body>
            </html>
    `;
    //we will watching can sen a token to the email of the user 
    return await send_email(toEmail, subjectEmail, message);
}

async function send_email_for_future_customer(email,company,token,category,expirationDate) {
    const toEmail = email;//'fud-technology@hotmail.com' //email
    const subjectEmail = '🚀 ¡Haz crecer tu negocio con PLUS! 🚀';
    const message = `
        <!DOCTYPE html>
        <html lang='es'>
        <head>
          <meta charset='UTF-8'>
          <title>Demo gratuito de PLUS</title>
          <style>
            body {
              font-family: 'Segoe UI', sans-serif;
              background-color: #f4f6f8;
              margin: 0;
              padding: 0;
            }
            .container {
              background-color: #ffffff;
              max-width: 650px;
              margin: 40px auto;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 8px 20px rgba(0,0,0,0.08);
            }
            .header {
              background: linear-gradient(90deg, #0576F8, #00C8FF);
              color: #ffffff;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 30px;
              color: #333333;
            }
            .content h2 {
              color: #0576F8;
              margin-bottom: 15px;
            }
            .content p {
              line-height: 1.6;
              font-size: 16px;
            }
            .highlight {
              background-color: #f1f5f9;
              border-left: 4px solid #0576F8;
              padding: 15px;
              margin: 20px 0;
              font-size: 16px;
            }
            .token {
              background-color: #0576F8;
              color: #ffffff;
              font-weight: bold;
              padding: 10px 15px;
              display: inline-block;
              border-radius: 6px;
              margin-top: 10px;
              font-size: 18px;
            }
            .cta {
              background-color: #0576F8;
              color: #ffffff;
              padding: 12px 25px;
              border-radius: 8px;
              text-decoration: none;
              display: inline-block;
              margin-top: 25px;
              font-weight: bold;
            }
            .footer {
              background-color: #f1f5f9;
              color: #555555;
              text-align: center;
              padding: 20px;
              font-size: 14px;
            }
            .footer a {
              color: #0576F8;
              text-decoration: none;
            }
            .token-box {
              background-color: #f1f5f9;
              border: 2px dashed #0576F8;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              font-size: 22px;
              font-weight: bold;
              color: #0576F8;
              margin: 25px 0;
            }
        
            .btn-descargar {
              background: linear-gradient(135deg, #0576F8, #00C6FF);
              color: white;
              padding: 16px 36px;
              font-size: 20px;
              font-weight: bold;
              border: none;
              border-radius: 50px;
              cursor: pointer;
              box-shadow: 0 10px 25px rgba(0, 123, 255, 0.3);
              transition: transform 0.3s ease, box-shadow 0.3s ease;
              text-decoration: none;
              position: relative;
              overflow: hidden;
            }
        
            .btn-descargar:hover {
              transform: scale(1.08);
              box-shadow: 0 15px 30px rgba(0, 123, 255, 0.4);
            }
        
            .btn-descargar::after {
        
              position: absolute;
              right: 20px;
              top: 50%;
              transform: translateY(-50%);
              font-size: 22px;
            }
          </style>
        </head>
        <body>
        
          <div class='container'>
            <div class='header'>
              <h1>¡Haz crecer tu negocio con PLUS!🚀</h1>
            </div>
        
            <div class='content'>
              <h2>Te invitamos a probar PLUS totalmente gratis 🤩</h2>
              <p>Hola, ${company}. Nos encantaría ofrecerte un <strong>demo gratuito de 30 días</strong> para que pruebes <strong>PLUS</strong>, nuestro sistema de punto de venta diseñado especialmente para tu <span style='color:#0576F8;font-weight:bold'>${category}</span>.</p>
        
              <h2>Tu token de activación:</h2>
              <div class='token-box'>
                ${token}
              </div>
              <br>
              <center>
                <a href='https://www.mediafire.com/file/nm5v5lk39m6ma5q/PLUS_INSTALADOR.zip/file' class='btn-descargar' download>
                    Descarga PLUS gratis 🤩
                </a>
              </center>
              <br>
        
              <h2>¿Por qué usar PLUS?</h2>
              <ul>
                <li>✅ Control total de inventario y ventas</li>
                <li>✅ Gestión de empleados y reportes automáticos</li>
                <li>✅ Facturación electrónica y control de clientes</li>
                <li>✅ Compatible con lectores de código de barras, cajones y más</li>
                <li>✅ Interfaz moderna, rápida y fácil de usar</li>
              </ul>
        
              <p>¿Quieres ver cómo funciona PLUS en acción? Mira este breve video de presentación:</p>
              <a class='cta' href='https://www.youtube.com/@bestpointsoftwarepuntodeve2638' target='_blank'>🎬 Ver el trailer de PLUS</a>
              
                <h2 style='margin-top: 40px;'>🎁 Oferta Especial Limitada</h2>
                <div class='highlight' style='text-align:center; font-size: 18px; font-weight: 500;'>
                    <p style='margin-bottom: 10px;'>Consigue tu oferta ahora. <strong>Ahórrate hasta un 60%</strong>!</p>
                    <p style='font-size: 16px; margin-bottom: 10px;'>ANTES <del style='color: red;'>$2,999</del>, AHORA DESDE <span style='font-size: 22px; font-weight: bold; color: green;'>$1,199*</span></p>
                    <p style='color: #888;'>Oferta válida hasta el <strong>${expirationDate}</strong>.</p>
                </div>
              <p style='margin-top:30px;'>Si tienes cualquier duda o deseas apoyo con la instalación, contáctanos por WhatsApp:<br>
                <strong style='font-size:18px;'>+52 55 1234 5678</strong>
              </p>
            </div>
        
            <div class='footer'>
              Tecnología con un toque de magia 💫<br>
              Visítanos en <a href='https://www.pluspuntodeventa.com' target='_blank'>www.pluspuntodeventa.com</a>
            </div>
          </div>
        
        </body>
        </html>

    `;

    //we will watching can sen a token to the email of the user 
    return await send_email(toEmail, subjectEmail, message);
}


module.exports={
    send_email,
    email_to_recover_password,
    welcome_email,
    welcome_email_ad,
    send_email_for_parthner,
    send_email_for_future_customer
};