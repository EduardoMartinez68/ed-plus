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

module.exports = router;