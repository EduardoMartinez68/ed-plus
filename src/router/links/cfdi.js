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


router.post('/add-data-facture-customer', isLoggedIn, async (req, res) => {
    const { id_company } = req.user;
    const {
        id_customer,
        rfc,
        name,
        regimenFiscal,
        taxZipCode,
        street,
        exterior,
        interior,
        neighborhood,
        municipality,
        state,
        country
    } = req.body;

    const values = {
        rfc,
        company_name: name,
        use_cfdi: 'G03', // Puedes adaptarlo si el frontend lo envía
        fiscalRegime: regimenFiscal,
        postal_code: taxZipCode,
        street,
        num_i: interior,
        num_e: exterior,
        cologne: neighborhood,
        municipy: municipality,
        state,
        country: country || 'México',
        id_customers: id_customer,
        id_companies: id_company
    };

    const insertResult = await add_facture_cfdi(values);
    if (insertResult.success) {
        res.json({ success: true, message: 'Datos CFDI guardados correctamente' });
    } else {
        res.json({ success: false, message: 'No se pudo guardar los datos CFDI' });
    }
});


async function add_facture_cfdi(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);

    if (TYPE_DATABASE === 'mysqlite') {
        const columns = keys.join(', ');
        const placeholders = keys.map(() => '?').join(', ');
        const query = `INSERT INTO facture_cfdi (${columns}) VALUES (${placeholders})`;

        return new Promise((resolve) => {
            database.run(query, values, function(err) {
                if (err) {
                    console.error('Error insertando CFDI cliente en SQLite:', err.message);
                    resolve({ success: false });
                } else {
                    resolve({ success: true });
                }
            });
        });

    } else {
        const columns = keys.map(k => `"${k}"`).join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO "Company".facture_cfdi (${columns}) VALUES (${placeholders})`;

        try {
            await database.query(query, values);
            return { success: true };
        } catch (error) {
            console.error('Error insertando CFDI cliente en PostgreSQL:', error.message);
            return { success: false };
        }
    }
}


module.exports = router;