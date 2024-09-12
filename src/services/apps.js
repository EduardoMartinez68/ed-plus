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

async function insert_app_in_my_list(id_company, id_branch, id, icon, name, description, labels, code_table) {
    const schema=`_company_${id_company}_branch_${id_branch}`;
    const queryText = `
        INSERT INTO ${schema}.apps (
            id,
            icon,
            name,
            description,
            labels,
            code_table
        ) VALUES ($1, $2, $3, $4, $5, $6)
    `;

    // Define the array of values to be inserted
    const values = [id, icon, name, description, labels, code_table];

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        return false;
    }
}

async function get_character_of_my_app(id_company, id_branch, id_app) {
    const schema = `_company_${id_company}_branch_${id_branch}`;
    
    const query = `
        SELECT * 
        FROM ${schema}.apps 
        WHERE id = $1
    `;
    
    try {
        const result = await database.query(query, [id_app]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return [];
    }
}

async function get_data_of_my_app(id_company, id_branch, id_app) {
    const schema = `_company_${id_company}_branch_${id_branch}`;
    
    const query = `
        SELECT * 
        FROM ${schema}.${id_app} 
    `;
    
    try {
        const result = await database.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return [];
    }
}

async function get_all_apps_of_this_company(id_company,id_branch) {
    const schema=`_company_${id_company}_branch_${id_branch}`;
    
    //Query to get the names of the tables in the schema
    const getTablesQuery = `
        SELECT * 
        FROM ${schema}.apps
    `;
    
    try {
        //Then get the tables in the specified schema
        const res = await database.query(getTablesQuery);
        return res.rows;
    } catch (error) {
        console.error('Error fetching tables:', error);
        return [];
    }
}

async function create_my_list_app(id_company,id_branch){
    const schema=`_company_${id_company}_branch_${id_branch}`;
    const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS ${schema};`;
    const query=`
        CREATE TABLE IF NOT EXISTS ${schema}.apps (
            id TEXT UNIQUE NOT NULL,
            id_company INTEGER NOT NULL DEFAULT ${id_company},
            id_branch INTEGER NOT NULL DEFAULT ${id_branch},
            icon TEXT,
            name VARCHAR(20) NOT NULL,
            description TEXT,
            labels TEXT,
            code_table TEXT NOT NULL,
            PRIMARY KEY (id)
        );
        `
    try {
        //First, create the schema if it doesn't exist
        await database.query(createSchemaQuery);
        await database.query(query);
    } catch (error) {
        console.error('Error fetching tables:', error);
        return [];
    }
}

async function get_the_data_of_the_table_of_my_app(id_company,id_branch,nameApp){
    const schema=`_company_${id_company}_branch_${id_branch}`;
    const tableName=nameApp;
    const queryText = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = $2
    `;

    try {
        const result = await database.query(queryText, [schema, tableName]);
        return result.rows;
    } catch (error) {
        return [];
    }
}

async function get_primary_keys_of_schema(id_company, id_branch) {
    const schema = `_company_${id_company}_branch_${id_branch}`;

    // Consulta para obtener las llaves primarias y sus tipos de datos
    const queryPrimaryKeysWithTypes = `
        SELECT
            kcu.table_name,
            kcu.column_name,
            c.data_type
        FROM
            information_schema.table_constraints tc
        JOIN
            information_schema.key_column_usage kcu
        ON
            tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN
            information_schema.columns c
        ON
            c.table_name = kcu.table_name
            AND c.column_name = kcu.column_name
        WHERE
            tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = $1;
    `;

    try {
        // Obtener las llaves primarias con sus tipos de datos
        const result = await database.query(queryPrimaryKeysWithTypes, [schema]);

        const primaryKeysWithTypes = {};

        // Agrupar por tablas y excluir la tabla especificada
        result.rows.forEach(row => {
            if (row.table_name !== 'apps') {
                if (!primaryKeysWithTypes[row.table_name]) {
                    primaryKeysWithTypes[row.table_name] = [];
                }
                primaryKeysWithTypes[row.table_name].push({
                    name: [row.table_name],
                    column_name: row.column_name,
                    data_type: row.data_type
                });
            }
        });

        return primaryKeysWithTypes;

    } catch (error) {
        console.error('Error fetching primary keys with types:', error.message);
        return {};
    }
}

async function get_code_table_of_my_app(id_company, id_branch,app){
    const schema = `_company_${id_company}_branch_${id_branch}`;

    // Consulta para obtener las llaves primarias y sus tipos de datos
    const queryText = `
        SELECT * FROM ${schema}.apps
        WHERE id=$1
    `;

    try {
        const result = await database.query(queryText, [app]);
        return result.rows;
    } catch (error) {
        return [];
    }
}


module.exports = {
    get_all_apps_of_this_company,
    create_my_list_app,
    insert_app_in_my_list,
    get_the_data_of_the_table_of_my_app,
    get_data_of_my_app,
    get_character_of_my_app,
    get_primary_keys_of_schema,
    get_code_table_of_my_app
};