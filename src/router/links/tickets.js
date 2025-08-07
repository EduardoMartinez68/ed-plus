const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
require('dotenv').config();
const { TYPE_DATABASE } = process.env;
const database = require('../../database');


//functions branch
const {
    get_data_branch
} = require('../../services/branch');

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

router.post('/change_status_of_ticket', isLoggedIn, async (req, res) => {
    const {id_company, id_branch} = req.user;
    const {keyTicketFacture, idFactura, status}=req.body;

    //we will see if exist the id of the ticket
    if(keyTicketFacture){
        //if exist the id of the ticket, is because the ticket was timbrado now 
        await update_cfdi_status_by_key_branch(id_branch, keyTicketFacture, idFactura, true)
    }else{
        //if not exist the id of the ticket, is because the user would like cancell the facture 
        await update_cfdi_status_by_idcfdi_branch(id_branch, idFactura, false)
    }
    return res.json({
      success: true,
      message: 'Estado actualizado correctamente.',
    });
});

async function update_cfdi_status_by_idcfdi_branch(id_branch, id_cfdi, cfdi_create) {
    const queryParams = [cfdi_create, id_branch, id_cfdi];

    if (TYPE_DATABASE === 'mysqlite') {
        const query = `
            UPDATE ticket
            SET cfdi_create = ?
            WHERE id_branches = ? AND id_cfdi = ?
        `;
        return new Promise((resolve) => {
            database.run(query, queryParams, function (err) {
                if (err) {
                    console.error('❌ Error actualizando cfdi en SQLite:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    } else {
        const query = `
            UPDATE "Box".ticket
            SET cfdi_create = $1
            WHERE id_branches = $2 AND id_cfdi = $3
        `;
        try {
            const result = await database.query(query, queryParams);
            return result.rowCount > 0;
        } catch (error) {
            console.error('❌ Error actualizando cfdi en PostgreSQL:', error);
            return false;
        }
    }
}

async function update_cfdi_status_by_key_branch(id_branch, key, cfdi_create, id_cfdi) {
    const queryParams = [cfdi_create, id_cfdi, id_branch, key];

    if (TYPE_DATABASE === 'mysqlite') {
        const query = `
            UPDATE ticket
            SET cfdi_create = ?, id_cfdi = ?
            WHERE id_branches = ? AND key = ?
        `;
        return new Promise((resolve) => {
            database.run(query, queryParams, function (err) {
                if (err) {
                    console.error('❌ Error actualizando cfdi en SQLite:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    } else {
        const query = `
            UPDATE "Box".ticket
            SET cfdi_create = $1, id_cfdi = $2
            WHERE id_branches = $3 AND key = $4
        `;
        try {
            const result = await database.query(query, queryParams);
            return result.rowCount > 0;
        } catch (error) {
            console.error('❌ Error actualizando cfdi en PostgreSQL:', error);
            return false;
        }
    }
}

//---------------------------her we will save the tickets in the software desktop-------------------------------------------
const {getToken}=require('../../middleware/tokenCheck.js');

router.post('/save_ticket', isLoggedIn, async (req, res) => {
    //get the information of the software desktop 
    const id_company = req.user.id_company;
    const id_branch = req.user.id_branch;
    const form=req.body;
    
    const ticket=create_a_new_ticket(id_company,id_branch,form)
});

function create_a_new_ticket(id_company,id_branch,bodyForm){
    return {
        id_company,
        id_branch,
        employee: bodyForm.name_employee
    }
}

router.post('/synchronized-ticket', isLoggedIn, async (req, res) => {
    //get the information of the software desktop 
    const id_company = req.user.id_company;
    const id_branch = req.user.id_branch;
    const token=getToken();

    //if have a token save, we will send this information to the server
    if(token){
        if (await update_setting_ticket(id_branch, normalizedData)) {
            req.flash('success', 'Configuración del ticket actualizada 🎉');
        } else {
            req.flash('message', 'No se pudo actualizar la configuración del ticket. Intenta de nuevo más tarde 😅');
        }
    }

    res.redirect(`/links/${id_company}/${id_branch}/tickets`);
});



//---------------------------facture CFDI GLOBAL-------------------------------------------
router.get('/create_cfdi_global', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.user;
    const branchFree = await get_data_branch(id_branch);
    const dataCompany=await get_data_company_with_id(id_company)
    const token=getToken()
    res.render('links/tickets/cfdiGlobal', {branchFree, dataCompany, token});
});

router.post('/get_data_cfdi_branch', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.user;
    const branchFreeList = await get_data_branch(id_branch);
    const branchFree=branchFreeList[0];

    //we will see if can get all the informacion of the cfdi of the branch
    if(branchFree){
        //get the data of the cfdi of the branch with the form of the api of facturama
        const Address={
			Street : branchFree.address,
			ExteriorNumber : branchFree.num_ext,
			InteriorNumber : branchFree.num_int,
			Neighborhood: branchFree.cologne,
			ZipCode : branchFree.postal_code,
			Municipality :branchFree.municipality,
			State : branchFree.city,
			Country : "México"
        }

        const data= {
            linkCFDI:branchFree.linkCFDI,
            Name: branchFree.name_branch,
            TaxZipCode:branchFree.postal_code,
            Rfc:branchFree.rfc,
            FiscalRegime:branchFree.fiscalRegime,
            ExpeditionPlace: branchFree.postal_code,
            Address
        }
        console.log(data)
        res.json({ success: true, message: 'Datos de busqueda obtenidos' , data});
    }else{
        res.json({ success: false, message: 'Datos de busqueda no encontrados'});
    }
});

module.exports = router;