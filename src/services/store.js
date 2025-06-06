const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0
require('dotenv').config();
const {TYPE_DATABASE}=process.env;

async function get_data_employee(req) {
    try {
        const id_user = req.user.id;

        if (TYPE_DATABASE === 'mysqlite') {
            const query = `
                SELECT *
                FROM employees
                WHERE id_users = ?
            `;
            const data = await new Promise((resolve, reject) => {
                database.all(query, [id_user], (err, rows) => {
                    if (err) {
                        console.error("SQLite error in get_data_employee:", err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            return data;
        } else {
            const query = `
                SELECT *
                FROM "Company".employees
                WHERE id_users = $1
            `;
            const result = await database.query(query, [id_user]);
            return result.rows;
        }
    } catch (error) {
        console.error("Error en get_data_employee:", error);
        return [];
    }
}


async function this_employee_works_here(req, res) {
    const { id_user } = req.params;

    //first we will watching if the id of the user is equal to the id of the account.
    if (id_user == req.user.id) {
        //we will watching if the employee data is of the user and work in this company 
        if (await this_data_employee_is_user(req)) {
            return true;
        }
    }
    req.flash('message', '⚠️ ¡Estás intentando acceder a una cuenta que no te pertenece! ⚠️')
    res.render('links/store/branchLost')
    //res.redirect('/fud/home');
}

async function this_data_employee_is_user(req) {
    const employee = await get_data_employee(req);
    const data = employee[0]
    const id_user_employee = data.id_users
    const id_company_employee = data.id_companies
    const id_branch_employee = data.id_branches
    const id_employee_employee = data.id
    const id_role_employee = data.id_roles_employees

    const { id_company, id_branch, id_employee, id_role } = req.params;

    return (id_user_employee == req.user.id) && (id_company_employee == id_company) && (id_branch_employee == id_branch) && (id_employee_employee == id_employee) && (id_role_employee == id_role)
}


async function get_all_dish_and_combo(idCompany, idBranch) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite no soporta json_agg ni jsonb_build_object, ni JOIN con agregaciones tan complejas
            // Por simplicidad, hacemos una consulta básica sin agregar lots
            const query = `
                SELECT 
                    i.*,
                    d.barcode,
                    d.name,
                    d.description,
                    d.img,
                    d.id_product_department,
                    d.id_product_category,
                    d.this_product_is_sold_in_bulk,
                    d.this_product_need_recipe
                FROM dish_and_combo_features i
                INNER JOIN dishes_and_combos d ON i.id_dishes_and_combos = d.id
                WHERE i.id_branches = ?
                LIMIT 20
            `;
            const rows = await new Promise((resolve, reject) => {
                database.all(query, [idBranch], (err, rows) => {
                    if (err) {
                        console.error("SQLite error in get_all_dish_and_combo:", err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            // En SQLite no incluimos lots, puedes obtenerlos con otra consulta si quieres
            return rows;

        } else {
            // PostgreSQL con json_agg y jsonb_build_object
            const queryText = `
                SELECT 
                    i.*,
                    d.barcode,
                    d.name,
                    d.description,
                    d.img,
                    d.id_product_department,
                    d.id_product_category,
                    d.this_product_is_sold_in_bulk,
                    d.this_product_need_recipe,
                    COALESCE(
                        json_agg(
                            jsonb_build_object(
                                'id', l.id,
                                'number_lote', l.number_lote,
                                'initial_existence', l.initial_existence,
                                'current_existence', l.current_existence,
                                'date_of_manufacture', l.date_of_manufacture,
                                'expiration_date', l.expiration_date
                            )
                            ORDER BY l.expiration_date ASC
                        ) FILTER (WHERE l.id IS NOT NULL), '[]'
                    ) AS lots
                FROM "Inventory".dish_and_combo_features i
                INNER JOIN "Kitchen".dishes_and_combos d ON i.id_dishes_and_combos = d.id
                LEFT JOIN "Inventory".lots l ON l.id_dish_and_combo_features = i.id
                WHERE i.id_branches = $1
                GROUP BY i.id, d.id
                LIMIT 20;
            `;
            const result = await database.query(queryText, [idBranch]);
            return result.rows;
        }
    } catch (error) {
        console.error("Error en get_all_dish_and_combo:", error);
        return [];
    }
}


async function get_all_dish_and_combo_without_lots(idBranch) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite no tiene schema, y no soporta GROUP BY tan complejo ni LEFT JOIN con filtro IS NULL tan directo
            // Hacemos una consulta básica con LEFT JOIN y filtro para que l.id sea NULL (sin lotes)
            const query = `
                SELECT 
                    i.*,
                    d.barcode,
                    d.name,
                    d.description,
                    d.img,
                    d.id_product_department,
                    d.id_product_category,
                    d.this_product_is_sold_in_bulk,
                    d.this_product_need_recipe
                FROM dish_and_combo_features i
                INNER JOIN dishes_and_combos d ON i.id_dishes_and_combos = d.id
                LEFT JOIN lots l ON l.id_dish_and_combo_features = i.id
                WHERE i.id_branches = ?
                AND l.id IS NULL
            `;
            const rows = await new Promise((resolve, reject) => {
                database.all(query, [idBranch], (err, rows) => {
                    if (err) {
                        console.error("SQLite error in get_all_dish_and_combo_without_lots:", err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            return rows;
        } else {
            // PostgreSQL versión original con esquema y agrupamiento
            const query = `
                SELECT 
                    i.*,
                    d.barcode,
                    d.name,
                    d.description,
                    d.img,
                    d.id_product_department,
                    d.id_product_category,
                    d.this_product_is_sold_in_bulk,
                    d.this_product_need_recipe
                FROM "Inventory".dish_and_combo_features i
                INNER JOIN "Kitchen".dishes_and_combos d ON i.id_dishes_and_combos = d.id
                LEFT JOIN "Inventory".lots l ON l.id_dish_and_combo_features = i.id
                WHERE i.id_branches = $1
                AND l.id IS NULL
                GROUP BY i.id, d.id
            `;
            const result = await database.query(query, [idBranch]);
            return result.rows;
        }
    } catch (error) {
        console.error("Error en get_all_dish_and_combo_without_lots:", error);
        return [];
    }
}

async function get_the_products_most_sales_additions(idBranch) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // En SQLite no hay jsonb ni funciones avanzadas, entonces simplificamos el query.
            // No hay json_agg ni jsonb_build_object, así que traemos los datos básicos sin agregados de lots.
            const query = `
                SELECT 
                    i.*,
                    d.barcode,
                    d.name,
                    d.description,
                    d.img,
                    d.id_product_department,
                    d.id_product_category,
                    d.this_product_is_sold_in_bulk,
                    d.this_product_need_recipe
                FROM dish_and_combo_features i
                INNER JOIN dishes_and_combos d ON i.id_dishes_and_combos = d.id
                WHERE i.id_branches = ?
                LIMIT 50
            `;
            const rows = await new Promise((resolve, reject) => {
                database.all(query, [idBranch], (err, rows) => {
                    if (err) {
                        console.error("SQLite error in get_the_products_most_sales_additions:", err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            return rows;
        } else {
            // PostgreSQL con jsonb_agg para obtener los lots como JSON
            const query = `
                SELECT 
                    i.*,
                    d.barcode,
                    d.name,
                    d.description,
                    d.img,
                    d.id_product_department,
                    d.id_product_category,
                    d.this_product_is_sold_in_bulk,
                    d.this_product_need_recipe,
                    COALESCE(
                        json_agg(
                            jsonb_build_object(
                                'id', l.id,
                                'number_lote', l.number_lote,
                                'initial_existence', l.initial_existence,
                                'current_existence', l.current_existence,
                                'date_of_manufacture', l.date_of_manufacture,
                                'expiration_date', l.expiration_date
                            )
                            ORDER BY l.expiration_date ASC
                        ) FILTER (WHERE l.id IS NOT NULL), '[]'
                    ) AS lots
                FROM "Inventory".dish_and_combo_features i
                INNER JOIN "Kitchen".dishes_and_combos d ON i.id_dishes_and_combos = d.id
                LEFT JOIN "Inventory".lots l ON l.id_dish_and_combo_features = i.id
                WHERE i.id_branches = $1
                GROUP BY i.id, d.id
                LIMIT 50;
            `;
            const result = await database.query(query, [idBranch]);
            return result.rows;
        }
    } catch (error) {
        console.error("Error en get_the_products_most_sales_additions:", error);
        return [];
    }
}

async function get_all_additions(dishAndCombo) {
    let additional = [];

    for (let i = 0; i < dishAndCombo.length; i++) {
        try {
            if (TYPE_DATABASE === 'mysqlite') {
                const query = `
                    SELECT id, id_dishes_and_combos, id_products_and_supplies 
                    FROM table_supplies_combo 
                    WHERE id_dishes_and_combos = ? AND additional = 1
                `;
                const rows = await new Promise((resolve, reject) => {
                    database.all(query, [dishAndCombo[i].id_dishes_and_combos], (err, rows) => {
                        if (err) {
                            console.error("SQLite error in get_all_additions:", err.message);
                            reject(err);
                        } else {
                            resolve(rows);
                        }
                    });
                });
                if (rows.length > 0) {
                    additional.push(...rows);
                }
            } else {
                const query = `
                    SELECT id, id_dishes_and_combos, id_products_and_supplies 
                    FROM "Kitchen".table_supplies_combo 
                    WHERE id_dishes_and_combos = $1 AND additional = true
                `;
                const result = await database.query(query, [dishAndCombo[i].id_dishes_and_combos]);
                if (result.rows.length > 0) {
                    additional.push(...result.rows);
                }
            }
        } catch (error) {
            console.error('Error al obtener las adiciones en get_all_additions:', error);
        }
    }

    return additional;
}


async function get_all_data_combo_most_sold(id_branch) {
    const mostSold = await get_all_combo_most_sold(id_branch);
    var dataComboSold = []
    for (let i = 0; i < mostSold.length; i++) {
        const combo = mostSold[i];
        const data = await get_dish_and_combo_with_id(combo.id_dishes_and_combos);
        dataComboSold.push(data);
    }

    return dataComboSold;
}

async function get_data_recent_combos(id_company) {
    const newCombo = await get_recent_combos(id_company);
    var dataCombo = []
    for (let i = 0; i < newCombo.length; i++) {
        const combo = newCombo[i];
        const data = await get_dish_and_combo_with_id(combo.id);
        dataCombo.push(data);
    }

    return dataCombo;
}

async function get_recent_combos(id_company) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const query = `
                SELECT *
                FROM dishes_and_combos
                WHERE id_companies = ?
                ORDER BY id DESC
                LIMIT 10;
            `;
            const rows = await new Promise((resolve, reject) => {
                database.all(query, [id_company], (err, rows) => {
                    if (err) {
                        console.error("SQLite error in get_recent_combos:", err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            return rows;
        } else {
            const queryText = `
                SELECT *
                FROM "Kitchen".dishes_and_combos
                WHERE id_companies = $1
                ORDER BY id DESC
                LIMIT 10;
            `;
            const values = [id_company];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error("Error occurred while fetching recent combos:", error);
        throw error;
    }
}

async function get_all_combo_most_sold(idBranch) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const query = `
                SELECT id_dishes_and_combos, SUM(amount) AS total_sold
                FROM sales_history
                WHERE id_branches = ?
                GROUP BY id_dishes_and_combos
                ORDER BY total_sold DESC
                LIMIT 10;
            `;
            const rows = await new Promise((resolve, reject) => {
                database.all(query, [idBranch], (err, rows) => {
                    if (err) {
                        console.error("SQLite error in get_all_combo_most_sold:", err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            return rows;
        } else {
            const queryText = `
                SELECT id_dishes_and_combos, SUM(amount) AS total_sold
                FROM "Box".sales_history
                WHERE id_branches = $1
                GROUP BY id_dishes_and_combos
                ORDER BY total_sold DESC
                LIMIT 10;
            `;
            const values = [idBranch];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error("Error occurred while fetching top 10 products:", error);
        throw error;
    }
}

async function get_dish_and_combo_with_id(idCombo) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const query = `
                SELECT 
                    i.*,
                    d.barcode,
                    d.name,
                    d.description,
                    d.img,
                    d.id_product_department,
                    d.id_product_category
                FROM dish_and_combo_features i
                INNER JOIN dishes_and_combos d ON i.id_dishes_and_combos = d.id
                WHERE d.id = ?
                LIMIT 1
            `;
            const row = await new Promise((resolve, reject) => {
                database.get(query, [idCombo], (err, row) => {
                    if (err) {
                        console.error("SQLite error in get_dish_and_combo_with_id:", err.message);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });
            return row;
        } else {
            const queryText = `
                SELECT 
                    i.*,
                    d.barcode,
                    d.name,
                    d.description,
                    d.img,
                    d.id_product_department,
                    d.id_product_category
                FROM "Inventory".dish_and_combo_features i
                INNER JOIN "Kitchen".dishes_and_combos d ON i.id_dishes_and_combos = d.id
                WHERE d.id = $1
                LIMIT 1;
            `;
            const values = [idCombo];
            const result = await database.query(queryText, values);
            return result.rows[0];
        }
    } catch (error) {
        console.error("Error in get_dish_and_combo_with_id:", error);
        return null;
    }
}

async function get_all_products_in_sales(idBranch) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const query = `
                SELECT 
                    i.*,
                    d.barcode,
                    d.name,
                    d.description,
                    d.img,
                    d.id_product_department,
                    d.id_product_category
                FROM dish_and_combo_features i
                INNER JOIN dishes_and_combos d ON i.id_dishes_and_combos = d.id
                WHERE i.id_branches = ? AND d.is_a_product = 1
            `;
            const rows = await new Promise((resolve, reject) => {
                database.all(query, [idBranch], (err, rows) => {
                    if (err) {
                        console.error("SQLite error in get_all_products_in_sales:", err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            return rows;
        } else {
            const queryText = `
                SELECT 
                    i.*,
                    d.barcode,
                    d.name,
                    d.description,
                    d.img,
                    d.id_product_department,
                    d.id_product_category
                FROM "Inventory".dish_and_combo_features i
                INNER JOIN "Kitchen".dishes_and_combos d ON i.id_dishes_and_combos = d.id
                WHERE i.id_branches = $1 AND d.is_a_product = true
            `;
            const values = [idBranch];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error("Error in get_all_products_in_sales:", error);
        return [];
    }
}


async function create_table_lot(){
    const queryText = `
        CREATE TABLE IF NOT EXISTS "Inventory".lots (
            id bigserial PRIMARY KEY,
            number_lote Text,
            initial_existence double precision,
            current_existence double precision NOT NULL,
            date_of_manufacture date NOT NULL,
            expiration_date date NOT NULL,
            id_dish_and_combo_features bigint,
            id_branches bigint,
            id_companies bigint,
            CONSTRAINT key_number_lote UNIQUE (id),
            CONSTRAINT dish_and_combo_features_fk FOREIGN KEY (id_dish_and_combo_features)
                REFERENCES "Inventory".dish_and_combo_features (id) MATCH FULL
                ON DELETE SET NULL ON UPDATE CASCADE,
            CONSTRAINT branches_fk FOREIGN KEY (id_branches)
                REFERENCES "Company".branches (id) MATCH FULL
                ON DELETE SET NULL ON UPDATE CASCADE,
            CONSTRAINT companies_fk FOREIGN KEY (id_companies)
                REFERENCES "User".companies (id) MATCH FULL
                ON DELETE SET NULL ON UPDATE CASCADE
        );
    `;
    
    try {
        await database.query(queryText);
        return true;
    } catch (error) {
        return false;
    }
}

async function get_all_the_promotions(id_branch) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const query = `
                SELECT 
                    p.*, 
                    d.id_dishes_and_combos 
                FROM promotions p
                INNER JOIN dish_and_combo_features d 
                    ON p.id_dish_and_combo_features = d.id
                WHERE p.id_branches = ? AND p.active_promotion = 1;
            `;
            const rows = await new Promise((resolve, reject) => {
                database.all(query, [id_branch], (err, rows) => {
                    if (err) {
                        console.error("SQLite error in get_all_the_promotions:", err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            return rows;
        } else {
            const queryText = `
                SELECT 
                    p.*, 
                    d.id_dishes_and_combos 
                FROM "Inventory".promotions AS p
                INNER JOIN "Inventory".dish_and_combo_features AS d 
                    ON p.id_dish_and_combo_features = d.id
                WHERE p.id_branches = $1 AND p.active_promotion = true;
            `;
            const result = await database.query(queryText, [id_branch]);
            return result.rows;
        }
    } catch (error) {
        console.error("Error al obtener los datos de la tabla 'promotions':", error);
        return [];
    }
}


module.exports = {
    this_employee_works_here,
    this_data_employee_is_user,
    get_all_dish_and_combo,
    get_all_additions,
    get_all_data_combo_most_sold,
    get_data_recent_combos,
    get_recent_combos,
    get_all_combo_most_sold,
    get_dish_and_combo_with_id,
    get_all_products_in_sales,
    get_all_the_promotions,
    get_the_products_most_sales_additions,
    get_all_dish_and_combo_without_lots
};