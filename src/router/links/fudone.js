const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
const database = require('../../database');
const helpers=require('../../lib/helpers.js');
require('dotenv').config();
const {TYPE_DATABASE}=process.env;
/**----------------------functions-----------------*/
//functions branch
const {
    get_data_branch,
    get_branch
} = require('../../services/branch');


//functions image
const {
    get_path_img,
    delate_image_upload,
    upload_image_to_space,
    delete_image_from_space,
    create_a_new_image,
    delate_image
} = require('../../services/connectionWithDatabaseImage');

//functions supplies
const {
    get_supplies_or_features,
    get_supplies_with_id,
    update_supplies_company,
    get_new_data_supplies_company,
    delate_supplies_company,
    this_is_a_supplies_or_a_products,
    search_company_supplies_or_products_with_company,
    search_company_supplies_or_products_with_id_company,
    search_company_supplies_or_products,
    update_product_category,
    get_supplies_or_features_with_id_products_and_supplies,
    delete_supplies_or_product_of_the_branch,
    delete_dishes_or_combo_of_the_branch,
    get_inventory_products_branch,
    get_inventory_supplies_branch
} = require('../../services/supplies');


//functions branch
const {
    get_combo_features,
    search_supplies_combo,
    search_combo,
    delate_combo_company,
    get_data_combo_factures,
    get_all_price_supplies_branch,
    delete_all_supplies_combo
} = require('../../services/combos');

//functions branch
const {
    get_data_tabla_with_id_company,
    get_pack_database,
    check_company_other,
    get_data_company_with_id
} = require('../../services/company');

//functions supplies
const {
    get_country,
    get_type_employees,
    get_data_employee,
    search_employee,
    search_employee_with_username
} = require('../../services/employees');

const {
    get_category,
    delate_product_category
} = require('../../services/foodCategory');

const {
    get_department,
    update_product_department,
    delate_product_department
} = require('../../services/foodDepartment');


//functions providers
const {
    search_providers,
    search_all_providers,
    search_providers_for_name,
    search_all_providers_for_name,
    search_provider,
    delete_provider
} = require('../../services/providers');

//functions permission
const {
    this_user_have_this_permission
} = require('../../services/permission');



const rolFree=0;


/*
*----------------------permission-----------------*/
router.get('/:id_company/:id_branch/permission_denied', isLoggedIn, async (req, res) => {
    const {id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);
    res.render('links/web/permission_denied',{branchFree});
});

router.post('/this_user_is_admin', isLoggedIn, async (req, res) => {
    const { username, password, permission } = req.body;

    if (!username || !password || !permission) {
        return res.status(400).json({ isAuthorized: false, message: 'Faltan datos' });
    }

    try {
        const dataUserArr = await search_employee_with_username(username);
        if (dataUserArr.length === 0) {
            return res.status(404).json({ isAuthorized: false, message: 'Usuario no encontrado' });
        }

        const dataUser = dataUserArr[0];

        const passwordMatch = await helpers.matchPassword(password.trim(), dataUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ isAuthorized: false, message: 'Contraseña incorrecta' });
        }

        if (!dataUser.hasOwnProperty(permission)) {
            return res.status(403).json({ isAuthorized: false, message: `El permiso "${permission}" no existe` });
        }

        if (!dataUser[permission]) {
            return res.status(403).json({ isAuthorized: false, message: `No tienes el permiso "${permission}"` });
        }

        return res.status(200).json({ isAuthorized: true });
    } catch (err) {
        console.error('Error al verificar permisos del admin:', err);
        return res.status(500).json({ isAuthorized: false, message: 'Error interno del servidor', error: err });
    }
    
});


/*
*----------------------router-----------------*/

router.get('/:id_user/:id_company/:id_branch/my-store', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'can_sales')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const branchFree = await get_data_branch(req);
    const employee = await get_data_employee(req);
    if (branchFree != null) {
        res.render('links/restaurant/home', { branchFree , employee});
    } else {
        res.render('links/store/branchLost');
    }
});


//------------------------------------employees
router.get('/:id_company/:id_branch/employees-free', isLoggedIn, async (req, res) => {
    
    const { id_company, id_branch } = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'view_employee')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }


    const branchFree = await get_data_branch(req);
    if (branchFree != null) {
        res.render('links/free/employee/employee', { branchFree });
    } else {
        res.render('links/store/branchLost');
    }
});


//------------------------------------supplies
router.get('/:id_company/:id_branch/supplies-free', isLoggedIn, async (req, res) => {
    const {id_company, id_branch} = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'view_supplies')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const branchFree = await get_data_branch(id_branch);
    if (branchFree != null) {
        //const supplies_products = await search_company_supplies_or_products(req, true);
        const supplies = await get_supplies_or_features(id_branch, true)
        res.render('links/free/supplies/supplies', { branchFree, supplies});
    } else {
        res.render('links/store/branchLost');
    }
});


//------------------------------------products
router.get('/:id_company/:id_branch/inventory', isLoggedIn, async (req, res) => {
    const {id_company,id_branch } = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'view_inventory')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const branchFree = await get_data_branch(id_branch);
    const products = await get_inventory_products_branch(id_branch);
    const supplies = await get_inventory_supplies_branch(id_branch);
    res.render('links/free/inventory/inventory', { branchFree, products, supplies});
});

router.post('/:id_branch/update_table_inventory', isLoggedIn, async (req, res) => {
    const {id_branch } = req.params;
    const {barcode}=req.body;
    const products = await get_inventory_products_branch(id_branch,barcode);
    const supplies = await get_inventory_supplies_branch(id_branch,barcode);
    res.json({ products, supplies });
});

router.get('/:id_company/:id_branch/products-free', isLoggedIn, async (req, res) => {
    const {id_company, id_branch } = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'view_products')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const branchFree = await get_data_branch(id_branch);
    

    if (branchFree != null) {
        const combos = await get_combo_features(id_branch,true);
        const labels=await get_all_the_labels(id_company,id_branch);
        res.render('links/free/products/products', { branchFree, combos, labels});
    } else {
        res.render('links/store/branchLost');
    }
});

router.post('/update_table/:id_branch/combos', isLoggedIn, async (req, res) => {
    const { barcode , is_a_product} = req.body;
    const { id_branch } = req.params;

    if (!id_branch) {
        return res.status(400).json({ error: 'Branch ID missing' });
    }

    try {
        const combos = await get_combo_features(id_branch, is_a_product, barcode);

        if (!combos || combos.length === 0) {
            return res.status(404).json({ error: 'No combos found' });
        }

        res.json(combos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching combos' });
    }
});

router.get('/:id_company/:id_branch/add-products-free', isLoggedIn, async (req, res) => {
    const {id_company, id_branch } = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'view_products')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const branchFree = await get_data_branch(id_branch);

    //const supplies_products = await search_company_supplies_or_products(req, true);
    const supplies = await get_supplies_or_features(id_branch, false);
    const departments = await get_department(id_company);
    const category = await get_category(id_company);
    res.render('links/free/products/addFormProducts', { branchFree, supplies,departments,category});
});

router.get('/:id_company/:id_branch/upload-products', isLoggedIn, async (req, res) => {
    const {id_company, id_branch } = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'view_products')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const branchFree = await get_data_branch(id_branch);

    res.render('links/free/products/uploadProducts', { branchFree});
});

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

router.get('/download-excel-product', (req, res) => {
    // Datos de ejemplo, que pueden venir de tu base de datos
    const data = [
        { Barcode:'Producto 1e', Producto: 'Producto 1', Description: '', Precio: 10, Cantidad: 5, UsaInventario: 0, EsUnInsumo: 0,MontoDeCompra:0,UnidadDeCompra:'Pza',
            PrecioDeCompra:0,MontoDeVenta:0,UnidadDeVenta:'Pza',InventarioMáximo:0,InventarioMínimo:0,UnidadDeMedida: 'Pza'},
        {Barcode:'Producto 2e', Producto: 'Producto 2', Description: '', Precio: 10, Cantidad: 5, UsaInventario: 0, EsUnInsumo: 0,MontoDeCompra:0,UnidadDeCompra:'kg',
            PrecioDeCompra:0,MontoDeVenta:0,UnidadDeVenta:'kg',InventarioMáximo:0,InventarioMínimo:0,UnidadDeMedida: 'kg'
        },
        { Barcode:'Producto 3e', Producto: 'Producto 3', Description: '', Precio: 10, Cantidad: 5, UsaInventario: 0, EsUnInsumo: 0,MontoDeCompra:0,UnidadDeCompra:'L',
            PrecioDeCompra:0,MontoDeVenta:0,UnidadDeVenta:'L',InventarioMáximo:0,InventarioMínimo:0,UnidadDeMedida: 'L'
        }
    ];

    // Convertir los datos a una hoja de trabajo (workbook)
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');

    // Generar un archivo Excel en memoria
    const filePath = path.join(__dirname, 'products.xlsx');
    XLSX.writeFile(wb, filePath);

    // Enviar el archivo Excel al cliente
    res.download(filePath, 'productos.xlsx', (err) => {
        if (err) {
            console.error('Error al enviar el archivo:', err);
        }
        // Eliminar el archivo después de la descarga
        fs.unlinkSync(filePath);
    });
});

//--this is for edit the data of the combo
router.get('/:id_company/:id_branch/:id_combo_features/edit-products-free', isLoggedIn, async (req, res) => {
    
    const { id_combo_features, id_company, id_branch } = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'edit_products')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    //her we will create the tabla lot if not exist in the database
    await create_table_lot();

    //get all the data of the combo
    const comboFeactures = await get_data_combo_factures(id_combo_features); //this is the data of the combo
    
    //this is for get the supplies of the combo
    const suppliesCombo = await get_all_price_supplies_branch(comboFeactures[0].id_dishes_and_combos, id_branch)

    //her, we will get all the lot that the product have in the database
    const lots=await get_lots_by_dish_and_combo_features(id_combo_features);
    const promotions = await get_all_the_promotions(id_combo_features); //this is the data of the combo
    const departments=await get_department(id_company);
    const category=await get_category(id_company);

    const taxes=await get_all_taxes_by_branch(id_branch);

    //we will see if the user have a suscription free
    if(req.user.rol_user==rolFree){
        const branchFree = await get_data_branch(id_branch); //get data of rol free
        //get the data of the product that is in the combo. This is the information of the product 
        const productFacture=await get_supplies_or_features_with_id_products_and_supplies(suppliesCombo[0].id_products_and_supplies,promotions);
        res.render('links/branch/products/editProduct', { comboFeactures, suppliesCombo , branchFree, productFacture,lots,promotions, departments, category, taxes});      
    }else{
        const branch = await get_data_branch(id_branch);
        res.render('links/branch/products/editProduct', { comboFeactures, suppliesCombo, branch, lots});
    }
})

router.get('/:step/:id_combo_features/next-edit-products-free', isLoggedIn, async (req, res) => {
    const { id_combo_features, step} = req.params; //get the index 
    const { id_company, id_branch } = req.user;
    const newIdComboFacture=await get_next_or_previous_combo_facture(id_branch, id_combo_features, step)
    res.redirect(`/links/${id_company}/${id_branch}/${newIdComboFacture}/edit-products-free`)
})

async function get_next_or_previous_combo_facture(id_branch, id_combo_facture, step) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT id 
        FROM dish_and_combo_features 
        WHERE id_branches = ? 
          AND id ${step > 0 ? '>' : '<'} ? 
        ORDER BY id ${step > 0 ? 'ASC' : 'DESC'} 
        LIMIT 1
      `;
      database.get(query, [id_branch, id_combo_facture], (err, row) => {
        if (err) {
          console.error("❌ Error en get_next_or_previous_combo_facture (SQLite):", err);
          return resolve(null);
        }
        resolve(row ? row.id : null);
      });
    });

  } else {
    try {
      const query = `
        SELECT id 
        FROM "Inventory".dish_and_combo_features 
        WHERE id_branches = $1 
          AND id ${step > 0 ? '>' : '<'} $2 
        ORDER BY id ${step > 0 ? 'ASC' : 'DESC'} 
        LIMIT 1
      `;
      const result = await database.query(query, [id_branch, id_combo_facture]);
      return result.rows.length ? result.rows[0].id : null;
    } catch (err) {
      console.error("❌ Error en get_next_or_previous_combo_facture (PostgreSQL):", err);
      return null;
    }
  }
}


async function get_all_taxes_by_branch(idBranch) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          id,
          id_branches,
          base,
          rate,
          is_retention,
          activate,
          this_taxes_is_in_all,
          name,
          taxId
        FROM taxes_product
        WHERE id_branches = ? AND activate = 1
      `;
      database.all(query, [idBranch], (err, rows) => {
        if (err) {
          console.error('❌ Error en get_all_taxes_by_branch (SQLite):', err);
          return resolve([]);
        }
        resolve(rows || []);
      });
    });
  } else {
    try {
      const query = `
        SELECT 
          id,
          id_branches,
          base,
          rate,
          is_retention,
          activate,
          this_taxes_is_in_all,
          name,
          "taxId"
        FROM "Branch".taxes_product
        WHERE id_branches = $1 AND activate = true
      `;
      const result = await database.query(query, [idBranch]);
      return result.rows || [];
    } catch (error) {
      console.error('❌ Error en get_all_taxes_by_branch (PostgreSQL):', error);
      return [];
    }
  }
}

router.post('/:id_lot/edit-lot-quantity', isLoggedIn, async (req, res) => {
    const { id_lot } = req.params;
    const { newQuantity } = req.body;
    const id_company = req.user.id_company;
    const id_branch = req.user.id_branch;
    const id_employees = req.user.id_employee;

    if (isNaN(newQuantity) || newQuantity < 0) {
        return res.status(400).json({ error: "Cantidad inválida" });
    }

    try {
        let updatedLot;

        if (TYPE_DATABASE === 'mysqlite') {
            const updateQuery = `
                UPDATE lots 
                SET current_existence = ?
                WHERE id = ?;
            `;
            await database.run(updateQuery, [newQuantity, id_lot]);

            const selectQuery = `
                SELECT * FROM lots WHERE id = ?;
            `;
            updatedLot = await database.get(selectQuery, [id_lot]);

            if (!updatedLot) {
                return res.status(404).json({ error: "Lote no encontrado" });
            }
        } else {
            const queryText = `
                UPDATE "Inventory".lots 
                SET current_existence = $1
                WHERE id = $2
                RETURNING *;
            `;
            const result = await database.query(queryText, [newQuantity, id_lot]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Lote no encontrado" });
            }

            updatedLot = result.rows[0];
        }

        await add_move_to_the_history(id_company, id_branch, id_employees, id_lot, newQuantity, 'Venta');

        const id_combo_features = updatedLot.id_dish_and_combo_features;
        if (id_combo_features) {
            await update_existence_use_lot(id_combo_features);
        }

        res.status(201).json({ message: "Lote actualizado con éxito", lot: updatedLot });
    } catch (error) {
        console.error("Error al actualizar el lote:", error);
        res.status(500).json({ error: "Error al actualizar el lote" });
    }
});


router.post('/:id_lot/update-lot-quantity-for-sale', isLoggedIn, async (req, res) => {
    const { id_lot } = req.params;
    const { newQuantity } = req.body;
    const id_company = req.user.id_company;
    const id_branch = req.user.id_branch;
    const id_employees = req.user.id_employee;

    if (isNaN(newQuantity) || newQuantity <= 0) {
        return res.status(400).json({ error: "Cantidad inválida" });
    }

    try {
        let updatedLot;

        if (TYPE_DATABASE === 'mysqlite') {
            // Actualizamos la existencia
            const updateQuery = `
                UPDATE lots 
                SET current_existence = current_existence - ?
                WHERE id = ?;
            `;
            await database.run(updateQuery, [newQuantity, id_lot]);

            // Luego hacemos un SELECT para obtener los datos del lote actualizado
            const selectQuery = `
                SELECT * FROM lots WHERE id = ?;
            `;
            updatedLot = await database.get(selectQuery, [id_lot]);

            if (!updatedLot) {
                return res.status(404).json({ error: "Lote no encontrado" });
            }
        } else {
            const queryText = `
                UPDATE "Inventory".lots 
                SET current_existence = current_existence - $1
                WHERE id = $2
                RETURNING *;
            `;
            const result = await database.query(queryText, [newQuantity, id_lot]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Lote no encontrado" });
            }

            updatedLot = result.rows[0];
        }

        // Guardamos el movimiento en el historial
        await add_move_to_the_history(id_company, id_branch, id_employees, id_lot, newQuantity, 'Venta');

        res.status(201).json({ message: "Lote actualizado con éxito", lot: updatedLot });
    } catch (error) {
        console.error("Error al actualizar el lote:", error);
        res.status(500).json({ error: "Error al actualizar el lote" });
    }
});


async function add_move_to_the_history(id_companies, id_branches, id_employees, id_lots, newCant, type_move) {
    try {
        let insertQuery;
        let result;

        if (TYPE_DATABASE === 'mysqlite') {
            insertQuery = `
                INSERT INTO history_move_lot 
                (id_companies, id_branches, id_employees, id_lots, newCant, type_move) 
                VALUES (?, ?, ?, ?, ?, ?);
            `;

            await database.run(insertQuery, [
                id_companies,
                id_branches,
                id_employees,
                id_lots,
                newCant,
                type_move
            ]);

            // SQLite doesn't support RETURNING *, so we return null for data
            return { success: true, message: "Movimiento agregado con éxito", data: null };

        } else {
            insertQuery = `
                INSERT INTO "Branch".history_move_lot 
                (id_companies, id_branches, id_employees, id_lots, "newCant", type_move) 
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *;
            `;

            result = await database.query(insertQuery, [
                id_companies,
                id_branches,
                id_employees,
                id_lots,
                newCant,
                type_move
            ]);

            return { success: true, message: "Movimiento agregado con éxito", data: result.rows[0] };
        }

    } catch (error) {
        console.error("Error al agregar movimiento al historial:", error);
        return { success: false, error: "Error al agregar movimiento al historial" };
    }
}


async function create_table_lot() {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const queryText = `
                CREATE TABLE IF NOT EXISTS lots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    number_lote TEXT,
                    initial_existence REAL,
                    current_existence REAL NOT NULL,
                    date_of_manufacture TEXT NOT NULL,
                    expiration_date TEXT NOT NULL,
                    id_dish_and_combo_features INTEGER,
                    id_branches INTEGER,
                    id_companies INTEGER,
                    UNIQUE(id),
                    FOREIGN KEY (id_dish_and_combo_features) REFERENCES dish_and_combo_features(id) ON DELETE SET NULL ON UPDATE CASCADE,
                    FOREIGN KEY (id_branches) REFERENCES branches(id) ON DELETE SET NULL ON UPDATE CASCADE,
                    FOREIGN KEY (id_companies) REFERENCES companies(id) ON DELETE SET NULL ON UPDATE CASCADE
                );
            `;
            await database.run(queryText);
        } else {
            // PostgreSQL
            const queryText = `
                CREATE TABLE IF NOT EXISTS "Inventory".lots (
                    id bigserial PRIMARY KEY,
                    number_lote TEXT,
                    initial_existence double precision,
                    current_existence double precision NOT NULL,
                    date_of_manufacture DATE NOT NULL,
                    expiration_date DATE NOT NULL,
                    id_dish_and_combo_features bigint,
                    id_branches bigint,
                    id_companies bigint,
                    CONSTRAINT key_number_lote UNIQUE (id),
                    CONSTRAINT dish_and_combo_features_fk FOREIGN KEY (id_dish_and_combo_features)
                        REFERENCES "Inventory".dish_and_combo_features (id) MATCH FULL
                        ON DELETE SET NULL ON UPDATE CASCADE,
                    CONSTRAINT branches_fk FOREIGN KEY (id_branches)
                        REFERENCES "Company".branches (id) MATCH FULL
                        ON DELETE SET NULL ON UPDATE CASCADE,
                    CONSTRAINT companies_fk FOREIGN KEY (id_companies)
                        REFERENCES "User".companies (id) MATCH FULL
                        ON DELETE SET NULL ON UPDATE CASCADE
                );
            `;
            await database.query(queryText);
        }
        return true;
    } catch (error) {
        console.error('Error creating lots table:', error);
        return false;
    }
}


async function get_lots_by_dish_and_combo_features(idDishAndComboFeatures) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const queryText = `
                SELECT * FROM lots
                WHERE id_dish_and_combo_features = ?
                ORDER BY expiration_date ASC;
            `;
            // En SQLite usamos database.all para obtener todas las filas
            const rows = await new Promise((resolve, reject) => {
                database.all(queryText, [idDishAndComboFeatures], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
            return rows;
        } else {
            // PostgreSQL
            const queryText = `
                SELECT * FROM "Inventory".lots
                WHERE id_dish_and_combo_features = $1
                ORDER BY expiration_date ASC;
            `;
            const result = await database.query(queryText, [idDishAndComboFeatures]);
            return result.rows;
        }
    } catch (error) {
        console.error("Error al obtener los datos de la tabla 'lots':", error);
        return [];
    }
}


router.get('/:id_company/:id_branch/lot', isLoggedIn, async (req, res) => {
    
    const { id_combo_features, id_company, id_branch } = req.params;

    res.render('links/branch/products/lot', {});
})

router.post('/:id_combo_features/add-lot', isLoggedIn, async (req, res) => {
    const { id_combo_features } = req.params;
    const { number_lote, initial_existence, current_existence, date_of_manufacture, expiration_date } = req.body;
    const id_company = req.user.id_company;
    const id_branch = req.user.id_branch;

    if (!number_lote || !initial_existence || !current_existence || !date_of_manufacture || !expiration_date) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const insertQuery = `
                INSERT INTO lots
                (number_lote, initial_existence, current_existence, date_of_manufacture, expiration_date, id_dish_and_combo_features, id_branches, id_companies)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            // Ejecutar inserción
            const runResult = await new Promise((resolve, reject) => {
                database.run(insertQuery, [
                    number_lote,
                    initial_existence,
                    current_existence,
                    date_of_manufacture,
                    expiration_date,
                    id_combo_features,
                    id_branch,
                    id_company
                ], function (err) {
                    if (err) reject(err);
                    else resolve(this); // this.lastID contiene el ID insertado
                });
            });

            // Obtener el lote insertado con SELECT
            const selectQuery = `SELECT * FROM lots WHERE id = ?`;
            const newLot = await new Promise((resolve, reject) => {
                database.get(selectQuery, [runResult.lastID], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            await update_existence_use_lot(id_combo_features);

            res.status(201).json({
                message: "Lote agregado con éxito",
                lot: newLot,
                date_of_manufacture: newLot.date_of_manufacture,
                expiration_date: newLot.expiration_date,
                id: newLot.id
            });

        } else {
            // PostgreSQL
            const queryText = `
                INSERT INTO "Inventory".lots 
                (number_lote, initial_existence, current_existence, date_of_manufacture, expiration_date, id_dish_and_combo_features, id_branches, id_companies) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING id, number_lote, initial_existence, current_existence, date_of_manufacture, expiration_date;
            `;

            const result = await database.query(queryText, [
                number_lote,
                initial_existence,
                current_existence,
                date_of_manufacture,
                expiration_date,
                id_combo_features,
                id_branch,
                id_company
            ]);

            const newLot = result.rows[0];
            await update_existence_use_lot(id_combo_features);

            res.status(201).json({
                message: "Lote agregado con éxito",
                lot: newLot,
                date_of_manufacture: newLot.date_of_manufacture,
                expiration_date: newLot.expiration_date,
                id: newLot.id
            });
        }
    } catch (error) {
        console.error("Error al agregar el lote:", error);
        res.status(500).json({ error: "Error al agregar el lote" });
    }
});


async function update_existence_use_lot(id_combo_features) {
    try {
        let totalExistence = 0;

        if (TYPE_DATABASE === 'mysqlite') {
            // Paso 1: Sumar existencias actuales en SQLite
            totalExistence = await new Promise((resolve, reject) => {
                const query = `
                    SELECT SUM(current_existence) AS total
                    FROM lots
                    WHERE id_dish_and_combo_features = ?
                `;
                database.get(query, [id_combo_features], (err, row) => {
                    if (err) reject(err);
                    else resolve(row.total || 0);
                });
            });

            // Paso 2: Actualizar existencia en SQLite
            await new Promise((resolve, reject) => {
                const updateQuery = `
                    UPDATE product_and_suppiles_features
                    SET existence = ?
                    WHERE id = ?
                `;
                database.run(updateQuery, [totalExistence, id_combo_features], function(err) {
                    if (err) reject(err);
                    else resolve();
                });
            });

        } else {
            // PostgreSQL
            const sumResult = await database.query(`
                SELECT SUM(current_existence) AS total
                FROM "Inventory".lots
                WHERE id_dish_and_combo_features = $1;
            `, [id_combo_features]);

            totalExistence = sumResult.rows[0].total || 0;

            await database.query(`
                UPDATE "Inventory".product_and_suppiles_features
                SET existence = $1
                WHERE id = $2;
            `, [totalExistence, id_combo_features]);
        }

        console.log(`Existencia actualizada a ${totalExistence} para id ${id_combo_features}`);
    } catch (err) {
        console.error("Error al actualizar existencia:", err);
        throw err;
    }
}


router.post('/:id_combo_features/:id_lot/edit-lot', isLoggedIn, async (req, res) => {
    const { id_combo_features, id_lot } = req.params;
    const { number_lote, current_existence, date_of_manufacture, expiration_date } = req.body;
    const id_company = req.user.id_company;
    const id_branch = req.user.id_branch;
    const id_employees = req.user.id_employee;

    if (!number_lote || !current_existence || !date_of_manufacture || !expiration_date) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // Para SQLite usamos ? como placeholders
            const updateQuery = `
                UPDATE lots
                SET number_lote = ?, 
                    current_existence = ?, 
                    date_of_manufacture = ?, 
                    expiration_date = ?
                WHERE id = ?;
            `;

            await new Promise((resolve, reject) => {
                database.run(updateQuery, [
                    number_lote,
                    current_existence,
                    date_of_manufacture,
                    expiration_date,
                    id_lot
                ], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Para obtener el lote actualizado, hacemos una consulta aparte
            const lot = await new Promise((resolve, reject) => {
                database.get(`SELECT * FROM lots WHERE id = ?`, [id_lot], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            await update_existence_use_lot(id_combo_features);
            await add_move_to_the_history(id_company, id_branch, id_employees, id_lot, current_existence, 'Ajuste de inventario');

            res.status(201).json({ message: "Lote actualizado con éxito", lot });

        } else {
            // PostgreSQL
            const queryText = `
                UPDATE "Inventory".lots 
                SET number_lote = $1, 
                    current_existence = $2,
                    date_of_manufacture = $3, 
                    expiration_date = $4
                WHERE id = $5
                RETURNING *;
            `;

            const result = await database.query(queryText, [
                number_lote,
                current_existence,
                date_of_manufacture,
                expiration_date,
                id_lot
            ]);

            await update_existence_use_lot(id_combo_features);
            await add_move_to_the_history(id_company, id_branch, id_employees, id_lot, current_existence, 'Ajuste de inventario');

            res.status(201).json({ message: "Lote actualizado con éxito", lot: result.rows[0] });
        }
    } catch (error) {
        console.error("Error al actualizar el lote:", error);
        res.status(500).json({ error: "Error al actualizar el lote" });
    }
});


router.post('/:id_lot/delete-lot', isLoggedIn, async (req, res) => {
    const { id_lot } = req.params;

    if (!id_lot) {
        return res.status(400).json({ error: "El ID del lote es obligatorio" });
    }

    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite no tiene rowCount, usamos changes en run callback
            await new Promise((resolve, reject) => {
                database.run(`DELETE FROM lots WHERE id = ?`, [id_lot], function (err) {
                    if (err) reject(err);
                    else if (this.changes === 0) reject({ code: 'NOT_FOUND' });
                    else resolve();
                });
            });

            res.status(200).json({ message: "Lote eliminado con éxito" });

        } else {
            // PostgreSQL
            const queryText = `DELETE FROM "Inventory".lots WHERE id = $1;`;
            const result = await database.query(queryText, [id_lot]);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: "Lote no encontrado" });
            }

            res.status(200).json({ message: "Lote eliminado con éxito" });
        }
    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: "Lote no encontrado" });
        }
        console.error("Error al eliminar el lote:", error);
        res.status(500).json({ error: "Error al eliminar el lote" });
    }
});

async function get_all_the_promotions(id_dish_and_combo_features) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // En SQLite no hay esquema ni uso $1, uso ? para parámetros
            const queryText = `
                SELECT * FROM promotions
                WHERE id_dish_and_combo_features = ?;
            `;
            const result = await new Promise((resolve, reject) => {
                database.all(queryText, [id_dish_and_combo_features], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
            return result;
        } else {
            // PostgreSQL con esquema "Inventory" y parámetros $1
            const queryText = `
                SELECT * FROM "Inventory".promotions
                WHERE id_dish_and_combo_features = $1;
            `;
            const result = await database.query(queryText, [id_dish_and_combo_features]);
            return result.rows;
        }
    } catch (error) {
        console.error("Error al obtener los datos de la tabla 'promotions':", error);
        return [];
    }
}


router.post('/:id_dish_and_combo_features/add-promotion-free', isLoggedIn, async (req, res) => {
    const { newPromotion } = req.body;
    const { id_dish_and_combo_features } = req.params;
    const id_company = req.user.id_company;
    const id_branch = req.user.id_branch;

    // Validaciones básicas
    if (!newPromotion.promotionName || newPromotion.promotionName.trim() === '') {
        return res.status(400).json({ error: 'Necesitas agregar un nombre a tu promoción 😅' });
    }

    const fromQuantity = parseFloat(newPromotion.fromQuantity);
    const toQuantity = parseFloat(newPromotion.toQuantity);
    if (isNaN(fromQuantity) || isNaN(toQuantity) || fromQuantity > toQuantity) {
        return res.status(400).json({ error: 'La cantidad de la promoción no es correcta 😅' });
    }

    try {
        const inserted = await insert_promotion(id_company, id_branch, id_dish_and_combo_features, newPromotion);
        res.status(201).json({ message: "Agregado con éxito", idPromotion: inserted.id });
    } catch (err) {
        console.error("❌ Error al agregar la promoción:", err);
        res.status(500).json({ error: 'Error en el servidor al agregar la promoción. Inténtalo más tarde. 💀' });
    }
});

async function insert_promotion(id_company, id_branch, id_dish_and_combo_features, newPromotion) {
    if (TYPE_DATABASE === 'mysqlite') {
        // En SQLite: sin esquema, con '?' como placeholders, y RETURNING no funciona, se obtiene lastID
        const queryText = `
            INSERT INTO promotions
            (id_companies, id_branches, id_dish_and_combo_features, name_promotion, promotions_from, promotions_to, discount_percentage, date_from, date_to, fromTime, toTime, active_promotion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        return new Promise((resolve, reject) => {
            database.run(queryText, [
                id_company,
                id_branch,
                id_dish_and_combo_features,
                newPromotion.promotionName,
                parseFloat(newPromotion.fromQuantity),
                parseFloat(newPromotion.toQuantity),
                parseFloat(newPromotion.discountPercentage),
                newPromotion.fromDate || null,
                newPromotion.toDate || null,
                newPromotion.fromTime || null,
                newPromotion.toTime || null,
                newPromotion.promotionStatus ? 1 : 0
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });

    } else {
        // PostgreSQL con esquema "Inventory" y placeholders $1...$12
        const queryText = `
            INSERT INTO "Inventory".promotions
            (id_companies, id_branches, id_dish_and_combo_features, name_promotion, promotions_from, promotions_to, discount_percentage, date_from, date_to, "fromTime", "toTime", active_promotion)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id;
        `;

        const result = await database.query(queryText, [
            id_company,
            id_branch,
            id_dish_and_combo_features,
            newPromotion.promotionName,
            parseFloat(newPromotion.fromQuantity),
            parseFloat(newPromotion.toQuantity),
            parseFloat(newPromotion.discountPercentage),
            newPromotion.fromDate || null,
            newPromotion.toDate || null,
            newPromotion.fromTime || null,
            newPromotion.toTime || null,
            newPromotion.promotionStatus
        ]);
        return result.rows[0];
    }
}


router.post('/update-promotion', isLoggedIn, async (req, res) => {
    const { newPromotion } = req.body;

    if (!newPromotion.idPromotions) {
        return res.status(400).json({ error: 'El ID de la promoción es obligatorio' });
    }
    if (!newPromotion.promotionName || newPromotion.promotionName.trim() === '') {
        return res.status(400).json({ error: 'Necesitas agregar un nombre a tu promoción 😅' });
    }
    const fromQuantity = parseFloat(newPromotion.fromQuantity);
    const toQuantity = parseFloat(newPromotion.toQuantity);
    if (isNaN(fromQuantity) || isNaN(toQuantity) || fromQuantity > toQuantity) {
        return res.status(400).json({ error: 'La cantidad de la promoción no es correcta 😅' });
    }

    try {
        const updated = await update_promotion(newPromotion);
        res.status(200).json({ message: "Actualizado con éxito", idPromotion: updated.id });
    } catch (err) {
        console.error("❌ Error al actualizar la promoción:", err);
        res.status(500).json({ error: 'Error en el servidor al actualizar la promoción. Inténtalo más tarde. 💀', message: err.message });
    }
});

async function update_promotion(newPromotion) {
    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite: sin esquema, placeholders '?', no RETURNING, usamos run + lastID no aplica para UPDATE, así que verificamos cambios con changes
        const queryText = `
            UPDATE promotions
            SET 
                name_promotion = ?, 
                promotions_from = ?, 
                promotions_to = ?, 
                discount_percentage = ?, 
                date_from = ?, 
                date_to = ?, 
                fromTime = ?, 
                toTime = ?, 
                active_promotion = ?
            WHERE id = ?;
        `;

        return new Promise((resolve, reject) => {
            database.run(queryText, [
                newPromotion.promotionName,
                parseFloat(newPromotion.fromQuantity),
                parseFloat(newPromotion.toQuantity),
                parseFloat(newPromotion.discountPercentage),
                newPromotion.fromDate || null,
                newPromotion.toDate || null,
                newPromotion.fromTime || null,
                newPromotion.toTime || null,
                newPromotion.promotionStatus ? 1 : 0,
                newPromotion.idPromotions
            ], function(err) {
                if (err) reject(err);
                else if (this.changes === 0) reject(new Error('No se encontró la promoción para actualizar'));
                else resolve({ id: newPromotion.idPromotions });
            });
        });

    } else {
        // PostgreSQL con esquema y RETURNING
        const queryText = `
            UPDATE "Inventory".promotions
            SET 
                name_promotion = $1, 
                promotions_from = $2, 
                promotions_to = $3, 
                discount_percentage = $4, 
                date_from = $5, 
                date_to = $6, 
                "fromTime" = $7, 
                "toTime" = $8, 
                active_promotion = $9
            WHERE id = $10
            RETURNING id;
        `;

        const result = await database.query(queryText, [
            newPromotion.promotionName,
            parseFloat(newPromotion.fromQuantity),
            parseFloat(newPromotion.toQuantity),
            parseFloat(newPromotion.discountPercentage),
            newPromotion.fromDate || null,
            newPromotion.toDate || null,
            newPromotion.fromTime || null,
            newPromotion.toTime || null,
            newPromotion.promotionStatus,
            newPromotion.idPromotions
        ]);
        if (result.rowCount === 0) throw new Error('No se encontró la promoción para actualizar');
        return result.rows[0];
    }
}

router.post('/:id_promotion/delete-promotion', isLoggedIn, async (req, res) => {
    const { id_promotion } = req.params;

    if (!id_promotion) {
        return res.status(400).json({ error: 'El ID de la promoción es obligatorio' });
    }

    try {
        await delete_promotion(id_promotion);
        res.status(200).json({ message: "Eliminado con éxito" });
    } catch (err) {
        console.error("Error al eliminar la promoción:", err);
        res.status(500).json({ error: 'Error en el servidor al eliminar la promoción. Inténtalo más tarde. 💀', message: err.message });
    }
});


async function delete_promotion(id_promotion) {
    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite no soporta RETURNING, usamos run + this.changes para verificar si borró algo
        const queryText = `DELETE FROM promotions WHERE id = ?;`;
        return new Promise((resolve, reject) => {
            database.run(queryText, [id_promotion], function(err) {
                if (err) return reject(err);
                if (this.changes === 0) return reject(new Error('No se encontró la promoción para eliminar'));
                resolve({ id: id_promotion });
            });
        });
    } else {
        // PostgreSQL con RETURNING
        const queryText = `
            DELETE FROM "Inventory".promotions
            WHERE id = $1
            RETURNING id;
        `;
        const result = await database.query(queryText, [id_promotion]);
        if (result.rowCount === 0) throw new Error('No se encontró la promoción para eliminar');
        return result.rows[0];
    }
}





//--this is for when the user would like delete the product (supplies)
router.get('/:id_company/:id_branch/:id_combo/:id_comboFeactures/:id_productFacture/delete-product-free', isLoggedIn, async (req, res) => {
    const { id_combo, id_comboFeactures, id_productFacture, id_company, id_branch} = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'delete_products')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const pathImg = await get_path_img('Kitchen', 'dishes_and_combos', id_combo) //get the image in our database 
    const idProduct=await search_supplies_combo(id_combo);
    let canDelete=false;

    //get the data of the supplies and the combo of the branch
    const idSuppliesCompany=idProduct[0].id_products_and_supplies;
    const idComboCompany=idProduct[0].id_dishes_and_combos;

    //delete all the container of the combo
    await delete_all_supplies_combo(id_combo);

    //delete the supplies of the branch
    if(await delete_supplies_or_product_of_the_branch(id_productFacture)){
        //delete the combo of the branch
        if(await delete_dishes_or_combo_of_the_branch(id_comboFeactures)){
            //delete the combo of the company
            if(await delate_combo_company(id_combo, pathImg)){
                //delete the supplies of the company
                if(await delate_supplies_company(idSuppliesCompany, pathImg)){
                    canDelete=true;
                }
            }
        }
    }

    //we will see if exist a error when delete the product and show a message to the user
    if(canDelete){
        req.flash('success', 'El producto fue eliminado con éxito 😄')
    }else{
        req.flash('message', 'El producto NO fue eliminado con éxito 😳')
    }

    res.redirect(`/links/${id_company}/${id_branch}/products-free`);
})

//------------------------------------combo
router.get('/:id_company/:id_branch/combos-free', isLoggedIn, async (req, res) => {
    const {id_company, id_branch } = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'view_combo')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const branchFree = await get_data_branch(id_branch);
    const combos = await get_combo_features(id_branch,false);
    res.render('links/free/combo/combo', { branchFree, combos});

});

router.get('/:id_company/:id_branch/:id_dishes_and_combos/edit-data-combo-free', isLoggedIn, async (req, res) => {
    const { id_dishes_and_combos, id_branch,id_company } = req.params;
    
    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'edit_combo')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const branchFree = await get_data_branch(id_branch);
    const dataForm = [{
        id_company: branchFree[0].id_companies,
        id_branch: branchFree[0].id,
        id_combo: id_dishes_and_combos
    }]
    
    const departments = await get_data_tabla_with_id_company(id_company, "Kitchen", "product_department");
    const category = await get_data_tabla_with_id_company(id_company, "Kitchen", "product_category");

    const supplies = await search_company_supplies_or_products_with_company(id_company, true);
    const products = await search_company_supplies_or_products_with_company(id_company, false);
    const suppliesCombo = await search_supplies_combo(id_dishes_and_combos);
    const combo = await search_combo(id_company, id_dishes_and_combos);

    res.render('links/manager/combo/editCombo', { branchFree, dataForm, departments, category, supplies, products, combo, suppliesCombo });
})

router.get('/:id/:id_branch/add-combos-free', isLoggedIn, async (req, res) => {

    const {id, id_branch } = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id, id_branch,'add_combo')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id}/${id_branch}/permission_denied`);
    }

    const branchFree = await get_data_branch(id_branch);
    const packCombo=100//await get_pack_database(id);
    const combos = await get_combo_features(id_branch);
    if(the_user_can_add_most_combo(combos.length,packCombo)){
        const departments = await get_department(id);
        const category = await get_category(id);
        const supplies = await search_company_supplies_or_products(req, true);
        const products = await search_company_supplies_or_products(req, false);
        const suppliesCombo = []
        res.render('links/free/combo/addCombo', { branchFree,departments,category,supplies,products,suppliesCombo});
    }
    else{
        req.flash('message','Ya alcanzaste el limite maximo para tu base de datos actual. Debes actualizar tu sucursal a la siguiente version 😅')
        res.redirect('/links/'+id+'/'+id_branch+'/combos-free');
    }

});

function the_user_can_add_most_combo(combos,packCombo){
    return true;//combos<=packCombo
}

router.get('/:id_company/:id_branch/:id/delete-combo-free', isLoggedIn, async (req, res) => {
    const { id, id_company, id_branch} = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'delete_combo')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id}/${id_branch}/permission_denied`);
    }

    const pathImg = await get_path_img('Kitchen', 'dishes_and_combos', id) //get the image in our database 
    //we will see if can delete the combo of the database 
    if (await delate_combo_company(id, pathImg)) {
        canDelete=true;
    }
    
    if(canDelete){
        req.flash('success', 'El combo fue eliminado con éxito 😄')
    }else{
        req.flash('message', 'El combo NO fue eliminado con éxito 😳')
    }
    res.redirect(`/links/${id_company}/${id_branch}/combos-free`);
})

//------------------------------------branch
router.get('/:idBranch/:idCompany/edit-branch-free', isLoggedIn, async (req, res) => {
    const {idBranch,idCompany}=req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,idCompany, idBranch,'modify_hardware_kitchen')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${idCompany}/${idBranch}/permission_denied`);
    }

    const country = await get_country();
    const branchFree = await get_branch(req);
    res.render("links/manager/branches/editBranchesFree", { branchFree, country });
})

router.get('/:id/Dashboard', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const sales_history = await databaseM.mongodb('history_sale', id, parseInt(req.user.id));
    res.render('links/manager/reports/dashboard', sales_history);
});


//------------------------------------report
router.get('/report', isLoggedIn, (req, res) => {
    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'view_reports')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    res.render("links/manager/reports/report");
})

router.get('/report-sales', isLoggedIn, (req, res) => {
    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'view_sale_history')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    res.render("links/manager/reports/sales");
})

//------------------------------------food departament and category 
router.get('/:id_company/:id_branch/food-department-free', isLoggedIn, async (req, res) => {
    const { id_company, id_branch} = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'view_food_departament')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const departments = await get_department(id_company);
    const branchFree = await get_data_branch(id_branch);
    res.render('links/manager/areas/department', { branchFree, departments })
});

router.get('/:id_company/:id_branch/:id/delete-food-department', isLoggedIn, async (req, res) => {

    const { id, id_company, id_branch} = req.params;
    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'delete_food_departament')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    //we going to see if we can delate the department 
    if (await delate_product_department(id)) {
        req.flash('success', 'El departamento fue eliminado con éxito 😄')
    }
    else {
        req.flash('message', 'El departamento NO fue eliminado con éxito 😳')
    }

    res.redirect(`/links/${id_company}/${id_branch}/food-department-free`);

});

router.get('/:id_company/:id_branch/:id/:name/:description/edit-food-department', isLoggedIn, async (req, res) => {

    const { id_company, id_branch, id, name, description } = req.params;
    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'edit_food_departament')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    //we going to see if we can delate the department 
    if (await update_product_department(id, name, description)) {
        req.flash('success', 'El departamento fue actualizado con éxito 😄')
    }
    else {
        req.flash('message', 'El departamento NO fue actualizado con éxito 😳')
    }

    res.redirect(`/links/${id_company}/${id_branch}/food-department-free`);

});

router.get('/:id_company/:idBranch/food-area-free', isLoggedIn, async (req, res) => {
    const { id_company , idBranch} = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, idBranch,'view_food_category')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${idBranch}/permission_denied`);
    }

    const categories = await get_category(id_company);
    const branchFree = await get_branch(req);
    res.render('links/manager/areas/category', { branchFree, categories })
});

router.get('/:id_company/:id_branch/:id/:name/:description/edit-food-category-free', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id, name, description } = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'edit_food_category')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    //we going to see if we can delate the department 
    if (await update_product_category(id, name, description)) {
        req.flash('success', 'La categoria fue actualizada con éxito 😄')
    }
    else {
        req.flash('message', 'La categoria NO fue actualizada con éxito 😳')
    }

    res.redirect(`/links/${id_company}/${id_branch}/food-area-free`);
});

router.get('/:id_company/:id_branch/:id/delete-food-category', isLoggedIn, async (req, res) => {
    const { id, id_company, id_branch} = req.params;
    
    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'delete_food_category')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    //we going to see if we can delate the department 
    if (await delate_product_category(id)) {
        req.flash('success', 'La categoria fue eliminada con éxito 😄')
    }
    else {
        req.flash('message', 'La categoria NO fue eliminada con éxito 😳')
    }

    res.redirect(`/links/${id_company}/${id_branch}/food-area-free`);


});


//------------------------------------type user
router.get('/:id_company/:id_branch/type-user', isLoggedIn, async (req, res) => {
    const { id_company, id_branch} = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'employee_department')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const branchFree = await check_company_other(req);
    const typeEmployees = await get_type_employees(id_company);
    res.render('links/manager/role_type_employees/typeEmployees', { branchFree, typeEmployees });
})


//------------------------------------providers
router.get('/:id_company/:id_branch/providers-free', isLoggedIn, async (req, res) => {
    const { id_company, id_branch} = req.params;

    //we will see if the user not have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'view_provider')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const providers = await search_providers(id_branch);
    const branchFree = await get_data_branch(id_branch);
    res.render('links/branch/providers/providers', { providers, branchFree });
})







//------------------------------------task management
router.get('/:id_company/:id_branch/task-management', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const apps=await get_all_apps_of_this_company(id_company,id_branch)
    res.render("links/taskManagement/taskManagement",{branchFree, apps});
});

//------------------------------------projects
router.get('/:id_company/:id_branch/projects', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const apps=await get_all_apps_of_this_company(id_company,id_branch)
    res.render("links/projects/projects",{branchFree, apps});
});

/*
//------------------------------------ED STUDIOS 
const {
    get_all_apps_of_this_company,
    create_my_list_app,
    get_the_data_of_the_table_of_my_app,
    get_data_of_my_app,
    get_character_of_my_app,
    get_primary_keys_of_schema,
    get_code_table_of_my_app
} = require('../../services/apps');
const mainHandelbars=`
<!--
    ED CLOUD 
-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="/img/logo.png" type="image/png">
    <title>ED PLUS</title>

    <!--font-->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans">

    <!-- BOX ICONS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <link href='https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css' rel='stylesheet'> 
    <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.4.2/uicons-solid-straight/css/uicons-solid-straight.css'>

    <!-- my CSS -->
    <link rel="stylesheet" href="/css/menu.css">
    <link rel="stylesheet" href="/css/Styles.css">
    <link rel="stylesheet" href="/css/load.css">
    <style>
        .alert-transparent {
            background-color: var(--color-company);
        }
    </style> 

    <!--select-->
    <link href="https://cdn.jsdelivr.net/npm/chosen-js@1.8.7/dist/css/chosen.min.css" rel="stylesheet" />

    <!--tutorial -->
    <link src="https://unpkg.com/intro.js/introjs.css"></link>
    <link rel="stylesheet" href="https://unpkg.com/intro.js/minified/introjs.min.css">
    <link rel="stylesheet" href="/css/tutorial.css">
</head>
<body>

</body>
</html>
`
const hbs = require('handlebars'); // Para compilar dinámicamente
const { console } = require('inspector');

router.get('/:id_company/:id_branch/ed-studios', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    await create_my_list_app(id_company,id_branch)
    const apps=await get_all_apps_of_this_company(id_company,id_branch)
    res.render("links/apps/myApps",{branchFree, apps});
});

router.get('/:id_company/:id_branch/app/:id_app', isLoggedIn, async (req, res) => {
    const { id_app, id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const apps=await get_all_apps_of_this_company(id_company,id_branch)

    const dataTable=await get_the_data_of_the_table_of_my_app(id_company, id_branch, id_app)
    const characterApp=await get_character_of_my_app(id_company, id_branch, id_app)

    console.log(characterApp)
    res.render("links/apps/app",{branchFree, apps, dataTable, characterApp});
});

router.get('/:id_company/:id_branch/:id_app/add', isLoggedIn, async (req, res) => {
    const { id_app, id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const apps=await get_all_apps_of_this_company(id_company,id_branch)

    const dataTable=await get_the_data_of_the_table_of_my_app(id_company, id_branch, id_app)
    const characterApp=await get_character_of_my_app(id_company, id_branch, id_app)

    
    res.render("links/apps/editApp",{branchFree, apps, dataTable, characterApp});
});

router.get('/:id_company/:id_branch/:id_app/table', isLoggedIn, async (req, res) => {
    const { id_app, id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const apps=await get_all_apps_of_this_company(id_company,id_branch)

    const characterApp=await get_character_of_my_app(id_company, id_branch, id_app)
    const dataTableMyApp=await get_the_data_of_the_table_of_my_app(id_company, id_branch, id_app)
    const items=await get_data_of_my_app(id_company, id_branch, id_app)

    res.render("links/apps/tableApp",{branchFree,apps, characterApp, items, dataTableMyApp});
});

router.get('/:id_company/:id_branch/:id_app/edit-form-app', isLoggedIn, async (req, res) => {
    const { id_app, id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const dataTable=await get_the_data_of_the_table_of_my_app(id_company, id_branch, id_app)
    res.render("links/apps/editForm",{branchFree,dataTable});
});

router.get('/:id_company/:id_branch/:id_app/edit-app', isLoggedIn, async (req, res) => {
    const { id_app, id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);

    const dataTable=await get_the_data_of_the_table_of_my_app(id_company, id_branch, id_app)
    const code=await get_code_table_of_my_app(id_company, id_branch, id_app)
    const code1=mainHandelbars+`
        <h5>{{user.user_name}}</h5>
        {{#each branchFree}}
            {{name_branch}}
        {{/each}}
    `
    const template = hbs.compile(code1);
    const data = {branchFree, dataTable};
    const html = template(data);

    //res.send(html);
    //-------------
    // Renderiza la vista
    const renderedView = res.render('links/apps/main', {branchFree, dataTable}, (err, html) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error rendering view");
        }

        // Aquí puedes combinar el HTML renderizado con tu código Handlebars dinámico
        const code1 = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formulario de Ejemplo</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <style>
        .form-container {
            max-width: 800px;
            margin: 20px auto;
        }
    </style>
</head>
<body>
    <div class="container form-container">
        <h1 class="text-center mb-4">Formulario de Ejemplo</h1>
        <form>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="firstName" class="form-label">Nombre</label>
                    <input type="text" class="form-control" id="firstName" placeholder="Nombre" required>
                </div>
                <div class="col-md-6">
                    <label for="lastName" class="form-label">Apellido</label>
                    <input type="text" class="form-control" id="lastName" placeholder="Apellido" required>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="email" class="form-label">Correo Electrónico</label>
                    <input type="email" class="form-control" id="email" placeholder="Correo Electrónico" required>
                </div>
                <div class="col-md-6">
                    <label for="phone" class="form-label">Teléfono</label>
                    <input type="tel" class="form-control" id="phone" placeholder="Teléfono" required>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="dob" class="form-label">Fecha de Nacimiento</label>
                    <input type="date" class="form-control" id="dob" required>
                </div>
                <div class="col-md-6">
                    <label for="gender" class="form-label">Género</label>
                    <select id="gender" class="form-select" required>
                        <option value="" disabled selected>Selecciona una opción</option>
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
            </div>

            <div class="mb-3">
                <label for="address" class="form-label">Dirección</label>
                <textarea class="form-control" id="address" rows="3" placeholder="Dirección" required></textarea>
            </div>

            <div class="mb-3">
                <label for="comments" class="form-label">Comentarios</label>
                <textarea class="form-control" id="comments" rows="4" placeholder="Comentarios"></textarea>
            </div>

            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="terms" required>
                    <label class="form-check-label" for="terms">
                        Acepto los términos y condiciones
                    </label>
                </div>
            </div>

            <div class="text-center">
                <button type="submit" class="btn btn-primary">Enviar</button>
                <button type="reset" class="btn btn-secondary">Restablecer</button>
            </div>
        </form>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous"></script>
</body>
</html>

        `;

        // Compila el código Handlebars dinámico
        const template = hbs.compile(code1);
        const data = {branchFree1:branchFree};

        // Genera el HTML con el código Handlebars dinámico
        const dynamicHtml = template(data);

        // Combina el HTML renderizado con el HTML dinámico
        const combinedHtml = html + dynamicHtml;

        // Envía el HTML combinado al cliente
        res.send(combinedHtml);
    });


    //res.render("links/apps/editApp",{branchFree,apps, dataTable});
});

router.get('/:id_company/:id_branch/ed-studios/create-app', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const apps=await get_all_apps_of_this_company(id_company,id_branch)
    res.render('links/apps/createApp', { branchFree, apps});
})


router.get('/:id_company/:id_branch/:id_app/create-database', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const apps=await get_all_apps_of_this_company(id_company,id_branch)
    const myApps=await get_primary_keys_of_schema(id_company,id_branch)
    res.render('links/apps/studios', { branchFree, apps, myApps});
})
*/


//------------------------------------options 
const {getToken}=require('../../middleware/tokenCheck.js');
router.get('/:id_company/:id_branch/options', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'give_permissions')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const branchFree = await get_data_branch(id_branch);
    const dataCompany = await get_data_company_with_id(id_company);
    const country=await get_country();
    const token=getToken();
    res.render('links/options/options', { branchFree, dataCompany, country, token });
})

router.get('/:id_company/:id_branch/prices', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'modify_hardware_kitchen')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const branchFree = await get_data_branch(id_branch);
    res.render('links/web/prices',{branchFree});
})


//------------------------------------labels 
router.get('/:id_company/:id_branch/labels', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'view_label')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const branchFree = await get_data_branch(id_branch);
    const labels = await get_all_the_labels(id_company, id_branch);
    res.render('links/labels/labels',{branchFree,labels});
})

async function get_all_the_labels(id_company, id_branch) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `
                SELECT * FROM labels WHERE id_companies = ? AND id_branches = ?
            `;
            database.all(queryText, [id_company, id_branch], (err, rows) => {
                if (err) {
                    console.error('Error getting get_all_the_labels (SQLite):', err);
                    return resolve([]);
                }
                resolve(rows);
            });
        });
    } else {
        try {
            const queryText = `
                SELECT * FROM "Branch".labels WHERE id_companies = $1 AND id_branches = $2
            `;
            const result = await database.query(queryText, [id_company, id_branch]);
            return result.rows;
        } catch (error) {
            console.error('Error getting get_all_the_labels (PostgreSQL):', error);
            return [];
        }
    }
}


router.get('/:id_company/:id_branch/add-labels', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'add_label')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    const branchFree = await get_data_branch(id_branch);
    res.render('links/labels/addLabels',{branchFree});
})

router.get('/edit_label/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const id_branch = req.user.id_branch;
    const id_company = req.user.id_company;

    const branchFree = await get_data_branch(id_branch);

    if (!this_user_have_this_permission(req.user, id_company, id_branch, 'edit_label')) {
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    try {
        const label = await get_label_by_id(id);

        if (!label) {
            return res.status(404).send("Etiqueta no encontrada.");
        }

        label.label = JSON.stringify(label.label);

        res.render('links/labels/editLabel', { branchFree, label });
    } catch (error) {
        console.error("Error al obtener la etiqueta:", error);
        res.status(500).send("Error interno del servidor.");
    }
});


// Función para obtener etiqueta por id, soporta PostgreSQL y SQLite
async function get_label_by_id(id) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `SELECT * FROM labels WHERE id = ?`;
            database.get(queryText, [id], (err, row) => {
                if (err) {
                    console.error('Error en get_label_by_id (SQLite):', err);
                    return resolve(null);
                }
                resolve(row);
            });
        });
    } else {
        try {
            const queryText = `SELECT * FROM "Branch".labels WHERE id = $1`;
            const result = await database.query(queryText, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en get_label_by_id (PostgreSQL):', error);
            return null;
        }
    }
}



router.get('/view_label/:id/name=:name/barcode=:barcode/price=:price', isLoggedIn, async (req, res) => {
    const { id, name, barcode, price } = req.params;

    const id_branch = req.user.id_branch;
    const id_company = req.user.id_company;

    // Verificar permisos
    if (!this_user_have_this_permission(req.user, id_company, id_branch, 'view_label')) {
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    try {
        const label = await get_label_by_id(id);

        if (!label) {
            return res.status(404).send("Etiqueta no encontrada.");
        }

        label.label = JSON.stringify(label.label);

        const product = [{
            name,
            barcode,
            price
        }];
        
        const branchFree = await get_data_branch(id_branch);
        res.render('links/labels/viewLabel', { branchFree, label, product });
    } catch (error) {
        console.error("Error al obtener la etiqueta:", error);
        res.status(500).send("Error interno del servidor.");
    }
});

async function get_label_by_id(id) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `SELECT * FROM labels WHERE id = ?`;
            database.get(queryText, [id], (err, row) => {
                if (err) {
                    console.error('Error en get_label_by_id (SQLite):', err);
                    return resolve(null);
                }
                resolve(row);
            });
        });
    } else {
        try {
            const queryText = `SELECT * FROM "Branch".labels WHERE id = $1`;
            const result = await database.query(queryText, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error en get_label_by_id (PostgreSQL):', error);
            return null;
        }
    }
}
/*
async function get_all_the_labels(id_branch) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `SELECT * FROM labels WHERE id_branches = ?`;
            database.all(queryText, [id_branch], (err, rows) => {
                if (err) {
                    console.error("Error al obtener las etiquetas (SQLite):", err);
                    return resolve([]);
                }
                resolve(rows);
            });
        });
    } else {
        try {
            const queryText = `SELECT * FROM "Branch".labels WHERE id_branches = $1`;
            const result = await database.query(queryText, [id_branch]);
            return result.rows;
        } catch (error) {
            console.error("Error al obtener las etiquetas (PostgreSQL):", error);
            return [];
        }
    }
}
*/


//--------------------services
router.get('/:id_company/:id_branch/:page/services', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    let { page } = req.params;

    //we will see if the user have the permission for this App.
    if(!this_user_have_this_permission(req.user,id_company, id_branch,'view_movement_history')){
        req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
        return res.redirect(`/links/${id_company}/${id_branch}/permission_denied`);
    }

    //now we will see if the page is a number or not, if not we will set it to 0
    page = Math.max(0, isNaN(page) ? 0 : parseInt(page));
    const pageNext= page + 1;
    const pagePrev= page - 1;
    const dataPage=[{id_company,id_branch,pageNext,pagePrev}];

    //now get the data of the branch and the services
    const branchFree = await get_data_branch(id_branch, page);
    const services = await get_services_by_page(id_company, id_branch, page);
    res.render('links/services/services',{branchFree,services,dataPage});
})

async function get_services_by_page(id_company, id_branch, page = 0, limit = 50) {
    const offset = page * limit;

    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    rs.id,
                    rs.id_companies,
                    rs.id_branches,
                    rs.id_employees,
                    rs.id_customers,
                    rs.key_services,
                    rs.money_received,
                    rs.service_name,
                    rs.change,
                    rs.service_money,
                    rs.time_sales,
                    b.name_branch,
                    b.city,
                    b.alias
                FROM reachange_services rs
                JOIN branches b
                    ON rs.id_branches = b.id
                WHERE rs.id_companies = ?
                AND rs.id_branches = ?
                ORDER BY rs.id DESC
                LIMIT ? OFFSET ?;
            `;
            database.all(query, [id_company, id_branch, limit, offset], (err, rows) => {
                if (err) {
                    console.error('Error en get_services_by_page (SQLite):', err);
                    return resolve([]);
                }
                resolve(rows);
            });
        });
    } else {
        try {
            const query = `
                SELECT 
                    rs.id,
                    rs.id_companies,
                    rs.id_branches,
                    rs.id_employees,
                    rs.id_customers,
                    rs.key_services,
                    rs.money_received,
                    rs.service_name,
                    rs.change,
                    rs.service_money,
                    rs.time_sales,
                    b.name_branch,
                    b.city,
                    b.alias
                FROM "Box".reachange_services rs
                JOIN "Company".branches b
                    ON rs.id_branches = b.id
                WHERE rs.id_companies = $1
                AND rs.id_branches = $2
                ORDER BY rs.id DESC
                LIMIT $3 OFFSET $4;
            `;
            const result = await database.query(query, [id_company, id_branch, limit, offset]);
            return result.rows;
        } catch (error) {
            console.error('Error en get_services_by_page (PostgreSQL):', error);
            return [];
        }
    }
}


//--------------------
const fetch = require('node-fetch');

router.get('/search-product-with-barcode', async (req, res) => {
  const upc = req.query.upc;

  try {
    const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`);
    const data = await response.json();
    res.json(data); // Devuelve los datos al frontend
  } catch (error) {
    console.error('Error al buscar producto:', error);
    res.status(500).json({ error: 'No se pudo obtener el producto' });
  }
});

router.get('/search-product-with-name', async (req, res) => {
  const nameProduct = req.query.nameProduct;

  try {
    const response = await fetch(`https://api.upcitemdb.com/prod/trial/search?s=${nameProduct}&match_mode=1&type=product`);
    const data = await response.json();
    res.json(data); // Devuelve los datos al frontend
  } catch (error) {
    console.error('Error al buscar producto:', error);
    res.status(500).json({ error: 'No se pudo obtener el producto' });
  }
});

module.exports = router;
