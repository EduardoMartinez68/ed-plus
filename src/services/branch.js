const database = require('../database');
const addDatabase = require('../router/addDatabase');
require('dotenv').config();
const {TYPE_DATABASE}=process.env;
const rolFree=0
//functions branch
const {
    get_all_apps_of_this_company
} = require('./apps');

async function delete_branch_company(idBranch) {
    try {
        var queryText = 'DELETE FROM "Company".branches WHERE id = $1';
        var values = [idBranch];
        await database.query(queryText, values); // Delete branch
        return true;
    } catch (error) {
        console.error('Error to delete branch:', error);
        return false;
    }
}

async function get_branch(req) {
  const { idBranch } = req.params;
  let queryText;
  let values = [idBranch];

  if (TYPE_DATABASE === "mysqlite") {
    // SQLite query with ? placeholder and no schema prefix
    queryText = `SELECT * FROM branches WHERE id = ?`;

    return new Promise((resolve, reject) => {
      database.all(queryText, values, (err, rows) => {
        if (err) {
          console.error('Error fetching branch from SQLite:', err);
          resolve(null);
        } else {
          resolve(rows);
        }
      });
    });

  } else {
    // PostgreSQL query with schema and $1 placeholder
    queryText = `SELECT * FROM "Company".branches WHERE id = $1`;

    try {
      const result = await database.query(queryText, values);
      return result.rows;
    } catch (error) {
      console.error('Error fetching branch from PostgreSQL:', error);
      return null;
    }
  }
}


async function search_all_branch(id_company) {
  try {
    if (TYPE_DATABASE === "mysqlite") {
      // SQLite version: no schemas, use ? placeholders, table names without quotes
      const queryText = `
        SELECT branches.*, country.name AS country_name
        FROM branches
        INNER JOIN country ON branches.id_country = country.id
        WHERE branches.id_companies = ?
      `;
      return await new Promise((resolve, reject) => {
        database.all(queryText, [id_company], (err, rows) => {
          if (err) {
            console.error('Error searching branches in SQLite:', err);
            resolve([]);
          } else {
            resolve(rows);
          }
        });
      });
    } else {
      // PostgreSQL version: with schema, $1 placeholder
      const queryText = `
        SELECT branches.*, country.name AS country_name
        FROM "Company".branches
        INNER JOIN "Fud".country ON branches.id_country = country.id
        WHERE branches.id_companies = $1
      `;
      const values = [id_company];
      const result = await database.query(queryText, values);
      return result.rows;
    }
  } catch (error) {
    console.error('Error searching branches:', error);
    return [];
  }
}


async function get_data_branch_view_manager(id_branch) {
  let queryText;
  const values = [id_branch];

  if (TYPE_DATABASE === "mysqlite") {
    // SQLite: no schema, use ? placeholder
    queryText = `SELECT * FROM branches WHERE id = ?`;
    
    return new Promise((resolve, reject) => {
      database.all(queryText, values, (err, rows) => {
        if (err) {
          console.error('Error fetching branch data from SQLite:', err);
          resolve(null);
        } else {
          resolve(rows);
        }
      });
    });

  } else {
    // PostgreSQL: schema with $1 placeholder
    queryText = `SELECT * FROM "Company".branches WHERE id = $1`;

    try {
      const result = await database.query(queryText, values);
      return result.rows;
    } catch (error) {
      console.error('Error fetching branch data from PostgreSQL:', error);
      return null;
    }
  }
}


async function get_data_branch(id_branch) {
  // Handle case when id_branch is an object containing user info
  try {
    const newIdBranch = id_branch.user?.id_branch;
    if (newIdBranch) {
      id_branch = newIdBranch;
    }
  } catch (error) {
    // silently ignore error
  }

  let queryText;
  let values = [id_branch];
  let data;

  if (TYPE_DATABASE === "mysqlite") {
    // SQLite query: no schema, ? placeholder
    queryText = `SELECT * FROM branches WHERE id = ?`;

    data = await new Promise((resolve, reject) => {
      database.all(queryText, values, (err, rows) => {
        if (err) {
          console.error('Error fetching branch data from SQLite:', err);
          resolve(null);
        } else {
          resolve(rows);
        }
      });
    });
  } else {
    // PostgreSQL query with schema and $1 placeholder
    queryText = `SELECT * FROM "Company".branches WHERE id = $1`;

    try {
      const result = await database.query(queryText, values);
      data = result.rows;
    } catch (error) {
      console.error('Error fetching branch data from PostgreSQL:', error);
      return null;
    }
  }

  if (!data || data.length === 0) return null;

  // Fetch all apps of this company and add to branch info
  const apps = await get_all_apps_of_this_company(data[0].id_companies, data[0].id);
  data[0].apps = apps;

  return data;
}


async function get_id_branch(id_company){
    var queryText = 'SELECT * FROM "Company".branches Where id_companies= $1';
    var values = [parseInt(req.user.id)];
    const result = await database.query(queryText, values);
    const branches = result.rows;
    if(branches.length>1){

    }else{

    }
}

async function get_pack_branch(id_branch) {
  try {
    if (TYPE_DATABASE === "mysqlite") {
      const queryText = `
        SELECT pack_database
        FROM branches
        WHERE id = ?
      `;
      return await new Promise((resolve) => {
        database.get(queryText, [id_branch], (err, row) => {
          if (err) {
            console.error('Error getting pack_database from SQLite:', err);
            resolve(null);
          } else {
            resolve(row ? row.pack_database : null);
          }
        });
      });
    } else {
      // PostgreSQL
      const queryText = `
        SELECT pack_database
        FROM "Company".branches
        WHERE id = $1
      `;
      const { rows } = await database.query(queryText, [id_branch]);
      if (rows.length > 0) {
        return rows[0].pack_database;
      } else {
        return null;
      }
    }
  } catch (error) {
    console.error('Error getting pack_database:', error);
    return 0;
  }
}


async function get_all_box_of_the_branch_with_his_id(id_branch) {
  try {
    if (TYPE_DATABASE === "mysqlite") {
      // SQLite version: no schema support, adjust table and join accordingly
      const queryText = `
        SELECT b.*, br.id_companies
        FROM boxes b
        JOIN branches br ON b.id_branches = br.id
        WHERE b.id_branches = ?
      `;
      return await new Promise((resolve, reject) => {
        database.all(queryText, [id_branch], (err, rows) => {
          if (err) {
            console.error('Error getting boxes from SQLite:', err);
            resolve([]);
          } else {
            resolve(rows);
          }
        });
      });
    } else {
      // PostgreSQL version
      const queryText = `
        SELECT b.*, br.id_companies
        FROM "Branch".boxes b
        JOIN "Company".branches br ON b.id_branches = br.id
        WHERE b.id_branches = $1
      `;
      const values = [id_branch];
      const result = await database.query(queryText, values);
      return result.rows;
    }
  } catch (error) {
    console.error('Error getting boxes:', error);
    return [];
  }
}


module.exports = {
    delete_branch_company,
    get_branch,
    search_all_branch,
    get_data_branch_view_manager,
    get_data_branch,
    get_id_branch,
    get_pack_branch,
    get_all_box_of_the_branch_with_his_id
};