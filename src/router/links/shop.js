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
    get_all_invoice_with_the_id_of_the_branch
} = require('../../services/invoice');

const {
    get_data_company_with_id
} = require('../../services/company');

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