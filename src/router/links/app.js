const express = require('express');
const router = express.Router();
const {
    send_email_for_parthner,
    send_email_for_future_customer
} = require('../../lib/sendEmail');

router.get('/tables', (req, res) => {
    res.render("links/branch/tables/tables");
});


router.get('/send_emails', (req, res) => {
    res.render("links/branch/CRM/sendEmails");
});

router.post('/sendEmailFutureParthner', async (req, res) => {
    const { name, email } = req.body;
    await send_email_for_parthner(email,name);
    req.flash('success', 'Email enviado con éxito 😄');
    res.redirect('/links/send_emails')
});

router.post('/sendEmailFutureCustomer', async (req, res) => {
    const { company, email, category, token} = req.body;
    const currentDate = new Date();
    const expirationDate = new Date(currentDate);
    expirationDate.setDate(currentDate.getDate() + 30);
    
    const expirationFormatted = formatExpirationDate(expirationDate);
    await send_email_for_future_customer(email,company,token,category,expirationFormatted) 
    req.flash('success', 'Email enviado con éxito 😄');
    res.redirect('/links/send_emails')
});

function formatExpirationDate(date) {
    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const año = date.getFullYear();

    return `${dia}/${mes}/${año}`;
}


module.exports = router;