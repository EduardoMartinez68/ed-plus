require('dotenv').config();
const {TYPE_DATABASE}=process.env;

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

const {
    get_inventory_products_branch,
    get_inventory_supplies_branch
} = require('../../services/supplies');

const {
    this_user_have_this_permission
} = require('../../services/permission');

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

router.get('/:id_company/:id_branch/mass-product-adjustment', isLoggedIn, async (req, res) => {
    const {id_company,id_branch}=req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'edit_inventory')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }
    const branchFree = await get_data_branch(id_branch);
    res.render('links/free/inventory/updateInventory.hbs',{branchFree});
})

router.post('/:id_branch/search_products_for_update_the_inventory', isLoggedIn, async (req, res) => {
    const {id_branch } = req.params;
    const {barcode}=req.body;

    const products = await get_inventory_products_branch(id_branch,barcode);
    const supplies = await get_inventory_supplies_branch(id_branch,barcode);
    res.json({ products, supplies });
});

router.post('/:id_company/:id_branch/update_all_the_inventory', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const { listInventory } = req.body;

    const failedUpdates = [];

    for (const item of listInventory) {
        const { id, newExistence } = item; // <- adaptalo a tus nombres exactos si quieres
        const updateResult = await update_product_existence(id, newExistence);

        if (!updateResult.success) {
            failedUpdates.push(item);
        }
    }

    if (failedUpdates.length > 0) {
        const productsFailed = failedUpdates.map(p => p.name || p.id).join(', ');
        req.flash('message', `Lo siento, no pudimos actualizar estos productos: ${productsFailed} 😅`);

        // IMPORTANTE: devuelve una respuesta JSON
        return res.json({ success: false, redirectUrl: `/links/${id_company}/${id_branch}/mass-product-adjustment` });
    } else {
        req.flash('success', 'Todos los productos fueron actualizados con éxito ❤️');

        // IMPORTANTE: devuelve una respuesta JSON
        return res.json({ success: true, redirectUrl: `/links/${id_company}/${id_branch}/mass-product-adjustment` });
    }
});


async function update_product_existence(id_product, newExistence) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE product_and_suppiles_features
                SET existence = ?
                WHERE id = ?;
            `;

            database.run(query, [newExistence, id_product], function (err) {
                if (err) {
                    console.error("Error al actualizar la existencia del producto (SQLite):", err);
                    return resolve({ success: false, error: "Error al actualizar la existencia" });
                }

                if (this.changes > 0) {
                    // SQLite no retorna los datos actualizados directamente, se consulta aparte si se quiere
                    const selectQuery = `SELECT * FROM product_and_suppiles_features WHERE id = ?`;
                    database.get(selectQuery, [id_product], (err, row) => {
                        if (err) {
                            console.error("Error al obtener producto actualizado (SQLite):", err);
                            return resolve({ success: false, error: "Error al obtener el producto actualizado" });
                        }
                        return resolve({ success: true, data: row });
                    });
                } else {
                    return resolve({ success: false, error: 'Producto no encontrado' });
                }
            });
        });
    } else {
        // PostgreSQL
        const queryText = `
            UPDATE "Inventory".product_and_suppiles_features
            SET existence = $1
            WHERE id = $2
            RETURNING *;
        `;

        try {
            const result = await database.query(queryText, [newExistence, id_product]);
            if (result.rowCount > 0) {
                return { success: true, data: result.rows[0] };
            } else {
                return { success: false, error: 'Producto no encontrado' };
            }
        } catch (error) {
            console.error("Error al actualizar la existencia del producto (PostgreSQL):", error);
            return { success: false, error: "Error al actualizar la existencia" };
        }
    }
}


router.get('/:id_company/:id_branch/upload-inventory-products-with-excel', isLoggedIn, async (req, res) => {
    const {id_company,id_branch}=req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'edit_inventory')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }
    const branchFree = await get_data_branch(id_branch);
    res.render('links/free/inventory/inventoryWithExcel.hbs',{branchFree});
})



module.exports = router;