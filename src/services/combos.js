const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree = 0
require('dotenv').config();
const { TYPE_DATABASE } = process.env;

//functions image
const {
    delate_image_upload,
} = require('./connectionWithDatabaseImage');

async function get_all_combos(req) {
    const { id } = req.params;

    try {
        if (TYPE_DATABASE === "mysqlite") {
            // SQLite query - no schema names, and ? placeholders
            const queryText = `
        SELECT dc.*, pd.name AS department_name, pc.name AS category_name
        FROM dishes_and_combos dc
        LEFT JOIN product_department pd ON dc.id_product_department = pd.id
        LEFT JOIN product_category pc ON dc.id_product_category = pc.id
        WHERE dc.id_companies = ?
      `;
            return await new Promise((resolve, reject) => {
                database.all(queryText, [id], (err, rows) => {
                    if (err) {
                        console.error('Error fetching combos from SQLite:', err);
                        resolve([]);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            // PostgreSQL query
            const queryText = `
        SELECT dc.*, pd.name AS department_name, pc.name AS category_name
        FROM "Kitchen".dishes_and_combos dc
        LEFT JOIN "Kitchen".product_department pd ON dc.id_product_department = pd.id
        LEFT JOIN "Kitchen".product_category pc ON dc.id_product_category = pc.id
        WHERE dc.id_companies = $1
      `;
            const result = await database.query(queryText, [id]);
            return result.rows;
        }
    } catch (error) {
        console.error('Error fetching combos:', error);
        return [];
    }
}


async function get_all_combos_and_products(id_company) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `
                SELECT * FROM Kitchen_dishes_and_combos
                WHERE id_companies = ?
            `;
            database.all(queryText, [id_company], (err, rows) => {
                if (err) {
                    console.error('Error en get_all_combos_and_products (SQLite):', err);
                    return resolve([]);
                }
                resolve(rows);
            });
        });
    }

    try {
        const queryText = `
            SELECT * FROM "Kitchen".dishes_and_combos
            WHERE id_companies = $1
        `;
        const result = await database.query(queryText, [id_company]);
        return result.rows;
    } catch (error) {
        console.error('Error en get_all_combos_and_products (PostgreSQL):', error);
        return [];
    }
}

async function search_combo(id_company, id_dishes_and_combos) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `
                SELECT * FROM Kitchen_dishes_and_combos
                WHERE id_companies = ? AND id = ?
            `;
            database.all(queryText, [id_company, id_dishes_and_combos], (err, rows) => {
                if (err) {
                    console.error('Error en search_combo (SQLite):', err);
                    return resolve([]);
                }
                resolve(rows);
            });
        });
    }

    try {
        const queryText = `
            SELECT * FROM "Kitchen".dishes_and_combos
            WHERE id_companies = $1 AND id = $2
        `;
        const result = await database.query(queryText, [id_company, id_dishes_and_combos]);
        return result.rows;
    } catch (error) {
        console.error('Error en search_combo (PostgreSQL):', error);
        return [];
    }
}


async function search_supplies_combo(id_dishes_and_combos) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `
                SELECT tsc.*, pas.img AS img, pas.name AS product_name, pas.barcode AS product_barcode
                FROM table_supplies_combo tsc
                JOIN products_and_supplies pas ON tsc.id_products_and_supplies = pas.id
                WHERE tsc.id_dishes_and_combos = ?
                ORDER BY id_products_and_supplies DESC
            `;
            database.all(queryText, [id_dishes_and_combos], (err, rows) => {
                if (err) {
                    console.error('Error en search_supplies_combo (SQLite):', err);
                    return resolve([]);
                }
                resolve(rows);
            });
        });
    }

    try {
        const queryText = `
            SELECT tsc.*, pas.img AS img, pas.name AS product_name, pas.barcode AS product_barcode
            FROM "Kitchen".table_supplies_combo tsc
            JOIN "Kitchen".products_and_supplies pas ON tsc.id_products_and_supplies = pas.id
            WHERE tsc.id_dishes_and_combos = $1
            ORDER BY id_products_and_supplies DESC
        `;
        const result = await database.query(queryText, [id_dishes_and_combos]);
        return result.rows;
    } catch (error) {
        console.error('Error en search_supplies_combo (PostgreSQL):', error);
        return [];
    }
}


async function delate_combo_company(id, pathImg) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // Primero elimina los suministros relacionados
            await delete_all_supplies_combo(id);

            // Luego elimina la imagen
            await delate_image_upload(pathImg);

            // Finalmente elimina el combo
            return new Promise((resolve, reject) => {
                const queryText = `DELETE FROM dishes_and_combos WHERE id = ?`;
                database.run(queryText, [id], function (err) {
                    if (err) {
                        console.error('Error al eliminar el combo (SQLite):', err);
                        return resolve(false);
                    }
                    resolve(true);
                });
            });
        } else {
            // PostgreSQL
            await delete_all_supplies_combo(id);
            await delate_image_upload(pathImg);

            const queryText = `DELETE FROM "Kitchen".dishes_and_combos WHERE id = $1`;
            await database.query(queryText, [id]);
            return true;
        }
    } catch (error) {
        console.error('Error al eliminar el combo de la base de datos:', error);
        return false;
    }
}


async function delete_all_supplies_combo(id) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            return new Promise((resolve, reject) => {
                const queryText = `DELETE FROM table_supplies_combo WHERE id_dishes_and_combos = ?`;
                database.run(queryText, [id], function (err) {
                    if (err) {
                        console.error('Error al eliminar en SQLite:', err);
                        return resolve(false);
                    }
                    resolve(true);
                });
            });
        } else {
            // PostgreSQL
            const queryText = `DELETE FROM "Kitchen".table_supplies_combo WHERE id_dishes_and_combos = $1`;
            await database.query(queryText, [id]);
            return true;
        }
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}


async function get_combo_features(idBranche, is_a_product, barcode = '') {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
        let queryText = `
            SELECT 
                f.*,
                d.img,
                d.barcode,
                d.name,
                d.description,
                d.this_product_is_sold_in_bulk,
                pc_cat.name as category_name,
                pd_dept.name as department_name
            FROM 
                dish_and_combo_features f
            INNER JOIN 
                dishes_and_combos d ON f.id_dishes_and_combos = d.id
            LEFT JOIN
                product_category pc_cat ON d.id_product_category = pc_cat.id
            LEFT JOIN
                product_department pd_dept ON d.id_product_department = pd_dept.id
            WHERE 
                f.id_branches = ? 
                AND d.is_a_product = ?
        `;

            let params = [idBranche, is_a_product];

            if (barcode.trim() !== '') {
                queryText += `
                    AND (
                        LOWER(d.barcode) LIKE ?
                        OR LOWER(d.name) LIKE ?
                    )
                    LIMIT 20
                `;
                const likeParam = `%${barcode.toLowerCase()}%`;
                params.push(likeParam, likeParam);
            } else {
                queryText += `
                    ORDER BY d.name ASC
                    LIMIT 50
                `;
            }

            database.all(queryText, params, (err, rows) => {
                if (err) {
                    console.error('Error en get_combo_features (SQLite):', err);
                    return resolve([]);
                }
                resolve(rows);
            });
        });
    }
    else {
        // PostgreSQL
        try {
            let queryText = `
            SELECT 
                f.*,
                d.img,
                d.barcode,
                d.name,
                d.description,
                d.this_product_is_sold_in_bulk,
                pc_cat.name as category_name,
                pd_dept.name as department_name
            FROM 
                "Inventory".dish_and_combo_features f
            INNER JOIN 
                "Kitchen".dishes_and_combos d ON f.id_dishes_and_combos = d.id
            LEFT JOIN
                "Kitchen".product_category pc_cat ON d.id_product_category = pc_cat.id
            LEFT JOIN
                "Kitchen".product_department pd_dept ON d.id_product_department = pd_dept.id
            WHERE 
                f.id_branches = $1 
                AND d.is_a_product = $2
        `;

            let values = [idBranche, is_a_product];

            if (barcode.trim() !== '') {
                queryText += `
                AND (
                    LOWER(d.barcode) LIKE $3
                    OR LOWER(d.name) LIKE $3
                )
                LIMIT 20
            `;
                values.push(`%${barcode.toLowerCase()}%`);
            } else {
                queryText += `
                ORDER BY d.name ASC
                LIMIT 50
            `;
            }

            const result = await database.query(queryText, values);
            return result.rows;
        } catch (error) {
            console.error('Error en get_combo_features (PostgreSQL):', error);
            return [];
        }
    }
}


async function get_all_dish_and_combo(idCompany, idBranch) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `
                SELECT 
                    i.*,
                    d.barcode,
                    d.name,
                    d.description,
                    d.img,
                    d.id_product_department,
                    d.id_product_category,
                    d.this_product_is_sold_in_bulk
                FROM Inventory_dish_and_combo_features i
                INNER JOIN Kitchen_dishes_and_combos d ON i.id_dishes_and_combos = d.id
                WHERE i.id_branches = ?
            `;
            database.all(queryText, [idBranch], (err, rows) => {
                if (err) {
                    console.error('Error en get_all_dish_and_combo (SQLite):', err);
                    return resolve([]);
                }
                resolve(rows);
            });
        });
    }

    try {
        const queryText = `
            SELECT 
                i.*,
                d.barcode,
                d.name,
                d.description,
                d.img,
                d.id_product_department,
                d.id_product_category,
                d.this_product_is_sold_in_bulk
            FROM "Inventory".dish_and_combo_features i
            INNER JOIN "Kitchen".dishes_and_combos d ON i.id_dishes_and_combos = d.id
            WHERE i.id_branches = $1
        `;
        const values = [idBranch];
        const result = await database.query(queryText, values);
        return result.rows;
    } catch (error) {
        console.error('Error en get_all_dish_and_combo (PostgreSQL):', error);
        return [];
    }
}


async function get_data_combo_factures(idComboFacture) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `
                SELECT 
                    f.id,
                    f.id_companies,
                    f.id_branches,
                    f.id_dishes_and_combos,
                    f.price_1,
                    f.revenue_1,
                    f.price_2,
                    f.revenue_2,
                    f.price_3,
                    f.revenue_3,
                    f.favorites,
                    f.sat_key,
                    f.purchase_unit,
                    f.existence,
                    f.amount,
                    f.product_cost,
                    f.id_providers,
                    d.name AS dish_name,
                    d.this_product_is_sold_in_bulk,
                    d.description AS dish_description,
                    d.img AS dish_img,
                    d.barcode AS dish_barcode,
                    d.id_product_department AS dish_product_department,
                    d.id_product_category AS dish_product_category,
                    d.this_product_need_recipe AS this_product_need_recipe
                    FROM 
                        dish_and_combo_features f
                    INNER JOIN 
                        dishes_and_combos d ON f.id_dishes_and_combos = d.id
                    WHERE 
                        f.id = ?
            `;
            database.get(queryText, [idComboFacture], (err, row) => {
                if (err) {
                    console.error('Error en get_data_combo_factures (SQLite):', err);
                    return resolve(null);
                }
                
                resolve(row ? [row] : []);
            });
        });
    }
    else{
        try {
            const queryText = `
                SELECT 
                    f.id,
                    f.id_companies,
                    f.id_branches,
                    f.id_dishes_and_combos,
                    f.price_1,
                    f.revenue_1,
                    f.price_2,
                    f.revenue_2,
                    f.price_3,
                    f.revenue_3,
                    f.favorites,
                    f.sat_key,
                    f.purchase_unit,
                    f.existence,
                    f.amount,
                    f.product_cost,
                    f.id_providers,
                    d.name AS dish_name,
                    d.this_product_is_sold_in_bulk,
                    d.description AS dish_description,
                    d.img AS dish_img,
                    d.barcode AS dish_barcode,
                    d.id_product_department AS dish_product_department,
                    d.id_product_category AS dish_product_category,
                    d.this_product_need_recipe AS this_product_need_recipe
                FROM 
                    "Inventory".dish_and_combo_features f
                INNER JOIN 
                    "Kitchen".dishes_and_combos d ON f.id_dishes_and_combos = d.id
                WHERE 
                    f.id = $1
            `;
            const result = await database.query(queryText, [idComboFacture]);
            return result.rows;
        } catch (error) {
            console.error('Error en get_data_combo_factures (PostgreSQL):', error);
            return [];
        }
    }
}

async function get_all_price_supplies_branch(idCombo, idBranch) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise(async (resolve, reject) => {
            try {
                // Consulta para obtener los suministros del combo
                const comboQuery = `
                    SELECT tsc.id_products_and_supplies, tsc.amount, tsc.unity, tsc.additional
                    FROM table_supplies_combo tsc
                    WHERE tsc.id_dishes_and_combos = ?
                    ORDER BY tsc.id_products_and_supplies DESC
                `;
                database.all(comboQuery, [idCombo], async (err, comboRows) => {
                    if (err) {
                        console.error('Error en comboQuery (SQLite):', err);
                        return resolve([]);
                    }

                    // Consulta para obtener el precio de suministros en sucursal
                    const priceQuery = `
                        SELECT psf.id_products_and_supplies, psf.sale_price, psf.sale_unity
                        FROM product_and_suppiles_features psf
                        WHERE psf.id_branches = ?
                        ORDER BY psf.id_products_and_supplies DESC
                    `;
                    database.all(priceQuery, [idBranch], async (err2, priceRows) => {
                        if (err2) {
                            console.error('Error en priceQuery (SQLite):', err2);
                            return resolve([]);
                        }

                        const suppliesWithPrice = {};
                        priceRows.forEach(row => {
                            suppliesWithPrice[row.id_products_and_supplies] = row.sale_price;
                        });

                        // Construir array con info de suministros
                        const suppliesInfo = comboRows.map(row => ({
                            img: '',
                            product_name: '',
                            product_barcode: '',
                            description: '',
                            id_products_and_supplies: row.id_products_and_supplies,
                            amount: row.amount,
                            unity: row.unity,
                            sale_price: suppliesWithPrice[row.id_products_and_supplies] || 0,
                            currency: '', // no tienes currency_sale en esta consulta para SQLite
                            additional: row.additional
                        }));

                        // Traer datos extra de suministros para completar info (reusar tu función)
                        const suppliesCombo = await search_supplies_combo(idCombo);
                        for (let i = 0; i < suppliesCombo.length; i++) {
                            if (suppliesInfo[i]) {
                                suppliesInfo[i].img = suppliesCombo[i].img;
                                suppliesInfo[i].product_name = suppliesCombo[i].product_name;
                                suppliesInfo[i].product_barcode = suppliesCombo[i].product_barcode;
                                suppliesInfo[i].description = suppliesCombo[i].description;
                                suppliesInfo[i].currency = suppliesCombo[i].currency_sale || '';
                            }
                        }

                        resolve(suppliesInfo);
                    });
                });
            } catch (error) {
                console.error('Error en get_all_price_supplies_branch (SQLite):', error);
                resolve([]);
            }
        });
    }
    else{
        try {
            // PostgreSQL
            const comboQuery = `
                SELECT tsc.id_products_and_supplies, tsc.amount, tsc.unity, tsc.additional, psf.currency_sale
                FROM "Kitchen".table_supplies_combo tsc
                INNER JOIN (
                    SELECT DISTINCT ON (id_products_and_supplies) id_products_and_supplies, currency_sale
                    FROM "Inventory".product_and_suppiles_features
                    ORDER BY id_products_and_supplies
                ) psf
                ON tsc.id_products_and_supplies = psf.id_products_and_supplies
                WHERE tsc.id_dishes_and_combos = $1
                ORDER BY tsc.id_products_and_supplies DESC
            `;
            const comboResult = await database.query(comboQuery, [idCombo]);

            const priceQuery = `
                SELECT psf.id_products_and_supplies, psf.sale_price, psf.sale_unity
                FROM "Inventory".product_and_suppiles_features psf
                WHERE psf.id_branches = $1
                ORDER BY psf.id_products_and_supplies DESC
            `;
            const priceResult = await database.query(priceQuery, [idBranch]);

            const suppliesWithPrice = {};
            priceResult.rows.forEach(row => {
                suppliesWithPrice[row.id_products_and_supplies] = row.sale_price;
            });

            const suppliesInfo = [];
            comboResult.rows.forEach(row => {
                const supplyId = row.id_products_and_supplies;
                const supplyPrice = suppliesWithPrice[supplyId] || 0;
                suppliesInfo.push({
                    img: '',
                    product_name: '',
                    product_barcode: '',
                    description: '',
                    id_products_and_supplies: supplyId,
                    amount: row.amount,
                    unity: row.unity,
                    sale_price: supplyPrice,
                    currency: row.currency_sale,
                    additional: row.additional
                });
            });

            // Agregar datos extra de suministros
            const suppliesCombo = await search_supplies_combo(idCombo);
            for (let i = 0; i < suppliesCombo.length; i++) {
                if (suppliesInfo[i]) {
                    suppliesInfo[i].img = suppliesCombo[i].img;
                    suppliesInfo[i].product_name = suppliesCombo[i].product_name;
                    suppliesInfo[i].product_barcode = suppliesCombo[i].product_barcode;
                    suppliesInfo[i].description = suppliesCombo[i].description;
                }
            }

            return suppliesInfo;
        } catch (error) {
            console.error("Error en la consulta:", error);
            throw error;
        }
    }
}


async function get_all_price_supplies_branch_vieja(idCombo, idBranch) {
    try {
        // Consulta para obtener los suministros de un combo específico
        const comboQuery = `SELECT tsc.id_products_and_supplies, tsc.amount, tsc.unity, tsc.additional, psf.currency_sale
        FROM "Kitchen".table_supplies_combo tsc
        INNER JOIN (
            SELECT DISTINCT ON (id_products_and_supplies) id_products_and_supplies, currency_sale
            FROM "Inventory".product_and_suppiles_features
            ORDER BY id_products_and_supplies
        ) psf
        ON tsc.id_products_and_supplies = psf.id_products_and_supplies
        WHERE tsc.id_dishes_and_combos = $1
        ORDER BY tsc.id_products_and_supplies DESC
        `;
        const comboValues = [idCombo];
        const comboResult = await database.query(comboQuery, comboValues)

        // Consulta para obtener el precio de los suministros en la sucursal específica
        const priceQuery = `
            SELECT psf.id_products_and_supplies, psf.sale_price, psf.sale_unity
            FROM "Inventory".product_and_suppiles_features psf
            WHERE psf.id_branches = $1 ORDER BY id_products_and_supplies DESC
        `;
        const priceValues = [idBranch];
        const priceResult = await database.query(priceQuery, priceValues);

        // Construir un objeto que contenga los suministros y sus precios en la sucursal específica
        const suppliesWithPrice = {};
        priceResult.rows.forEach(row => {
            suppliesWithPrice[row.id_products_and_supplies] = row.sale_price;
        });

        // Agregar los suministros y sus cantidades del combo junto con sus precios
        const suppliesInfo = [];
        comboResult.rows.forEach(row => {
            const supplyId = row.id_products_and_supplies;
            const supplyPrice = suppliesWithPrice[supplyId] || 0; // Precio predeterminado si no se encuentra
            suppliesInfo.push({
                img: '',
                product_name: '',
                product_barcode: '',
                description: '',
                id_products_and_supplies: supplyId,
                amount: row.amount,
                unity: row.unity,
                sale_price: supplyPrice,
                currency: row.currency_sale,
                additional: row.additional
            });
        });

        //agregamos los datos del combo 
        const suppliesCombo = await search_supplies_combo(idCombo);
        for (var i = 0; i < suppliesCombo.length; i++) {
            suppliesInfo[i].img = suppliesCombo[i].img;
            suppliesInfo[i].product_name = suppliesCombo[i].product_name;
            suppliesInfo[i].product_barcode = suppliesCombo[i].product_barcode;
            suppliesInfo[i].description = suppliesCombo[i].description;
        }

        return suppliesInfo;
    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error;
    }
}

module.exports = {
    get_all_combos,
    search_combo,
    search_supplies_combo,
    delate_combo_company,
    delete_all_supplies_combo,
    get_combo_features,
    get_all_dish_and_combo,
    get_all_combos_and_products,
    get_data_combo_factures,
    get_all_price_supplies_branch
};