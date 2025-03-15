const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
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

const {
    get_data_employee
} = require('../../services/employees');

const {
    get_all_ad,
} = require('../../services/ad');

const {
    this_employee_works_here,
    get_all_dish_and_combo,
    get_all_data_combo_most_sold,
    get_data_recent_combos,
    get_all_products_in_sales
} = require('../../services/store');

const {
    get_all_invoice_with_the_id_of_the_branch
} = require('../../services/invoice');

const {
    get_data_company_with_id
} = require('../../services/company');

//functions permission
const {
    this_user_have_this_permission
} = require('../../services/permission');

router.get('/:id_user/:id_company/:id_branch/:id_employee/:id_role/store-home', isLoggedIn, async (req, res) => {
    try {

        const { id_company, id_branch } = req.params;

        //we will see if the user not have the permission for this App.
        if(!this_user_have_this_permission(req.user,id_company, id_branch,'app_point_sales')){
            req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
            return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
        }

        const branchFree = await get_data_branch(id_branch);
        const dataEmployee = await get_data_employee(req);

        const dishAndCombo = await get_all_dish_and_combo(id_company, id_branch);
        console.log(dishAndCombo)
        
        const newCombos = await get_data_recent_combos(id_company);
        const mostSold = await get_all_data_combo_most_sold(id_branch);
        const offerAd = await get_all_ad(id_branch, 'offer');
        const newAd = await get_all_ad(id_branch, 'new');
        const combosAd = await get_all_ad(id_branch, 'combo');
        const specialsAd = await get_all_ad(id_branch, 'special');
        const addition = '{"nombre": "Juan", "edad": 30, "ciudad": "Madrid"}'; // Ejemplo de datos adicionales
        const boxes=await get_all_box_of_the_branch_with_his_id(id_branch);

        //const productsSales=await get_all_products_in_sales(id_branch);
        const dataCompany=await get_data_company_with_id(id_company);
        const templateData = {
            branchFree,
            dishAndCombo,
            dataEmployee,
            mostSold,
            newCombos,
            offerAd,
            newAd,
            combosAd,
            specialsAd,
            boxes,
            dataCompany,
            addition: JSON.stringify(addition)
        };

        res.render('links/store/home/home', templateData);
    } catch (error) {
        console.error('Error en la ruta store-home:', error);
        res.render('error'); // Renderizar una página de error adecuada
    }
});

router.get('/store-home', isLoggedIn, async (req, res) => {
    res.render('links/store/home/home');
})


router.get('/:id_company/:id_branch/:id_employee/create-invoice', isLoggedIn, async (req, res) => {
    res.render('links/store/invoice/createInvoice');
})

router.get('/:id_company/:id_branch/invoice', isLoggedIn, async (req, res) => {
    const {id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);
    const invoice=await get_all_invoice_with_the_id_of_the_branch(id_branch);
    res.render('links/store/invoice/invoice',{branchFree,invoice});
})








module.exports = router;