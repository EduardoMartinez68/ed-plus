require('dotenv').config();
const {TYPE_DATABASE}=process.env;
const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0

//functions branch
async function search_providers(idBranch) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite version: no schemas, use `?` instead of `$1`
            const queryText = `
                SELECT p.*, b.id_companies
                FROM providers p
                JOIN branches b ON b.id = p.id_branches
                WHERE p.id_branches = ?;
            `;
            return new Promise((resolve, reject) => {
                database.all(queryText, [idBranch], (err, rows) => {
                    if (err) {
                        console.error('SQLite error searching providers:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            // PostgreSQL version: use schema names and $1
            const queryText = `
                SELECT p.*, b.id_companies
                FROM "Branch".providers p
                JOIN "Company".branches b ON b.id = p.id_branches
                WHERE p.id_branches = $1;
            `;
            const values = [idBranch];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error in search_providers:', error);
        throw error;
    }
}


async function search_all_providers(id_company) {
    const allBranch = await search_all_branch(id_company);
    const providers = []

    //we will to read all the branch of the company for get his providers 
    for (var i = 0; i < allBranch.length; i++) {
        const branchId = allBranch[i].id //get the id of the branch that we are reading 
        const providersBranch = await search_providers(branchId) //search all providers in this branch

        //we will see if this branch have providers, if the branch have provider we will saving his providers in the array <providers>
        if (providersBranch.length > 0) {
            providers.push(providersBranch) //add all the providers of the branch
        }
    }

    return providers;
}

async function search_all_branch(id_company) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite: sin esquemas ni alias con comillas, y usa ? para parámetros
            const queryText = `
                SELECT branches.*, country.name AS country_name
                FROM branches
                INNER JOIN country ON branches.id_country = country.id
                WHERE branches.id_companies = ?
            `;
            return new Promise((resolve, reject) => {
                database.all(queryText, [id_company], (err, rows) => {
                    if (err) {
                        console.error('SQLite error searching branches:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            // PostgreSQL: con esquema y $1 como parámetro
            const queryText = `
                SELECT branches.*, country.name AS country_name
                FROM "Company".branches
                INNER JOIN "Fud".country ON branches.id_country = country.id
                WHERE branches.id_companies = $1
            `;
            const values = [id_company];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error in search_all_branch:', error);
        throw error;
    }
}


async function search_providers_for_name(idBranch, name_provider) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite: sin esquemas ni comillas dobles
            const queryText = `
                SELECT p.*, b.id_companies
                FROM providers p
                JOIN branches b ON b.id = p.id_branches
                WHERE p.id_branches = ? AND p.name = ?
            `;
            return new Promise((resolve, reject) => {
                database.all(queryText, [idBranch, name_provider], (err, rows) => {
                    if (err) {
                        console.error('SQLite error searching provider by name:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            // PostgreSQL: con esquemas y parámetros $1, $2
            const queryText = `
                SELECT p.*, b.id_companies
                FROM "Branch".providers p
                JOIN "Company".branches b ON b.id = p.id_branches
                WHERE p.id_branches = $1 AND p.name = $2
            `;
            const values = [idBranch, name_provider];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error in search_providers_for_name:', error);
        throw error;
    }
}


async function search_all_providers_for_name(id_company, name_provider) {
    const allBranch = await search_all_branch_company(id_company);
    const providers = []

    //we will to read all the branch of the company for get his providers 
    for (var i = 0; i < allBranch.length; i++) {
        const branchId = allBranch[i].id //get the id of the branch that we are reading 
        const providersBranch = await search_providers_for_name(branchId, name_provider) //search all providers in this branch

        //we will see if this branch have providers, if the branch have provider we will saving his providers in the array <providers>
        if (providersBranch.length > 0) {
            providers.push(providersBranch) //add all the providers of the branch
        }
    }

    return providers;
}

async function search_provider(idProvider) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite: sin esquemas ni comillas dobles, usa ? como placeholder
            const queryText = `
                SELECT p.*, b.id_companies
                FROM providers p
                JOIN branches b ON b.id = p.id_branches
                WHERE p.id = ?
            `;
            return new Promise((resolve, reject) => {
                database.all(queryText, [idProvider], (err, rows) => {
                    if (err) {
                        console.error('SQLite error searching provider:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            // PostgreSQL: con esquemas y $1 como placeholder
            const queryText = `
                SELECT p.*, b.id_companies
                FROM "Branch".providers p
                JOIN "Company".branches b ON b.id = p.id_branches
                WHERE p.id = $1
            `;
            const values = [idProvider];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error in search_provider:', error);
        throw error;
    }
}


async function delete_provider(idProvider) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const queryText = 'DELETE FROM providers WHERE id = ?';
            return new Promise((resolve, reject) => {
                database.run(queryText, [idProvider], function (err) {
                    if (err) {
                        console.error('Error al eliminar en SQLite:', err.message);
                        reject(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        } else {
            const queryText = 'DELETE FROM "Branch".providers WHERE id = $1';
            const values = [idProvider];
            await database.query(queryText, values);
            return true;
        }
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}


module.exports = {
    search_providers,
    search_all_providers,
    search_providers_for_name,
    search_all_providers_for_name,
    search_provider,
    delete_provider
};