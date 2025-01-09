const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
const database = require('../../database');
//const sql = fs.readFileSync('database/archivo.sql').toString();

router.get('/install-desktop', isNotLoggedIn, async (req, res) => {
    //her we will see if can connect to the database, and if can connect with the database get the number of user
    const user=await connect_with_the_database();

    //we will see if exist a user in the database
    if(user>0){
        return res.redirect('/links/login-desktop');
    }
    else{
        //if in the database not exist a user, this means that is the first time that the user start the program
        if(await create_database_in_desktop()){
            //if can create the database, we will add the first new user
            return res.redirect('/links/singup-desktop');
        }
    }

    //if no can create the database, we will to show a message of error for that the user can call us
    return res.render('links/desktop/error-start-desktop');
    //res.render('links/desktop');
})

async function connect_with_the_database(){
    try{
        var queryText = 'SELECT * FROM "Fud".users';
        var user = await database.query(queryText);
        return user.rows.length;
    }catch(err){
        console.log('we no can create the database in the desktop '+err);
        return 0;
    }
}

async function create_database_in_desktop(){
    //we will see if can create the database
    try{
        await database.query(sql);
        return true;
    }catch(err){
        console.log('we no can create the database in the desktop '+err);
        return false;
    }
}


router.get('/singup-desktop', isNotLoggedIn, async (req, res) => {
    return res.render('links/desktop/singup-desktop');
})

router.get('/login-desktop', isNotLoggedIn, async (req, res) => {
    return res.render('links/desktop/login-desktop');
})


module.exports = router;