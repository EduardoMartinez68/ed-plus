const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0
//functions image
const {
    delate_image_upload,
} = require('./connectionWithDatabaseImage');

async function get_all_combos(req) {
    //we will search the company of the user 
    const { id } = req.params;
    const queryText = `
    SELECT dc.*, pd.name AS department_name, pc.name AS category_name
    FROM "Kitchen".dishes_and_combos dc
    LEFT JOIN "Kitchen".product_department pd ON dc.id_product_department = pd.id
    LEFT JOIN "Kitchen".product_category pc ON dc.id_product_category = pc.id
    WHERE dc.id_companies = $1
`;
    var values = [id];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function get_all_combos_and_products(id_company) {
    //we will search the company of the user 
    const queryText = `
    SELECT * from "Kitchen".dishes_and_combos id_companies = $1
    `;
    var values = [id_company];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function search_combo(id_company, id_dishes_and_combos) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".dishes_and_combos WHERE id_companies= $1 and id=$2';
    var values = [id_company, id_dishes_and_combos];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function search_supplies_combo(id_dishes_and_combos) {
    var queryText = `
        SELECT tsc.*, pas.img AS img, pas.name AS product_name, pas.barcode AS product_barcode
        FROM "Kitchen".table_supplies_combo tsc
        JOIN "Kitchen".products_and_supplies pas ON tsc.id_products_and_supplies = pas.id
        WHERE tsc.id_dishes_and_combos = $1 ORDER BY id_products_and_supplies DESC
    `;
    var values = [id_dishes_and_combos];
    const result = await database.query(queryText, values);
    return result.rows;
}

async function delate_combo_company(id, pathImg) {
    try {
        var queryText = 'DELETE FROM "Kitchen".dishes_and_combos WHERE id=$1';
        var values = [id];
        await delete_all_supplies_combo(id);
        await delate_image_upload(pathImg); //delate img
        await database.query(queryText, values); //delate combo
        return true;
    } catch (error) {
        console.error('Error al eliminar el combo de la base de datos:', error);
        return false;
    }
}

async function delete_all_supplies_combo(id) {
    try {
        var queryText = 'DELETE FROM "Kitchen".table_supplies_combo WHERE id_dishes_and_combos = $1';
        var values = [id];
        await database.query(queryText, values); // Delete combo
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}

async function get_combo_features(idBranche,is_a_product) {
    var queryText = `
    SELECT 
        f.*,
        d.img,
        d.barcode,
        d.name,
        d.description,
        d.this_product_is_sold_in_bulk,
        pc_cat.name as category_name,
        pd_dept.name as department_name
    FROM 
        "Inventory".dish_and_combo_features f
    INNER JOIN 
        "Kitchen".dishes_and_combos d ON f.id_dishes_and_combos = d.id
    LEFT JOIN
        "Kitchen".product_category pc_cat ON d.id_product_category = pc_cat.id
    LEFT JOIN
        "Kitchen".product_department pd_dept ON d.id_product_department = pd_dept.id
    WHERE 
        f.id_branches = $1 and d.is_a_product =$2
    `;
    var values = [idBranche,is_a_product];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

async function get_all_dish_and_combo(idCompany, idBranch) {
    var queryText = `
        SELECT 
            i.*,
            d.barcode,
            d.name,
            d.description,
            d.img,
            d.id_product_department,
            d.id_product_category,
            d.this_product_is_sold_in_bulk
        FROM "Inventory".dish_and_combo_features i
        INNER JOIN "Kitchen".dishes_and_combos d ON i.id_dishes_and_combos = d.id
        WHERE i.id_branches = $1
    `;
    var values = [idBranch];
    const result = await database.query(queryText, values);
    return result.rows;
}

async function get_data_combo_factures(idComboFacture) {
    const queryText = `
        SELECT 
            f.id,
            f.id_companies,
            f.id_branches,
            f.id_dishes_and_combos,
            f.price_1,
            f.revenue_1,
            f.price_2,
            f.revenue_2,
            f.price_3,
            f.revenue_3,
            f.favorites,
            f.sat_key,
            f.purchase_unit,
            f.existence,
            f.amount,
            f.product_cost,
            f.id_providers,
            d.name AS dish_name,
            d.this_product_is_sold_in_bulk,
            d.description AS dish_description,
            d.img AS dish_img,
            d.barcode AS dish_barcode,
            d.id_product_department AS dish_product_department,
            d.id_product_category AS dish_product_category
        FROM 
            "Inventory".dish_and_combo_features f
        INNER JOIN 
            "Kitchen".dishes_and_combos d ON f.id_dishes_and_combos = d.id
        WHERE 
            f.id = $1
    `;

    const result = await database.query(queryText, [idComboFacture]);
    return result.rows;
}

async function get_all_price_supplies_branch(idCombo, idBranch) {
    try {
        // Consulta para obtener los suministros de un combo específico
        const comboQuery1 = `
            SELECT tsc.id_products_and_supplies, tsc.amount, tsc.unity, psf.currency_sale
            FROM "Kitchen".table_supplies_combo tsc
            INNER JOIN "Inventory".product_and_suppiles_features psf
            ON tsc.id_products_and_supplies = psf.id_products_and_supplies
            WHERE tsc.id_dishes_and_combos = $1 ORDER BY id_products_and_supplies DESC
        `;

        const comboQuery2 = `SELECT tsc.id_products_and_supplies, tsc.amount, tsc.unity, psf.currency_sale, psf.additional
        FROM "Kitchen".table_supplies_combo tsc
        INNER JOIN (
            SELECT DISTINCT ON (id_products_and_supplies) id_products_and_supplies, currency_sale
            FROM "Inventory".product_and_suppiles_features
            ORDER BY id_products_and_supplies
        ) psf
        ON tsc.id_products_and_supplies = psf.id_products_and_supplies
        WHERE tsc.id_dishes_and_combos = $1
        ORDER BY tsc.id_products_and_supplies DESC
        `;
        const comboQuery=`SELECT tsc.id_products_and_supplies, tsc.amount, tsc.unity, tsc.additional, psf.currency_sale
        FROM "Kitchen".table_supplies_combo tsc
        INNER JOIN (
            SELECT DISTINCT ON (id_products_and_supplies) id_products_and_supplies, currency_sale
            FROM "Inventory".product_and_suppiles_features
            ORDER BY id_products_and_supplies
        ) psf
        ON tsc.id_products_and_supplies = psf.id_products_and_supplies
        WHERE tsc.id_dishes_and_combos = $1
        ORDER BY tsc.id_products_and_supplies DESC
        `;
        const comboValues = [idCombo];
        const comboResult = await database.query(comboQuery, comboValues)

        // Consulta para obtener el precio de los suministros en la sucursal específica
        const priceQuery = `
            SELECT psf.id_products_and_supplies, psf.sale_price, psf.sale_unity
            FROM "Inventory".product_and_suppiles_features psf
            WHERE psf.id_branches = $1 ORDER BY id_products_and_supplies DESC
        `;
        const priceValues = [idBranch];
        const priceResult = await database.query(priceQuery, priceValues);

        // Construir un objeto que contenga los suministros y sus precios en la sucursal específica
        const suppliesWithPrice = {};
        priceResult.rows.forEach(row => {
            suppliesWithPrice[row.id_products_and_supplies] = row.sale_price;
        });

        // Agregar los suministros y sus cantidades del combo junto con sus precios
        const suppliesInfo = [];
        comboResult.rows.forEach(row => {
            const supplyId = row.id_products_and_supplies;
            const supplyPrice = suppliesWithPrice[supplyId] || 0; // Precio predeterminado si no se encuentra
            suppliesInfo.push({
                img: '',
                product_name: '',
                product_barcode: '',
                description: '',
                id_products_and_supplies: supplyId,
                amount: row.amount,
                unity: row.unity,
                sale_price: supplyPrice,
                currency: row.currency_sale,
                additional: row.additional
            });
        });

        //agregamos los datos del combo 
        const suppliesCombo = await search_supplies_combo(idCombo);
        for (var i = 0; i < suppliesCombo.length; i++) {
            suppliesInfo[i].img = suppliesCombo[i].img;
            suppliesInfo[i].product_name = suppliesCombo[i].product_name;
            suppliesInfo[i].product_barcode = suppliesCombo[i].product_barcode;
            suppliesInfo[i].description = suppliesCombo[i].description;
        }

        return suppliesInfo;
    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error;
    }
}

module.exports = {
    get_all_combos,
    search_combo,
    search_supplies_combo,
    delate_combo_company,
    delete_all_supplies_combo,
    get_combo_features,
    get_all_dish_and_combo,
    get_all_combos_and_products,
    get_data_combo_factures,
    get_all_price_supplies_branch
};