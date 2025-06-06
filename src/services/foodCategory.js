require('dotenv').config();
const {TYPE_DATABASE}=process.env;
const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

async function get_category(id_company) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            return new Promise((resolve, reject) => {
                const query = 'SELECT * FROM product_category WHERE id_companies = ?';
                database.all(query, [id_company], (err, rows) => {
                    if (err) {
                        console.error('SQLite error getting categories:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            const queryText = 'SELECT * FROM "Kitchen".product_category WHERE id_companies = $1';
            const values = [id_company];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error getting categories:', error);
        throw error;
    }
}

async function delate_product_category(id) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            return new Promise((resolve, reject) => {
                const query = 'DELETE FROM product_category WHERE id = ?';
                database.run(query, [id], function(err) {
                    if (err) {
                        console.error('SQLite error deleting product category:', err.message);
                        reject(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        } else {
            const queryText = 'DELETE FROM "Kitchen".product_category WHERE id = $1';
            const values = [id];
            await database.query(queryText, values);
            return true;
        }
    } catch (error) {
        console.error('Error deleting product category:', error);
        return false;
    }
}

module.exports = {
    get_category,
    delate_product_category,
};
