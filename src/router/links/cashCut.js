const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
const database = require('../../database');
const addDatabase = require('../addDatabase');
const update = require('../updateDatabase');
require('dotenv').config();
const {TYPE_DATABASE}=process.env;

//functions branch
const {
    get_data_branch
} = require('../../services/branch');

const {
    delate_image_upload
} = require('../../services/connectionWithDatabaseImage');
const { get } = require('node-persist');


router.get('/:id_company/:id_branch/cashCut', isLoggedIn, async (req, res) => {
    const {id_company,id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);

    //this is for update the database of the user
    await add_table_box_history();


    //now if exist the table, we will get all the information of the user
    const dateStart = new Date();
    dateStart.setHours(0, 0, 0, 0); // Establece hora en 00:00:00.000
    const idEmployee=req.user.id_employee;

    const dateFinish = new Date();
    dateFinish.setHours(23, 59, 59, 999);

    const salesForMoney=[await get_all_the_buy(idEmployee,dateStart,dateFinish)];
    const moveUser=await get_total_movements_by_employee(idEmployee,dateStart,dateFinish);
    const movePositive=await get_all_the_movements_positive(idEmployee,dateStart,dateFinish);
    const moveNegative=await get_all_the_movements_negative(idEmployee,dateStart,dateFinish);

    const numberOfSales=await get_the_number_of_sales(idEmployee,dateStart);
    const numberInputOutput=await get_the_number_input_and_output(idEmployee,dateStart,dateFinish);

    const employees=await get_all_the_user_of_the_branch(id_branch);

    const datesCut=[{dateStart:formatDate(dateStart),dateFinish:formatDate(dateFinish)}];
    const dataEmployee=[{first_name:req.user.first_name,second_name:req.user.second_name,last_name:req.user.last_name}];
    res.render('links/cashCut/cashCut.hbs',{branchFree, salesForMoney,moveUser,movePositive,moveNegative,numberOfSales,numberInputOutput,employees,datesCut,dataEmployee});
})

async function get_all_the_user_of_the_branch(id_branch) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // En SQLite no hay schemas, y el placeholder es '?'
            const query = `
                SELECT 
                    e.id AS employee_id, e.id_companies, e.id_users, e.id_roles_employees, 
                    e.id_departments_employees, e.id_branches, e.city, 
                    e.street, e.num_ext, e.num_int, e.id_country, 
                    e.phone, e.cell_phone, e.nip,
                    u.id AS user_id, u.photo, u.user_name, u.email, u.first_name, 
                    u.second_name, u.last_name, u.rol_user, u.id_packs_fud, 
                    u.language, u.pack_database, u.pack_branch, 
                    u.navbar_1, u.navbar_2, u.navbar_3, u.edit_branch
                FROM employees e
                LEFT JOIN users u ON e.id_users = u.id
                WHERE e.id_branches = ?;
            `;
            return new Promise((resolve, reject) => {
                database.all(query, [id_branch], (err, rows) => {
                    if (err) {
                        console.error('SQLite error getting users:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            // PostgreSQL usa schemas y placeholders $1
            const queryText = `
                SELECT 
                    e.id AS employee_id, e.id_companies, e.id_users, e.id_roles_employees, 
                    e.id_departments_employees, e.id_branches, e.city, 
                    e.street, e.num_ext, e.num_int, e.id_country, 
                    e.phone, e.cell_phone, e.nip,
                    u.id AS user_id, u.photo, u.user_name, u.email, u.first_name, 
                    u.second_name, u.last_name, u.rol_user, u.id_packs_fud, 
                    u.language, u.pack_database, u.pack_branch, 
                    u.navbar_1, u.navbar_2, u.navbar_3, u.edit_branch
                FROM "Company".employees e
                LEFT JOIN "Fud".users u ON e.id_users = u.id
                WHERE e.id_branches = $1;
            `;
            const values = [id_branch];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error getting users of the branch:', error);
        return [];
    }
}

async function get_the_number_of_sales(id_employee, dateStart, dateFinish) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite usa '?' para placeholders y no tiene schemas
            const query = `
                SELECT * FROM box_history
                WHERE id_employee = ?
                AND date_sales BETWEEN ? AND ?;
            `;
            return new Promise((resolve, reject) => {
                database.all(query, [id_employee, dateStart, dateFinish], (err, rows) => {
                    if (err) {
                        console.error('SQLite error getting sales:', err.message);
                        reject(err);
                    } else {
                        resolve([{
                            count: rows.length,
                            data: rows
                        }]);
                    }
                });
            });
        } else {
            // PostgreSQL usa $1, $2, $3 y schemas
            const queryText = `
                SELECT * FROM "Box".box_history
                WHERE id_employee = $1
                AND date_sales BETWEEN $2 AND $3;
            `;
            const values = [id_employee, dateStart, dateFinish];
            const result = await database.query(queryText, values);
            return [{
                count: result.rowCount,
                data: result.rows
            }];
        }
    } catch (error) {
        console.error('Error getting total sales:', error);
        return { cash: 0, credit: 0, debit: 0, total_change_of_sale: 0 };
    }
}

async function get_the_number_input_and_output(id_employee, dateStart, dateFinish) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite no soporta schemas y usa '?' como placeholders
            const query = `
                SELECT 
                    SUM(CASE WHEN move >= 0 THEN 1 ELSE 0 END) AS positive_moves,
                    SUM(CASE WHEN move < 0 THEN 1 ELSE 0 END) AS negative_moves
                FROM movement_history
                WHERE id_employees = ?
                AND date_move BETWEEN ? AND ?;
            `;
            return new Promise((resolve, reject) => {
                database.get(query, [id_employee, dateStart, dateFinish], (err, row) => {
                    if (err) {
                        console.error('SQLite error getting move counts:', err.message);
                        reject(err);
                    } else {
                        resolve([{
                            positive: row?.positive_moves || 0,
                            negative: row?.negative_moves || 0
                        }]);
                    }
                });
            });
        } else {
            // PostgreSQL con schemas y placeholders $1, $2, $3
            const queryText = `
                SELECT 
                    SUM(CASE WHEN move >= 0 THEN 1 ELSE 0 END) AS positive_moves,
                    SUM(CASE WHEN move < 0 THEN 1 ELSE 0 END) AS negative_moves
                FROM "Box".movement_history
                WHERE id_employees = $1
                AND date_move BETWEEN $2 AND $3;
            `;
            const values = [id_employee, dateStart, dateFinish];
            const result = await database.query(queryText, values);
            return [{
                positive: result.rows[0]?.positive_moves || 0,
                negative: result.rows[0]?.negative_moves || 0
            }];
        }
    } catch (error) {
        console.error('Error getting number move counts in get_the_number_input_and_output:', error);
        return { positive: 0, negative: 0 };
    }
}


async function get_all_the_buy(id_employee, dateStart, dateFinish) {
  // Formato ISO para fechas
  const start = new Date(dateStart).toISOString();
  const end = new Date(dateFinish).toISOString();

  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const query = `
        SELECT 
          COALESCE(SUM(cash), 0) AS total_cash_sales,
          COALESCE(SUM(credit), 0) AS total_credit_sales,
          COALESCE(SUM(debit), 0) AS total_debit_sales,
          COALESCE(SUM(cash + credit + debit - total), 0) AS total_change_of_sale
        FROM ticket
        WHERE id_employees = ?
          AND datetime(date_sale) BETWEEN datetime(?) AND datetime(?)
      `;
      database.get(query, [id_employee, start, end], (err, row) => {
        if (err) {
          console.error('Error get_all_the_buy (SQLite):', err);
          return resolve({
            total_cash_sales: 0,
            total_credit_sales: 0,
            total_debit_sales: 0,
            total_change_of_sale: 0
          });
        }
        resolve(row);
      });
    });
  } else {
    const query = `
      SELECT 
        COALESCE(SUM(cash), 0) AS total_cash_sales,
        COALESCE(SUM(credit), 0) AS total_credit_sales,
        COALESCE(SUM(debit), 0) AS total_debit_sales,
        COALESCE(SUM(cash + credit + debit - total), 0) AS total_change_of_sale
      FROM "Box".ticket
      WHERE id_employees = $1
        AND date_sale BETWEEN $2 AND $3
    `;
    try {
      const result = await database.query(query, [id_employee, start, end]);
      return result.rows[0];
    } catch (error) {
      console.error('Error get_all_the_buy (PostgreSQL):', error);
      return {
        total_cash_sales: 0,
        total_credit_sales: 0,
        total_debit_sales: 0,
        total_change_of_sale: 0
      };
    }
  }
}

async function get_all_the_buy_falla_al_sumar(id_employee, dateStart, dateFinish) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite no soporta schemas y usa '?' como placeholders
            const query = `
                SELECT 
                    COALESCE(SUM(buy_for_cash), 0) AS total_cash_sales,
                    COALESCE(SUM(buy_for_credit_card), 0) AS total_credit_sales,
                    COALESCE(SUM(buy_for_debit_card), 0) AS total_debit_sales,
                    COALESCE(SUM(change_of_sale), 0) AS total_change_of_sale
                FROM box_history
                WHERE id_employee = ?
                AND date_sales BETWEEN ? AND ?;
            `;
            return new Promise((resolve, reject) => {
                database.get(query, [id_employee, dateStart, dateFinish], (err, row) => {
                    if (err) {
                        console.error('SQLite error getting total sales:', err.message);
                        reject(err);
                    } else {
                        resolve(row ? [row] : []);
                    }
                });
            });
        } else {
            // PostgreSQL con schemas y placeholders $1, $2, $3
            const queryText = `
                SELECT 
                    COALESCE(SUM(buy_for_cash), 0) AS total_cash_sales,
                    COALESCE(SUM(buy_for_credit_card), 0) AS total_credit_sales,
                    COALESCE(SUM(buy_for_debit_card), 0) AS total_debit_sales,
                    COALESCE(SUM(change_of_sale), 0) AS total_change_of_sale
                FROM "Box".box_history
                WHERE id_employee = $1
                AND date_sales BETWEEN $2 AND $3;
            `;
            const values = [id_employee, dateStart, dateFinish];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error getting total sales:', error);
        return { total_cash_sales: 0, total_credit_sales: 0, total_debit_sales: 0, total_change_of_sale: 0 };
    }
}

async function get_total_movements_by_employee(id_employee, dateStart, dateFinish) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const query = `
                SELECT 
                    COALESCE(SUM(CASE WHEN move >= 0 THEN move ELSE 0 END), 0) AS total_entries,
                    COALESCE(SUM(CASE WHEN move < 0 THEN move ELSE 0 END), 0) AS total_exits
                FROM movement_history
                WHERE id_employees = ?
                AND date_move BETWEEN ? AND ?;
            `;
            return new Promise((resolve, reject) => {
                database.get(query, [id_employee, dateStart, dateFinish], (err, row) => {
                    if (err) {
                        console.error('SQLite error in get_total_movements_by_employee:', err.message);
                        reject(err);
                    } else {
                        resolve([{
                            entries: row.total_entries || 0,
                            exits: row.total_exits || 0
                        }]);
                    }
                });
            });
        } else {
            const queryText = `
                SELECT 
                    COALESCE(SUM(CASE WHEN move >= 0 THEN move ELSE 0 END), 0) AS total_entries,
                    COALESCE(SUM(CASE WHEN move < 0 THEN move ELSE 0 END), 0) AS total_exits
                FROM "Box".movement_history
                WHERE id_employees = $1
                AND date_move BETWEEN $2 AND $3;
            `;
            const result = await database.query(queryText, [id_employee, dateStart, dateFinish]);
            return [{
                entries: result.rows[0].total_entries,
                exits: result.rows[0].total_exits
            }];
        }
    } catch (error) {
        console.error('Error in get_total_movements_by_employee:', error);
        return [{ entries: 0, exits: 0 }];
    }
}

async function get_all_the_movements_positive(id_employee, dateStart, dateFinish) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const query = `
                SELECT *  
                FROM movement_history
                WHERE id_employees = ?
                AND date_move BETWEEN ? AND ?
                AND move >= 0;
            `;
            return new Promise((resolve, reject) => {
                database.all(query, [id_employee, dateStart, dateFinish], (err, rows) => {
                    if (err) {
                        console.error('SQLite error getting positive movements:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            const queryText = `
                SELECT *  
                FROM "Box".movement_history
                WHERE id_employees = $1
                AND date_move BETWEEN $2 AND $3
                AND move >= 0;
            `;
            const result = await database.query(queryText, [id_employee, dateStart, dateFinish]);
            return result.rows;
        }
    } catch (error) {
        console.error('Error getting positive movements:', error);
        return [];
    }
}

async function get_all_the_movements_negative(id_employee, dateStart, dateFinish) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const query = `
                SELECT *  
                FROM movement_history
                WHERE id_employees = ?
                AND date_move BETWEEN ? AND ?
                AND move < 0;
            `;
            return new Promise((resolve, reject) => {
                database.all(query, [id_employee, dateStart, dateFinish], (err, rows) => {
                    if (err) {
                        console.error('SQLite error getting negative movements:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            const queryText = `
                SELECT *  
                FROM "Box".movement_history
                WHERE id_employees = $1
                AND date_move BETWEEN $2 AND $3
                AND move < 0;
            `;
            const result = await database.query(queryText, [id_employee, dateStart, dateFinish]);
            return result.rows;
        }
    } catch (error) {
        console.error('Error get_all_the_movements_negative:', error);
        return [];
    }
}

async function add_table_box_history() {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const query = `
                CREATE TABLE IF NOT EXISTS box_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    id_employee INTEGER NOT NULL,
                    id_customers INTEGER,
                    buy_for_cash REAL NOT NULL,
                    buy_for_credit_card REAL NOT NULL,
                    buy_for_debit_card REAL NOT NULL,
                    change_of_sale REAL DEFAULT 0,
                    comment TEXT,
                    date_sales TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;
            return new Promise((resolve, reject) => {
                database.run(query, (err) => {
                    if (err) {
                        console.error('SQLite error creating box_history:', err.message);
                        reject(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        } else {
            const queryText = `
                CREATE SCHEMA IF NOT EXISTS "Box";

                CREATE TABLE IF NOT EXISTS "Box".box_history (
                    id BIGSERIAL PRIMARY KEY,
                    id_employee INTEGER NOT NULL,
                    id_customers INTEGER,
                    buy_for_cash NUMERIC(10,2) NOT NULL,
                    buy_for_credit_card NUMERIC(10,2) NOT NULL,
                    buy_for_debit_card NUMERIC(10,2) NOT NULL,
                    change_of_sale NUMERIC(10,2) DEFAULT 0,
                    comment TEXT,
                    date_sales TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;
            await database.query(queryText);
            return true;
        }
    } catch (error) {
        console.error('Error creating box_history table:', error);
        return false;
    }
}

async function get_data_of_the_employee(id_employee) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const query = `
                SELECT 
                    e.id AS employee_id, e.id_companies, e.id_users, e.id_roles_employees, 
                    e.id_departments_employees, e.id_branches, e.city, 
                    e.street, e.num_ext, e.num_int, e.id_country, 
                    e.phone, e.cell_phone, e.nip,
                    u.id AS user_id, u.photo, u.user_name, u.email, u.first_name, 
                    u.second_name, u.last_name, u.rol_user, u.id_packs_fud, 
                    u.language, u.pack_database, u.pack_branch, 
                    u.navbar_1, u.navbar_2, u.navbar_3, u.edit_branch
                FROM employees e
                LEFT JOIN users u ON e.id_users = u.id
                WHERE e.id = ?;
            `;

            return new Promise((resolve, reject) => {
                database.all(query, [id_employee], (err, rows) => {
                    if (err) {
                        console.error('SQLite error in get_data_of_the_employee:', err.message);
                        reject([]);
                    } else {
                        resolve(rows);
                    }
                });
            });

        } else {
            const queryText = `
                SELECT 
                    e.id AS employee_id, e.id_companies, e.id_users, e.id_roles_employees, 
                    e.id_departments_employees, e.id_branches, e.city, 
                    e.street, e.num_ext, e.num_int, e.id_country, 
                    e.phone, e.cell_phone, e.nip,
                    u.id AS user_id, u.photo, u.user_name, u.email, u.first_name, 
                    u.second_name, u.last_name, u.rol_user, u.id_packs_fud, 
                    u.language, u.pack_database, u.pack_branch, 
                    u.navbar_1, u.navbar_2, u.navbar_3, u.edit_branch
                FROM "Company".employees e
                LEFT JOIN "Fud".users u ON e.id_users = u.id
                WHERE e.id = $1;
            `;

            const result = await database.query(queryText, [id_employee]);
            return result.rows;
        }
    } catch (error) {
        console.error('Error getting employee data:', error);
        return [];
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

router.post('/:id_company/:id_branch/cash-cut-date', isLoggedIn, async (req, res) => {
    const {id_company,id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);

    //this is for update the database of the user
    await add_table_box_history();

    //now if exist the table, we will get all the information of the user
    const dateStart = req.body.dateStart;
    const dateFinish = req.body.dateFinish;
    const idEmployee = req.body.idEmployee;

    const salesForMoney=[await get_all_the_buy(idEmployee,dateStart,dateFinish)];
    const moveUser=await get_total_movements_by_employee(idEmployee,dateStart,dateFinish);
    const movePositive=await get_all_the_movements_positive(idEmployee,dateStart,dateFinish);
    const moveNegative=await get_all_the_movements_negative(idEmployee,dateStart,dateFinish);


    const numberOfSales=await get_the_number_of_sales(idEmployee,dateStart);
    const numberInputOutput=await get_the_number_input_and_output(idEmployee,dateStart,dateFinish);

    const employees=await get_all_the_user_of_the_branch(id_branch);
    const dataEmployee=await get_data_of_the_employee(idEmployee);
    const datesCut=[{dateStart:formatDate(dateStart),dateFinish:formatDate(dateFinish)}];
    
    res.render('links/cashCut/cashCut.hbs',{branchFree, salesForMoney,moveUser,movePositive,moveNegative,numberOfSales,numberInputOutput,employees,datesCut,dataEmployee});
})

module.exports = router;