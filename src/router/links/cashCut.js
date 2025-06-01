const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
const database = require('../../database');
const addDatabase = require('../addDatabase');
const update = require('../updateDatabase');

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

    const salesForMoney=await get_all_the_buy(idEmployee,dateStart,dateFinish);
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

async function get_all_the_user_of_the_branch(id_branch){
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

    try {
        const result = await database.query(queryText, [id_branch]);
        return result.rows;
    } catch (error) {
        console.error('Error getting total sales:', error);
        return [];
    }
}

async function get_the_number_of_sales(id_employee, dateStart,dateFinish) {
    const queryText = `
        SELECT * FROM "Box".box_history
        WHERE id_employee = $1
        AND date_sales BETWEEN $2 AND $3;
    `;

    try {
        const result = await database.query(queryText, [id_employee, dateStart,dateFinish]);
        return [{
            count: result.rowCount, // Número de registros obtenidos
            data: result.rows // Datos obtenidos
        }];
    } catch (error) {
        console.error('Error getting total sales:', error);
        return { cash: 0, credit: 0, debit: 0 , total_change_of_sale:0};
    }
}

async function get_the_number_input_and_output(id_employee, dateStart,dateFinish) {
    const queryText = `
        SELECT 
            SUM(CASE WHEN move >= 0 THEN 1 ELSE 0 END) AS positive_moves,
            SUM(CASE WHEN move < 0 THEN 1 ELSE 0 END) AS negative_moves
        FROM "Box".movement_history
        WHERE id_employees = $1
        AND date_move BETWEEN $2 AND $3;
    `;

    try {
        const result = await database.query(queryText, [id_employee, dateStart,dateFinish]);

        return [{
            positive: result.rows[0].positive_moves || 0,
            negative: result.rows[0].negative_moves || 0
        }];
    } catch (error) {
        console.error('Error getting number move counts in get_the_number_input_and_output:', error);
        return { positive: 0, negative: 0 };
    }
}

async function get_all_the_buy(id_employee, dateStart,dateFinish) {
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

    try {
        const result = await database.query(queryText, [id_employee, dateStart,dateFinish]);
        return result.rows;
    } catch (error) {
        console.error('Error getting total sales:', error);
        return { cash: 0, credit: 0, debit: 0 , total_change_of_sale:0};
    }
}

async function get_total_movements_by_employee(id_employee, dateStart,dateFinish) {
    const queryText = `
        SELECT 
            COALESCE(SUM(CASE WHEN move >=0 THEN move ELSE 0 END), 0) AS total_entries,
            COALESCE(SUM(CASE WHEN move <0 THEN move ELSE 0 END), 0) AS total_exits
        FROM "Box".movement_history
        WHERE id_employees = $1
        AND date_move BETWEEN $2 AND $3;
    `;

    try {
        const result = await database.query(queryText, [id_employee, dateStart,dateFinish]);
        return [{
            entries: result.rows[0].total_entries,
            exits: result.rows[0].total_exits
        }];
    } catch (error) {
        console.error('Error getting total movements in get_total_movements_by_employee:', error);
        return { entries: 0, exits: 0 };
    }
}

async function get_all_the_movements_positive(id_employee, dateStart,dateFinish) {
    const queryText = `
        SELECT *  
        FROM "Box".movement_history
        WHERE id_employees = $1
        AND date_move BETWEEN $2 AND $3
        AND move >= 0;
    `;

    try {
        const result = await database.query(queryText, [id_employee,dateStart,dateFinish]);
        return result.rows; 
    } catch (error) {
        console.error('Error getting positive movements:', error);
        return [];
    }
}

async function get_all_the_movements_negative(id_employee, dateStart,dateFinish) {
    const queryText = `
        SELECT *  
        FROM "Box".movement_history
        WHERE id_employees = $1
        AND date_move BETWEEN $2 AND $3
        AND move < 0;
    `;

    try {
        const result = await database.query(queryText, [id_employee, dateStart,dateFinish]);
        return result.rows; 
    } catch (error) {
        console.error('Error get_all_the_movements_negative:', error);
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

async function get_data_of_the_employee(id_employee){
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

    try {
        const result = await database.query(queryText, [id_employee]);
        return result.rows;
    } catch (error) {
        console.error('Error getting total sales:', error);
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

    const salesForMoney=await get_all_the_buy(idEmployee,dateStart,dateFinish);
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