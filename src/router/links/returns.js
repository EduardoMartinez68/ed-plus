const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
require('dotenv').config();
const { TYPE_DATABASE } = process.env;

/*
*----------------------functions-----------------*/
//functions branch
const {
    get_data_branch,
} = require('../../services/branch');

const {
    get_data_employee
} = require('../../services/employees');



const {
    get_data_company_with_id
} = require('../../services/company');

//functions permission
const {
    this_user_have_this_permission
} = require('../../services/permission');

const {
    search_combo,
    search_supplies_combo,
    get_data_combo_factures
} = require('../../services/combos');

const {
  search_customer_by_email_and_company,
  search_customers
} = require('../../services/customers');

const database = require('../../database');

router.get('/:id_company/:id_branch/returns', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;

    //we will see if the user not have the permission for this App.
    if (!this_user_have_this_permission(req.user, id_company, id_branch, 'return_ticket')) {
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const tickets=await get_tickets_by_branch(id_branch);
    const branchFree = await get_data_branch(id_branch);
    res.render('links/returns/returns', {branchFree, tickets});
});

async function get_ticket_by_branch_and_key(id_branch, ticketKey) {
  if (!id_branch || !ticketKey) return null;

  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const query = `
        SELECT *
        FROM ticket
        WHERE id_branches = ? AND key = ?
        LIMIT 1
      `;
      database.get(query, [id_branch, ticketKey], (err, row) => {
        if (err) {
          console.error("Error get_ticket_by_branch_and_key (SQLite):", err);
          return resolve(null);
        }

        // Parseamos los campos JSON
        if (row) {
          row.original_ticket = JSON.parse(row.original_ticket);
          row.current_ticket = JSON.parse(row.current_ticket);
        }

        resolve(row || null);
      });
    });
  } else {
    const query = `
      SELECT *
      FROM "Box".ticket
      WHERE id_branches = $1 AND key = $2
      LIMIT 1
    `;
    try {
      const result = await database.query(query, [id_branch, ticketKey]);

      if (result.rows.length > 0) {
        const row = result.rows[0];
        row.original_ticket = JSON.parse(row.original_ticket);
        row.current_ticket = JSON.parse(row.current_ticket);
        return row;
      }

      return null;
    } catch (error) {
      console.error("Error get_ticket_by_branch_and_key (PostgreSQL):", error);
      return null;
    }
  }
}
async function search_tickets_by_token(id_branch, ticketKey = '') {
  if (!id_branch) return null;

  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      let query;
      let params;

      if (ticketKey.trim() === '') {
        // Si no hay token, devolver últimos 20 tickets del branch
        query = `
          SELECT *
          FROM ticket
          WHERE id_branches = ?
          ORDER BY date_sale DESC
          LIMIT 20
        `;
        params = [id_branch];
      } else {
        // Buscar tokens parecidos con LIKE
        query = `
          SELECT *
          FROM ticket
          WHERE id_branches = ? AND key LIKE ?
          ORDER BY date_sale DESC
          LIMIT 20
        `;
        params = [id_branch, `%${ticketKey}%`];
      }

      database.all(query, params, (err, rows) => {
        if (err) {
          console.error("Error search_tickets_by_token (SQLite):", err);
          return resolve([]);
        }

        // Parsear campos JSON para cada fila
        const parsedRows = rows.map(row => {
          try {
            row.original_ticket = JSON.parse(row.original_ticket);
            row.current_ticket = JSON.parse(row.current_ticket);
          } catch {
            // si no es JSON válido, se ignora
          }
          return row;
        });

        resolve(parsedRows);
      });
    });
  } else {
    try {
      let query;
      let params;

      if (ticketKey.trim() === '') {
        query = `
          SELECT *
          FROM "Box".ticket
          WHERE id_branches = $1
          ORDER BY date_sale DESC
          LIMIT 20
        `;
        params = [id_branch];
      } else {
        query = `
          SELECT *
          FROM "Box".ticket
          WHERE id_branches = $1 AND key ILIKE $2
          ORDER BY date_sale DESC
          LIMIT 20
        `;
        params = [id_branch, `%${ticketKey}%`];
      }

      const result = await database.query(query, params);

      // Parsear JSON
      const parsedRows = result.rows.map(row => {
        try {
          row.original_ticket = JSON.parse(row.original_ticket);
          row.current_ticket = JSON.parse(row.current_ticket);
        } catch {
          // ignorar si no válido
        }
        return row;
      });

      return parsedRows;
    } catch (error) {
      console.error("Error search_tickets_by_token (PostgreSQL):", error);
      return [];
    }
  }
}

async function get_tickets_by_branch(id_branch) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        SELECT id, key, original_ticket, current_ticket, date_sale, cash, debit, credit, total, note,
               id_customers, id_employees, id_branches, id_companies
        FROM ticket
        WHERE id_branches = ?
        ORDER BY date_sale DESC
        LIMIT 20
      `;
      database.all(queryText, [id_branch], (err, rows) => {
        if (err) {
          console.error('Error get_tickets_by_branch (SQLite):', err);
          return resolve([]);
        }

        // Parse JSON fields
        const tickets = rows.map(row => ({
          ...row,
          original_ticket: JSON.parse(row.original_ticket),
          current_ticket: JSON.parse(row.current_ticket),
        }));

        resolve(tickets);
      });
    });
  } else {
    const queryText = `
      SELECT id, key, original_ticket, current_ticket, date_sale, cash, debit, credit, total, note,
             id_customers, id_employees, id_branches, id_companies
      FROM "Box".ticket
      WHERE id_branches = $1
      ORDER BY date_sale DESC
      LIMIT 20
    `;
    try {
      const result = await database.query(queryText, [id_branch]);

      return result.rows.map(row => ({
        ...row,
        original_ticket: JSON.parse(row.original_ticket),
        current_ticket: JSON.parse(row.current_ticket),
      }));
    } catch (error) {
      console.error('Error get_tickets_by_branch (PostgreSQL):', error);
      return [];
    }
  }
}


router.post('/get-data-ticket', isLoggedIn, async (req, res) => {
    //get the information of the user and of the ticket
    const id_branch=req.user.id_branch;
    const id_company=req.user.id_company;
    const {ticketCode}=req.body;


    //now we will get the information of the ticket
    //const dataTicket=await get_the_information_of_the_ticket(ticketCode);
    const dataTicket=await get_ticket_by_branch_and_key(id_branch, ticketCode)
    //console.log(dataTicket)
    return res.json({
      success: true,
      message: 'Ticket obtenido correctamente.',
      ticket: dataTicket
    });
});


async function get_the_information_of_the_ticket(ticketCode) {
    try {
        let query;
        let values;
        let result;

        if (!ticketCode) {
            return { success: false, error: "Código de ticket requerido." };
        }

        if (TYPE_DATABASE === 'mysqlite') {
            query = `
                SELECT 
                    t.*,
                    hr.id AS history_return_id,
                    hr.old_ticket,
                    hr.date_return,
                    hr.total_return,
                    hr.products_returns,
                    hr.note AS return_note
                FROM ticket t
                LEFT JOIN history_returns hr ON hr.id_ticket = t.id
                WHERE t.key = ?;
            `;

            result = await database.all(query, [ticketCode]);

            return {
                success: true,
                message: "Información del ticket obtenida.",
                data: result
            };

        } else {
            query = `
                SELECT 
                    t.*,
                    hr.id AS history_return_id,
                    hr.old_ticket,
                    hr.date_return,
                    hr.total_return,
                    hr.products_returns,
                    hr.note AS return_note
                FROM "Box".ticket t
                LEFT JOIN "Box".history_returns hr ON hr.id_ticket = t.id
                WHERE t.key = $1;
            `;

            const pgResult = await database.query(query, [ticketCode]);

            return {
                success: true,
                message: "Información del ticket obtenida.",
                data: pgResult.rows
            };
        }

    } catch (error) {
        console.error("Error al obtener información del ticket:", error);
        return { success: false, error: "No se pudo obtener la información del ticket." };
    }
}


router.post('/filter-sales-for-token', isLoggedIn, async (req, res) => {
    //get the information of the user and of the ticket
    const id_branch=req.user.id_branch;
    const id_company=req.user.id_company;
    const {token}=req.body;
    const dataTicket=await search_tickets_by_token(id_branch, token)
    return res.json({
      dataTicket
    });
});


router.post('/update_ticket', isLoggedIn, async (req, res) => {
    let flag=false;
    //get the information of the user and of the ticket
    const id_branch=req.user.id_branch;
    const id_company=req.user.id_company;
    const id_employee=req.user.id_employee;
    const {dataTicket, tokenTicket}=req.body;

    //first we will get the old information of the ticket
    const dataTicketOld=await get_ticket_by_branch_and_key(id_branch, tokenTicket);
    if(dataTicketOld){
        //update the information of ticket for change the variable 'current_ticket'
        const idTicket=await update_current_ticket(tokenTicket,id_branch,dataTicket.newTicket);
        if(idTicket){
          //now we will save this change in the history of the ticket.
          await save_ticket_return_history(id_employee, idTicket, dataTicketOld.current_ticket, dataTicket.returnedProducts, dataTicket.totalReturn, dataTicket.note);

          //now we will create a new move in the history for that the move show in the cut box
          const date_move = new Date();
          const move = `Se realizó una devolución del ticket con folio "${tokenTicket}", con un total devuelto de $${dataTicket.totalReturn}. NOTA: ${dataTicket.note}`;
          const newHistoryMove = create_new_history_move(id_branch, id_employee, -dataTicket.totalReturn, move, date_move);
          await add_movement_history(newHistoryMove);

          //now we will return the product in the inventory if the product use inventory
          for(var i=0;i<dataTicket.returnedProducts.length;i++){
            const product=dataTicket.returnedProducts[i]
            const suppliesCombo=await search_supplies_combo(product.id_dishes_and_combos);
            const itemReturn=product.quantityReturned; //this is the cant that the user return


            //her we will read all the supplies of the combo
            for(var j=0;j<suppliesCombo.length;j++){
              //get the id of the product and the supplies for change the inventory after
              const id_products_and_supplies=suppliesCombo[j].id_products_and_supplies;
              const amount=suppliesCombo[j].amount*itemReturn; //this is the cant that the user return with the combo
              await change_the_inventory(id_branch, id_products_and_supplies, amount) //update the inventory
            }
          }
          flag=true;
        }
    }



    //if we can update all the ticket and save his history, we will return true to the frontend
    if(flag){
      return res.json({
        success: true,
        message: 'Ticket guardado correctamente.',
      });
    }else{
      return res.json({
        success: false,
        message: 'Ocurrio un problema al guardar el Ticket.',
      });
    }
});

async function change_the_inventory(idBranch, idSupplies, quantityToAdd = 0) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const selectQuery = `
        SELECT 
          existence,
          minimum_inventory
        FROM product_and_suppiles_features
        WHERE id_branches = ? AND id_products_and_supplies = ?
      `;
      database.get(selectQuery, [idBranch, idSupplies], (err, row) => {
        if (err) {
          console.error('Error get data supplies features (SQLite):', err);
          return resolve(false);
        }
        if (!row) return resolve(null);

        const newExistence = row.existence + quantityToAdd;

        const updateQuery = `
          UPDATE product_and_suppiles_features
          SET existence = ?
          WHERE id_branches = ? AND id_products_and_supplies = ?
        `;
        database.run(updateQuery, [newExistence, idBranch, idSupplies], (updateErr) => {
          if (updateErr) {
            console.error('Error updating existence (SQLite):', updateErr);
            return resolve(false);
          }
          resolve({ ...row, existence: newExistence });
        });
      });
    });

  } else {
    // PostgreSQL
    const selectQuery = `
      SELECT 
        existence,
        minimum_inventory
      FROM "Inventory".product_and_suppiles_features
      WHERE id_branches = $1 AND id_products_and_supplies = $2
    `;
    try {
      const result = await database.query(selectQuery, [idBranch, idSupplies]);
      if (result.rows.length === 0) return null;

      const current = result.rows[0];
      const newExistence = current.existence + quantityToAdd;

      const updateQuery = `
        UPDATE "Inventory".product_and_suppiles_features
        SET existence = $1
        WHERE id_branches = $2 AND id_products_and_supplies = $3
      `;
      await database.query(updateQuery, [newExistence, idBranch, idSupplies]);

      return { ...current, existence: newExistence };

    } catch (error) {
      console.error('Error get/update data supplies features (PostgreSQL):', error);
      return false;
    }
  }
}


async function update_current_ticket(ticketKey, id_branch, newCurrentTicket) {
  const jsonTicket = JSON.stringify(newCurrentTicket);

  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const updateQuery = `
        UPDATE ticket
        SET current_ticket = ?
        WHERE key = ? AND id_branches = ?
      `;

      const selectQuery = `
        SELECT id FROM ticket
        WHERE key = ? AND id_branches = ?
        LIMIT 1
      `;

      database.run(updateQuery, [jsonTicket, ticketKey, id_branch], function (err) {
        if (err) {
          console.error('Error update_current_ticket (SQLite):', err);
          return resolve(null);
        }

        database.get(selectQuery, [ticketKey, id_branch], (err, row) => {
          if (err || !row) {
            console.error('Error fetching ticket ID (SQLite):', err);
            return resolve(null);
          }
          resolve(row.id);
        });
      });
    });
  } else {
    const updateQuery = `
      UPDATE "Box".ticket
      SET current_ticket = $1
      WHERE key = $2 AND id_branches = $3
      RETURNING id
    `;

    try {
      const result = await database.query(updateQuery, [
        jsonTicket,
        ticketKey,
        id_branch,
      ]);

      if (result.rows.length > 0) {
        return result.rows[0].id;
      }

      return null;
    } catch (error) {
      console.error('Error update_current_ticket (PostgreSQL):', error);
      return null;
    }
  }
}

async function save_ticket_return_history(id_employee, id_ticket, old_ticket, products_returns, total_return, note = '') {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        INSERT INTO history_returns 
        (id_employees, id_ticket, old_ticket, products_returns, total_return, note)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      database.run(
        queryText,
        [
          id_employee,
          id_ticket,
          JSON.stringify(old_ticket),
          JSON.stringify(products_returns),
          total_return,
          note
        ],
        function (err) {
          if (err) {
            console.error('Error save_ticket_return_history (SQLite):', err);
            return resolve(false);
          }
          resolve(true);
        }
      );
    });
  } else {
    const queryText = `
      INSERT INTO "Box".history_returns 
      (id_employees, id_ticket, old_ticket, products_returns, total_return, note)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    try {
      await database.query(queryText, [
        id_employee,
        id_ticket,
        JSON.stringify(old_ticket),
        JSON.stringify(products_returns),
        total_return,
        note
      ]);
      return true;
    } catch (error) {
      console.error('Error save_ticket_return_history (PostgreSQL):', error);
      return false;
    }
  }
}


//**history ticket**/
router.get('/view_history_ticket/:token_ticket', isLoggedIn, async (req, res) => {
    const { token_ticket } = req.params;
    const id_branch=req.user.id_branch;
    const id_company=req.user.id_company;

    //we will see if the user not have the permission for this App.
    if (!this_user_have_this_permission(req.user, id_company, id_branch, 'return_ticket')) {
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const dataTicketOld=await get_ticket_by_branch_and_key(id_branch, token_ticket);
    const historyTicket=await get_ticket_return_history_by_ticket_id(dataTicketOld.id);
    const branchFree = await get_data_branch(id_branch);
    res.render('links/returns/history_ticket', {branchFree, dataTicketOld, historyTicket});
});


async function get_ticket_return_history_by_ticket_id(id_ticket) {
  if (!id_ticket) return [];

  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        SELECT id, id_employees, id_ticket, old_ticket, products_returns, total_return, date_return, note
        FROM history_returns
        WHERE id_ticket = ?
        ORDER BY date_return DESC
      `;

      database.all(queryText, [id_ticket], (err, rows) => {
        if (err) {
          console.error('Error get_ticket_return_history_by_ticket_id (SQLite):', err);
          return resolve([]);
        }

        const parsedRows = rows.map(row => ({
          ...row,
          old_ticket: JSON.parse(row.old_ticket),
          products_returns: JSON.parse(row.products_returns)
        }));

        resolve(parsedRows);
      });
    });
  } else {
    const queryText = `
      SELECT id, id_employees, id_ticket, old_ticket, products_returns, total_return, date_return, note
      FROM "Box".history_returns
      WHERE id_ticket = $1
      ORDER BY date_return DESC
    `;
    try {
      const result = await database.query(queryText, [id_ticket]);

      return result.rows.map(row => ({
        ...row,
        old_ticket: JSON.parse(row.old_ticket),
        products_returns: JSON.parse(row.products_returns)
      }));
    } catch (error) {
      console.error('Error get_ticket_return_history_by_ticket_id (PostgreSQL):', error);
      return [];
    }
  }
}

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

function create_new_history_move(id_branches,id_employees, move, comment, date_move){
  return {
    id_branches,
    id_boxes: 0, 
    id_employees,
    move,
    comment,
    date_move
  }
}


//** -----------------------------------------CFDI----------------------------------- */
router.get('/:id_company/:id_branch/tickets-sale', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;

    //we will see if the user not have the permission for this App.
    if (!this_user_have_this_permission(req.user, id_company, id_branch, 'return_ticket')) {
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const tickets=await get_tickets_by_branch(id_branch);
    const branchFree = await get_data_branch(id_branch);
    res.render('links/tickets/viewTickets', {branchFree, tickets});
});

router.get('/:id_company/:id_branch/cfdi', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    res.render('links/tickets/cfdi', {branchFree});
});

router.get('/:token_ticket/view_tickets_sale', isLoggedIn, async (req, res) => {
    const {token_ticket} = req.params;
    const {id_company, id_branch}=req.user;

    //we will see if the user not have the permission for this App.
    if (!this_user_have_this_permission(req.user, id_company, id_branch, 'return_ticket')) {
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const dataTicketOld=await get_ticket_by_branch_and_key(id_branch, token_ticket);
    
    //now we will see if this sale have a customer
    const idCustomer=dataTicketOld.id_customers;
    let dataFacture=null;
    let infoCustomer=[{}]
    let firstDataFacture=null;
    if(idCustomer){
      infoCustomer=await search_customers(idCustomer) //if have save a customer, get the information of the customer
      dataFacture=await get_factures_by_customer(idCustomer)
      firstDataFacture=dataFacture[0]
    }
    else{
      //if the facture not have a customer save, we will show all the facture of the company
      dataFacture=await get_factures_by_company(id_company)
      firstDataFacture=dataFacture[0]
    }


    const branchFree = await get_data_branch(id_branch);
    res.render('links/tickets/viewATickets', {branchFree, dataTicketOld, infoCustomer, dataFacture, firstDataFacture});
});

async function get_factures_by_customer(id_customer) {
    const queryParams = [id_customer];

    if (TYPE_DATABASE === 'mysqlite') {
        const query = `
            SELECT * FROM facture_cfdi WHERE id_customers = ?
        `;
        return new Promise((resolve) => {
            database.all(query, queryParams, (err, rows) => {
                if (err) {
                    console.error('Error consultando facture_cfdi en SQLite:', err);
                    resolve([]);
                } else {
                    resolve(rows);
                }
            });
        });

    } else {
        const query = `
            SELECT * FROM "Company".facture_cfdi WHERE id_customers = $1
        `;
        try {
            const result = await database.query(query, queryParams);
            return result.rows || [];
        } catch (error) {
            console.error('Error consultando facture_cfdi en PostgreSQL:', error);
            return [];
        }
    }
}

async function get_factures_by_company(id_company) {
    const queryParams = [id_company];

    if (TYPE_DATABASE === 'mysqlite') {
        const query = `
            SELECT * FROM facture_cfdi WHERE id_companies = ? LIMIT 20
        `;
        return new Promise((resolve) => {
            database.all(query, queryParams, (err, rows) => {
                if (err) {
                    console.error('Error consultando facture_cfdi en SQLite:', err);
                    resolve([]);
                } else {
                    resolve(rows);
                }
            });
        });

    } else {
        const query = `
            SELECT * FROM "Company".facture_cfdi WHERE id_companies = $1 LIMIT 20
        `;
        try {
            const result = await database.query(query, queryParams);
            return result.rows || [];
        } catch (error) {
            console.error('Error consultando facture_cfdi en PostgreSQL:', error);
            return [];
        }
    }
}


router.get('/:id_company/:id_branch/:token_ticket/view_tickets_sale', isLoggedIn, async (req, res) => {
    const { id_company, id_branch , token_ticket} = req.params;

    //we will see if the user not have the permission for this App.
    if (!this_user_have_this_permission(req.user, id_company, id_branch, 'return_ticket')) {
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const dataTicketOld=await get_ticket_by_branch_and_key(id_branch, token_ticket);
    console.log(dataTicketOld);
    
    //now we will see if this sale have a customer
    const idCustomer=dataTicketOld.id_customers;
    let infoCustomer=[{}]
    if(idCustomer){
      infoCustomer=await search_customers(dataTicketOld.id_customers) //if have save a customer, get the information of the customer
    }
    
    const branchFree = await get_data_branch(id_branch);
    res.render('links/tickets/viewATickets', {branchFree, dataTicketOld, infoCustomer});
});


module.exports = router;