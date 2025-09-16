//require
//const router=express.Router();
require('dotenv').config();
const {TYPE_DATABASE}=process.env;
const database = require('../database');
const addDatabase = {}

async function update_company(company, id_company) {
  if (TYPE_DATABASE === 'mysqlite') {
    return await update_company_sqlite(company, id_company);
  } else {
    return await update_company_postgresql(company, id_company);
  }
}

async function update_company_postgresql(company, id_company) {
  const hasLogo = company.path_logo && company.path_logo !== '';
  const values = hasLogo
    ? [
        company.path_logo,
        company.name,
        company.alias,
        company.description,
        company.representative,
        company.ceo,
        company.id_country,
        company.phone,
        company.cell_phone,
        company.email,
        company.num_o,
        company.num_i,
        company.postal_code,
        company.cologne,
        company.city,
        company.streets,
        company.municipality,
        id_company
      ]
    : [
        company.name,
        company.alias,
        company.description,
        company.representative,
        company.ceo,
        company.id_country,
        company.phone,
        company.cell_phone,
        company.email,
        company.num_o,
        company.num_i,
        company.postal_code,
        company.cologne,
        company.city,
        company.streets,
        company.municipality,
        id_company
      ];

  const queryText = hasLogo
    ? `UPDATE "User".companies SET
        path_logo = $1,
        name = $2,
        alias = $3,
        description = $4,
        representative = $5,
        ceo = $6,
        id_country = $7,
        phone = $8,
        cell_phone = $9,
        email_company = $10,
        num_ext = $11,
        num_int = $12,
        postal_code = $13,
        cologne = $14,
        city = $15,
        states = $16,
        municipality = $17
      WHERE id = $18`
    : `UPDATE "User".companies SET
        name = $1,
        alias = $2,
        description = $3,
        representative = $4,
        ceo = $5,
        id_country = $6,
        phone = $7,
        cell_phone = $8,
        email_company = $9,
        num_ext = $10,
        num_int = $11,
        postal_code = $12,
        cologne = $13,
        city = $14,
        states = $15,
        municipality = $16
      WHERE id = $17`;

  try {
    await database.query(queryText, values);
    return true;
  } catch (error) {
    console.error('Error updating company in PostgreSQL:', error);
    return false;
  }
}

function update_company_sqlite(company, id_company) {
  return new Promise((resolve) => {
    const hasLogo = company.path_logo && company.path_logo !== '';
    const values = hasLogo
      ? [
          company.path_logo,
          company.name,
          company.alias,
          company.description,
          company.representative,
          company.ceo,
          company.id_country,
          company.phone,
          company.cell_phone,
          company.email,
          company.num_o,
          company.num_i,
          company.postal_code,
          company.cologne,
          company.city,
          company.streets,
          company.municipality,
          id_company
        ]
      : [
          company.name,
          company.alias,
          company.description,
          company.representative,
          company.ceo,
          company.id_country,
          company.phone,
          company.cell_phone,
          company.email,
          company.num_o,
          company.num_i,
          company.postal_code,
          company.cologne,
          company.city,
          company.streets,
          company.municipality,
          id_company
        ];

    const queryText = hasLogo
      ? `UPDATE "User".companies SET
          path_logo = ?,
          name = ?,
          alias = ?,
          description = ?,
          representative = ?,
          ceo = ?,
          id_country = ?,
          phone = ?,
          cell_phone = ?,
          email_company = ?,
          num_ext = ?,
          num_int = ?,
          postal_code = ?,
          cologne = ?,
          city = ?,
          states = ?,
          municipality = ?
        WHERE id = ?`
      : `UPDATE companies SET
          name = ?,
          alias = ?,
          description = ?,
          representative = ?,
          ceo = ?,
          id_country = ?,
          phone = ?,
          cell_phone = ?,
          email_company = ?,
          num_ext = ?,
          num_int = ?,
          postal_code = ?,
          cologne = ?,
          city = ?,
          states = ?,
          municipality = ?
        WHERE id = ?`;

    database.run(queryText, values, function (err) {
      if (err) {
        console.error('Error updating company in SQLite:', err);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}


function get_query_edit_company(company,id_company) {
    if (company.path_logo == "") {
        var queryText = `UPDATE "User".companies SET name='${company.name}', alias='${company.alias}', description='${company.description}', 
        representative='${company.representative}', ceo='${company.ceo}', id_country='${company.id_country}', phone='${company.phone}', 
        cell_phone='${company.cell_phone}', email_company='${company.email}', num_ext='${company.num_o}', 
        num_int='${company.num_i}', postal_code='${company.postal_code}', cologne='${company.cologne}', city='${company.city}', 
        states='${company.streets}', municipality='${company.municipality}' WHERE id='${id_company}'`;

        return queryText;
    }
    else {
        var queryText = `UPDATE "User".companies SET path_logo= '${company.path_logo}', name='${company.name}', alias='${company.alias}', description='${company.description}', 
        representative='${company.representative}', ceo='${company.ceo}', id_country='${company.id_country}', phone='${company.phone}', 
        cell_phone='${company.cell_phone}', email_company='${company.email}', num_ext='${company.num_o}', 
        num_int='${company.num_i}', postal_code='${company.postal_code}', cologne='${company.cologne}', city='${company.city}', 
        states='${company.streets}', municipality='${company.municipality}' WHERE id='${id_company}'`;

        return queryText;
    }
}


function get_query_edit_supplies_company(supplies) {
    //this code is for load a new image 
    var queryText = `UPDATE "Kitchen".products_and_supplies SET barcode= '${supplies.barcode}', name='${supplies.name}', description='${supplies.description}', 
    use_inventory='${supplies.use_inventory}'`;

    return queryText;
}

async function update_combo(idCombo, combo) {
  if (TYPE_DATABASE === 'mysqlite') {
    return await update_combo_sqlite(idCombo, combo);
  } else {
    return await update_combo_postgresql(idCombo, combo);
  }
}


function get_query_edit_combo_company(idCombo,combo) {
    if (combo.path_image == "") {
        var queryText = `UPDATE "Kitchen".dishes_and_combos SET name='${combo.name}', barcode='${combo.barcode}', description='${combo.description}', 
        id_product_department='${combo.id_product_department}', id_product_category='${combo.id_product_category}' WHERE id=${idCombo}`;

        return queryText;
    }
    else {
        var queryText = `UPDATE "Kitchen".dishes_and_combos SET img='${combo.path_image}', name='${combo.name}', barcode='${combo.alias}', description='${combo.description}', 
        id_product_department='${combo.id_product_department}', id_product_category='${combo.id_product_category}' WHERE id=${idCombo}`;

        return queryText;
    }
}

async function update_combo_postgresql(idCombo, combo) {
  const hasImage = combo.path_image && combo.path_image !== '';
  const values = hasImage
    ? [
        combo.path_image,
        combo.name,
        combo.barcode,   // corregí que en tu original estaba combo.alias en el UPDATE de barcode, ¿es correcto? Aquí uso barcode
        combo.description,
        combo.id_product_department,
        combo.id_product_category,
        idCombo
      ]
    : [
        combo.name,
        combo.barcode,
        combo.description,
        combo.id_product_department,
        combo.id_product_category,
        idCombo
      ];

  const queryText = hasImage
    ? `UPDATE "Kitchen".dishes_and_combos SET
        img = $1,
        name = $2,
        barcode = $3,
        description = $4,
        id_product_department = $5,
        id_product_category = $6
      WHERE id = $7`
    : `UPDATE "Kitchen".dishes_and_combos SET
        name = $1,
        barcode = $2,
        description = $3,
        id_product_department = $4,
        id_product_category = $5
      WHERE id = $6`;

  try {
    await database.query(queryText, values);
    return true;
  } catch (error) {
    console.error('Error updating combo in PostgreSQL:', error);
    return false;
  }
}

function update_combo_sqlite(idCombo, combo) {
  return new Promise((resolve) => {
    const hasImage = combo.path_image && combo.path_image !== '';
    const values = hasImage
      ? [
          combo.path_image,
          combo.name,
          combo.barcode,  // igual aquí uso barcode
          combo.description,
          combo.id_product_department,
          combo.id_product_category,
          idCombo
        ]
      : [
          combo.name,
          combo.barcode,
          combo.description,
          combo.id_product_department,
          combo.id_product_category,
          idCombo
        ];

    const queryText = hasImage
      ? `UPDATE "Kitchen".dishes_and_combos SET
          img = ?,
          name = ?,
          barcode = ?,
          description = ?,
          id_product_department = ?,
          id_product_category = ?
        WHERE id = ?`
      : `UPDATE "Kitchen".dishes_and_combos SET
          name = ?,
          barcode = ?,
          description = ?,
          id_product_department = ?,
          id_product_category = ?
        WHERE id = ?`;

    database.run(queryText, values, function (err) {
      if (err) {
        console.error('Error updating combo in SQLite:', err);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}


async function update_branch(id_branch, branch) {
  if (TYPE_DATABASE === 'mysqlite') {
    // SQLite usa signos de interrogación (?) para parámetros
    const queryText = `
      UPDATE branches 
      SET 
          name_branch = ?,
          alias = ?,
          representative = ?,
          id_country = ?,
          municipality = ?,
          city = ?,
          cologne = ?,
          address = ?,
          num_ext = ?,
          num_int = ?,
          postal_code = ?,
          email_branch = ?,
          cell_phone = ?,
          phone = ?,
          token_uber = ?
      WHERE id = ?
    `;

    const values = [
      branch.name,
      branch.alias,
      branch.representative,
      branch.country,
      branch.municipality,
      branch.city,
      branch.cologne,
      branch.street,
      branch.num_o,
      branch.num_i,
      branch.postal_code,
      branch.email,
      branch.cell_phone,
      branch.phone,
      branch.token_uber_eat,
      id_branch,
    ];

    return new Promise((resolve) => {
      database.run(queryText, values, function (err) {
        if (err) {
          console.error('Error updating branch in SQLite:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } else {
    // PostgreSQL usa $1, $2, ... para parámetros
    const queryText = `
      UPDATE "Company".branches 
      SET 
          name_branch = $1,
          alias = $2,
          representative = $3,
          id_country = $4,
          municipality = $5,
          city = $6,
          cologne = $7,
          address = $8,
          num_ext = $9,
          num_int = $10,
          postal_code = $11,
          email_branch = $12,
          cell_phone = $13,
          phone = $14,
          token_uber = $15
      WHERE id = $16
    `;

    const values = [
      branch.name,
      branch.alias,
      branch.representative,
      branch.country,
      branch.municipality,
      branch.city,
      branch.cologne,
      branch.street,
      branch.num_o,
      branch.num_i,
      branch.postal_code,
      branch.email,
      branch.cell_phone,
      branch.phone,
      branch.token_uber_eat,
      id_branch,
    ];

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error updating branch in PostgreSQL:', error);
      return false;
    }
  }
}


async function update_token_rappi_branch(id_branch, token_rappi) {
    var queryText = `
        UPDATE "Company".branches 
        SET 
            token_rappi=$1
        WHERE 
            id=$2
    `;

    const values = [
        id_branch
    ];

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error update :', error);
        return false;
    }
}

async function update_token_uber_eat_branch(id_branch, token_uber) {
    var queryText = `
        UPDATE "Company".branches 
        SET 
            token_uber=$1
        WHERE 
            id=$2
    `;

    const values = [
        id_branch
    ];

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error update :', error);
        return false;
    }
}

async function update_customer(customerId, newCustomer) {
  // Mapeo entre las columnas de la tabla y los valores en newCustomer
  const columnMapping = {
    id_companies: newCustomer.id_company,
    first_name: newCustomer.firstName,
    second_name: newCustomer.secondName,
    last_name: newCustomer.lastName,
    id_country: newCustomer.country,
    states: newCustomer.states,
    city: newCustomer.city,
    street: newCustomer.street,
    num_ext: newCustomer.num_o,
    num_int: newCustomer.num_i,
    postal_code: newCustomer.postal_code,
    email: newCustomer.email,
    phone: newCustomer.phone,
    cell_phone: newCustomer.cellPhone,
    birthday: newCustomer.birthday,
    company_name: newCustomer.company_name,
    company_address: newCustomer.company_address,
    website: newCustomer.website,
    contact_name: newCustomer.contact_name,
    company_cellphone: newCustomer.company_cellphone,
    company_phone: newCustomer.company_phone,
    type_customer: newCustomer.userType
  };

  const fields = Object.keys(columnMapping);       // ['id_companies', 'first_name', ...]
  const values = Object.values(columnMapping);     // ['1', 'customer 1', ...]

  if (TYPE_DATABASE === 'mysqlite') {
    // SQLite usa ? como placeholders
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const queryText = `
      UPDATE customers
      SET ${setClause}
      WHERE id = ?
    `;

    return new Promise((resolve) => {
      database.run(queryText, [...values, customerId], function (err) {
        if (err) {
          console.error('Error updating customer in SQLite:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

  } else {
    // PostgreSQL usa $1, $2, etc.
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const queryText = `
      UPDATE "Company".customers
      SET ${setClause}
      WHERE id = $${fields.length + 1}
    `;

    try {
      await database.query(queryText, [...values, customerId]);
      return true;
    } catch (error) {
      console.error('Error updating customer in PostgreSQL:', error);
      return false;
    }
  }
}



async function update_role_employee(idRoleEmployee, newRole) {
  const keys = Object.keys(newRole);
  const values = Object.values(newRole);

  if (TYPE_DATABASE === 'mysqlite') {
    // SQLite uses ? placeholders and positional parameters
    // Build SET clause like: "field1 = ?, field2 = ?, ..."
    const setClause = keys.map(key => `${key} = ?`).join(', ');

    // Add idRoleEmployee as last parameter for WHERE clause
    values.push(idRoleEmployee);

    const queryText = `
      UPDATE roles_employees
      SET ${setClause}
      WHERE id = ?
    `;

    return new Promise((resolve) => {
      database.run(queryText, values, function (err) {
        if (err) {
          console.error('Error updating roles_employees in SQLite:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

  } else {
    // PostgreSQL uses $1, $2, ... placeholders
    // Build SET clause with positional parameters $1, $2, ...
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    // Add idRoleEmployee at the end for WHERE
    values.push(idRoleEmployee);

    const queryText = `
      UPDATE "Employee".roles_employees
      SET ${setClause}
      WHERE id = $${values.length}
    `;

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error updating roles_employees in PostgreSQL:', error);
      return false;
    }
  }
}


async function update_role_employee2(idRoleEmployee, newRole){
    var queryText = `
    UPDATE "Employee".roles_employees
    SET 
        id_companies=$1,
        name_role=$2,
        salary=$3,
        currency=$4,
        type_of_salary=$5,
        commissions=$6,
        discount_for_product=$7,
        add_box=$8,
        edit_box=$9,
        delete_box=$10,
        create_reservation=$11,
        view_reservation=$12,
        view_reports=$13,
        add_customer=$14,
        edit_customer=$15,
        delete_customer=$16,
        cancel_debt=$17,
        offer_loan=$18,
        get_fertilizer=$19,
        view_customer_credits=$20,
        send_email=$21,
        add_employee=$22,
        edit_employee=$23,
        delete_employee=$24,
        create_schedule=$25,
        assign_schedule=$26,
        view_schedule=$27,
        create_type_user=$28,
        create_employee_department=$29,
        view_sale_history=$30,
        delete_sale_history=$31,
        view_movement_history=$32,
        delete_movement_history=$33,
        view_supplies=$34,
        add_supplies=$35,
        edit_supplies=$36,
        delete_supplies=$37,
        view_products=$38,
        edit_products=$39,
        delete_products=$40,
        view_combo=$41,
        add_combo=$42,
        edit_combo=$43,
        delete_combo=$44,
        view_food_departament=$45,
        add_food_departament=$46,
        edit_food_departament=$47,
        delete_food_departament=$48,
        view_food_category=$49,
        add_food_category=$50,
        edit_food_category=$51,
        delete_food_category=$52,
        waste_report=$53,
        add_provider=$54,
        edit_provider=$55,
        delete_provider=$56,
        view_provider=$57,
        sell=$58,
        apply_discount=$59,
        apply_returns=$60,
        add_offers=$61,
        edit_offers=$62,
        delete_offers=$63,
        change_coins=$64,
        modify_hardware=$65,
        modify_hardware_kitchen=$66,
        give_permissions=$67,
        app_point_sales=$68,
        view_inventory=$69,
        edit_inventory=$70,


        edit_employee_department=$71,
        delete_employee_department=$72,
        edit_rol_employee=$73,
        delete_rol_employee=$74,
        employee_roles=$75,
        employee_department=$76,
        view_employee=$77
        WHERE 
            id=$78
    `;

    var values = Object.values(newRole);
    values.push(idRoleEmployee);

    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating role_employee:', error);
        return false;
    }
}

// Returns the PostgreSQL query text with placeholders $1, $2, ...
function get_query_edit_user_postgresql(dataUser) {
  if (dataUser.image === "") {
    return `
      UPDATE "Fud".users
      SET 
        user_name=$1,
        email=$2,
        first_name=$3,
        second_name=$4,
        last_name=$5,
        rol_user=$6
      WHERE 
        id=$7
    `;
  } else {
    return `
      UPDATE "Fud".users
      SET 
        photo=$1,
        user_name=$2,
        email=$3,
        first_name=$4,
        second_name=$5,
        last_name=$6,
        rol_user=$7
      WHERE 
        id=$8
    `;
  }
}

// Returns the SQLite query text with ? placeholders
function get_query_edit_user_sqlite(dataUser) {
  if (dataUser.image === "") {
    return `
      UPDATE users
      SET 
        user_name = ?,
        email = ?,
        first_name = ?,
        second_name = ?,
        last_name = ?,
        rol_user = ?
      WHERE 
        id = ?
    `;
  } else {
    return `
      UPDATE users
      SET 
        photo = ?,
        user_name = ?,
        email = ?,
        first_name = ?,
        second_name = ?,
        last_name = ?,
        rol_user = ?
      WHERE 
        id = ?
    `;
  }
}

async function update_user(idUser, dataUser) {
  let queryText;
  let values = Object.values(dataUser);

  if (TYPE_DATABASE === "mysqlite") {
    queryText = get_query_edit_user_sqlite(dataUser);

    if (dataUser.image === "") {
      // Remove photo from values array if image is empty
      values.splice(0, 1);
    }

    // Add idUser as last parameter
    values.push(idUser);

    // Return a Promise since sqlite uses callbacks
    return new Promise((resolve) => {
      database.run(queryText, values, function (err) {
        if (err) {
          console.error("Error updating user in SQLite:", err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

  } else {
    // PostgreSQL
    queryText = get_query_edit_user_postgresql(dataUser);

    if (dataUser.image === "") {
      values.splice(0, 1);
    }

    values.push(idUser);

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error("Error updating user in PostgreSQL:", error);
      return false;
    }
  }
}


async function update_employee(idEmployee, dataEmployee) {
  let queryText;
  let values = Object.values(dataEmployee);
  values.push(idEmployee);

  if (TYPE_DATABASE === "mysqlite") {
    // SQLite uses ? placeholders
    queryText = `
      UPDATE employees
      SET 
          id_roles_employees = ?,
          id_departments_employees = ?,
          id_branches = ?,
          id_country = ?,
          city = ?,
          street = ?,
          num_int = ?,
          num_ext = ?,
          phone = ?,
          cell_phone = ?
      WHERE 
          id_users = ?
    `;

    // SQLite's run method uses callbacks
    return new Promise((resolve) => {
      database.run(queryText, values, function (err) {
        if (err) {
          console.error("Error updating employee in SQLite:", err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

  } else {
    // PostgreSQL uses $1, $2, ... placeholders
    queryText = `
      UPDATE "Company".employees
      SET 
          id_roles_employees = $1,
          id_departments_employees = $2,
          id_branches = $3,
          id_country = $4,
          city = $5,
          street = $6,
          num_int = $7,
          num_ext = $8,
          phone = $9,
          cell_phone = $10
      WHERE 
          id_users = $11
    `;

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error("Error updating employee in PostgreSQL:", error);
      return false;
    }
  }
}


async function update_provider_company(idProvider, dataProvider) {
  let queryText;
  let values = Object.values(dataProvider);
  values.push(idProvider);

  if (TYPE_DATABASE === "mysqlite") {
    // SQLite placeholders son '?'
    queryText = `
      UPDATE providers
      SET
          id_branches = ?,
          name = ?,
          representative = ?,
          email = ?,
          website = ?,
          rfc = ?,
          curp = ?,
          phone = ?,
          cell_phone = ?,
          credit_limit = ?,
          credit_days = ?,
          category = ?,
          comment = ?,
          type = ?,
          business_name = ?,
          business_representative = ?,
          business_curp = ?,
          business_rfc = ?,
          business_phone = ?,
          business_cell_phone = ?,
          business_address = ?,
          business_postal_code = ?
      WHERE
          id = ?
    `;

    // SQLite uses callback style, convert to Promise
    return new Promise((resolve) => {
      database.run(queryText, values, function (err) {
        if (err) {
          console.error('Error updating provider in SQLite:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

  } else {
    // PostgreSQL placeholders $1, $2, ...
    queryText = `
      UPDATE "Branch".providers
      SET 
          id_branches=$1, name=$2, representative=$3, email=$4, website=$5, rfc=$6, curp=$7, phone=$8, cell_phone=$9, credit_limit=$10, credit_days=$11, category=$12, comment=$13, type=$14, business_name=$15, business_representative=$16, business_curp=$17, business_rfc=$18, business_phone=$19, business_cell_phone=$20, business_address=$21, business_postal_code=$22
      WHERE 
          id=$23
    `;

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error updating provider in PostgreSQL:', error);
      return false;
    }
  }
}

async function update_supplies_branch(supplies) {
  let queryText;
  let values = Object.values(supplies);

  if (TYPE_DATABASE === "mysqlite") {
    // SQLite uses '?' placeholders
    queryText = `
      UPDATE product_and_suppiles_features
      SET 
          purchase_amount = ?,
          purchase_unity = ?,
          purchase_price = ?,
          currency_purchase = ?,
          sale_amount = ?,
          sale_unity = ?,
          sale_price = ?,
          currency_sale = ?,
          max_inventary = ?,
          minimum_inventory = ?,
          unit_inventory = ?,
          existence = ?
      WHERE 
          id = ?
    `;

    return new Promise((resolve) => {
      database.run(queryText, values, function(err) {
        if (err) {
          console.error('Error updating supplies in SQLite:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

  } else {
    // PostgreSQL uses $1, $2, ... placeholders
    queryText = `
      UPDATE "Inventory".product_and_suppiles_features
      SET 
          purchase_amount=$1,
          purchase_unity=$2,
          purchase_price=$3,
          currency_purchase=$4,
          sale_amount=$5,
          sale_unity=$6,
          sale_price=$7,
          currency_sale=$8,
          max_inventary=$9,
          minimum_inventory=$10,
          unit_inventory=$11,
          existence=$12
      WHERE 
          id=$13
    `;

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error updating supplies in PostgreSQL:', error);
      return false;
    }
  }
}

async function update_combo_branch(combo) {
  let queryText;
  let values = Object.values(combo);

  if (TYPE_DATABASE === "mysqlite") {
    // SQLite placeholders: '?'
    queryText = `
      UPDATE dish_and_combo_features
      SET 
          favorites = ?,
          price_1 = ?,
          revenue_1 = ?,
          price_2 = ?,
          revenue_2 = ?,
          price_3 = ?,
          revenue_3 = ?,
          sat_key = ?
      WHERE 
          id = ?
    `;

    return new Promise((resolve) => {
      database.run(queryText, values, function(err) {
        if (err) {
          console.error('Error updating combo in SQLite:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

  } else {
    // PostgreSQL placeholders: $1, $2, ...
    queryText = `
      UPDATE "Inventory".dish_and_combo_features
      SET 
          favorites=$1,
          price_1=$2,
          revenue_1=$3,
          price_2=$4,
          revenue_2=$5,
          price_3=$6,
          revenue_3=$7,
          sat_key=$8
      WHERE 
          id=$9
    `;

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error updating combo in PostgreSQL:', error);
      return false;
    }
  }
}


async function update_subscription_branch(idSubscription, idBranch) {
  if (TYPE_DATABASE === 'mysqlite') {
    const queryText = `UPDATE subscription SET id_branches = ? WHERE id = ?`;
    const values = [idBranch, idSubscription];

    return new Promise((resolve) => {
      database.run(queryText, values, function (err) {
        if (err) {
          console.error('Error updating subscription in SQLite:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } else {
    // PostgreSQL
    const queryText = `
      UPDATE "User".subscription
      SET id_branches = $1
      WHERE id = $2
    `;
    const values = [idBranch, idSubscription];

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error updating subscription in PostgreSQL:', error);
      return false;
    }
  }
}



module.exports = {
    update_company,
    get_query_edit_supplies_company,
    update_combo,
    update_branch,
    update_customer,
    update_role_employee,
    update_user,
    update_employee,
    update_provider_company,
    update_supplies_branch,
    update_combo_branch,
    update_subscription_branch,
    update_token_uber_eat_branch,
    update_token_rappi_branch
};