const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');

const database = require('../../database');
const addDatabase = require('../addDatabase');
const update = require('../updateDatabase');

//functions branch
const {
    get_data_branch,
    get_all_box_of_the_branch_with_his_id
} = require('../../services/branch');

const {
    delate_image_upload,
} = require('../../services/connectionWithDatabaseImage');
const { get } = require('node-persist');
const ExcelJS = require('exceljs');

router.get('/:id_company/:id_branch/report-prescription', isLoggedIn, async (req, res) => {
    const {id_company,id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);
    res.render('links/cashCut/cashCut.hbs',{branchFree});
})

async function get_all_the_user_of_the_branch(id_branch){
    const queryText = `
        SELECT 
            e.id AS employee_id, e.id_companies, e.id_users, e.id_roles_employees, 
            e.id_departments_employees, e.id_branches, e.city, 
            e.street, e.num_ext, e.num_int, e.id_country, 
            e.phone, e.cell_phone, e.nip,
            u.id AS user_id, u.photo, u.user_name, u.email, u.first_name, 
            u.second_name, u.last_name, u.rol_user, u.id_packs_fud, 
            u.language, u.pack_database, u.pack_branch, 
            u.navbar_1, u.navbar_2, u.navbar_3, u.edit_branch
        FROM "Company".employees e
        LEFT JOIN "Fud".users u ON e.id_users = u.id
        WHERE e.id_branches = $1;
    `;

    try {
        const result = await database.query(queryText, [id_branch]);
        return result.rows;
    } catch (error) {
        console.error('Error getting total sales:', error);
        return [];
    }
}

async function create_excel(){
    const workbook = new ExcelJS.Workbook(); // Crear un nuevo libro de Excel
    const worksheet = workbook.addWorksheet('Hoja 1'); // Crear una hoja

    // Agregar encabezados
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nombre', key: 'nombre', width: 20 },
        { header: 'Edad', key: 'edad', width: 10 }
    ];

    // Agregar filas de datos
    worksheet.addRow({ id: 1, nombre: 'Juan', edad: 30 });
    worksheet.addRow({ id: 2, nombre: 'María', edad: 25 });
    worksheet.addRow({ id: 3, nombre: 'Carlos', edad: 35 });

    // Guardar el archivo
    await workbook.xlsx.writeFile('archivo.xlsx');
    console.log('Archivo Excel creado exitosamente.');
}


/**
 periodo:
 sucursales:
 fecha | clave (codigo de barras) | nombre | descripcion | movimiento | lote | fecha caducidad | salida| entrada | documento |
 */
module.exports = router;