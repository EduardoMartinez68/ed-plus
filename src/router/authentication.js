const express=require('express');
const router=express.Router();
const passport=require('passport');
const {isLoggedIn,isNotLoggedIn}=require('../lib/auth');
//---------------------------------------------------------------------web
router.get('/links/signup',isNotLoggedIn,(req,res)=>{
    //res.render('links/web/singup');
    res.render('links/web/loginAd');
});

router.get('/links/login',isNotLoggedIn,(req,res)=>{
    res.render('links/web/login');
});

router.get('/links/logout',(req,res)=>{
    req.logout(function(err) {
        if (err) {
          console.error('Error al desautenticar:', err);
          return res.status(500).json({ message: 'Error al desautenticar' });
        }
        res.redirect('/links/login');
    })
});

router.post('/fud/signup',passport.authenticate('local.signup',{
        successRedirect: '/links/home',
        failureRedirect: '/links/signup',
        failureFlash:true
}));

router.post('/fud/login',passport.authenticate('local.login',{
    successRedirect: '/links/home',
    failureRedirect: '/links/login',
    failureFlash:true
}));

//---------------------------------------------------------------------CEO
router.post('/fud/addCompany',passport.authenticate('local.add_company',{
    successRedirect: '/fud/add-company',
    failureRedirect: '/fud/add-company',
    failureFlash:true
}));

router.post('/fud/editCompany',passport.authenticate('local.edit_company',{
    successRedirect: '/links/home',
    failureRedirect: '/links/home',
    failureFlash:true
}));

router.post('/fud/:id/add-branch',passport.authenticate('local.add_branch',{
    successRedirect: '/links/home',
    failureRedirect: '/links/home',
    failureFlash:true
}));


module.exports=router;