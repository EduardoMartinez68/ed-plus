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

router.get('/:id_company/:id_branch/returns', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;

    //we will see if the user not have the permission for this App.
    if (!this_user_have_this_permission(req.user, id_company, id_branch, 'return_ticket')) {
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }


    const branchFree = await get_data_branch(id_branch);
    res.render('links/returns/returns', {branchFree});
});

router.post('/get-data-ticket', isLoggedIn, async (req, res) => {
    //get the information of the user and of the ticket
    const id_branch=req.user.id_branch;
    const id_company=req.user.id_company;
    const {ticketCode}=req.body;


    //now we will get the information of the ticket
    const dataTicket=get_the_information_of_the_ticket(ticketCode);
    return dataTicket;
});


async function get_the_information_of_the_ticket(ticketCode) {
    try {
        let query;
        let values;
        let result;

        if (!ticketCode) {
            return { success: false, error: "Código de ticket requerido." };
        }

        if (TYPE_DATABASE === 'sqlite') {
            query = `
                SELECT 
                    t.*,
                    hr.id AS history_return_id,
                    hr.old_ticket,
                    hr.date_return,
                    hr.total_return,
                    hr.products_returns,
                    hr.note AS return_note
                FROM ticket t
                LEFT JOIN history_returns hr ON hr.id_ticket = t.id
                WHERE t.key = ?;
            `;

            result = await database.all(query, [ticketCode]);

            return {
                success: true,
                message: "Información del ticket obtenida.",
                data: result
            };

        } else {
            query = `
                SELECT 
                    t.*,
                    hr.id AS history_return_id,
                    hr.old_ticket,
                    hr.date_return,
                    hr.total_return,
                    hr.products_returns,
                    hr.note AS return_note
                FROM "Box".ticket t
                LEFT JOIN "Box".history_returns hr ON hr.id_ticket = t.id
                WHERE t.key = $1;
            `;

            const pgResult = await database.query(query, [ticketCode]);

            return {
                success: true,
                message: "Información del ticket obtenida.",
                data: pgResult.rows
            };
        }

    } catch (error) {
        console.error("Error al obtener información del ticket:", error);
        return { success: false, error: "No se pudo obtener la información del ticket." };
    }
}

module.exports = router;