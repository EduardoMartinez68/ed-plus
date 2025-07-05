require('dotenv').config();
const {TYPE_DATABASE}=process.env;
const database = require('../database');
const addDatabase = require('../router/addDatabase');
const rolFree=0


async function get_the_setting_of_the_ticket(id_company, id_branch) {
    if (!id_company || !id_branch) {
        return null;
    }

    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const selectQuery = `
                SELECT * FROM setting_ticket WHERE id_branches = ?
            `;
            database.get(selectQuery, [id_branch], (err, row) => {
                if (err) {
                    console.error("Error al buscar configuración (SQLite):", err);
                    return reject(err);
                }

                if (row) {
                    return resolve(row);
                }

                // Insertar si no existe
                const insertQuery = `
                    INSERT INTO setting_ticket (id_companies, id_branches)
                    VALUES (?, ?)
                `;
                database.run(insertQuery, [id_company, id_branch], function (err) {
                    if (err) {
                        console.error("Error al insertar configuración (SQLite):", err);
                        return reject(err);
                    }

                    const insertedId = this.lastID;
                    database.get(`SELECT * FROM setting_ticket WHERE id = ?`, [insertedId], (err, newRow) => {
                        if (err) {
                            console.error("Error al obtener configuración nueva (SQLite):", err);
                            return reject(err);
                        }

                        return resolve(newRow);
                    });
                });
            });
        });

    } else {
        try {
            const query = `
                SELECT * FROM "Box".setting_ticket WHERE id_branches = $1
            `;
            const result = await database.query(query, [id_branch]);

            if (result.rows.length > 0) {
                return result.rows[0];
            }

            const insertQuery = `
                INSERT INTO "Box".setting_ticket (id_companies, id_branches)
                VALUES ($1, $2)
                RETURNING *
            `;
            const insertResult = await database.query(insertQuery, [id_company, id_branch]);

            return insertResult.rows[0];

        } catch (error) {
            console.error("Error al obtener o crear configuración (PostgreSQL):", error);
            return null;
        }
    }
}

async function update_setting_ticket(id_branch, data) {

    const fields = [
        "show_name_employee", "show_name_customer", "show_name_company",
        "show_address", "show_name_branch", "show_phone", "show_cellphone",
        "show_email_company", "show_email_branch", "show_logo", "show_date",
        "show_qr", "qr", "message", "size_ticket"
    ];

    const values = fields.map(field => data[field] !== undefined ? data[field] : null);

    if (TYPE_DATABASE === "mysqlite") {
        return new Promise((resolve, reject) => {
            const setClause = fields.map(field => `${field} = ?`).join(", ");
            const query = `
                UPDATE setting_ticket
                SET ${setClause}
                WHERE id_branches = ?;
            `;
            database.run(query, [...values, id_branch], function (err) {
                if (err) {
                    console.error("SQLite update error:", err);
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    } else {
        try {
            const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");
            const query = `
                UPDATE "Box".setting_ticket
                SET ${setClause}
                WHERE id_branches = $${fields.length + 1};
            `;
            await database.query(query, [...values, id_branch]);
            return true;
        } catch (error) {
            console.error("PostgreSQL update error:", error);
            return false;
        }
    }
}

module.exports = {
    get_the_setting_of_the_ticket,
    update_setting_ticket
};