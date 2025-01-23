const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

async function search_all_customers(idCompany) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Company".customers WHERE id_companies= $1';
    var values = [idCompany];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function search_customers(idCustomer) {
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Company".customers WHERE id= $1';
    var values = [idCustomer];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function delete_customer(idCustomer) {
    try {
        var queryText = 'DELETE FROM "Company".customers WHERE id = $1';
        var values = [idCustomer];
        await database.query(queryText, values); // Delete combo
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}

module.exports = {
    search_all_customers,
    search_customers,
    delete_customer
};
