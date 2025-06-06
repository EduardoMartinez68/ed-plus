const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0
require('dotenv').config();
const {TYPE_DATABASE}=process.env;

//functions image
const {
    get_path_img,
    delate_image_upload,
    upload_image_to_space,
    delete_image_from_space,
    create_a_new_image,
    delate_image
} = require('./connectionWithDatabaseImage');

async function search_employees(idCompany) {
    try {
        let queryText;
        let values = [idCompany];

        if (TYPE_DATABASE === 'mysqlite') {
            queryText = `
                SELECT e.id, e.id_companies, e.id_users, e.id_roles_employees, e.id_departments_employees, e.id_branches, e.num_int, e.num_ext, e.city, e.street, e.phone, e.cell_phone,
                       u.*, r.*, d.*, b.*, c.*
                FROM employees e
                LEFT JOIN users u ON e.id_users = u.id
                LEFT JOIN roles_employees r ON e.id_roles_employees = r.id
                LEFT JOIN departments_employees d ON e.id_departments_employees = d.id
                LEFT JOIN branches b ON e.id_branches = b.id
                LEFT JOIN country c ON e.id_country = c.id
                WHERE e.id_companies = ?
            `;
            // Para SQLite, usa el método run/all con ? y la librería sqlite3
            return new Promise((resolve, reject) => {
                database.all(queryText, values, (err, rows) => {
                    if (err) {
                        console.error('Error SQLite en search_employees:', err.message);
                        return reject(err);
                    }
                    resolve(rows);
                });
            });

        } else {
            // PostgreSQL
            queryText = `
                SELECT e.id, e.id_companies, e.id_users, e.id_roles_employees, e.id_departments_employees, e.id_branches, e.num_int, e.num_ext, e.city, e.street, e.phone, e.cell_phone,
                       u.*, r.*, d.*, b.*, c.*
                FROM "Company".employees e
                LEFT JOIN "Fud".users u ON e.id_users = u.id
                LEFT JOIN "Employee".roles_employees r ON e.id_roles_employees = r.id
                LEFT JOIN "Employee".departments_employees d ON e.id_departments_employees = d.id
                LEFT JOIN "Company".branches b ON e.id_branches = b.id
                LEFT JOIN "Fud".country c ON e.id_country = c.id
                WHERE e.id_companies = $1
            `;
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error en search_employees:', error);
        throw error;
    }
}

async function search_employees_branch(idBranch) {
    try {
        let queryText;
        let values = [idBranch];

        if (TYPE_DATABASE === 'mysqlite') {
            queryText = `
                SELECT e.id AS id_employee, e.id_companies, e.id_users, e.id_roles_employees, e.id_departments_employees, e.id_branches, e.num_int, e.num_ext, e.city, e.street, e.phone, e.cell_phone,
                       u.*, r.*, d.*, b.*, c.*
                FROM employees e
                LEFT JOIN users u ON e.id_users = u.id
                LEFT JOIN roles_employees r ON e.id_roles_employees = r.id
                LEFT JOIN departments_employees d ON e.id_departments_employees = d.id
                LEFT JOIN branches b ON e.id_branches = b.id
                LEFT JOIN country c ON e.id_country = c.id
                WHERE e.id_branches = ?
            `;
            return new Promise((resolve, reject) => {
                database.all(queryText, values, (err, rows) => {
                    if (err) {
                        console.error('Error SQLite en search_employees_branch:', err.message);
                        return reject(err);
                    }
                    resolve(rows);
                });
            });

        } else {
            queryText = `
                SELECT e.id AS id_employee, e.id_companies, e.id_users, e.id_roles_employees, e.id_departments_employees, e.id_branches, e.num_int, e.num_ext, e.city, e.street, e.phone, e.cell_phone,
                       u.*, r.*, d.*, b.*, c.*
                FROM "Company".employees e
                LEFT JOIN "Fud".users u ON e.id_users = u.id
                LEFT JOIN "Employee".roles_employees r ON e.id_roles_employees = r.id
                LEFT JOIN "Employee".departments_employees d ON e.id_departments_employees = d.id
                LEFT JOIN "Company".branches b ON e.id_branches = b.id
                LEFT JOIN "Fud".country c ON e.id_country = c.id
                WHERE e.id_branches = $1
            `;
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error en search_employees_branch:', error);
        throw error;
    }
}


async function search_employee(idEmployee) {
    try {
        let queryText;
        let values = [idEmployee];

        if (TYPE_DATABASE === 'mysqlite') {
            queryText = `
                SELECT e.id, e.id_companies, e.id_users, e.id_roles_employees, e.id_departments_employees, e.id_branches, e.num_int, e.num_ext, e.id_country, e.city, e.street, e.phone, e.cell_phone,
                       u.*, r.*, d.*, c.*
                FROM employees e
                LEFT JOIN users u ON e.id_users = u.id
                LEFT JOIN roles_employees r ON e.id_roles_employees = r.id
                LEFT JOIN departments_employees d ON e.id_departments_employees = d.id
                LEFT JOIN country c ON e.id_country = c.id
                WHERE e.id_users = ?
            `;
            return new Promise((resolve, reject) => {
                database.all(queryText, values, (err, rows) => {
                    if (err) {
                        console.error('Error SQLite en search_employee:', err.message);
                        return reject(err);
                    }
                    resolve(rows);
                });
            });
        } else {
            queryText = `
                SELECT e.id, e.id_companies, e.id_users, e.id_roles_employees, e.id_departments_employees, e.id_branches, e.num_int, e.num_ext, e.id_country, e.city, e.street, e.phone, e.cell_phone,
                       u.*, r.*, d.*, c.*
                FROM "Company".employees e
                LEFT JOIN "Fud".users u ON e.id_users = u.id
                LEFT JOIN "Employee".roles_employees r ON e.id_roles_employees = r.id
                LEFT JOIN "Employee".departments_employees d ON e.id_departments_employees = d.id
                LEFT JOIN "Fud".country c ON e.id_country = c.id
                WHERE e.id_users = $1
            `;
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error en search_employee:', error);
        throw error;
    }
}

async function search_employee_with_username(username) {
    try {
        let queryText;
        let values = [username];

        if (TYPE_DATABASE === 'mysqlite') {
            queryText = `
                SELECT 
                    e.id AS id_employee,
                    e.id_companies AS id_company,
                    e.id_branches AS id_branch,
                    r.id AS id_role,
                    u.*,
                    r.*
                FROM 
                    users AS u
                JOIN 
                    employees AS e ON u.id = e.id_users
                JOIN 
                    roles_employees AS r ON e.id_roles_employees = r.id
                WHERE 
                    u.user_name = ?
            `;
            return new Promise((resolve, reject) => {
                database.all(queryText, values, (err, rows) => {
                    if (err) {
                        console.error('Error SQLite en search_employee_with_username:', err.message);
                        return reject(err);
                    }
                    resolve(rows);
                });
            });
        } else {
            queryText = `
                SELECT 
                    e.id AS id_employee,
                    e.id_companies AS id_company,
                    e.id_branches AS id_branch,
                    r.id AS id_role,
                    u.*,
                    r.* 
                FROM 
                    "Fud".users AS u
                JOIN 
                    "Company".employees AS e ON u.id = e.id_users
                JOIN 
                    "Employee".roles_employees AS r ON e.id_roles_employees = r.id
                WHERE 
                    u.user_name = $1
            `;
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error en search_employee_with_username:', error);
        throw error;
    }
}


async function delete_employee(idUser) {
    try {
        let queryText;
        let values = [idUser];

        if (TYPE_DATABASE === 'mysqlite') {
            queryText = 'DELETE FROM Employees WHERE id_users = ?';
            return new Promise((resolve, reject) => {
                database.run(queryText, values, function(err) {
                    if (err) {
                        console.error('Error SQLite al eliminar empleado:', err.message);
                        return resolve(false);
                    }
                    resolve(true);
                });
            });
        } else {
            queryText = 'DELETE FROM "Company".Employees WHERE id_users = $1';
            await database.query(queryText, values);
            return true;
        }
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
        return false;
    }
}


async function search_employee_departments(idCompany) {
    try {
        let queryText;
        let values = [idCompany];

        if (TYPE_DATABASE === 'mysqlite') {
            // En SQLite no hay schemas, y los placeholders son ?
            queryText = 'SELECT * FROM departments_employees WHERE id_companies = ?';
            return new Promise((resolve, reject) => {
                database.all(queryText, values, (err, rows) => {
                    if (err) {
                        console.error('Error SQLite al buscar departamentos:', err.message);
                        return reject(err);
                    }
                    resolve(rows);
                });
            });
        } else {
            // PostgreSQL usa schemas y placeholders $1
            queryText = 'SELECT * FROM "Employee".departments_employees WHERE id_companies = $1';
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error al buscar departamentos de empleados:', error);
        throw error;
    }
}


async function get_country() {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite does not use schemas or rows, and uses callbacks or promisify
            return new Promise((resolve, reject) => {
                const query = 'SELECT * FROM country';
                database.all(query, [], (err, rows) => {
                    if (err) {
                        console.error('SQLite error getting countries:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            // PostgreSQL with schema and async/await query
            const query = 'SELECT * FROM "Fud".country';
            const result = await database.query(query);
            return result.rows;
        }
    } catch (error) {
        console.error('Error getting countries:', error);
        throw error;
    }
}

async function get_type_employees(idCompany) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite does not use schemas or $ placeholders, uses ? placeholders and callback style
            return new Promise((resolve, reject) => {
                const query = 'SELECT * FROM roles_employees WHERE id_companies = ?';
                database.all(query, [idCompany], (err, rows) => {
                    if (err) {
                        console.error('SQLite error getting employee roles:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            // PostgreSQL with schema and async/await query
            const query = 'SELECT * FROM "Employee".roles_employees WHERE id_companies = $1';
            const result = await database.query(query, [idCompany]);
            return result.rows;
        }
    } catch (error) {
        console.error('Error getting employee roles:', error);
        throw error;
    }
}


async function delete_type_employee(idTypeEmployee) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite uses ? placeholders and callbacks
            return new Promise((resolve, reject) => {
                const query = 'DELETE FROM roles_employees WHERE id = ?';
                database.run(query, [idTypeEmployee], function(err) {
                    if (err) {
                        console.error('SQLite error deleting employee role:', err.message);
                        reject(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        } else {
            // PostgreSQL with schema and async/await query
            const queryText = 'DELETE FROM "Employee".roles_employees WHERE id = $1';
            await database.query(queryText, [idTypeEmployee]);
            return true;
        }
    } catch (error) {
        console.error('Error deleting employee role from database:', error);
        return false;
    }
}


async function get_data_role_employees(idRoleEmployee) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            return new Promise((resolve, reject) => {
                const query = 'SELECT * FROM roles_employees WHERE id = ?';
                database.all(query, [idRoleEmployee], (err, rows) => {
                    if (err) {
                        console.error('SQLite error getting role employee:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            const queryText = 'SELECT * FROM "Employee".roles_employees WHERE id = $1';
            const result = await database.query(queryText, [idRoleEmployee]);
            return result.rows;
        }
    } catch (error) {
        console.error('Error getting role employee data:', error);
        throw error;
    }
}


async function delete_departament_employee(idDepartament) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            return new Promise((resolve, reject) => {
                const query = 'DELETE FROM departments_employees WHERE id = ?';
                database.run(query, [idDepartament], function(err) {
                    if (err) {
                        console.error('SQLite error deleting department employee:', err.message);
                        reject(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        } else {
            const queryText = 'DELETE FROM "Employee".departments_employees WHERE id = $1';
            const values = [idDepartament];
            await database.query(queryText, values);
            return true;
        }
    } catch (error) {
        console.error('Error deleting department employee:', error);
        return false;
    }
}


async function update_department_employe(idDepartament, name, description) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            return new Promise((resolve, reject) => {
                const query = `UPDATE departments_employees SET name_departaments = ?, description = ? WHERE id = ?`;
                database.run(query, [name, description, idDepartament], function(err) {
                    if (err) {
                        console.error('SQLite error updating department employee:', err.message);
                        reject(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        } else {
            const queryText = `UPDATE "Employee".departments_employees SET name_departaments = $1, description = $2 WHERE id = $3`;
            const values = [name, description, idDepartament];
            await database.query(queryText, values);
            return true;
        }
    } catch (error) {
        console.error('Error updating department employee:', error);
        return false;
    }
}


async function get_data_employee(req) {
    const id_user = req.user.id;

    try {
        if (TYPE_DATABASE === 'mysqlite') {
            return new Promise((resolve, reject) => {
                const query = 'SELECT * FROM employees WHERE id_users = ?';
                database.all(query, [id_user], (err, rows) => {
                    if (err) {
                        console.error('SQLite error getting employee data:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            const queryText = 'SELECT * FROM "Company".employees WHERE id_users = $1';
            const values = [id_user];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error getting employee data:', error);
        throw error;
    }
}


async function delete_profile_picture(idUser) {
    //we will see if the user have a profile picture
    const pathImg = await get_profile_picture(idUser);
    //if esxit a image, we going to delete 
    if (pathImg != null) {
        delate_image_upload(pathImg)
    }
}

async function get_profile_picture(idUser) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            return new Promise((resolve, reject) => {
                const query = 'SELECT photo FROM users WHERE id = ?';
                database.get(query, [idUser], (err, row) => {
                    if (err) {
                        console.error('SQLite error getting profile picture:', err.message);
                        reject(err);
                    } else {
                        if (row && row.photo) {
                            resolve(row.photo);
                        } else {
                            resolve(null);
                        }
                    }
                });
            });
        } else {
            const queryText = 'SELECT photo FROM "Fud".users WHERE id = $1';
            const values = [idUser];
            const result = await database.query(queryText, values);
            if (result.rows.length > 0 && 'photo' in result.rows[0]) {
                return result.rows[0].photo;
            } else {
                return null;
            }
        }
    } catch (error) {
        console.error('Error getting profile picture:', error);
        throw error;
    }
}

async function delete_user(idUser) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            return new Promise((resolve, reject) => {
                const query = 'DELETE FROM users WHERE id = ?';
                database.run(query, [idUser], function(err) {
                    if (err) {
                        console.error('SQLite error deleting user:', err.message);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        } else {
            const queryText = 'DELETE FROM "Fud".users WHERE id = $1';
            const values = [idUser];
            await database.query(queryText, values);
            return true;
        }
    } catch (error) {
        console.error('Error deleting user from database:', error);
        return false;
    }
}


module.exports = {
    search_employees,
    search_employees_branch,
    search_employee,
    delete_employee,
    search_employee_departments,
    get_country,
    get_type_employees,
    delete_type_employee,
    get_data_tole_employees,
    delete_departament_employee,
    update_department_employe,
    get_data_employee,
    delete_profile_picture,
    get_profile_picture,
    delete_user,
    search_employee_with_username
};