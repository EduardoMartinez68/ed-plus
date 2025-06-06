const database = require('../database');
const addDatabase = require('../router/addDatabase');
require('dotenv').config();
const {TYPE_DATABASE}=process.env;
const rolFree=0
//functions image
const {
    get_path_img,
    delate_image_upload,
    upload_image_to_space,
    delete_image_from_space,
    create_a_new_image,
    delate_image
} = require('./connectionWithDatabaseImage');

//----------------------------------------------------------------supplies and products 
async function search_company_supplies_or_products(req, supplies) {
    const { id } = req.params;

    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite usa ? para los parámetros y database.all para consulta
        const queryText = `
            SELECT * 
            FROM products_and_supplies 
            WHERE id_companies = ? AND supplies = ?
        `;
        return new Promise((resolve, reject) => {
            database.all(queryText, [id, supplies], (err, rows) => {
                if (err) {
                    console.error("Error en búsqueda SQLite:", err);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    } else {
        // PostgreSQL usa $1, $2 para parámetros y database.query()
        const queryText = `
            SELECT * 
            FROM "Kitchen".products_and_supplies 
            WHERE id_companies = $1 AND supplies = $2
        `;
        try {
            const result = await database.query(queryText, [id, supplies]);
            return result.rows;
        } catch (error) {
            console.error("Error en búsqueda PostgreSQL:", error);
            return [];
        }
    }
}

async function search_company_supplies_or_products_with_id_company(id_company, supplies) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `
            SELECT * 
            FROM products_and_supplies 
            WHERE id_companies = ? AND supplies = ?
        `;
        return new Promise((resolve, reject) => {
            database.all(queryText, [id_company, supplies], (err, rows) => {
                if (err) {
                    console.error("Error en búsqueda SQLite:", err);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    } else {
        const queryText = `
            SELECT * 
            FROM "Kitchen".products_and_supplies 
            WHERE id_companies = $1 AND supplies = $2
        `;
        try {
            const result = await database.query(queryText, [id_company, supplies]);
            return result.rows;
        } catch (error) {
            console.error("Error en búsqueda PostgreSQL:", error);
            return [];
        }
    }
}

async function search_company_supplies_or_products_with_company(id_company, supplies) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `
            SELECT * 
            FROM products_and_supplies 
            WHERE id_companies = ? AND supplies = ?
        `;
        return new Promise((resolve, reject) => {
            database.all(queryText, [id_company, supplies], (err, rows) => {
                if (err) {
                    console.error("Error en búsqueda SQLite:", err);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    } else {
        const queryText = `
            SELECT * 
            FROM "Kitchen".products_and_supplies 
            WHERE id_companies = $1 AND supplies = $2
        `;
        try {
            const result = await database.query(queryText, [id_company, supplies]);
            return result.rows;
        } catch (error) {
            console.error("Error en búsqueda PostgreSQL:", error);
            return [];
        }
    }
}


async function this_is_a_supplies_or_a_products(id) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `SELECT * FROM products_and_supplies WHERE id = ?`;
        return new Promise((resolve, reject) => {
            database.get(queryText, [id], (err, row) => {
                if (err) {
                    console.error("Error SQLite en this_is_a_supplies_or_a_products:", err);
                    return reject(err);
                }
                resolve(row ? row.supplies : null);
            });
        });
    } else {
        const queryText = `SELECT * FROM "Kitchen".products_and_supplies WHERE id = $1`;
        try {
            const result = await database.query(queryText, [id]);
            return result.rows.length > 0 ? result.rows[0].supplies : null;
        } catch (error) {
            console.error("Error PostgreSQL en this_is_a_supplies_or_a_products:", error);
            return null;
        }
    }
}


async function delate_supplies_company(id, pathOmg) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite usa placeholders con '?'
            await new Promise((resolve, reject) => {
                const queryText = `DELETE FROM products_and_supplies WHERE id = ?`;
                database.run(queryText, [id], function(err) {
                    if (err) {
                        console.error("Error SQLite en delate_supplies_company:", err);
                        return reject(err);
                    }
                    resolve();
                });
            });
        } else {
            // PostgreSQL usa placeholders $1, $2, etc.
            const queryText = `DELETE FROM "Kitchen".products_and_supplies WHERE id = $1`;
            await database.query(queryText, [id]);
        }

        // Borrar la imagen (asumo que esta función es compatible con ambos DB o independiente)
        await delate_image_upload(pathOmg);
        return true;
    } catch (error) {
        console.error('Error al borrar el supplies en la compañía en delate_supplies_company:', error);
        return false;
    }
}

function get_new_data_supplies_company(req) {
    const { id, id_company, barcode, name, description, useInventory } = req.params;
    const newSupplies = {
        id,
        id_company,
        barcode,
        name,
        description,
        use_inventory: (useInventory == 'true')
    }
    return newSupplies;
}

async function update_supplies_company(newSupplies) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const queryText = `
                UPDATE products_and_supplies 
                SET barcode = ?, name = ?, description = ?, use_inventory = ? 
                WHERE id = ?
            `;
            await new Promise((resolve, reject) => {
                database.run(queryText, [
                    newSupplies.barcode,
                    newSupplies.name,
                    newSupplies.description,
                    newSupplies.use_inventory,
                    newSupplies.id
                ], function(err) {
                    if (err) {
                        console.error("Error SQLite en update_supplies_company:", err);
                        return reject(err);
                    }
                    resolve();
                });
            });
        } else {
            const queryText = `
                UPDATE "Kitchen".products_and_supplies 
                SET barcode = $1, name = $2, description = $3, use_inventory = $4 
                WHERE id = $5
            `;
            const values = [
                newSupplies.barcode,
                newSupplies.name,
                newSupplies.description,
                newSupplies.use_inventory,
                newSupplies.id
            ];
            await database.query(queryText, values);
        }
        return true;
    } catch (error) {
        console.error("Error en update_supplies_company:", error);
        return false;
    }
}


async function get_supplies_or_features(id_branch, type) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const queryText = `
                SELECT 
                    f.*,
                    p.id_companies,
                    p.img,
                    p.barcode,
                    p.name,
                    p.description,
                    p.use_inventory
                FROM product_and_suppiles_features f
                INNER JOIN products_and_supplies p ON f.id_products_and_supplies = p.id
                WHERE f.id_branches = ? AND p.supplies = ?
            `;
            const data = await new Promise((resolve, reject) => {
                database.all(queryText, [id_branch, type], (err, rows) => {
                    if (err) {
                        console.error("Error SQLite en get_supplies_or_features:", err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            return data;
        } else {
            const queryText = `
                SELECT 
                    f.*,
                    p.id_companies,
                    p.img,
                    p.barcode,
                    p.name,
                    p.description,
                    p.use_inventory
                FROM "Inventory".product_and_suppiles_features f
                INNER JOIN "Kitchen".products_and_supplies p ON f.id_products_and_supplies = p.id
                WHERE f.id_branches = $1 AND p.supplies = $2
            `;
            const result = await database.query(queryText, [id_branch, type]);
            return result.rows;
        }
    } catch (error) {
        console.error("Error en get_supplies_or_features:", error);
        return [];
    }
}

//--------------------------------------------------------------products
async function get_supplies_or_features_with_id_products_and_supplies(id_products_and_supplies) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const queryText = `
                SELECT 
                    f.*,
                    p.id_companies,
                    p.img,
                    p.barcode,
                    p.name,
                    p.description,
                    p.use_inventory
                FROM product_and_suppiles_features f
                INNER JOIN products_and_supplies p ON f.id_products_and_supplies = p.id
                WHERE f.id_products_and_supplies = ?
            `;
            const data = await new Promise((resolve, reject) => {
                database.all(queryText, [id_products_and_supplies], (err, rows) => {
                    if (err) {
                        console.error("Error SQLite en get_supplies_or_features_with_id_products_and_supplies:", err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            return data;
        } else {
            const queryText = `
                SELECT 
                    f.*,
                    p.id_companies,
                    p.img,
                    p.barcode,
                    p.name,
                    p.description,
                    p.use_inventory
                FROM "Inventory".product_and_suppiles_features f
                INNER JOIN "Kitchen".products_and_supplies p ON f.id_products_and_supplies = p.id
                WHERE f.id_products_and_supplies = $1
            `;
            const result = await database.query(queryText, [id_products_and_supplies]);
            return result.rows;
        }
    } catch (error) {
        console.error("Error en get_supplies_or_features_with_id_products_and_supplies:", error);
        return [];
    }
}

async function get_supplies_with_id(id_supplies) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const queryText = `
                SELECT 
                    f.*,
                    p.id_companies,
                    p.img,
                    p.barcode,
                    p.name,
                    p.description,
                    p.use_inventory
                FROM product_and_suppiles_features f
                INNER JOIN products_and_supplies p ON f.id_products_and_supplies = p.id
                WHERE f.id = ?
            `;
            const data = await new Promise((resolve, reject) => {
                database.all(queryText, [id_supplies], (err, rows) => {
                    if (err) {
                        console.error("Error SQLite en get_supplies_with_id:", err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            return data;
        } else {
            const queryText = `
                SELECT 
                    f.*,
                    p.id_companies,
                    p.img,
                    p.barcode,
                    p.name,
                    p.description,
                    p.use_inventory
                FROM "Inventory".product_and_suppiles_features f
                INNER JOIN "Kitchen".products_and_supplies p ON f.id_products_and_supplies = p.id
                WHERE f.id = $1
            `;
            const result = await database.query(queryText, [id_supplies]);
            return result.rows;
        }
    } catch (error) {
        console.error("Error en get_supplies_with_id:", error);
        return [];
    }
}

async function update_product_category(id, name, description) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const queryText = `
                UPDATE product_category
                SET name = ?, description = ?
                WHERE id = ?
            `;
            await new Promise((resolve, reject) => {
                database.run(queryText, [name, description, id], function(err) {
                    if (err) {
                        console.error("Error SQLite al actualizar product_category:", err);
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            });
            return true;
        } else {
            const queryText = `
                UPDATE "Kitchen".product_category
                SET name = $1, description = $2
                WHERE id = $3
            `;
            await database.query(queryText, [name, description, id]);
            return true;
        }
    } catch (error) {
        console.error('Error al actualizar el registro en la base de datos:', error);
        return false;
    }
}

async function delete_supplies_or_product_of_the_branch(id_products_and_supplies) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const queryText = `
                DELETE FROM product_and_suppiles_features
                WHERE id = ?
            `;
            await new Promise((resolve, reject) => {
                database.run(queryText, [id_products_and_supplies], function(err) {
                    if (err) {
                        console.error("Error SQLite al borrar supplies o productos:", err);
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            });
            return true;
        } else {
            const queryText = `
                DELETE FROM "Inventory".product_and_suppiles_features
                WHERE id = $1
            `;
            await database.query(queryText, [id_products_and_supplies]);
            return true;
        }
    } catch (error) {
        console.log('error to delete the supplies in the branch in the function delete_supplies_or_product_of_the_branch: ' + error);
        return false;
    }
}


async function delete_dishes_or_combo_of_the_branch(id_dishes_and_combos) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const queryText = `
                DELETE FROM dish_and_combo_features
                WHERE id = ?
            `;
            await new Promise((resolve, reject) => {
                database.run(queryText, [id_dishes_and_combos], function(err) {
                    if (err) {
                        console.error("Error SQLite al borrar dishes o combos:", err);
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            });
            return true;
        } else {
            const queryText = `
                DELETE FROM "Inventory".dish_and_combo_features
                WHERE id = $1
            `;
            await database.query(queryText, [id_dishes_and_combos]);
            return true;
        }
    } catch (error) {
        console.log('error to delete the dishes or combo in the branch in the function delete_dishes_or_combo_of_the_branch: ' + error);
        return false;
    }
}

async function get_inventory_products_branch(id_branch, barcode = '') {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            let queryText = `
                SELECT 
                    f.*,
                    p.id_companies,
                    p.img,
                    p.barcode,
                    p.name,
                    p.description,
                    p.use_inventory
                FROM product_and_suppiles_features f
                INNER JOIN products_and_supplies p ON f.id_products_and_supplies = p.id
                WHERE f.id_branches = ? AND p.supplies = ? AND use_inventory = 1
            `;

            let values = [id_branch, 0]; // SQLite usa 1/0 para booleanos

            if (barcode && barcode.trim() !== '') {
                queryText += ` AND p.barcode LIKE ? LIMIT 10`;
                values.push(`%${barcode}%`);
            } else {
                queryText += ` LIMIT 25`;
            }

            const rows = await new Promise((resolve, reject) => {
                database.all(queryText, values, (err, rows) => {
                    if (err) {
                        console.error('Error SQLite en get_inventory_products_branch:', err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });

            return rows;
        } else {
            // PostgreSQL
            let queryText = `
                SELECT 
                    f.*,
                    p.id_companies,
                    p.img,
                    p.barcode,
                    p.name,
                    p.description,
                    p.use_inventory
                FROM "Inventory".product_and_suppiles_features f
                INNER JOIN "Kitchen".products_and_supplies p ON f.id_products_and_supplies = p.id
                WHERE f.id_branches = $1 AND p.supplies = $2 AND use_inventory = true
            `;

            let values = [id_branch, false];

            if (barcode && barcode.trim() !== '') {
                queryText += ` AND p.barcode LIKE $3 LIMIT 10`;
                values.push(`%${barcode}%`);
            } else {
                queryText += ` LIMIT 25`;
            }

            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error en get_inventory_products_branch:', error);
        return [];
    }
}

async function get_inventory_supplies_branch(id_branch, barcode = '') {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            let queryText = `
                SELECT 
                    f.*,
                    p.id_companies,
                    p.img,
                    p.barcode,
                    p.name,
                    p.description,
                    p.use_inventory
                FROM product_and_suppiles_features f
                INNER JOIN products_and_supplies p ON f.id_products_and_supplies = p.id
                WHERE f.id_branches = ? AND p.supplies = ? AND p.use_inventory = 1
            `;

            let values = [id_branch, 1]; // En SQLite booleanos son 1/0

            if (barcode && barcode.trim() !== '') {
                queryText += ` AND p.barcode LIKE ? LIMIT 10`;
                values.push(`%${barcode}%`);
            } else {
                queryText += ` LIMIT 25`;
            }

            const rows = await new Promise((resolve, reject) => {
                database.all(queryText, values, (err, rows) => {
                    if (err) {
                        console.error('Error SQLite en get_inventory_supplies_branch:', err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });

            return rows;
        } else {
            // PostgreSQL
            let queryText = `
                SELECT 
                    f.*,
                    p.id_companies,
                    p.img,
                    p.barcode,
                    p.name,
                    p.description,
                    p.use_inventory
                FROM "Inventory".product_and_suppiles_features f
                INNER JOIN "Kitchen".products_and_supplies p ON f.id_products_and_supplies = p.id
                WHERE f.id_branches = $1 AND p.supplies = $2 AND p.use_inventory = true
            `;

            let values = [id_branch, true];

            if (barcode && barcode.trim() !== '') {
                queryText += ` AND p.barcode LIKE $3 LIMIT 10`;
                values.push(`%${barcode}%`);
            } else {
                queryText += ` LIMIT 25`;
            }

            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (err) {
        console.error('Error al obtener los suministros del inventario:', err);
        throw err;
    }
}


module.exports = {
    get_supplies_or_features,
    get_supplies_with_id,
    update_supplies_company,
    get_new_data_supplies_company,
    delate_supplies_company,
    this_is_a_supplies_or_a_products,
    search_company_supplies_or_products_with_company,
    search_company_supplies_or_products_with_id_company,
    search_company_supplies_or_products,
    update_product_category,
    get_supplies_or_features_with_id_products_and_supplies,
    delete_supplies_or_product_of_the_branch,
    delete_dishes_or_combo_of_the_branch,
    get_inventory_products_branch,
    get_inventory_supplies_branch
};