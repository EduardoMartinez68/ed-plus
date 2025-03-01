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


router.get('/:id_company/:id_branch/cashCut', isLoggedIn, async (req, res) => {
    const {id_company,id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);

    //this is for update the database of the user
    await add_table_box_history();


    //now if exist the table, we will get all the information of the user
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Establece hora en 00:00:00.000
    const idEmployee=req.user.id_employee;

    const salesForMoney=await get_all_the_buy(idEmployee,today);
    const moveUser=await get_total_movements_by_employee(idEmployee,today);
    const movePositive=await get_all_the_movements_positive(idEmployee,today);
    const moveNegative=await get_all_the_movements_negative(idEmployee,today);

    console.log('---------------');
    console.log(salesForMoney);
    console.log(moveUser);
    console.log(movePositive);
    console.log(moveNegative);

    res.render('links/cashCut/cashCut.hbs',{branchFree, salesForMoney,moveUser,movePositive,moveNegative});
})


async function get_all_the_buy(id_employee, date) {
    const queryText = `
        SELECT 
            COALESCE(SUM(buy_for_cash), 0) AS total_cash_sales,
            COALESCE(SUM(buy_for_credit_card), 0) AS total_credit_sales,
            COALESCE(SUM(buy_for_debit_card), 0) AS total_debit_sales,
            COALESCE(SUM(change_of_sale), 0) AS total_change_of_sale
        FROM "Box".box_history
        WHERE id_employee = $1
        AND DATE(date_sales) = $2;
    `;

    try {
        const result = await database.query(queryText, [id_employee, date]);
        return result.rows;
    } catch (error) {
        console.error('Error getting total sales:', error);
        return { cash: 0, credit: 0, debit: 0 , total_change_of_sale:0};
    }
}


async function get_total_movements_by_employee(id_employee, date) {
    const queryText = `
        SELECT 
            COALESCE(SUM(CASE WHEN move >=0 THEN move ELSE 0 END), 0) AS total_entries,
            COALESCE(SUM(CASE WHEN move <0 THEN move ELSE 0 END), 0) AS total_exits
        FROM "Box".movement_history
        WHERE id_employees = $1
        AND DATE(date_move) = $2;
    `;

    try {
        const result = await database.query(queryText, [id_employee, date]);
        return [{
            entries: result.rows[0].total_entries,
            exits: result.rows[0].total_exits
        }];
    } catch (error) {
        console.error('Error getting total movements:', error);
        return { entries: 0, exits: 0 };
    }
}

async function get_all_the_movements_positive(id_employee, date) {
    const queryText = `
        SELECT *  
        FROM "Box".movement_history
        WHERE id_employees = $1
        AND DATE(date_move) = $2
        AND move>=0;
    `;

    try {
        const result = await database.query(queryText, [id_employee,date]);
        return result.rows; 
    } catch (error) {
        console.error('Error getting positive movements:', error);
        return [];
    }
}

async function get_all_the_movements_negative(id_employee, date) {
    const queryText = `
        SELECT *  
        FROM "Box".movement_history
        WHERE id_employees = $1
        AND DATE(date_move) = $2
        AND move < 0;
    `;

    try {
        const result = await database.query(queryText, [id_employee, date]);
        return result.rows; 
    } catch (error) {
        console.error('Error getting positive movements:', error);
        return [];
    }
}


async function add_table_box_history() {
    const queryText = `
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

    try {
        await database.query(queryText);
        return true;
    } catch (error) {
        console.error('Error adding column "cut" to sales_history:', error);
        return false;
    }
}


module.exports = router;