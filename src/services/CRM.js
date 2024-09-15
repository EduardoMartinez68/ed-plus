const database = require('../database');
const addDatabase = require('../router/addDatabase');
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


async function get_sales_stage_with_company_id(id_company){
    const queryText = `
        select * from "CRM".sales_stage WHERE id_companies=$1 ORDER BY position ASC
    `;
    const values = [id_company];

    try {
        const result = await database.query(queryText, values);
        return result.rows; 
    } catch (error) {
        console.log('ERROR to get the sales stage in get_sales_stage_with_company_id, File services/CRM.js '+error)
        return null;
    }
}

function create_new_sales_stage(id_company,name){
    const newSalesStage={
        id_company,
        name
    }

    return newSalesStage;
}

async function add_the_new_sales_stage_in_my_company(id_company){
    //we will create the four sales stage for any company
    const stage4=create_new_sales_stage(id_company,'ganado');
    const stage3=create_new_sales_stage(id_company,'propuesta');
    const stage2=create_new_sales_stage(id_company,'calificado');
    const stage1=create_new_sales_stage(id_company,'Nuevo');
    

    //we will add the stage to the database
    await addDatabase.add_new_sales_stage(stage1);
    await addDatabase.add_new_sales_stage(stage2);
    await addDatabase.add_new_sales_stage(stage3);
    await addDatabase.add_new_sales_stage(stage4);
}

async function delete_sale_stage_in_my_company(id_sale_stage){
    /*
        we will get all the proposals in this sale stage for after
        change of table and save in the first sale stage. This is for that not exist 
        a error when the user visite the link CRM 
    */
    const saleStages=await get_all_proposals_in_this_sale_stage(id_sale_stage);
    for(var i=0;i<=saleStages.length;i++){

    }

    return await delete_sale_stage_use_the_id(id_sale_stage); //we will see if can delete the sale stage
}

async function delete_sale_stage_use_the_id(id_sale_stage){
    const queryText = `
    DELETE FROM "CRM".sales_stage WHERE id = $1
    `;
    const values = [id_sale_stage];
    
    try {
        const result = await database.query(queryText, values);
        return result.rowCount;
    } catch (error) {
        console.log('ERROR to delete the sales stage in delete_sale_stage_use_the_id, File services/CRM.js '+error)
        return false;
    }    
}

async function get_all_proposals_in_this_sale_stage(id_sale_stage){
    const queryText = `
        select * from "CRM".prospects WHERE id_sales_stage=$1
    `;
    const values = [id_sale_stage];

    try {
        const result = await database.query(queryText, values);
        return result.rows; 
    } catch (error) {
        console.log('ERROR to get the sales stage in get_all_proposals_in_this_sale_stage, File services/CRM.js '+error)
        return null;
    }
}

async function get_all_sales_teams_with_company_id(id_company){
    const queryText = `
        select * from "CRM".sales_team WHERE id_companies=$1
    `;
    const values = [id_company];

    try {
        const result = await database.query(queryText, values);
        return result.rows; 
    } catch (error) {
        console.log('ERROR to get the sales stage in get_sales_sales_team, File services/CRM.js '+error)
        return null;
    }
}

async function add_new_sales_team_in_my_company(id_company){
    return await addDatabase.add_new_sales_team_in_my_company(id_company,'Ventas',0)
}

async function get_all_prospects_of_my_company(id_company){
    const queryText = `
        SELECT 
            p.*, 
            p2s.name AS product_name,
            p2s.color AS product_color,
            st.name AS sales_team_name,
            ss.id AS sales_stage_id,
            u.photo AS user_photo,
            u.user_name AS user_name,
            u.email AS user_email,
            u.first_name AS user_first_name,
            u.second_name AS user_second_name,
            u.last_name AS user_last_name
        FROM "CRM".prospects p
        LEFT JOIN "CRM".product_to_sell p2s ON p.id_product_to_sell = p2s.id
        LEFT JOIN "CRM".sales_team st ON p.id_sales_team = st.id
        LEFT JOIN "CRM".sales_stage ss ON p.id_sales_stage = ss.id
        LEFT JOIN "Company".employees e ON p.id_employees = e.id
        LEFT JOIN "Fud".users u ON e.id_users = u.id
        WHERE p.id_companies = $1
    `;
    const values = [id_company];

    try {
        const result = await database.query(queryText, values);
        return result.rows; 
    } catch (error) {
        console.log('ERROR to get the prospects in get_all_prospects_of_my_company, File services/CRM.js '+error)
        return null;
    }
}

async function get_data_of_a_prospect_with_his_id(id_prospect) {
    const queryText = `
        select * from "CRM".prospects WHERE id=$1
    `;
    const values = [id_prospect];

    try {
        const result = await database.query(queryText, values);
        return result.rows; 
    } catch (error) {
        console.log('ERROR to get the prospect in get_data_of_a_prospect_with_his_id, File services/CRM.js '+error)
        return null;
    }
}

async function delete_prospect_with_id(id_prospect) {
    const queryText = `
        DELETE FROM "CRM".prospects WHERE id=$1
    `;
    const values = [id_prospect];

    try {
        const result = await database.query(queryText, values);
        return result.rows; 
    } catch (error) {
        console.log('ERROR to delete the prospect in delete_prospect_with_id, File services/CRM.js '+error)
        return null;
    }
}

async function get_appointment_withuser_id(id_employee){
    const queryText = `
        SELECT 
            a.id as appointment_id,
            a.*,
            p.id as prospect_id,
            p.name as prospect_name,
            p.email as prospect_email,
            p.cellphone as prospect_cellphone,
            p.company_name as prospect_company_name,
            p.address as prospect_address,
            p.website as prospect_website
        FROM "CRM".appointment a
        LEFT JOIN "CRM".prospects p ON a.id_prospects = p.id
        WHERE a.id_employees = $1
    `;
    const values = [id_employee];

    try {
        const result = await database.query(queryText, values);
        return result.rows; 
    } catch (error) {
        console.log('ERROR to get the appointment in get_appointment_withuser_id, File services/CRM.js '+error)
        return null;
    }
}

module.exports = {
    get_sales_stage_with_company_id,
    add_the_new_sales_stage_in_my_company,
    delete_sale_stage_in_my_company,
    get_all_sales_teams_with_company_id,
    add_new_sales_team_in_my_company,
    get_all_prospects_of_my_company,
    get_data_of_a_prospect_with_his_id,
    delete_prospect_with_id,
    get_appointment_withuser_id
};