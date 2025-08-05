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


async function add_a_new_ticket(ticket) {

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

function formatDateRange(startDate, endDate) {
    const formatStart = startDate.split(" ")[0] + " 00:00:00";
    const formatEnd = endDate.split(" ")[0] + " 23:59:59";
    return [formatStart, formatEnd];
}

async function get_tickets_by_date_range(id_branch, startDate, endDate) {
    if (!id_branch || !startDate || !endDate) {
        console.error("Faltan parámetros requeridos");
        return [];
    }
    const [startFormatted, endFormatted]=formatDateRange(startDate,endDate)
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM ticket 
                WHERE id_branches = ? 
                  AND date_sale BETWEEN ? AND ? 
                  AND cfdi_create = 0
            `;
            database.all(query, [id_branch, startFormatted, endFormatted], (err, rows) => {
                if (err) {
                    console.error("Error al obtener tickets (SQLite):", err);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    } else {
        try {
            const query = `
                SELECT * FROM "Box".ticket 
                WHERE id_branches = $1 
                  AND date_sale BETWEEN $2 AND $3 
                  AND cfdi_create = false
            `;
            const result = await database.query(query, [id_branch, startFormatted, endFormatted]);
            return result.rows;
        } catch (error) {
            console.error("Error al obtener tickets (PostgreSQL):", error);
            return [];
        }
    }
}

/**
 * Obtiene un ticket por su "key".
 * @param {string|number} id_branch - (Opcional) Si deseas filtrar además por sucursal. Pásalo como null/undefined para ignorarlo.
 * @param {string} ticketKey - Valor del campo "key" del ticket.
 * @returns {Promise<object|null>} Un objeto ticket o null si no existe.
 */
/**
 * Obtiene un ticket por su "key" y "id_branches".
 * Devuelve un único registro o null si no existe.
 * @param {number|string} id_branch
 * @param {string} ticketKey
 * @returns {Promise<object|null>}
 */
async function get_ticket_by_key_and_branch(id_branch, ticketKey) {
  if (!id_branch || !ticketKey) {
    console.error("Faltan parámetros requeridos: id_branch y ticketKey son obligatorios");
    return null;
  }

  if (TYPE_DATABASE === 'mysqlite') {
    // SQLite
    return new Promise((resolve, reject) => {
      // OJO: "key" es identificador reservado; en SQLite se puede entrecomillar con comillas dobles.
      const query = `
        SELECT *
        FROM ticket
        WHERE id_branches = ?
          AND "key" = ?
        LIMIT 1
      `;
      database.get(query, [id_branch, ticketKey], (err, row) => {
        if (err) {
          console.error("Error al obtener ticket (SQLite):", err);
          return reject(err);
        }
        resolve(row || null);
      });
    });
  } else {
    // PostgreSQL
    try {
      // En Postgres, el identificador "key" debe ir con comillas dobles.
      const query = `
        SELECT *
        FROM "Box".ticket
        WHERE id_branches = $1
          AND "key" = $2
        LIMIT 1
      `;
      const result = await database.query(query, [id_branch, ticketKey]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error al obtener ticket (PostgreSQL):", error);
      return null;
    }
  }
}


async function get_tickets_for_facture_individual_by_key_and_id_branch(id_branch, key) {
    const tickets = [await get_ticket_by_key_and_branch(id_branch, key)];

    let totalGlobal = 0;
    const products = [];

    for (let i = 0; i < tickets.length; i++) {
        const dataTicket = tickets[i];
        let current_ticket = [];

        try {
            current_ticket = JSON.parse(dataTicket.current_ticket);
        } catch (e) {
            console.error(`Error al parsear current_ticket del ticket ID ${dataTicket.id}:`, e);
            continue; // Salta este ticket si falla el parseo
        }
        
        for (let j = 0; j < current_ticket.length; j++) {
            const dataProduct = current_ticket[j];

            //now if this product have taxes, we will save this product with taxes TaxObject:'02'
            let UnitCode;
            if(dataProduct.name=='Pza'){
                UnitCode='H87';
            }else{
                UnitCode='KGM';
            }

            //now we will see if this produc have taxes in the ticket, if not have taxes, we will know that the product is free of tax
            let infoTaxes = [];
            const thisProductNotIsFreeOfTax = Array.isArray(dataProduct.taxes) && dataProduct.taxes.length > 0;

            const quantityProduct=parseFloat(parseFloat(dataProduct.quantity || 0).toFixed(2));
            const priceWithoutTaxes=parseFloat(parseFloat(dataProduct.priceWithoutTaxes || 0).toFixed(2));
            const priceWithTaxes=parseFloat(parseFloat(dataProduct.price || 0).toFixed(2))
            const totalProduct=parseFloat(parseFloat(dataProduct.itemTotal || 0).toFixed(2));

            //update the formt of the taxes
            let taxes=[]
            if(thisProductNotIsFreeOfTax){
                //if this product not is free of tax, we will get all the tax that have save in the ticket
                try {
                    infoTaxes = dataProduct.taxes;//JSON.parse(dataProduct.taxes);
                } catch (e) {
                    console.error(`Error al parsear taxes del producto`, e);
                    continue;
                }

                //her we will read all the taxes
                for(var k=0;k<infoTaxes.length;k++){
                    //get the information of all the taxes and do the calculate of the taxes
                    const dataTax=infoTaxes[k];
                    const IsRetention = !!(dataTax.is_retention == 1 || dataTax.is_retention);
                    const rate=parseFloat((parseFloat(dataTax.rate/100)).toFixed(2));
                    const totalTaxe=parseFloat(parseFloat((priceWithoutTaxes*quantityProduct)*(dataTax.rate/100))).toFixed(2);
                    const infoTax={
                        Total: totalTaxe,
                        Name: dataTax.name,
                        Base: priceWithoutTaxes,
                        Rate: rate,
                        IsRetention: IsRetention//IsRetention
                    }
                    
                    //save the information of the taxes
                    taxes.push(infoTax)
                }

                products.push({
                    ProductCode: dataProduct.sat_key,
                    Description: dataProduct.name,
                    UnitCode,
                    Quantity: parseFloat((parseFloat(dataProduct.quantity)).toFixed(2)),
                    UnitPrice: priceWithoutTaxes,
                    Subtotal: parseFloat((parseFloat(priceWithoutTaxes*dataProduct.quantity)).toFixed(2)),
                    TaxObject : "02",
                    Taxes: infoTaxes,
                    Total: totalProduct          
                });
            }else{
                //now if this product not have taxes, we will save this product with TaxObject:'01'
                products.push({
                    ProductCode: '01010101',
                    Description:'VENTA',
                    UnitCode: UnitCode,
                    Quantity: parseFloat((parseFloat(dataProduct.quantity)).toFixed(2)),
                    UnitPrice: priceWithoutTaxes,
                    Subtotal: parseFloat((parseFloat(priceWithoutTaxes*dataProduct.quantity)).toFixed(2)),
                    TaxObject : "01",
                    Total: totalProduct          
                });
            }

        

            totalGlobal+=totalProduct;
        }

    }

    totalGlobal=parseFloat(totalGlobal.toFixed(2))
    return {
        products,
        totalGlobal
    }
}


async function get_tickets_for_facture_global_by_date_range(id_branch, startDate, endDate) {
    const tickets = await get_tickets_by_date_range(id_branch, startDate, endDate);
    let totalGlobal = 0;
    const products = [];

    for (let i = 0; i < tickets.length; i++) {
        const dataTicket = tickets[i];
        let current_ticket = [];

        try {
            current_ticket = JSON.parse(dataTicket.current_ticket);
        } catch (e) {
            console.error(`Error al parsear current_ticket del ticket ID ${dataTicket.id}:`, e);
            continue; // Salta este ticket si falla el parseo
        }

        for (let j = 0; j < current_ticket.length; j++) {
            const dataProduct = current_ticket[j];

            //now we will see if this produc have taxes in the ticket, if not have taxes, we will know that the product is free of tax
            let infoTaxes = [];
            const thisProductNotIsFreeOfTax = Array.isArray(dataProduct.taxes) && dataProduct.taxes.length > 0;

            const quantityProduct=parseFloat(parseFloat(dataProduct.quantity || 0).toFixed(2));
            const priceWithoutTaxes=parseFloat(parseFloat(dataProduct.priceWithoutTaxes || 0).toFixed(2));
            const priceWithTaxes=parseFloat(parseFloat(dataProduct.price || 0).toFixed(2))
            const totalProduct=parseFloat(parseFloat(dataProduct.itemTotal || 0).toFixed(2));

            //update the formt of the taxes
            let taxes=[]
            if(thisProductNotIsFreeOfTax){
                //if this product not is free of tax, we will get all the tax that have save in the ticket
                try {
                    infoTaxes = dataProduct.taxes;//JSON.parse(dataProduct.taxes);
                } catch (e) {
                    console.error(`Error al parsear taxes del producto`, e);
                    continue;
                }

                //her we will read all the taxes
                for(var k=0;k<infoTaxes.length;k++){
                    //get the information of all the taxes and do the calculate of the taxes
                    const dataTax=infoTaxes[k];
                    const IsRetention = !!(dataTax.is_retention == 1 || dataTax.is_retention);
                    const rate=parseFloat((parseFloat(dataTax.rate/100)).toFixed(2));
                    const totalTaxe=parseFloat(parseFloat((priceWithoutTaxes*quantityProduct)*(dataTax.rate/100))).toFixed(2);
                    const infoTax={
                        Total: totalTaxe,
                        Name: dataTax.name,
                        Base: priceWithoutTaxes,
                        Rate: rate,
                        IsRetention: false//IsRetention
                    }
                    
                    //save the information of the taxes
                    taxes.push(infoTax)
                }

                //now if this product have taxes, we will save this product with taxes TaxObject:'02'
                products.push({
                    ProductCode: '01010101',
                    Description:'VENTA',
                    UnitCode: 'ACT',
                    Quantity: parseFloat((parseFloat(dataProduct.quantity)).toFixed(2)),
                    UnitPrice: priceWithoutTaxes,
                    Subtotal: parseFloat((parseFloat(priceWithoutTaxes*dataProduct.quantity)).toFixed(2)),
                    TaxObject : "02",
                    Taxes: infoTaxes,
                    Total: totalProduct          
                });
            }else{
                //now if this product not have taxes, we will save this product with TaxObject:'01'
                products.push({
                    ProductCode: '01010101',
                    Description:'VENTA',
                    UnitCode: 'ACT',
                    Quantity: parseFloat((parseFloat(dataProduct.quantity)).toFixed(2)),
                    UnitPrice: priceWithoutTaxes,
                    Subtotal: parseFloat((parseFloat(priceWithoutTaxes*dataProduct.quantity)).toFixed(2)),
                    TaxObject : "01",
                    Total: totalProduct          
                });
            }

        

            totalGlobal+=totalProduct;
        }

    }

    totalGlobal=parseFloat(totalGlobal.toFixed(2))
    return {
        products,
        totalGlobal
    }
}



module.exports = {
    get_the_setting_of_the_ticket,
    update_setting_ticket,
    get_tickets_by_date_range,
    get_tickets_for_facture_global_by_date_range,
    get_ticket_by_key_and_branch,
    get_tickets_for_facture_individual_by_key_and_id_branch
};