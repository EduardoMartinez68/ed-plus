//require
require('dotenv').config();
const {TYPE_DATABASE}=process.env;

const express=require('express');
//const router=express.Router();
const database=require('../database');
const addDatabase={}
function compare_password(P1,P2){
    if (P1==''){
        return false;
    }

    return P1==P2;
}

async function add_user(user, role) {
    if (TYPE_DATABASE === 'postgres') {
        const queryText = `
            INSERT INTO "Fud"."users" 
                (photo, user_name, first_name, second_name, last_name, email, password, rol_user, id_packs_fud) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING id;
        `;
        const values = [
            user.image,
            user.user_name,
            user.first_name,
            user.second_name,
            user.last_name,
            user.email,
            user.password,
            role,
            0
        ];

        try {
            const result = await database.query(queryText, values);
            return result.rows[0].id;
        } catch (error) {
            console.error("Error en add_user PostgreSQL:", error);
            return null;
        }
    } else{
        // Para SQLite
        const queryText = `
            INSERT INTO users
                (photo, user_name, first_name, second_name, last_name, email, password, rol_user, id_packs_fud) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const values = [
            user.image,
            user.user_name,
            user.first_name,
            user.second_name,
            user.last_name,
            user.email,
            user.password,
            role,
            0
        ];

        try {
            // Suponiendo que database es un objeto sqlite3.Database promisificado o con promisify
            const result = await new Promise((resolve, reject) => {
                database.run(queryText, values, function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID); // this.lastID es el id insertado
                });
            });
            return result;
        } catch (error) {
            console.error("Error en add_user SQLite:", error);
            return null;
        }
    }
}

async function add_new_employees(employee) {
    if (TYPE_DATABASE === 'postgres') {
        try {
            const queryText = `
                INSERT INTO "Company"."employees"
                    (id_companies, id_users, id_roles_employees, id_departments_employees, id_branches, id_country, city, street, num_int, num_ext, phone, cell_phone)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
            `;
            const values = [
                employee.id_company,
                employee.id_user,
                employee.id_role_employee,
                employee.id_departament_employee,
                employee.id_branch,
                employee.id_country,
                employee.city,
                employee.street,
                employee.num_int,
                employee.num_ext,
                employee.phone,
                employee.cell_phone,
            ];
   
            await database.query(queryText, values);
            return true;
        } catch (err) {
            console.error('Error al insertar empleado en PostgreSQL:', err);
            return false;
        }

    } else {
        try {
            const queryText = `
                INSERT INTO employees
                    (id_companies, id_users, id_roles_employees, id_departments_employees, id_branches, id_country, city, street, num_int, num_ext, phone, cell_phone)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `;

            const values = [
                employee.id_company,
                employee.id_user,
                employee.id_role_employee,
                employee.id_departament_employee,
                employee.id_branch,
                employee.id_country,
                employee.city,
                employee.street,
                employee.num_int,
                employee.num_ext,
                employee.phone,
                employee.cell_phone,
            ];
    
            await new Promise((resolve, reject) => {
                database.run(queryText, values, function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            });

            return true;
        } catch (err) {
            console.error('Error al insertar empleado en SQLite:', err);
            return false;
        }
    }
}


async function add_new_employees2(employee) {
    try {
        if (TYPE_DATABASE === 'postgres') {
            const queryText = `
                INSERT INTO "Company"."employees"
                    (id_companies, id_users, id_roles_employees, id_departments_employees, id_branches, id_country, city, street, num_int, num_ext, phone, cell_phone)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
            `;
            const values = [
                employee.id_companies,
                employee.id_users,
                employee.id_roles_employees,
                employee.id_departments_employees,
                employee.id_branches,
                employee.id_country,
                employee.city,
                employee.street,
                employee.num_int,
                employee.num_ext,
                employee.phone,
                employee.cell_phone,
            ];

            await database.query(queryText, values);
            return true;

        } else {
            // Ajustar tabla para SQLite: sin esquema, solo nombre simple (ajusta según tu DB)
            const queryText = `
                INSERT INTO employees
                    (id_companies, id_users, id_roles_employees, id_departments_employees, id_branches, id_country, city, street, num_int, num_ext, phone, cell_phone)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `;

            const values = [
                employee.id_companies,
                employee.id_users,
                employee.id_roles_employees,
                employee.id_departments_employees,
                employee.id_branches,
                employee.id_country,
                employee.city,
                employee.street,
                employee.num_int,
                employee.num_ext,
                employee.phone,
                employee.cell_phone,
            ];

            await new Promise((resolve, reject) => {
                database.run(queryText, values, function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            });

            return true;
        }
    } catch (error) {
        console.log("add employee error:", error);
        return false;
    }
}

/*
async function add_company(company){
    var queryText = 'INSERT INTO "User".companies (id_users, path_logo, name, alias,description,representative,ceo,id_country,'
        +'phone,cell_phone,email_company,address,num_ext,num_int,postal_code,cologne,city,states,municipality)'
        +'VALUES ($1, $2, $3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)';

    var values = [company.id_user,company.path_logo,company.name,company.alias,company.description,company.representative,company.ceo,
                company.id_country,company.phone,company.cell_phone,company.email,company.street,company.num_o,company.num_i,company.postal_code,
                company.cologne,company.city,company.street,company.municipality] 
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al insertar en la base de datos:', error);
        return false;
    }
}*/

async function add_company(company) {
    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite: usa '?' en vez de $1, sin esquema "User"
        const queryText = `
            INSERT INTO companies
                (id_users, path_logo, name, alias, description, representative, ceo, id_country,
                 phone, cell_phone, email_company, address, num_ext, num_int, postal_code,
                 cologne, city, states, municipality)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const values = [
            company.id_user,
            company.path_logo,
            company.name,
            company.alias,
            company.description,
            company.representative,
            company.ceo,
            company.id_country,
            company.phone,
            company.cell_phone,
            company.email,
            company.street,
            company.num_o,
            company.num_i,
            company.postal_code,
            company.cologne,
            company.city,
            company.street,   // este campo "states" parece que usas street dos veces, revisa si está bien
            company.municipality
        ];

        try {
            return await new Promise((resolve, reject) => {
                database.run(queryText, values, function(err) {
                    if (err) {
                        console.error('Error al insertar en SQLite:', err);
                        reject(null);
                    } else {
                        resolve(this.lastID); // ID insertado en SQLite
                    }
                });
            });
        } catch {
            return null;
        }

    } else {
        // PostgreSQL (u otra base que use $1...): con esquema "User"
        const queryText = `
            INSERT INTO "User".companies
                (id_users, path_logo, name, alias, description, representative, ceo, id_country,
                 phone, cell_phone, email_company, address, num_ext, num_int, postal_code,
                 cologne, city, states, municipality)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING id;
        `;

        const values = [
            company.id_user,
            company.path_logo,
            company.name,
            company.alias,
            company.description,
            company.representative,
            company.ceo,
            company.id_country,
            company.phone,
            company.cell_phone,
            company.email,
            company.street,
            company.num_o,
            company.num_i,
            company.postal_code,
            company.cologne,
            company.city,
            company.street, // igual aquí revisa si "states" debe ser street o un campo diferente
            company.municipality
        ];

        try {
            const result = await database.query(queryText, values);
            if (result.rows.length > 0) {
                return result.rows[0].id;
            } else {
                throw new Error('No se pudo obtener el ID de la compañía después de la inserción');
            }
        } catch (error) {
            console.error('Error al insertar en PostgreSQL:', error);
            return null;
        }
    }
}


async function add_product_department(department) {
    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite usa '?' y no esquema "Kitchen"
        const queryText = `
            INSERT INTO product_department (id_companies, name, description)
            VALUES (?, ?, ?);
        `;
        const values = [department.id_company, department.name, department.description];

        try {
            return await new Promise((resolve, reject) => {
                database.run(queryText, values, function(err) {
                    if (err) {
                        console.error('Error al insertar en SQLite:', err);
                        reject(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        } catch {
            return false;
        }

    } else {
        // PostgreSQL con esquema "Kitchen" y placeholders $1, $2, $3
        const queryText = `
            INSERT INTO "Kitchen".product_department (id_companies, name, description)
            VALUES ($1, $2, $3);
        `;
        const values = [department.id_company, department.name, department.description];

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error al insertar en PostgreSQL:', error);
            return false;
        }
    }
}

async function add_product_category(department) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `
            INSERT INTO product_category (id_companies, name, description)
            VALUES (?, ?, ?);
        `;
        const values = [department.id_company, department.name, department.description];

        try {
            return await new Promise((resolve, reject) => {
                database.run(queryText, values, function(err) {
                    if (err) {
                        console.error('Error al insertar en SQLite:', err);
                        reject(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        } catch {
            return false;
        }
    } else {
        const queryText = `
            INSERT INTO "Kitchen".product_category (id_companies, name, description)
            VALUES ($1, $2, $3);
        `;
        const values = [department.id_company, department.name, department.description];

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error al insertar en PostgreSQL:', error);
            return false;
        }
    }
}

//////////////////////////////supplies 
async function add_supplies_company(supplies){
    if(await this_supplies_exists(supplies.id_company,supplies.barcode)){
        return false;
    }
    else{
        return await save_supplies_company(supplies)
    }
}

async function save_supplies_company(supplies) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `
            INSERT INTO products_and_supplies 
            (id_companies, img, barcode, name, description, supplies, use_inventory)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
        const values = [
            supplies.id_company,
            supplies.img,
            supplies.barcode,
            supplies.name,
            supplies.description,
            supplies.this_is_a_supplies,
            supplies.use_inventory
        ];

        try {
            return await new Promise((resolve, reject) => {
                database.run(queryText, values, function(err) {
                    if (err) {
                        console.error('Error al insertar en SQLite:', err);
                        reject(null);
                    } else {
                        resolve(this.lastID); // SQLite devuelve el id del último insert con this.lastID
                    }
                });
            });
        } catch {
            return null;
        }
    } else {
        const queryText = `
            INSERT INTO "Kitchen".products_and_supplies 
            (id_companies, img, barcode, name, description, supplies, use_inventory)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id;
        `;
        const values = [
            supplies.id_company,
            supplies.img,
            supplies.barcode,
            supplies.name,
            supplies.description,
            supplies.this_is_a_supplies,
            supplies.use_inventory
        ];

        try {
            const result = await database.query(queryText, values);
            return result.rows[0].id;
        } catch (error) {
            console.error('Error al insertar en PostgreSQL:', error);
            return null;
        }
    }
}


async function search_supplies_company(id_company, barcode) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `
            SELECT * FROM products_and_supplies WHERE id_companies = ? AND barcode = ?;
        `;
        const values = [id_company, barcode];

        return await new Promise((resolve, reject) => {
            database.all(queryText, values, (err, rows) => {
                if (err) {
                    console.error('Error buscando supplies en SQLite:', err);
                    reject([]);
                } else {
                    resolve(rows);
                }
            });
        });
    } else {
        // PostgreSQL
        const queryText = `
            SELECT * FROM "Kitchen".products_and_supplies WHERE id_companies = $1 AND barcode = $2;
        `;
        const values = [id_company, barcode];

        try {
            const result = await database.query(queryText, values);
            return result.rows;
        } catch (error) {
            console.error('Error buscando supplies en PostgreSQL:', error);
            return [];
        }
    }
}


async function this_supplies_exists(id_company,barcode){
    //we will search the company of the user 
    const supplies=await search_supplies_company(id_company,barcode);
    return supplies.length>0;
}

//////////////////////combos
async function add_combo_company(combo){
    if(await this_combo_exists(combo.id_company,combo.barcode)){
        return false;
    }
    else{
        //we save the new combo
        const idCombo=await save_combo_company(combo)
        if(idCombo!=null){
            //we going to save all the supplies and products of the combo
            await save_all_supplies_combo_company(idCombo,combo.supplies)
            return idCombo;
        }

        return false;
    }
}

async function save_combo_company(combo) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `
            INSERT INTO dishes_and_combos (id_companies, img, barcode, name, description) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [combo.id_company, combo.path_image, combo.barcode, combo.name, combo.description];

        return await new Promise((resolve, reject) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error al insertar combo en SQLite:', err);
                    resolve(null);
                } else {
                    // this.lastID es el ID insertado en SQLite
                    resolve(this.lastID);
                }
            });
        });
    } else {
        // PostgreSQL
        const queryText = `
            INSERT INTO "Kitchen".dishes_and_combos (id_companies, img, barcode, name, description)
            VALUES ($1, $2, $3, $4, $5) RETURNING id
        `;
        const values = [combo.id_company, combo.path_image, combo.barcode, combo.name, combo.description];

        try {
            const result = await database.query(queryText, values);
            if (result.rowCount > 0) {
                return result.rows[0].id;
            } else {
                console.error('No se insertaron filas en la base de datos.');
                return null;
            }
        } catch (error) {
            console.error('Error al insertar combo en PostgreSQL:', error);
            return null;
        }
    }
}

async function add_product_combo_company(combo){
    if(await this_combo_exists(combo.id_company,combo.barcode)){
        return false;
    }
    else{
        //we save the new combo
        const idCombo=await save_product_combo_company(combo)
        if(idCombo!=null){
            //we going to save all the supplies and products of the combo
            await save_all_supplies_combo_company(idCombo,combo.supplies)
            return idCombo;
        }

        return false;
    }
}

async function save_product_combo_company(combo) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `
            INSERT INTO dishes_and_combos 
            (id_companies, img, barcode, name, description, is_a_product, id_product_department, id_product_category) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            combo.id_company,
            combo.path_image,
            combo.barcode,
            combo.name,
            combo.description,
            1, // true en SQLite se usa como 1
            combo.id_product_department,
            combo.id_product_category
        ];

        return await new Promise((resolve, reject) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error al insertar producto combo en SQLite:', err);
                    resolve(null);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    } else {
        // PostgreSQL
        const queryText = `
            INSERT INTO "Kitchen".dishes_and_combos 
            (id_companies, img, barcode, name, description, is_a_product, id_product_department, id_product_category) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
        `;

        const values = [
            combo.id_company,
            combo.path_image,
            combo.barcode,
            combo.name,
            combo.description,
            true,
            combo.id_product_department,
            combo.id_product_category
        ];

        try {
            const result = await database.query(queryText, values);
            if (result.rowCount > 0) {
                return result.rows[0].id;
            } else {
                console.error('No se insertaron filas en la base de datos.');
                return null;
            }
        } catch (error) {
            console.error('Error al insertar producto combo en PostgreSQL:', error);
            return null;
        }
    }
}


async function save_all_supplies_combo_company(id_combo,supplies){
    try{
        //create a loop for get all the supplies and products of the combo
        for(var i=0;i<supplies.length;i++){
            //get the data of the supplies
            var data=supplies[i]
            await save_supplies_combo_company(id_combo,data); //save the data
        }
        return true;
    } catch (error) {
        console.error('Error al insertar en la base de datos combo:', error);
        return false;
    }
}

async function save_supplies_combo_company(id_dishes_and_combos, supplies) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `
            INSERT INTO table_supplies_combo 
            (id_dishes_and_combos, id_products_and_supplies, amount, food_waste, unity, additional)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [
            id_dishes_and_combos,
            supplies.idProduct,
            supplies.amount,
            supplies.foodWaste,
            supplies.unity,
            supplies.additional
        ];

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error al insertar supplies combo en SQLite:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    } else {
        // PostgreSQL
        const queryText = `
            INSERT INTO "Kitchen".table_supplies_combo 
            (id_dishes_and_combos, id_products_and_supplies, amount, food_waste, unity, additional)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        const values = [
            id_dishes_and_combos,
            supplies.idProduct,
            supplies.amount,
            supplies.foodWaste,
            supplies.unity,
            supplies.additional
        ];

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error al insertar supplies combo en PostgreSQL:', error);
            return false;
        }
    }
}


function get_unity(unity){

    if(unity=='pza' || unity=='pza]'){
        return 0
    }
    if(unity=='kg' || unity=='kg]'){
        return 1
    }
    if(unity=='g' || unity=='g]'){
        return 2
    }
    if(unity=='l' || unity=='l]'){
        return 1
    }
    if(unity=='ml' || unity=='ml]'){
        return 2
    }
    return 3
}

async function search_component_company(id_company, barcode, schema, nameTable) {
    if (TYPE_DATABASE === 'mysqlite') {
        // En SQLite no existe esquema, y placeholders son '?'
        // Ignoramos schema, concatenamos directamente nameTable con cuidado de evitar inyección (mejor sanitizar antes)
        const queryText = `SELECT * FROM ${nameTable} WHERE id_companies = ? AND barcode = ?`;
        const values = [id_company, barcode];

        return new Promise((resolve) => {
            database.all(queryText, values, (err, rows) => {
                if (err) {
                    console.error('Error en búsqueda SQLite:', err);
                    resolve([]);
                } else {
                    resolve(rows);
                }
            });
        });
    } else {
        // PostgreSQL usa esquema y placeholders $1, $2
        const queryText = `SELECT * FROM "${schema}".${nameTable} WHERE id_companies = $1 AND barcode = $2`;
        const values = [id_company, barcode];

        try {
            const result = await database.query(queryText, values);
            return result.rows;
        } catch (error) {
            console.error('Error en búsqueda PostgreSQL:', error);
            return [];
        }
    }
}


async function this_combo_exists(id_company,barcode){
    //we will search the company of the user 
    const supplies=await search_component_company(id_company,barcode,'Kitchen','dishes_and_combos');
    return calculate_components(supplies)
}

function calculate_components(data){
    return data.length>0;
}

//add buy to the history 
async function add_buy_history(id_companies, id_branches, id_employees, id_customers, id_dishes_and_combos, price, amount, total, day) {
    let idCustomer = parseInt(id_customers);
    if (isNaN(idCustomer)) {
        idCustomer = null;
    }

    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite no usa esquema, y placeholders son '?'
        const queryText = 'INSERT INTO sales_history (id_companies, id_branches, id_employees, id_customers, id_dishes_and_combos, price, amount, total, sale_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [id_companies, id_branches, id_employees, idCustomer, id_dishes_and_combos, price, amount, total, day];
        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error add database history SQLite:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    } else {
        // PostgreSQL usa esquema y placeholders $1, $2...
        const queryText = 'INSERT INTO "Box".sales_history (id_companies, id_branches, id_employees, id_customers, id_dishes_and_combos, price, amount, total, sale_day) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
        const values = [id_companies, id_branches, id_employees, idCustomer, id_dishes_and_combos, price, amount, total, day];
        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error add database history PostgreSQL:', error);
            return false;
        }
    }
}



//////////////////////branch
async function add_branch(branch){
    if(await this_branch_exists(branch.id_company,branch.name)){
        return false;
    }
    else{
        return await save_branch(branch)
    }
}

async function save_branch(branch) {
    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite no usa esquema ni placeholders con números
        const queryText = `INSERT INTO branches 
            (id_companies, name_branch, alias, representative, phone, cell_phone, email_branch, id_country, municipality, city, cologne, address, num_ext, num_int, postal_code) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = Object.values(branch);

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error to insert branch SQLite:', err);
                    resolve(false);
                } else {
                    // En SQLite, el id insertado queda en this.lastID
                    resolve(this.lastID);
                }
            });
        });
    } else {
        // PostgreSQL con esquema y placeholders numerados
        const queryText = `INSERT INTO "Company".branches 
            (id_companies, name_branch, alias, representative, phone, cell_phone, email_branch, id_country, municipality, city, cologne, address, num_ext, num_int, postal_code) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id`;
        const values = Object.values(branch);

        try {
            const result = await database.query(queryText, values);
            return result.rows[0].id;
        } catch (error) {
            console.error('Error to insert branch PostgreSQL:', error);
            return false;
        }
    }
}


async function this_branch_exists(id_company, name) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `SELECT * FROM branches WHERE id_companies = ? AND name_branch = ?`;
        const values = [id_company, name];

        return new Promise((resolve) => {
            database.all(queryText, values, (err, rows) => {
                if (err) {
                    console.error('Error checking branch SQLite:', err);
                    resolve(false);
                } else {
                    resolve(rows.length > 0);
                }
            });
        });
    } else {
        // PostgreSQL
        const queryText = `SELECT * FROM "Company".branches WHERE id_companies = $1 AND name_branch = $2`;
        const values = [id_company, name];

        try {
            const result = await database.query(queryText, values);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error checking branch PostgreSQL:', error);
            return false;
        }
    }
}

//////////////////////customer commanders
async function this_customer_exists(id_company, email) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `SELECT * FROM customers WHERE id_companies = ? AND email = ?`;
        const values = [id_company, email];

        return new Promise((resolve) => {
            database.all(queryText, values, (err, rows) => {
                if (err) {
                    console.error('Error checking customer SQLite:', err);
                    resolve(false);
                } else {
                    resolve(rows.length > 0);
                }
            });
        });
    } else {
        // PostgreSQL
        const queryText = `SELECT * FROM "Company".customers WHERE id_companies = $1 AND email = $2`;
        const values = [id_company, email];

        try {
            const result = await database.query(queryText, values);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error checking customer PostgreSQL:', error);
            return false;
        }
    }
}

async function add_customer(customer) {
    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite usa ? para los placeholders y no soporta schema ni RETURNING
        const queryText = `
            INSERT INTO customers (
                id_companies, first_name, second_name, last_name, id_country, states, city, street, num_ext, num_int, postal_code, email, phone, cell_phone, points, birthday,
                type_customer, company_name, company_address, website, contact_name, company_cellphone, company_phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const values = Object.values(customer);

        return new Promise((resolve) => {
            database.run(queryText, values, function (err) {
                if (err) {
                    console.error('Error inserting into customer SQLite:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });

    } else {
        // PostgreSQL con placeholders $1, $2...
        const queryText = `
            INSERT INTO "Company".customers (
                id_companies, first_name, second_name, last_name, id_country, states, city, street, num_ext, num_int, postal_code, email, phone, cell_phone, points, birthday,
                type_customer, company_name, company_address, website, contact_name, company_cellphone, company_phone
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
                $17, $18, $19, $20, $21, $22, $23
            );
        `;

        const values = Object.values(customer);

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error inserting into customer PostgreSQL:', error);
            return false;
        }
    }
}


//department employees
async function this_department_employees_exists(department) {
    let queryText, values;

    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite no usa schema y usa ? para parámetros
        queryText = `SELECT * FROM departments_employees WHERE id_companies = ? AND name_departaments = ?`;
        values = [department.id_company, department.name];
        
        return new Promise((resolve) => {
            database.all(queryText, values, (err, rows) => {
                if (err) {
                    console.error('Error searching department employees SQLite:', err);
                    resolve(false);
                } else {
                    resolve(rows.length > 0);
                }
            });
        });

    } else {
        // PostgreSQL con schema y $ placeholders
        queryText = `SELECT * FROM "Employee".departments_employees WHERE id_companies = $1 AND name_departaments = $2`;
        values = [department.id_company, department.name];

        try {
            const result = await database.query(queryText, values);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error searching department employees PostgreSQL:', error);
            return false;
        }
    }
}


async function save_department_employees(department) {
    let queryText, values;

    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite no tiene schema ni RETURNING, y usa ? para placeholders
        queryText = 'INSERT INTO departments_employees (id_companies, name_departaments, description) VALUES (?, ?, ?)';
        values = Object.values(department);

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error al insertar en SQLite:', err);
                    resolve(null);
                } else {
                    // this.lastID contiene el id insertado
                    resolve(this.lastID);
                }
            });
        });

    } else {
        // PostgreSQL
        queryText = 'INSERT INTO "Employee".departments_employees(id_companies, name_departaments, description) VALUES ($1, $2, $3) RETURNING id';
        values = Object.values(department);

        try {
            const result = await database.query(queryText, values);
            return result.rows[0].id;
        } catch (error) {
            console.error('Error al insertar en PostgreSQL:', error);
            return null;
        }
    }
}


async function add_department_employees(department){
    if(await this_department_employees_exists(department)){
        return false;
    }
    else{
        return await save_department_employees(department)
    }
}

async function add_type_employees2(typeEmployee) {
    var queryText = 'INSERT INTO "Employee".roles_employees(' +
        'id_companies, name_role, salary, currency, type_of_salary, commissions, discount_for_product, add_box, edit_box, delete_box, create_reservation, view_reservation, view_reports, ' +
        'add_customer, edit_customer, delete_customer, cancel_debt, offer_loan, get_fertilizer, view_customer_credits, send_email, add_employee, edit_employee, delete_employee, ' +
        'create_schedule, assign_schedule, view_schedule, create_type_user, create_employee_department, view_sale_history, delete_sale_history, view_movement_history, delete_movement_history, ' +
        'view_supplies, add_supplies, edit_supplies, delete_supplies, view_products, edit_products, delete_products, view_combo, add_combo, edit_combo, delete_combo, view_food_departament, ' +
        'add_food_departament, edit_food_departament, delete_food_departament, view_food_category, add_food_category, edit_food_category, delete_food_category, waste_report, ' +
        'add_provider, edit_provider, delete_provider, view_provider, sell, apply_discount, apply_returns, add_offers, edit_offers, delete_offers, change_coins, modify_hardware, modify_hardware_kitchen, ' +
        'give_permissions, app_point_sales, view_inventory, edit_inventory, edit_employee_department, delete_employee_department, edit_rol_employee, delete_rol_employee, employee_roles, employee_department, view_employee) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, ' +
        '$38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76, $77) ' +
        'RETURNING id';

    var values = Object.values(typeEmployee);
    
    try {
        const result = await database.query(queryText, values);
        return result.rows[0].id;
    } catch (error) {
        console.error('Error al insertar en la base de datos roles_employees:', error);
        return null;
    }
}

async function add_type_employees(newRole) {
    const keys = Object.keys(newRole);
    const values = Object.values(newRole);

    let queryText;

    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite usa ? para placeholders
        const columns = keys.join(', ');
        const placeholders = keys.map(() => '?').join(', ');
        queryText = `INSERT INTO roles_employees (${columns}) VALUES (${placeholders})`;

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error insertando nuevo rol en SQLite:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });

    } else {
        // PostgreSQL usa $1, $2, ...
        const columns = keys.join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        queryText = `INSERT INTO "Employee".roles_employees (${columns}) VALUES (${placeholders})`;

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error insertando nuevo rol en PostgreSQL:', error);
            return false;
        }
    }
}



//add_provider_company
async function add_provider_company(provider) {
    const values = Object.values(provider);

    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite usa ?
        const queryText = `
            INSERT INTO providers (
                id_branches, name, representative, cell_phone, phone, email, credit_limit, credit_days, comment,
                business_name, business_address, business_rfc, business_curp, business_postal_code,
                business_phone, business_cell_phone, website, rfc, curp, category, type, business_representative
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `;


        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error insertando proveedor en SQLite:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });

    } else {
        // PostgreSQL usa $1, $2, ...
        const queryText = `
            INSERT INTO "Branch".providers (
                name, representative, cell_phone, phone, email, credit_limit, credit_days, comment,
                business_name, business_address, business_rfc, business_curp, business_postal_code,
                business_phone, business_cell_phone, website, rfc, curp, category, type, business_representative
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
            )
        `;

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error al insertar en la base de datos provider:', error);
            return false;
        }
    }
}

//add product_and_suppiles_features
async function add_product_and_suppiles_features(id_branch, id_supplies) {
    const values = [id_branch, id_supplies];

    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = 'INSERT INTO product_and_suppiles_features (id_branches, id_products_and_supplies) VALUES (?, ?)';
        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error insertando product_and_suppiles_features en SQLite:', err);
                    resolve(null);
                } else {
                    resolve(this.lastID); // ID generado en SQLite
                }
            });
        });
    } else {
        const queryText = 'INSERT INTO "Inventory".product_and_suppiles_features (id_branches, id_products_and_supplies) VALUES ($1, $2) RETURNING id';
        try {
            const result = await database.query(queryText, values);
            return result.rows[0].id;
        } catch (error) {
            console.error('Error al insertar en la base de datos product_and_suppiles_features:', error);
            return null;
        }
    }
}


//add combo branch 
async function add_combo_branch(combo) {
    const values = Object.values(combo);

    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `INSERT INTO dish_and_combo_features (id_companies, id_branches, id_dishes_and_combos, price_1, amount, product_cost, revenue_1, purchase_unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error insertando dish_and_combo_features en SQLite:', err);
                    resolve(null);
                } else {
                    resolve(this.lastID); // ID generado en SQLite
                }
            });
        });
    } else {
        const queryText = 'INSERT INTO "Inventory".dish_and_combo_features(id_companies, id_branches, id_dishes_and_combos, price_1, amount, product_cost, revenue_1, purchase_unit) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id';

        try {
            const result = await database.query(queryText, values);
            return result.rows[0].id;
        } catch (error) {
            console.error('Error al insertar en la base de datos dish_and_combo_features:', error);
            return null;
        }
    }
}



//add  box move branch 
async function add_movement_history(data) {
    const values = Object.values(data);

    if (TYPE_DATABASE === 'mysqlite') {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const queryText = `INSERT INTO movement_history (id_branches, id_boxes, id_employees, move, comment, date_move) VALUES (?,?,?,?,?,?)`;

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error insertando movement_history en SQLite:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });

    } else {
        const queryText = 'INSERT INTO "Box".movement_history(id_branches, id_boxes, id_employees, move, comment, date_move) VALUES ($1, $2, $3, $4, $5, $6)';
        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error to add in the database movement_history:', error);
            return false;
        }
    }
}

async function add_commanders(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);

    if (TYPE_DATABASE === 'mysqlite') {
        const columns = keys.join(', ');
        const placeholders = keys.map(() => '?').join(', ');
        const queryText = `INSERT INTO commanders (${columns}) VALUES (${placeholders})`;

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error insertando commanders en SQLite:', err);
                    resolve(null);
                } else {
                    resolve(this.lastID);  // SQLite returns last inserted ID as this.lastID
                }
            });
        });

    } else {
        const queryText = 'INSERT INTO "Branch".commanders(id_branches, id_employees, id_customers, order_details, total, money_received, change, status, comentary, commander_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id';

        try {
            const result = await database.query(queryText, values);
            return result.rows[0].id;  // PostgreSQL returns inserted id in rows[0].id
        } catch (error) {
            console.error('Error to add in the database commanders:', error);
            return null;
        }
    }
}


async function add_box(idBranch, number, idPrinter, idBox) {
    const values = [idBranch, number, idPrinter];

    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `INSERT INTO boxes (id_branches, num_box, ip_printer) VALUES (?, ?, ?)`;

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error insertando en SQLite boxes:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });

    } else {
        const queryText = `INSERT INTO "Branch".boxes(id_branches, num_box, ip_printer) VALUES ($1, $2, $3)`;

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error to add in the database boxes:', error);
            return false;
        }
    }
}


async function add_ad(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);

    if (TYPE_DATABASE === 'mysqlite') {
        const columns = keys.join(', ');
        const placeholders = keys.map(() => '?').join(', ');
        const queryText = `INSERT INTO Ad (${columns}) VALUES (${placeholders})`;

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error insertando anuncio en SQLite:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });

    } else {
        const columns = keys.join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const queryText = `INSERT INTO "Branch"."Ad" (${columns}) VALUES (${placeholders})`;

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error al insertar anuncio en PostgreSQL:', error);
            return false;
        }
    }
}

async function add_schedule(schedule) {
    const keys = Object.keys(schedule);
    const values = Object.values(schedule);

    if (TYPE_DATABASE === 'mysqlite') {
        const columns = keys.join(', ');
        const placeholders = keys.map(() => '?').join(', ');
        const queryText = `INSERT INTO schedules (${columns}) VALUES (${placeholders})`;

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error insertando horario en SQLite:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    } else {
        const columns = keys.join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const queryText = `INSERT INTO "Employee".schedules (${columns}) VALUES (${placeholders})`;

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error insertando horario en PostgreSQL:', error);
            return false;
        }
    }
}

//////////////////////////////////////////////////
async function add_department(name,description){
    var queryText = 'INSERT INTO "Kitchen".product_department (id_company, name, description)'
        +'VALUES ($1, $2, $3)';

    var values = [name,description] 
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al insertar en la base de datos:', error);
        return false;
    }
}

async function add_order(dataOrder) {
    const keys = Object.keys(dataOrder);
    const values = Object.values(dataOrder);

    if (TYPE_DATABASE === 'mysqlite') {
        const columns = keys.join(', ');
        const placeholders = keys.map(() => '?').join(', ');
        const queryText = `INSERT INTO "order" (${columns}) VALUES (${placeholders})`;

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error insertando orden en SQLite:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    } else {
        const columns = keys.join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const queryText = `INSERT INTO "Branch".order (${columns}) VALUES (${placeholders})`;

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error insertando orden en PostgreSQL:', error);
            return false;
        }
    }
}





//-------------------------------------------------------------------CRM-------------------------------------------------//
async function add_new_sales_stage(salesStage){
    //update the position of all the sales stage
    if(!await update_sales_stage_positions(salesStage.id_company)){
        //if not can update the sales stage, no can add a new sales stage to the database\
        return false;
    }

    const queryText = `
        INSERT INTO "CRM".sales_stage(
        id_companies, name)
        VALUES ($1, $2)
    `;
    const values = Object.values(salesStage); //this is for create the format of save
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error inserting into new_sales_stage database:', error);
        return false;
    }
}

async function update_sales_stage_positions(id_company) {
    const queryText = `
        UPDATE "CRM".sales_stage
        SET position = position + 1
        WHERE id_companies = $1
    `;
    try {
        await database.query(queryText, [id_company]);
        return true;
    } catch (error) {
        console.error('Error updating sales_stage positions:', error);
        return false;
    }
}

async function add_new_sales_team_in_my_company(id_company,name,commision){
    const queryText = `
        INSERT INTO "CRM".sales_team(
        name, commission, id_companies)
        VALUES ($1, $2, $3)
    `;
    const values = [name,commision, id_company] //this is for create the format of save
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error inserting into add_new_sales_team_in_my_company database:', error);
        return false;
    }
}

async function add_new_prospects(prospects){
    const queryText = `
        INSERT INTO "CRM".prospects(
            id_sales_stage, name, email, estimated_income, probability, phone, cellphone, notes,
            color, priority, id_companies, id_branches, id_employees, planned_closure, id_sales_team, expected_closing_percentage, id_product_to_sell, category, salesrep,
            type_customer, company_name, address, website, contact_name, company_cellphone, company_phone
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
    `;
    const values = Object.values(prospects); //this is for create the format of save

    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error inserting into add_new_prospects database:', error);
        return false;
    }
}

async function add_appointment(appointment){
    const queryText = `
        INSERT INTO "CRM".appointment(
            id_companies, id_branches, id_prospects, id_employees ,affair, meeting_date, end_date, location, notes, color
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    const values = Object.values(appointment); //this is for create the format of save
    
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error inserting into add_appointment database:', error);
        return false;
    }
}

async function add_message_to_the_customer_history(id_users,id_prospects,comment,link){
    const queryText = `
        INSERT INTO "CRM".history_prospects(
        id_prospects, id_users, comment, link)
        VALUES ($1, $2, $3, $4)
    `;
    const values = [id_prospects,id_users,comment,link] //this is for create the format of save
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error inserting into add_new_sales_team_in_my_company database:', error);
        return false;
    }
}


async function add_recipe_original( id_companies, id_branches, id_employees,recipe) {

    // Verificar si recipe.id_customer es un valor numérico y asignar null si no lo es
    recipe.id_customer = isNaN(recipe.id_customer) ? null : recipe.id_customer;
    if(recipe.id_customer){
        // SQL Query to insert the new recipe into the database
        const queryText = `
            INSERT INTO "Branch".prescription 
            (recipe_folio, doctor_id, doctor_name, date_prescription, retained, comment, id_dishes_and_combos, id_companies, id_branches, id_employees,id_lots,id_customers,amount) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11,$12,$13) 
        `;


        // Values to insert
        const values = [
            recipe.recipeId,       // recipe_folio
            recipe.doctorLicense,  // doctor_id
            recipe.doctorName,     // doctor_name
            recipe.prescriptionDate, // date
            recipe.retained,       // retained
            recipe.comments,       // comment
            recipe.id_dishes_and_combos, // id_dishes_and_combos,
            id_companies, 
            id_branches, 
            id_employees,
            recipe.id_lot,
            recipe.id_customer,
            recipe.amount
        ];

        try {
            // Insert the recipe into the database
            const result = await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error("Error adding recipe: ", error);
            return null;
        }
    }else{
        // SQL Query to insert the new recipe into the database
        const queryText = `
            INSERT INTO "Branch".prescription 
            (recipe_folio, doctor_id, doctor_name, date_prescription, retained, comment, id_dishes_and_combos, id_companies, id_branches, id_employees,id_lots,amount) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11,$12) 
        `;


        // Values to insert
        const values = [
            recipe.recipeId,       // recipe_folio
            recipe.doctorLicense,  // doctor_id
            recipe.doctorName,     // doctor_name
            recipe.prescriptionDate, // date
            recipe.retained,       // retained
            recipe.comments,       // comment
            recipe.id_dishes_and_combos, // id_dishes_and_combos,
            id_companies, 
            id_branches, 
            id_employees,
            recipe.id_lot,
            recipe.amount
        ];

        try {
            // Insert the recipe into the database
            const result = await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error("Error adding recipe: ", error);
            return null;
        }    
    }

}

async function add_recipe(id_companies, id_branches, id_employees, recipe) {
  // Verificar si recipe.id_customer es numérico y asignar null si no
  recipe.id_customer = isNaN(recipe.id_customer) ? null : recipe.id_customer;

  // Construimos las columnas y valores según si id_customer existe o no
  const hasCustomer = !!recipe.id_customer;

  const keysBase = [
    'recipe_folio',
    'doctor_id',
    'doctor_name',
    'date_prescription',
    'retained',
    'comment',
    'id_dishes_and_combos',
    'id_companies',
    'id_branches',
    'id_employees',
    'id_lots',
    'amount'
  ];

  const keys = hasCustomer ? [...keysBase.slice(0, 11), 'id_customers', keysBase[11]] : keysBase;

  // Valores ordenados según keys
  const valuesBase = [
    recipe.recipeId,
    recipe.doctorLicense,
    recipe.doctorName,
    recipe.prescriptionDate,
    recipe.retained,
    recipe.comments,
    recipe.id_dishes_and_combos,
    id_companies,
    id_branches,
    id_employees,
    recipe.id_lot
  ];

  const values = hasCustomer
    ? [...valuesBase, recipe.id_customer, recipe.amount]
    : [...valuesBase, recipe.amount];

  if (TYPE_DATABASE === 'mysqlite') {
    // SQLite usa ?, y tabla sin schema
    const columns = keys.join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const queryText = `INSERT INTO prescription (${columns}) VALUES (${placeholders})`;

    return new Promise((resolve) => {
      database.run(queryText, values, function (err) {
        if (err) {
          console.error('Error insertando receta en SQLite:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } else {
    // PostgreSQL usa $1, $2, ... y schema "Branch"
    const columns = keys.join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const queryText = `INSERT INTO "Branch".prescription (${columns}) VALUES (${placeholders})`;

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error insertando receta en PostgreSQL:', error);
      return false;
    }
  }
}



async function add_app(app){
    
}

module.exports={
    add_company,
    add_product_department,
    add_product_category,
    add_branch,
    add_supplies_company,
    add_combo_company,
    save_all_supplies_combo_company,
    add_customer,
    add_department_employees,
    save_department_employees,
    add_type_employees,
    add_user,
    add_new_employees,
    add_provider_company,
    add_product_and_suppiles_features,
    add_combo_branch,
    add_buy_history,
    add_movement_history,
    add_commanders,
    add_box,
    add_ad,
    add_schedule,
    save_branch,
    add_order,
    add_new_sales_stage,
    add_new_sales_team_in_my_company,
    add_new_prospects, 
    add_appointment,
    this_customer_exists,
    add_message_to_the_customer_history,
    add_product_combo_company,
    add_recipe
};