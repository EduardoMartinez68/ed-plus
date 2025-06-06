require('dotenv').config();
const {TYPE_DATABASE}=process.env;
const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

async function get_department(id_company) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite query (no schema, uses ? for placeholders)
            return new Promise((resolve, reject) => {
                const query = 'SELECT * FROM product_department WHERE id_companies = ?';
                database.all(query, [id_company], (err, rows) => {
                    if (err) {
                        console.error('SQLite error getting product departments:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            // PostgreSQL query with schema and async/await
            const queryText = 'SELECT * FROM "Kitchen".product_department WHERE id_companies = $1';
            const values = [id_company];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error getting product departments:', error);
        throw error;
    }
}

async function delate_product_department(id) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite deletion (no schema, uses ? for placeholder)
            return new Promise((resolve, reject) => {
                const query = 'DELETE FROM product_department WHERE id = ?';
                database.run(query, [id], function (err) {
                    if (err) {
                        console.error('SQLite error deleting product department:', err.message);
                        reject(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        } else {
            // PostgreSQL deletion using async/await
            const queryText = 'DELETE FROM "Kitchen".product_department WHERE id = $1';
            const values = [id];
            await database.query(queryText, values);
            return true;
        }
    } catch (error) {
        console.error('Error deleting product department from the database:', error);
        return false;
    }
}


async function update_product_department(id, name, description) {
    const values = [name, description, id];

    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite uses ? placeholders and does not use schemas
            return new Promise((resolve, reject) => {
                const query = 'UPDATE product_department SET name = ?, description = ? WHERE id = ?';
                database.run(query, values, function (err) {
                    if (err) {
                        console.error('SQLite error updating product department:', err.message);
                        reject(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        } else {
            // PostgreSQL uses $1, $2, etc. and supports schemas
            const queryText = 'UPDATE "Kitchen".product_department SET name = $1, description = $2 WHERE id = $3';
            await database.query(queryText, values);
            return true;
        }
    } catch (error) {
        console.error('Error updating product department in the database:', error);
        return false;
    }
}


async function this_department_be() {
    return true;
}

module.exports = {
    get_department,
    delate_product_department,
    update_product_department,
    this_department_be
};
