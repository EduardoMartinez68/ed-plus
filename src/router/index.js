const express=require('express');
const router=express.Router();

router.get('/',(req,res)=>{
   // res.render('links/web/login');
    res.render('links/web/prices');
})

module.exports=router