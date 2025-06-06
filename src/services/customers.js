require('dotenv').config();
const {TYPE_DATABASE}=process.env;

const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

async function search_all_customers(idCompany) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            return new Promise((resolve, reject) => {
                const queryText = 'SELECT * FROM customers WHERE id_companies = ?';
                database.all(queryText, [idCompany], (err, rows) => {
                    if (err) {
                        console.error('Error fetching customers (SQLite):', err.message);
                        return reject(err);
                    }
                    resolve(rows);
                });
            });
        } else {
            const queryText = 'SELECT * FROM "Company".customers WHERE id_companies = $1';
            const values = [idCompany];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error fetching customers:', error.message);
        throw error;
    }
}


async function search_customers(idCustomer) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            return new Promise((resolve, reject) => {
                const queryText = 'SELECT * FROM customers WHERE id = ?';
                database.get(queryText, [idCustomer], (err, row) => {
                    if (err) {
                        console.error('Error fetching customer (SQLite):', err.message);
                        return reject(err);
                    }
                    resolve(row ? [row] : []);
                });
            });
        } else {
            const queryText = 'SELECT * FROM "Company".customers WHERE id = $1';
            const values = [idCustomer];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error fetching customer:', error.message);
        throw error;
    }
}

async function delete_customer(idCustomer) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            return new Promise((resolve, reject) => {
                const queryText = 'DELETE FROM customers WHERE id = ?';
                database.run(queryText, [idCustomer], function(err) {
                    if (err) {
                        console.error('Error al eliminar cliente (SQLite):', err.message);
                        return reject(false);
                    }
                    resolve(true);
                });
            });
        } else {
            const queryText = 'DELETE FROM "Company".customers WHERE id = $1';
            const values = [idCustomer];
            await database.query(queryText, values);
            return true;
        }
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        return false;
    }
}


module.exports = {
    search_all_customers,
    search_customers,
    delete_customer
};
