require('dotenv').config();
const {TYPE_DATABASE}=process.env;
const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

async function get_all_invoice_with_the_id_of_the_branch(id_branch) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite does not support schemas and uses ? as placeholder
            const query = `
                SELECT 
                    f."Invoice Number", 
                    f.id_companies, 
                    f.id_branches, 
                    f.id_employees, 
                    f.id_customers, 
                    f.id_commanders, 
                    f.name_customer, 
                    f.email_customer, 
                    f.address, 
                    f.transition_type, 
                    f.payment_reference, 
                    f.creation_date, 
                    f.payment_date, 
                    f.type_of_documentation, 
                    f.status, 
                    f.paid, 
                    b.name_branch AS branch_name
                FROM 
                    facture f
                JOIN 
                    branches b ON b.id = f.id_branches
                WHERE 
                    f.id_branches = ?;
            `;
            return new Promise((resolve, reject) => {
                database.all(query, [id_branch], (err, rows) => {
                    if (err) {
                        console.error('SQLite error fetching invoices:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            // PostgreSQL uses schemas and $1 as placeholder
            const queryText = `
                SELECT 
                    f."Invoice Number", 
                    f.id_companies, 
                    f.id_branches, 
                    f.id_employees, 
                    f.id_customers, 
                    f.id_commanders, 
                    f.name_customer, 
                    f.email_customer, 
                    f.address, 
                    f.transition_type, 
                    f.payment_reference, 
                    f.creation_date, 
                    f.payment_date, 
                    f.type_of_documentation, 
                    f.status, 
                    f.paid, 
                    b.name_branch AS branch_name
                FROM 
                    "Branch".facture f
                JOIN 
                    "Company".branches b ON b.id = f.id_branches
                WHERE 
                    f.id_branches = $1;
            `;
            const values = [id_branch];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error fetching invoices by branch:', error);
        throw error;
    }
}

module.exports = {
    get_all_invoice_with_the_id_of_the_branch,
};