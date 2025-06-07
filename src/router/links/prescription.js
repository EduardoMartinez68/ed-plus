require('dotenv').config();
const {TYPE_DATABASE}=process.env;

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


const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

router.get('/:id_company/:id_branch/report-prescription', isLoggedIn, async (req, res) => {
    const {id_company,id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);
    res.render('links/prescription/prescription.hbs',{branchFree});
})

router.get('/report-prescription', isLoggedIn, async (req, res) => {
    try {

        /*------------------her is make the file--------------------------------- */
        const { branch, dateStart, dateFinish } = req.query;
        if (!branch || !dateStart || !dateFinish) {
            return res.status(400).json({ status: 'error', message: `Faltan datos ${branch}_${dateStart}_a_${dateFinish}` });
        }

        // Obtener la fecha actual con formato
        const currentDate = new Date();
        const currentDateString = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}`;

        const fileName = `Reporte_${branch}_${dateStart}_a_${dateFinish}.xlsx`.replace(/[:\/\\]/g, '-'); // Evita caracteres no válidos

        // Crear un nuevo libro
        const wb = XLSX.utils.book_new();


        /*------------------her is for add the title--------------------------------- */
        // Crear las filas iniciales (título y subtítulos)
        const title = [`Reporte de Historial de Artículos controlados por Recetas Médicas ${branch}`];
        const subtitle1 = [`Reporte Generado el día: ${currentDateString}`];
        const subtitle2 = [`Desde ${dateStart} hasta ${dateFinish}`];

        // Crear la hoja de trabajo para el título y subtítulos
        const ws = XLSX.utils.aoa_to_sheet([
            title, // Título
            subtitle1, // Subtítulo 1
            subtitle2 // Subtítulo 2
        ]);

        // Estilo para el título
        ws['A1'].s = {
            font: { bold: true, sz: 30, color: { rgb: "1649FF" } }, // Título en rojo y tamaño 16
            alignment: { horizontal: "center" },
        };

        // Estilo para el subtítulo 1
        ws['A2'].s = {
            font: { bold: true, italic: true, sz: 16, color: { rgb: "1649FF" } }, // Subtítulo 1 en azul y tamaño 12
            alignment: { horizontal: "center" },
        };

        // Estilo para el subtítulo 2
        ws['A3'].s = {
            font: { bold: true, italic: true, sz: 16, color: { rgb: "1649FF" } }, // Subtítulo 2 en azul y tamaño 12
            alignment: { horizontal: "center" },
        };

        // Fusión de celdas
        const numberCol=20;
        ws['!merges'] = [
            { s: { r: 0, c: 0 } , e: { r: 0, c: numberCol } }, // Título ocupa A1 a C1
            { s: { r: 1, c: 0 }, e: { r: 1, c: numberCol } }, // Subtítulo 1 ocupa A2 a C2
            { s: { r: 2, c: 0 }, e: { r: 2, c: numberCol } }, // Subtítulo 2 ocupa A3 a C3
        ];

        /*------------------her is for add the information--------------------------------- */
        // Encabezados de las columnas para los datos
        const headers = ['Fecha', 'Código de barras', 'Descripción', 'Movimiento', 'Lote', 'Fecha de caducidad', 'Nueva cantidad', 'Documento'];

        // Obtener los detalles de los lotes desde la base de datos
        const lotDetails = await get_lot_details(dateStart, dateFinish);

        // Transformar los datos obtenidos para ajustarlos al formato de columnas de Excel
        const data = lotDetails.map(row => [
            row.date_move, // Fecha
            row.barcode,   // Código de barras
            row.description, // Descripción
            row.type_move,  // Movimiento
            row.number_lote, // Lote
            row.expiration_date, // Fecha de caducidad
            row.newCant,    // Nueva cantidad
            row.id_dishes_and_combos // Documento (puedes poner el valor adecuado si no es el id)
        ]);

        const allData = [headers, ...data];

        // Agregar los encabezados y datos al archivo
        XLSX.utils.sheet_add_aoa(ws, allData, { origin: 'A4' });

        // Estilo para los encabezados
        for (let i = 0; i < headers.length; i++) {
            const cell = ws[XLSX.utils.encode_cell({ r: 3, c: i })]; // Celda en la fila 4 (fila de encabezado)
            cell.s = {
                font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } }, // Encabezado en blanco y tamaño 12
                fill: { fgColor: { rgb: "4F81BD" } }, // Color de fondo azul
                alignment: { horizontal: "center" },
            };
        }

        // Agregar la hoja con título y subtítulos al libro
        XLSX.utils.book_append_sheet(wb, ws, 'Historial de movimientos');

        /*------------------her is for save the information of the prescriptions--------------------------------- */
        const prescriptionDetails = await get_prescription_details(dateStart, dateFinish);
        const headersTwo = [
            'Fecha de receta', 
            'Folio receta', 
            'ID Doctor', 
            'Nombre Doctor', 
            'Fecha', 
            'Retenido', 
            'Cantidad', 
            'Comentario', 
            'Número de lote', 
            'Fecha de caducidad', 
            'Código de barras', 
            'Nombre del producto', 
            'Descripción del producto'
        ];

        // Transformar los datos obtenidos para ajustarlos al formato de columnas de Excel Sheet
        const dataTwo = prescriptionDetails.map(row => [
            row.date_prescription, // Fecha de receta
            row.recipe_folio,   // Folio receta
            row.doctor_id,      // ID Doctor
            row.doctor_name,    // Nombre Doctor
            row.date,           // Fecha
            row.retained,       // Retenido
            row.amount,         // Cantidad
            row.comment,        // Comentario
            row.number_lote,    // Número de lote
            row.expiration_date, // Fecha de caducidad
            row.barcode,        // Código de barras
            row.product_name,   // Nombre del producto
            row.product_description // Descripción del producto
        ]);

        // Combina los encabezados y los datos
        const allData2 = [headersTwo, ...dataTwo];

        // Crear la hoja de trabajo con los datos
        const ws2 = XLSX.utils.aoa_to_sheet(allData2);

        // Agregar la hoja "Recetas" al libro sheetName 
        XLSX.utils.book_append_sheet(wb, ws2, 'Recetas');

        /*------------------her is for save and download the file--------------------------------- */

        // Generar un archivo Excel en memoria
        const filePath = path.join(__dirname, fileName);
        XLSX.writeFile(wb, filePath);

        // Enviar el archivo Excel al cliente
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Error al enviar el archivo:', err);
            }
            // Eliminar el archivo después de la descarga
            fs.unlinkSync(filePath);
        });

        console.log('Archivo Excel generado exitosamente.');
    } catch (error) {
        console.error("Error al generar el Excel:", error);
        res.status(500).json({ status: 'error', message: 'Error en el servidor' });
    }
})

async function get_lot_details(dateStart, dateFinish) {
    if (dateStart && !dateStart.includes(' ')) {
        dateStart = `${dateStart} 00:00:00`;
    }

    if (dateFinish && !dateFinish.includes(' ')) {
        dateFinish = `${dateFinish} 23:59:59`;
    }

    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT
                    h.date_move,
                    l.number_lote,
                    l.expiration_date,
                    h.type_move,
                    h.newCant,
                    dcf.id_dishes_and_combos,
                    dc.barcode,
                    dc.description,
                    dc.name
                FROM history_move_lot h
                LEFT JOIN lots l ON h.id_lots = l.id
                LEFT JOIN dish_and_combo_features dcf ON l.id_dish_and_combo_features = dcf.id
                LEFT JOIN dishes_and_combos dc ON dcf.id_dishes_and_combos = dc.id
                WHERE dc.this_product_need_recipe = 1
                AND h.date_move BETWEEN ? AND ?;
            `;

            database.all(query, [dateStart, dateFinish], (err, rows) => {
                if (err) {
                    console.error("Error al obtener los detalles del lote (SQLite):", err);
                    return resolve([]);
                }
                return resolve(rows);
            });
        });
    } else {
        const queryText = `
            SELECT
                h.date_move,
                l.number_lote,
                l.expiration_date,
                h.type_move,
                h."newCant",
                dcf.id_dishes_and_combos,
                dc.barcode,
                dc.description,
                dc.name
            FROM "Branch".history_move_lot h
            LEFT JOIN "Inventory".lots l ON h.id_lots = l.id
            LEFT JOIN "Inventory".dish_and_combo_features dcf ON l.id_dish_and_combo_features = dcf.id
            LEFT JOIN "Kitchen".dishes_and_combos dc ON dcf.id_dishes_and_combos = dc.id
            WHERE dc.this_product_need_recipe = true
            AND h.date_move BETWEEN $1 AND $2;
        `;

        try {
            const result = await database.query(queryText, [dateStart, dateFinish]);
            return result.rows;
        } catch (error) {
            console.error('Error getting lot details (PostgreSQL):', error);
            return [];
        }
    }
}

async function get_prescription_details(dateStart, dateFinish) {
    if (dateStart && !dateStart.includes(' ')) {
        dateStart = `${dateStart} 00:00:00`;
    }

    if (dateFinish && !dateFinish.includes(' ')) {
        dateFinish = `${dateFinish} 23:59:59`;
    }

    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    p.id AS prescription_id,
                    p.recipe_folio,
                    p.doctor_id,
                    p.doctor_name,
                    p.date_prescription,
                    p.retained,
                    p.amount,
                    p.comment,
                    l.number_lote,
                    l.expiration_date,
                    dc.barcode,
                    dc.name AS product_name,
                    dc.description AS product_description
                FROM prescription p
                LEFT JOIN lots l ON p.id_lots = l.id
                LEFT JOIN dish_and_combo_features dcf ON l.id_dish_and_combo_features = dcf.id
                LEFT JOIN dishes_and_combos dc ON dcf.id_dishes_and_combos = dc.id
                WHERE dc.this_product_need_recipe = 1
                AND p.date_prescription BETWEEN ? AND ?;
            `;

            database.all(query, [dateStart, dateFinish], (err, rows) => {
                if (err) {
                    console.error("Error al obtener los detalles de recetas (SQLite):", err);
                    return resolve([]);
                }
                return resolve(rows);
            });
        });
    } else {
        const queryText = `
            SELECT 
                p.id AS prescription_id,
                p.recipe_folio,
                p.doctor_id,
                p.doctor_name,
                p.date_prescription,
                p.retained,
                p.amount,
                p.comment,
                l.number_lote,
                l.expiration_date,
                dc.barcode,
                dc.name AS product_name,
                dc.description AS product_description
            FROM "Branch".prescription p
            LEFT JOIN "Inventory".lots l ON p.id_lots = l.id
            LEFT JOIN "Inventory".dish_and_combo_features dcf ON l.id_dish_and_combo_features = dcf.id
            LEFT JOIN "Kitchen".dishes_and_combos dc ON dcf.id_dishes_and_combos = dc.id
            WHERE dc.this_product_need_recipe = true
            AND p.date_prescription BETWEEN $1 AND $2;
        `;

        try {
            const result = await database.query(queryText, [dateStart, dateFinish]);
            return result.rows;
        } catch (error) {
            console.error('Error getting prescription details (PostgreSQL):', error);
            return [];
        }
    }
}

/**
 periodo:
 sucursales:
 fecha | clave (codigo de barras) | nombre | descripcion | movimiento | lote | fecha caducidad | salida| entrada | documento |
 */
module.exports = router;