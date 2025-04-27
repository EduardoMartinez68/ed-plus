const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');

const database = require('../../database');
const addDatabase = require('../addDatabase');
const update = require('../updateDatabase');

//functions branch
const {
    get_data_branch,
    get_all_box_of_the_branch_with_his_id
} = require('../../services/branch');

const {
    delate_image_upload,
} = require('../../services/connectionWithDatabaseImage');
const { get } = require('node-persist');


const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

router.get('/:id_company/:id_branch/mass-product-adjustment', isLoggedIn, async (req, res) => {
    const {id_company,id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);
    res.render('links/free/inventory/updateInventory.hbs',{branchFree});
})

async function get_prescription_details(dateStart, dateFinish) {
    if (dateStart && !dateStart.includes(' ')) {
        dateStart = `${dateStart} 00:00:00`;
    }

    // Si solo se pasa la fecha sin hora, asignamos la hora 23:59:59 para dateFinish
    if (dateFinish && !dateFinish.includes(' ')) {
        dateFinish = `${dateFinish} 23:59:59`;
    }
    const queryText = `
        SELECT 
            p.id AS prescription_id,
            p.recipe_folio,
            p.doctor_id,
            p.doctor_name,
            p.date_prescription,
            p.retained,
            p.amount,
            p.comment,
            l.number_lote,
            l.expiration_date,
            dc.barcode,
            dc.name AS product_name,
            dc.description AS product_description
        FROM "Branch".prescription p
        LEFT JOIN "Inventory".lots l ON p.id_lots = l.id
        LEFT JOIN "Inventory".dish_and_combo_features dcf ON l.id_dish_and_combo_features = dcf.id
        LEFT JOIN "Kitchen".dishes_and_combos dc ON dcf.id_dishes_and_combos = dc.id
        WHERE dc.this_product_need_recipe = true
        AND p.date_prescription BETWEEN $1 AND $2;  -- Filtro por rango de fechas
    `;

    try {
        // Realizar la consulta pasando las fechas como parámetros
        const result = await database.query(queryText, [dateStart, dateFinish]);
        return result.rows;
    } catch (error) {
        console.error('Error getting prescription details:', error);
        return [];
    }
}

module.exports = router;