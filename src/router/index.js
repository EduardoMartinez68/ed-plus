const express=require('express');
const router=express.Router();

router.get('/',(req,res)=>{
    // res.render('links/web/login');
    //res.render('links/web/prices');
    //res.render('links/desktop')
    res.redirect('/links/install-desktop');
})

module.exports=router;