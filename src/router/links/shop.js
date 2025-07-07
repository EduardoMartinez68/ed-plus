const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
require('dotenv').config();
const { TYPE_DATABASE } = process.env;

/*
*----------------------functions-----------------*/
//functions image
const {
    get_path_img,
    delate_image_upload,
    upload_image_to_space,
    delete_image_from_space,
    create_a_new_image,
    delate_image
} = require('../../services/connectionWithDatabaseImage');
//functions branch
const {
    get_data_branch,
    get_all_box_of_the_branch_with_his_id
} = require('../../services/branch');

//functions permission
const {
    this_user_have_this_permission
} = require('../../services/permission');

const {getToken}=require('../../middleware/tokenCheck.js');

router.get('/:id_company/:id_branch/shop', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    //fitst we will see if exist a token in this desktop
    const token=getToken();
    if(token){
        //we will see if the user not have the permission for this App.
        if (!this_user_have_this_permission(req.user, id_company, id_branch, 'edit_shop_online')) {
            req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
            return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
        }


        const branchFree = await get_data_branch(id_branch);
        res.render('links/shop/formShop', {branchFree, token});
    }else{
        req.flash('message', 'Lo siento, no tienes ningun Token valido en este equipo 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);  
    }
});


router.get('/:id_company/:id_branch/products-shop', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    //fitst we will see if exist a token in this desktop
    const token=getToken();
    if(token){
        //we will see if the user not have the permission for this App.
        if (!this_user_have_this_permission(req.user, id_company, id_branch, 'edit_shop_online')) {
            req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
            return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
        }


        const branchFree = await get_data_branch(id_branch);
        res.render('links/shop/catalogo', {branchFree, token});
    }else{
        req.flash('message', 'Lo siento, no tienes ningun Token valido en este equipo 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);  
    }
});

router.get('/:id_company/:id_branch/add-products-shop', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    //fitst we will see if exist a token in this desktop
    const token=getToken();
    if(token){
        //we will see if the user not have the permission for this App.
        if (!this_user_have_this_permission(req.user, id_company, id_branch, 'edit_shop_online')) {
            req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
            return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
        }


        const branchFree = await get_data_branch(id_branch);
        res.render('links/shop/addProduct', {branchFree, token});
    }else{
        req.flash('message', 'Lo siento, no tienes ningun Token valido en este equipo 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);  
    }
});



module.exports = router;