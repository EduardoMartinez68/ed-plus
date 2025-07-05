const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
require('dotenv').config();
const { TYPE_DATABASE } = process.env;
const database = require('../../database');

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
    get_all_products_in_sales,
    get_all_the_promotions,
    get_the_products_most_sales_additions,
    get_all_dish_and_combo_without_lots
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

const {
    get_the_setting_of_the_ticket,
    update_setting_ticket
} = require('../../services/ticket');

router.get('/:id_company/:id_branch/tickets', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;

    //we will see if the user not have the permission for this App.
    if (!this_user_have_this_permission(req.user, id_company, id_branch, 'edit_ticket')) {
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }


    const branchFree = await get_data_branch(id_branch);
    const dataCompany=await get_data_company_with_id(id_company)
    const settingTicket=await get_the_setting_of_the_ticket(id_company, id_branch);
    res.render('links/tickets/tickets', {branchFree,dataCompany, settingTicket});
});

router.get('/:id_company/:id_branch/edit-tickets', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    
    //we will see if the user not have the permission for this App.
    if (!this_user_have_this_permission(req.user, id_company, id_branch, 'return_ticket')) {
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }


    const branchFree = await get_data_branch(id_branch);
    const dataCompany=await get_data_company_with_id(id_company)
    res.render('links/tickets/tickets', {branchFree,dataCompany});
});

router.post('/:id_company/:id_branch/:id_ticket/update_ticket', isLoggedIn, async (req, res) => {
    const { id_ticket } = req.params;
    const id_company = req.user.id_company;
    const id_branch = req.user.id_branch;
    const normalizedData = normalizeTicketData(req.body);

    if (await update_setting_ticket(id_branch, normalizedData)) {
        req.flash('success', 'Configuración del ticket actualizada 🎉');
    } else {
        req.flash('message', 'No se pudo actualizar la configuración del ticket. Intenta de nuevo más tarde 😅');
    }

    res.redirect(`/links/${id_company}/${id_branch}/tickets`);
});

function normalizeTicketData(data) {
    const boolFields = [
        "show_name_employee", "show_name_customer", "show_name_company",
        "show_address", "show_name_branch", "show_phone", "show_cellphone",
        "show_email_company", "show_email_branch", "show_logo", "show_date",
        "show_qr"
    ];

    let normalized = {...data};

    boolFields.forEach(field => {
        normalized[field] = !!data[field]; // convierte cualquier valor truthy en true, undefined o vacío en false
    });

    // size_ticket puede venir como string, convertir a número
    if (data.size_ticket !== undefined) {
        normalized.size_ticket = Number(data.size_ticket) || null;
    }

    // qr y message son texto, pueden quedar tal cual
    if (data.qr === undefined) normalized.qr = null;
    if (data.message === undefined) normalized.message = null;

    return normalized;
}


module.exports = router;