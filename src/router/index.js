const express=require('express');
const router=express.Router();
const system=require('../lib/system');

router.get('/',(req,res)=>{
    //res.render('links/web/login');
    //res.render('links/web/prices');
    //res.render('links/desktop')
    
    //we will see if the user have the app desktop 
    if(system=='desktop'){
        //res.redirect('/links/install-desktop');
        res.redirect('/links/login-desktop');
    }
    else{
        res.render('links/web/prices');
    }
})

module.exports=router;