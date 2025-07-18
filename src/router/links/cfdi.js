const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
const database = require('../../database');
const {TYPE_DATABASE}=process.env;

//functions branch
const {
    get_data_branch,
    get_branch
} = require('../../services/branch');

router.post('/update-data-cfdi', isLoggedIn, async (req, res) => {
    const {id_branch}=req.user;
    if(await update_information_of_the_cfdi_of_the_branch(id_branch, req.body)){
        res.json({
            success: true,
            message: 'Datos CFDI actualizados correctamente'
        });
    }else{
        res.json({
            success: false,
            message: 'No se pudo actualizar los datos del CFDI'
        });
    }
});


async function update_information_of_the_cfdi_of_the_branch(id_branch, branchData){
    const {
        linkCFDI,
        rfc,
        name_branch,
        fiscalRegime,
        postal_code,
        country,
        municipality,
        city,
        cologne,
        street,
        num_o, 
        num_i 
    } = branchData;

    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const query = `
                UPDATE branches
                SET 
                    rfc = ?,
                    name_branch = ?,
                    "fiscalRegime" = ?,
                    postal_code = ?,
                    id_country = ?,
                    municipality = ?,
                    city = ?,
                    cologne = ?,
                    address = ?,
                    num_ext = ?,
                    num_int = ?,
                    "linkCFDI" = ?
                WHERE id = ?;
            `;

            const values = [
                rfc,
                name_branch,
                fiscalRegime,
                postal_code,
                country,
                municipality,
                city,
                cologne,
                street,
                num_o,
                num_i,
                linkCFDI,
                id_branch
            ];

            return new Promise((resolve, reject) => {
                database.run(query, values, function (err) {
                    if (err) {
                        console.error('SQLite error updating branch:', err.message);
                        reject(err);
                    } else {
                        resolve({ success: true, changes: this.changes });
                    }
                });
            });
        } else {
            const query = `
                UPDATE "Company".branches
                SET 
                    rfc = $1,
                    name_branch = $2,
                    "fiscalRegime" = $3,
                    postal_code = $4,
                    id_country = $5,
                    municipality = $6,
                    city = $7,
                    cologne = $8,
                    address = $9,
                    num_ext = $10,
                    num_int = $11,
                    "linkCFDI" = $12
                WHERE id = $13;
            `;

            const values = [
                rfc,
                name_branch,
                fiscalRegime,
                postal_code,
                country,
                municipality,
                city,
                cologne,
                street,
                num_o,
                num_i,
                linkCFDI,
                id_branch
            ];

            const result = await database.query(query, values);
            return { success: true, rowCount: result.rowCount };
        }
    } catch (error) {
        console.error('Error updating CFDI data for branch:', error);
        return { success: false, error: error.message };
    }
}

module.exports = router;