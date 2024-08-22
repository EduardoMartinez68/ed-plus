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



module.exports = {
    get_sales_stage_with_company_id,
    add_the_new_sales_stage_in_my_company,
    delete_sale_stage_in_my_company
};