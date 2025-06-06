require('dotenv').config();
const {TYPE_DATABASE}=process.env;

const database = require('../database');
const addDatabase = require('../router/addDatabase');

//functions image
async function get_data_tabla_with_id_company(id_company, schema, table) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            // En SQLite no hay esquema, solo tabla
            const queryText = `SELECT * FROM ${table} WHERE id_companies = ?`;
            database.all(queryText, [id_company], (err, rows) => {
                if (err) {
                    console.error('Error en get_data_tabla_with_id_company (SQLite):', err);
                    return resolve([]);
                }
                resolve(rows);
            });
        });
    }

    try {
        // PostgreSQL: incluye esquema y usa $1 para placeholder
        const queryText = `SELECT * FROM "${schema}"."${table}" WHERE id_companies = $1`;
        const result = await database.query(queryText, [id_company]);
        return result.rows;
    } catch (error) {
        console.error('Error en get_data_tabla_with_id_company (PostgreSQL):', error);
        return [];
    }
}

function the_user_have_this_company(company) {
    return company.rows.length > 0;
}

async function search_the_company_of_the_user(req) {
    const { id } = req.params;
    const userId = parseInt(req.user.id);

    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `SELECT * FROM companies WHERE id = ? AND id_users = ?`;
            database.get(queryText, [id, userId], (err, row) => {
                if (err) {
                    console.error('Error en search_the_company_of_the_user (SQLite):', err);
                    return resolve(null);
                }
                resolve(row);
            });
        });
    }

    try {
        const queryText = `SELECT * FROM "User".companies WHERE id = $1 AND id_users = $2`;
        const result = await database.query(queryText, [id, userId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error en search_the_company_of_the_user (PostgreSQL):', error);
        return null;
    }
}

async function get_data_company_with_id(id_company) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `SELECT * FROM companies WHERE id = ?`;
            database.get(queryText, [id_company], (err, row) => {
                if (err) {
                    console.error('Error en get_data_company_with_id (SQLite):', err);
                    return resolve(null);
                }
                resolve(row);
            });
        });
    }

    try {
        const queryText = `SELECT * FROM "User".companies WHERE id = $1`;
        const result = await database.query(queryText, [id_company]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error en get_data_company_with_id (PostgreSQL):', error);
        return null;
    }
}

async function delete_my_company(id_company, req) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // En SQLite no hay schemas, y placeholders son '?'
            // Eliminar roles_employees
            await new Promise((resolve, reject) => {
                const queryText = `DELETE FROM roles_employees WHERE id_companies = ?`;
                database.run(queryText, [id_company], function (err) {
                    if (err) {
                        console.error('Error deleting roles_employees (SQLite):', err);
                        return reject(err);
                    }
                    resolve();
                });
            });

            // Eliminar company con id_usuario
            await new Promise((resolve, reject) => {
                const queryText = `DELETE FROM companies WHERE id = ? AND id_users = ?`;
                database.run(queryText, [id_company, parseInt(req.user.id)], function (err) {
                    if (err) {
                        console.error('Error deleting company (SQLite):', err);
                        return reject(err);
                    }
                    resolve();
                });
            });

            return true;
        }

        // PostgreSQL
        var queryText = 'DELETE FROM "Employee".roles_employees WHERE id_companies= $1';
        var values = [id_company];
        await database.query(queryText, values);

        queryText = 'DELETE FROM "User".companies WHERE id= $1 and id_users= $2';
        values = [id_company, parseInt(req.user.id)];
        await database.query(queryText, values);

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}


async function get_data_company(req, nameTable) {
    const { id } = req.params;

    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite: sin schema, placeholder ?
        return new Promise((resolve, reject) => {
            const queryText = `SELECT * FROM ${nameTable} WHERE id_companies = ?`;
            database.all(queryText, [id], (err, rows) => {
                if (err) {
                    console.error('Error en SQLite get_data_company:', err);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    } else {
        // PostgreSQL
        const queryText = `SELECT * FROM "Company".${nameTable} WHERE id_companies = $1`;
        const values = [id];
        const result = await database.query(queryText, values);
        return result.rows;
    }
}


async function check_company_other(req) {
    const { id_company } = req.params;

    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `SELECT * FROM companies WHERE id = ? AND id_users = ?`;
            const values = [id_company, parseInt(req.user.id)];
            database.get(queryText, values, (err, row) => {
                if (err) {
                    console.error('Error en SQLite check_company_other:', err);
                    return resolve(null);
                }
                resolve(row ? [row] : []);
            });
        });
    } else {
        const queryText = `SELECT * FROM "User".companies WHERE id = $1 AND id_users = $2`;
        const values = [id_company, parseInt(req.user.id)];
        const result = await database.query(queryText, values);
        return result.rows;
    }
}


async function check_company(req) {
    const { id } = req.params;

    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `SELECT * FROM companies WHERE id = ? AND id_users = ?`;
            const values = [id, parseInt(req.user.id)];
            database.get(queryText, values, (err, row) => {
                if (err) {
                    console.error('Error en SQLite check_company:', err);
                    return resolve([]);
                }
                resolve(row ? [row] : []);
            });
        });
    } else {
        const queryText = `SELECT * FROM "User".companies WHERE id = $1 AND id_users = $2`;
        const values = [id, parseInt(req.user.id)];
        const result = await database.query(queryText, values);
        return result.rows;
    }
}


async function this_company_is_of_this_user(req, res) {
    //get the id of the company
    const { id_company } = req.params;
    const company = await check_company_user(id_company, req); //search all the company of the user 
    console.log(id_company)
    //we will see if exist this company in the list of the user
    if (company.length > 0) {
        return company;
    } else {
        //if not exist we will to show a invasion message 
        req.flash('message', '⚠️Esta empresa no es tuya⚠️');
        res.redirect('/fud/home');
    }
}

async function check_company_user(id_company, req) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `SELECT * FROM companies WHERE id = ? AND id_users = ?`;
            const values = [id_company, parseInt(req.user.id)];
            database.get(queryText, values, (err, row) => {
                if (err) {
                    console.error('Error en SQLite check_company_user:', err);
                    return resolve([]);
                }
                resolve(row ? [row] : []);
            });
        });
    } else {
        var queryText = 'SELECT * FROM "User".companies WHERE id= $1 and id_users= $2';
        var values = [id_company, parseInt(req.user.id)];
        const result = await database.query(queryText, values);
        return result.rows;
    }
}


async function get_free_company(id_user) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `SELECT id FROM companies WHERE id_users = ? LIMIT 1`;
            database.get(queryText, [id_user], (err, row) => {
                if (err) {
                    console.error('Error en SQLite get_free_company:', err);
                    return resolve(null);
                }
                resolve(row ? row.id : null);
            });
        });
    } else {
        const queryText = 'SELECT id FROM "User".companies WHERE id_users = $1 LIMIT 1';
        const values = [id_user];
        const result = await database.query(queryText, values);
        return result.rows.length > 0 ? result.rows[0].id : null;
    }
}


/*////this is for get the pack database//*/
async function get_pack_database(id_company) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            return new Promise((resolve, reject) => {
                const queryText = `SELECT pack_database FROM companies WHERE id = ? LIMIT 1`;
                database.get(queryText, [id_company], (err, row) => {
                    if (err) {
                        console.error('Error en SQLite get_pack_database:', err);
                        return resolve(0);
                    }
                    resolve(row ? row.pack_database : null);
                });
            });
        } else {
            const queryText = `
                SELECT pack_database
                FROM "User".companies
                WHERE id = $1
            `;
            const { rows } = await database.query(queryText, [id_company]);
            if (rows.length > 0) {
                return rows[0].pack_database;
            } else {
                return null;
            }
        }
    } catch (error) {
        console.error('Error al obtener pack_database:', error);
        return 0;
    }
}



module.exports = {
    get_data_tabla_with_id_company,
    the_user_have_this_company,
    search_the_company_of_the_user,
    get_data_company_with_id,
    delete_my_company,
    get_data_company,
    check_company_other,
    check_company,
    get_pack_database,
    this_company_is_of_this_user,
    check_company_user,
    get_free_company
};