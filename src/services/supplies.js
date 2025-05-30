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

//----------------------------------------------------------------supplies and products 
async function search_company_supplies_or_products(req, supplies) {
    //we will search the company of the user 
    const { id } = req.params;
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id_companies= $1 and supplies= $2';
    var values = [id, supplies];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function search_company_supplies_or_products_with_id_company(id_company, supplies) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id_companies= $1 and supplies= $2';
    var values = [id_company, supplies];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function search_company_supplies_or_products_with_company(id_company, supplies) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id_companies= $1 and supplies= $2';
    var values = [id_company, supplies];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function this_is_a_supplies_or_a_products(id) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id= $1';
    const result = await database.query(queryText, [id]);

    return result.rows[0].supplies;
}

async function delate_supplies_company(id, pathOmg) {
    try {
        var queryText = 'DELETE FROM "Kitchen".products_and_supplies WHERE id=$1';
        var values = [id];
        await database.query(queryText, values); //delate supplies
        await delate_image_upload(pathOmg); //delate img
        return true;
    } catch (error) {
        console.log('error to delete the supplies in the company in the function delate_supplies_company: '+error)
        return false;
    }
}

function get_new_data_supplies_company(req) {
    const { id, id_company, barcode, name, description, useInventory } = req.params;
    const newSupplies = {
        id,
        id_company,
        barcode,
        name,
        description,
        use_inventory: (useInventory == 'true')
    }
    return newSupplies;
}

async function update_supplies_company(newSupplies) {
    try {
        var queryText = `UPDATE "Kitchen".products_and_supplies SET barcode = $1, name = $2, description = $3, 
        use_inventory = $4 WHERE id = $5`;
        var values = [newSupplies.barcode, newSupplies.name, newSupplies.description, newSupplies.use_inventory, newSupplies.id];
        await database.query(queryText, values); // update supplies
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

async function get_supplies_or_features(id_branch, type) {
    var queryText = `
        SELECT 
            f.*,
            p.id_companies,
            p.img,
            p.barcode,
            p.name,
            p.description,
            p.use_inventory
        FROM "Inventory".product_and_suppiles_features f
        INNER JOIN "Kitchen".products_and_supplies p ON f.id_products_and_supplies = p.id
        WHERE f.id_branches = $1 and p.supplies =$2
    `;
    var values = [id_branch, type];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}
//--------------------------------------------------------------products
async function get_supplies_or_features_with_id_products_and_supplies(id_products_and_supplies) {
    var queryText = `
        SELECT 
            f.*,
            p.id_companies,
            p.img,
            p.barcode,
            p.name,
            p.description,
            p.use_inventory
        FROM "Inventory".product_and_suppiles_features f
        INNER JOIN "Kitchen".products_and_supplies p ON f.id_products_and_supplies = p.id
        WHERE f.id_products_and_supplies = $1
    `;
    var values = [id_products_and_supplies];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

async function get_supplies_with_id(id_supplies) {
    var queryText = `
        SELECT 
            f.*,
            p.id_companies,
            p.img,
            p.barcode,
            p.name,
            p.description,
            p.use_inventory
        FROM "Inventory".product_and_suppiles_features f
        INNER JOIN "Kitchen".products_and_supplies p ON f.id_products_and_supplies = p.id
        WHERE f.id = $1
    `;
    var values = [id_supplies];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

async function update_product_category(id, name, description) {
    var values = [name, description, id];
    var queryText = 'UPDATE "Kitchen".product_category SET name = $1, description = $2 WHERE id = $3';

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al actualizar el registro en la base de datos:', error);
        return false;
    }
}

async function delete_supplies_or_product_of_the_branch(id_products_and_supplies){
    try {
        var queryText = `
            DELETE FROM "Inventory".product_and_suppiles_features
            WHERE id = $1
        `;
        var values = [id_products_and_supplies];
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.log('error to delete the supplies in the branch in the function delete_supplies_or_product_of_the_branch: '+error)
        return false;
    }
}

async function delete_dishes_or_combo_of_the_branch(id_dishes_and_combos){
    try {
        var queryText = `
            DELETE FROM "Inventory".dish_and_combo_features
            WHERE id = $1 
        `;
        var values = [id_dishes_and_combos];
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.log('error to delete the dishes or combo in the branch in the function delete_dishes_or_combo_of_the_branch: '+error)
        return false;
    }
}


async function get_inventory_products_branch(id_branch, barcode = '') {
    let queryText = `
        SELECT 
            f.*,
            p.id_companies,
            p.img,
            p.barcode,
            p.name,
            p.description,
            p.use_inventory
        FROM "Inventory".product_and_suppiles_features f
        INNER JOIN "Kitchen".products_and_supplies p ON f.id_products_and_supplies = p.id
        WHERE f.id_branches = $1 AND p.supplies = $2 AND use_inventory = true
    `;
    
    let values = [id_branch, false];
    
    // Si el barcode existe, se agrega el filtro por barcode
    if (barcode && barcode.trim() !== '') {
        queryText += ` AND p.barcode LIKE $3 LIMIT 10`;
        values.push(`%${barcode}%`);
    } else {
        queryText += ` LIMIT 25`;  // Limitar a los primeros 50 si no hay barcode
    }

    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

async function get_inventory_supplies_branch(id_branch,barcode=''){
    let queryText = `
        SELECT 
            f.*,
            p.id_companies,
            p.img,
            p.barcode,
            p.name,
            p.description,
            p.use_inventory
        FROM "Inventory".product_and_suppiles_features f
        INNER JOIN "Kitchen".products_and_supplies p ON f.id_products_and_supplies = p.id
        WHERE f.id_branches = $1 AND p.supplies = $2 AND p.use_inventory = true
    `;

    let values = [id_branch, true];

    // Modifica la consulta dependiendo de si barcode está presente o no
    if (barcode) {
        // Si hay barcode, obtén los primeros 20 resultados filtrando por el código de barras
        queryText += ` AND p.barcode LIKE $3 LIMIT 10`;
        values.push(`%${barcode}%`);
    } else {
        // Si no hay barcode, obtén los primeros 50 resultados
        queryText += ` LIMIT 25`;
    }

    try {
        const result = await database.query(queryText, values);
        const data = result.rows;
        return data;
    } catch (err) {
        console.error('Error al obtener los suministros del inventario:', err);
        throw err;  // Lanza el error para ser manejado en otro lugar
    }
}

module.exports = {
    get_supplies_or_features,
    get_supplies_with_id,
    update_supplies_company,
    get_new_data_supplies_company,
    delate_supplies_company,
    this_is_a_supplies_or_a_products,
    search_company_supplies_or_products_with_company,
    search_company_supplies_or_products_with_id_company,
    search_company_supplies_or_products,
    update_product_category,
    get_supplies_or_features_with_id_products_and_supplies,
    delete_supplies_or_product_of_the_branch,
    delete_dishes_or_combo_of_the_branch,
    get_inventory_products_branch,
    get_inventory_supplies_branch
};