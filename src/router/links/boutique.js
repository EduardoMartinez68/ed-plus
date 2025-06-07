const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
require('dotenv').config();
const {TYPE_DATABASE}=process.env;

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


router.get('/:id_company/:id_branch/boutique', isLoggedIn, async (req, res) => {
    const {id_company,id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);
    const boutique=await get_all_the_product_of_the_boutique(id_company,id_branch);
    res.render('links/boutique/boutique.hbs',{branchFree,boutique});
})

async function get_all_the_product_of_the_boutique(id_company, id_branch) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // En SQLite no se usa schema ni comillas dobles, y los placeholders son '?'
            const queryText = `
                SELECT 
                    b.*, 
                    COUNT(tb.id) AS total_products
                FROM boutique b
                LEFT JOIN table_boutique tb ON tb.id_boutique = b.id
                WHERE b.id_companies = ? AND b.id_branches = ?
                GROUP BY b.id
            `;
            const values = [id_company, id_branch];

            const rows = await new Promise((resolve, reject) => {
                database.all(queryText, values, (err, rows) => {
                    if (err) {
                        console.error('Error SQLite en get_all_the_product_of_the_boutique:', err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });

            return rows;
        } else {
            // PostgreSQL
            const queryText = `
                SELECT 
                    b.*, 
                    COUNT(tb.id) AS total_products
                FROM "Inventory".boutique b
                LEFT JOIN "Inventory".table_boutique tb ON tb.id_boutique = b.id
                WHERE b.id_companies = $1 AND b.id_branches = $2
                GROUP BY b.id
            `;
            const values = [id_company, id_branch];

            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error to get_all_the_product_of_the_boutique:', error);
        return [];
    }
}















router.get('/:id_company/:id_branch/add-boutique', isLoggedIn, async (req, res) => {
    const {id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);
    res.render('links/boutique/addBoutique.hbs',{branchFree});
})

router.post('/:id_company/:id_branch/add-boutique', isLoggedIn, async (req, res) => {
    const {id_company,id_branch}=req.params;

    //get the data of the product
    const {barcode,name,price,description,variant_count,max_inventary}=req.body;

    //we will see if can save the boutique in the database
    const newBoutique=create_boutique(barcode,name,price,description,max_inventary,id_company,id_branch);
    const idBoutique=await add_the_boutique(newBoutique);
    
    //we will see if can added the boutique to the database
    if(!idBoutique){
        //if no save the boutique in the database, we will show a error to the user
        req.flash('message', `No se pudo agregar el producto ${name}. Tal vez el codigo de barras o el nombre ya existen 😬`);
        return res.redirect(`/links/${id_company}/${id_branch}/add-boutique`);
    }
    
    //if can added the boutique to the database, so we will save all the variants in the database
    //get the variants of the clothes
    const tallas = req.body['talla[]'];    
    const colores = req.body['color[]'];
    const prices = req.body['prices[]'];
    const existences = req.body['existence[]'];

    //use this variable for know if we could add all the variants of the product 
    let canAdd=true;
    let productsThatNoWasAdd='';

    //her we will read all the variants of the clothes
    for (let i = 0; i < tallas.length; i++) {
        //get the data of the variants
        const size=tallas[i];
        const color=colores[i];
        const priceProduct=prices[i];
        const existence=existences[i];

        //make the new barcode and the new name use the size and the color of the product
        const newBarcode=`${barcode}-${color}-${size}`;
        const newName=`${name}-color ${color} talla ${size}`;

        //her we will save all the new product and the new combo in the company and in the branch
        const result=await add_product_to_boutique(id_company, id_branch, newBarcode,newName,description,priceProduct,1,priceProduct,existence,max_inventary);

        //if the product can save in the database, we will save in the table of the boutique
        if(result !=null){
            await add_product_to_the_table_of_boutique(idBoutique.id,result.idComboFacture,result.idSuppliesFactures);
        }else{
            //if the product no can save in the database, we will save the name of the product for show to the user after
            canAdd=false;
            productsThatNoWasAdd+=newName+',';
        }
        
    }

    //we will see if can save all the products 
    if(canAdd){
        req.flash('success', 'Todas las variantes fueron subidos con éxito 😉');
    }else{
        req.flash('message', `Ocurrio un error al momento de cargar las siguientes variantes:  ${productsThatNoWasAdd}. Tal vez su barcode y nombres ya existen en la base de datos 😬.`);
    }

    res.redirect(`/links/${id_company}/${id_branch}/boutique`);
})

function create_boutique(barcode,name,purchase_sale,description,max_inventary,id_companies,id_branches){
    const boutique={
        name,
        barcode,
        description,
        use_inventory: true,
        max_inventary,
        min_inventory: 0,
        purchase_price:0,
        purchase_sale,
        id_companies,
        id_branches
    }

    return boutique;
}

async function add_the_boutique(boutiqueData) {
  const values = [
    boutiqueData.name,
    boutiqueData.barcode,
    boutiqueData.description,
    boutiqueData.use_inventory,
    boutiqueData.max_inventary,
    boutiqueData.min_inventory,
    boutiqueData.purchase_price,
    boutiqueData.purchase_sale,
    boutiqueData.id_companies,
    boutiqueData.id_branches
  ];

  if (TYPE_DATABASE === 'mysqlite') {
    const queryText = `
      INSERT INTO boutique (
        name, 
        barcode, 
        description, 
        use_inventory, 
        max_inventary, 
        min_inventory, 
        purchase_price, 
        purchase_sale, 
        id_companies, 
        id_branches
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve) => {
      database.run(queryText, values, function(err) {
        if (err) {
          console.error('Error al insertar en boutique (SQLite):', err);
          resolve(false);
        } else {
          resolve({ id: this.lastID }); // Retorna el id insertado como objeto
        }
      });
    });
  } else {
    const queryText = `
      INSERT INTO "Inventory".boutique (
        name, 
        barcode, 
        description, 
        use_inventory, 
        max_inventary, 
        min_inventory, 
        purchase_price, 
        purchase_sale, 
        id_companies, 
        id_branches
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id;
    `;

    try {
      const result = await database.query(queryText, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error al insertar en boutique (PostgreSQL):', error);
      return false;
    }
  }
}


async function add_product_to_the_table_of_boutique(id_boutique, id_dish_and_combo_features, id_product_and_suppiles_features) {
  const values = [
    id_boutique,
    id_dish_and_combo_features,
    id_product_and_suppiles_features
  ];

  if (TYPE_DATABASE === 'mysqlite') {
    const queryText = `
      INSERT INTO table_boutique (
        id_boutique, 
        id_dish_and_combo_features,
        id_product_and_suppiles_features
      ) VALUES (?, ?, ?)
    `;

    return new Promise((resolve) => {
      database.run(queryText, values, function(err) {
        if (err) {
          console.error('Error al insertar en table_boutique (SQLite):', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

  } else {
    const queryText = `
      INSERT INTO "Inventory".table_boutique (
        id_boutique, 
        id_dish_and_combo_features,
        id_product_and_suppiles_features
      ) VALUES ($1, $2, $3)
    `;

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error al insertar en table_boutique (PostgreSQL):', error);
      return false;
    }
  }
}

async function add_product_to_boutique( id_company, id_branch, barcode,name,description,sale_price,purchase_amount,purchase_price,existence,max_inventory){
    //get all the data of the product
    const use_inventory=1;
    const this_is_a_supplies=0;
    const newProducts=create_new_product_with_boutique(id_company, barcode, name, description, use_inventory, this_is_a_supplies);
    const idSupplies = await addDatabase.add_supplies_company(newProducts);

    //we will see if the product can be save in the database
    if (idSupplies) {
        //get the data of the combo in the file excel 
        const purchase_unity='Pza';

        const sale_amount=1;
        const sale_unity=purchase_unity;

        const minimum_inventory=0;
        const unit_inventory=purchase_unity;

        //we will create the supplies in the branch
        const idSuppliesFactures = await addDatabase.add_product_and_suppiles_features(id_branch, idSupplies) //add the supplies in the branch 

        //we will watch if not can added the supplies in the branch 
        if(idSuppliesFactures==null){
            //if we not can added the supplies in the branch, we will to delete the supplies of the company for avoid mistakes
            await delete_supplies_company(idSupplies);
        }else{
            //we will creating the data of the supplies and we will saving with the id of the supplies that create
            const supplies = create_supplies_branch_with_excel(purchase_amount,purchase_unity,purchase_price,sale_amount,sale_unity,sale_price,max_inventory,minimum_inventory,unit_inventory,existence,idSuppliesFactures);
            
            //update the data in the branch for save the new product in his branch
            if (await update.update_supplies_branch(supplies)){

                //get the new combo
                const combo = create_a_new_combo_with_excel(id_company,barcode,name,description);
                const dataProduct={idProduct:idSupplies,amount: 1,foodWaste: supplies.sale_amount,unity: supplies.sale_unity,additional: 0}
                combo.supplies.push(dataProduct); //update the data of supplies use only the barcode of the product
                
                //we will see if can add the combo to the database
                const idCombos = await addDatabase.add_product_combo_company(combo);

                //get the data combo in the branch
                const comboData = create_combo_data_branch(idCombos, id_company, id_branch);

                // save the combo in the branch
                const idComboFacture = await addDatabase.add_combo_branch(comboData);
                if(!idComboFacture){
                    await delete_all_supplies_combo(idCombos);
                    await delete_product_combo_company(idCombos);
                    await delete_product_and_suppiles_features(idSuppliesFactures);
                    await delete_supplies_company(idSupplies);
                }else{
                    //if we can added the combo to the branch, update the price of the combo
                    await update_price_combo_for_excel(sale_price,idComboFacture);
                    return { idComboFacture,idSuppliesFactures }; //this is when the product was added with success
                }
            }else{
                //if we not can update the supplies in the branch, we will delete the supplis in the branch and in the company
                await delete_product_and_suppiles_features(idSuppliesFactures);
                await delete_supplies_company(idSupplies);
            }
        }
    }


    return null; //if exist a error when the user added the 
}


function create_new_product_with_boutique(id_company, barcode, name, description, use_inventory, this_is_a_supplies) {
    const supplies = {
        id_company,
        img: '',
        barcode,
        name,
        description,
        use_inventory,
        this_is_a_supplies
    }

    return supplies;
}

function create_supplies_branch_with_excel(purchase_amount,purchase_unity,purchase_price,sale_amount,sale_unity,sale_price,max_inventory,minimum_inventory,unit_inventory,existence,id_supplies) {
    const supplies = {
        purchase_amount: string_to_float(purchase_amount),
        purchase_unity,
        purchase_price: string_to_float(purchase_price),
        currency_purchase: 'MXN',
        sale_amount: string_to_float(sale_amount),
        sale_unity,
        sale_price: string_to_float(sale_price),
        currency_sale:'MXN',
        max_inventory: string_to_float(max_inventory),
        minimum_inventory: string_to_float(minimum_inventory),
        unit_inventory,
        existence: string_to_float(existence),
        id_supplies: id_supplies,
    };

    return supplies;
}

function create_a_new_combo_with_excel(id_company,barcode,name,description) {
    const combo = {
        id_company: id_company,
        path_image:'',
        barcode,
        name,
        description,
        id_product_department: '',
        id_product_category: '',
        supplies:[]
    }

    return combo;
}

async function update_price_combo_for_excel(newPrice, id) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `
            UPDATE dish_and_combo_features 
            SET price_1 = ? 
            WHERE id = ?
        `;
        const values = [newPrice, id];

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error actualizando el precio del combo en SQLite:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });

    } else {
        const queryText = `
            UPDATE "Inventory".dish_and_combo_features 
            SET price_1 = $1 
            WHERE id = $2
        `;
        const values = [newPrice, id];

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error actualizando el precio del combo en PostgreSQL:', error);
            return false;
        }
    }
}

async function delete_product_and_suppiles_features(id) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = 'DELETE FROM product_and_suppiles_features WHERE id = ?';
        const values = [id];

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error al eliminar en SQLite product_and_suppiles_features:', err);
                    resolve(null);
                } else {
                    resolve(true);
                }
            });
        });
    } else {
        const queryText = 'DELETE FROM "Inventory".product_and_suppiles_features WHERE id = $1';
        const values = [id];

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error al eliminar en PostgreSQL product_and_suppiles_features:', error);
            return null;
        }
    }
}

async function delete_supplies_company(id) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = 'DELETE FROM products_and_supplies WHERE id = ?';
        const values = [id];

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error al eliminar el supply en SQLite:', err);
                    resolve(null);
                } else {
                    resolve(true);
                }
            });
        });
    } else {
        const queryText = 'DELETE FROM "Kitchen".products_and_supplies WHERE id = $1';
        const values = [id];

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error al eliminar el supply en PostgreSQL:', error);
            return null;
        }
    }
}

async function delete_product_combo_company(id) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = 'DELETE FROM dishes_and_combos WHERE id = ?';
        const values = [id];

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error al eliminar en SQLite dishes_and_combos:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    } else {
        const queryText = 'DELETE FROM "Kitchen".dishes_and_combos WHERE id = $1';
        const values = [id];

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error al eliminar en PostgreSQL dishes_and_combos:', error);
            return false;
        }
    }
}

async function delete_all_supplies_combo(id) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = 'DELETE FROM table_supplies_combo WHERE id_dishes_and_combos = ?';
        const values = [id];

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error al eliminar en SQLite table_supplies_combo:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    } else {
        const queryText = 'DELETE FROM "Kitchen".table_supplies_combo WHERE id_dishes_and_combos = $1';
        const values = [id];

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error al eliminar en PostgreSQL table_supplies_combo:', error);
            return false;
        }
    }
}


function create_combo_data_branch(idCombo, idCompany, id_branch) {
    const comboData = {
        idCompany: idCompany,
        idBranch: id_branch,
        idDishesAndCombos: idCombo,
        price_1: 0,
        amount: 0,
        product_cost: 0,
        revenue_1: 0,
        purchase_unit: 'Pza'
    };
    return comboData;
}

function string_to_float(str) {
    let floatValue = parseFloat(str);
    return isNaN(floatValue) ? 0 : floatValue;
}



router.get('/:id_company/:id_branch/:id_boutique/edit-boutique', isLoggedIn, async (req, res) => {
    const {id_company,id_branch,id_boutique}=req.params;
    const branchFree = await get_data_branch(id_branch);
    const boutique=await get_data_boutique_with_id(id_boutique);
    const tableBoutique=await get_data_table_boutique_with_id(id_boutique);

    res.render('links/boutique/editBoutique.hbs',{branchFree,boutique,tableBoutique});
})


async function get_data_boutique_with_id(id) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `
            SELECT *
            FROM boutique
            WHERE id = ?
        `;
        return new Promise((resolve, reject) => {
            database.get(queryText, [id], (err, row) => {
                if (err) {
                    console.error('Error al obtener datos de boutique en SQLite:', err);
                    return reject(err);
                }
                // Retornamos un array con el registro si existe, o vacío si no
                resolve(row ? [row] : []);
            });
        });
    } else {
        const queryText = `
            SELECT *
            FROM "Inventory".boutique
            WHERE id = $1
        `;
        try {
            const result = await database.query(queryText, [id]);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener datos de boutique en PostgreSQL:', error);
            throw error;
        }
    }
}

async function get_data_table_boutique_with_id(id_boutique) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `
            SELECT 
                dnc.id, 
                dnc.img, 
                dnc.barcode, 
                dnc.name, 
                dacf.price_1,
                psf.existence,
                tb.id_dish_and_combo_features,
                tb.id_product_and_suppiles_features
            FROM table_boutique tb
            JOIN dish_and_combo_features dacf 
                ON tb.id_dish_and_combo_features = dacf.id
            JOIN dishes_and_combos dnc 
                ON dacf.id_dishes_and_combos = dnc.id
            JOIN product_and_suppiles_features psf 
                ON tb.id_product_and_suppiles_features = psf.id
            WHERE tb.id_boutique = ?
        `;
        
        return new Promise((resolve, reject) => {
            database.all(queryText, [id_boutique], (err, rows) => {
                if (err) {
                    console.error('Error al obtener datos de la boutique en SQLite:', err);
                    return resolve([]); // retornamos array vacío si error
                }
                resolve(rows);
            });
        });
    } else {
        const queryText = `
            SELECT 
                dnc.id, 
                dnc.img, 
                dnc.barcode, 
                dnc.name, 
                dacf.price_1,
                psf.existence,
                tb.id_dish_and_combo_features,
                tb.id_product_and_suppiles_features
            FROM "Inventory".table_boutique tb
            JOIN "Inventory".dish_and_combo_features dacf 
                ON tb.id_dish_and_combo_features = dacf.id
            JOIN "Kitchen".dishes_and_combos dnc 
                ON dacf.id_dishes_and_combos = dnc.id
            JOIN "Inventory".product_and_suppiles_features psf 
                ON tb.id_product_and_suppiles_features = psf.id
            WHERE tb.id_boutique = $1;
        `;

        try {
            const result = await database.query(queryText, [id_boutique]);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener datos de la boutique en PostgreSQL:', error);
            return [];
        }
    }
}


/*---------------------------form edit boutique--------------------------*/
router.post('/:id_company/:id_branch/:id_boutique/edit-boutique', isLoggedIn, async (req, res) => {
    const {id_company,id_branch,id_boutique}=req.params;

    //update the information of the boutique
    await update_the_boutique(id_boutique,req.body.barcode,req.body.name,req.body.price,req.body.description,req.body.max_inventary);


    //we will see if exist new variant in the boutique 
    await add_new_product_to_boutique(req); //her is for add the new product to the boutique 
    await update_old_product_to_boutique(req); //update the old product in the boutique 

    //we will see if can save all the products 
    let canAdd=true;
    if(canAdd){
        req.flash('success', 'Tu Boutique fue actualizada con éxito 😉');
    }else{
        req.flash('message', `Ocurrio un error al momento de cargar las siguientes variantes:  ${productsThatNoWasAdd} 😬.`);
    }

    res.redirect(`/links/${id_company}/${id_branch}/boutique`);
})

async function update_the_boutique(id_boutique, barcode, name, price, description, max_inventary) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `
            UPDATE boutique 
            SET barcode = ?, name = ?, purchase_sale = ?, description = ?, max_inventary = ?
            WHERE id = ?
        `;
        const values = [barcode, name, price, description, max_inventary, id_boutique];

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error updating boutique in SQLite:', err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    } else {
        const queryText = `
            UPDATE "Inventory".boutique 
            SET barcode = $1, name = $2, purchase_sale = $3, description = $4, max_inventary = $5
            WHERE id = $6
        `;
        const values = [barcode, name, price, description, max_inventary, id_boutique];

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error updating boutique in PostgreSQL:', error);
            return false;
        }
    }
}


async function add_new_product_to_boutique(req){
    const {id_company,id_branch,id_boutique}=req.params;
    const {barcode,name,description,max_inventary}=req.body;
    //if can added the boutique to the database, so we will save all the variants in the database
    //get the variants of the clothes
    const tallas = req.body['talla[]'];    
    const colores = req.body['color[]'];
    const prices = req.body['prices[]'];
    const existences = req.body['existence[]'];

    if(colores){
        //use this variable for know if we could add all the variants of the product 
        let canAdd=true;
        let productsThatNoWasAdd='';

        //her we will read all the variants of the clothes
        for (let i = 0; i < colores.length; i++) {
            //get the data of the variants
            const size=tallas[i];
            const color=colores[i];
            const priceProduct=prices[i];
            const existence=existences[i];

            //make the new barcode and the new name use the size and the color of the product
            const newBarcode=`${barcode}-${color}-${size}`;
            const newName=`${name}-color ${color} talla ${size}`;
            
            //her we will save all the new product and the new combo in the company and in the branch
            const result=await add_product_to_boutique(id_company, id_branch, newBarcode,newName,description,priceProduct,1,priceProduct,existence,max_inventary);

            //if the product can save in the database, we will save in the table of the boutique
            if(result !=null){
                await add_product_to_the_table_of_boutique(id_boutique,result.idComboFacture,result.idSuppliesFactures);
            }else{
                //if the product no can save in the database, we will save the name of the product for show to the user after
                canAdd=false;
                productsThatNoWasAdd+=newName+',';
            }
        }
    }
}

async function update_old_product_to_boutique(req){
    //get tha old information of the form. This is for update the information of the product
    const oldName=req.body.name_old;
    const oldBarCode=req.body.barcode_old;
    const newName=req.body.name;
    const newBarCode=req.body.barcode;

    //if can added the boutique to the database, so we will save all the variants in the database
    //get the variants of the clothes
    const id_dish_and_combo_features_form = req.body['id_dish_and_combo_features[]'];    
    const id_product_and_suppiles_features_form = req.body['id_product_and_suppiles_features[]'];
    const names = req.body['name-old[]'];
    const barcodes = req.body['barcode-old[]'];
    const prices = req.body['prieces-old[]'];
    const existences = req.body['existence-old[]'];

    //use this variable for know if we could add all the variants of the product 
    let canAdd=true;
    let productsThatNoWasAdd='';

    //her we will read all the variants of the clothes
    for (let i = 0; i < id_dish_and_combo_features_form.length; i++) {
        //get the data of the variants
        const id_dish_and_combo_features=id_dish_and_combo_features_form[i];
        const id_product_and_suppiles_features=id_product_and_suppiles_features_form[i];
        const name = names[i];
        const barcode = barcodes[i];
        const price = prices[i];
        const existence = existences[i];
    

        //her we will see if exist a change in the name or in the barcode of the product, if exist we will update the name and the barcode
        //this is for that the backend not have problems of speed
        if(oldName!=newName || oldBarCode!=newBarCode){
            //her we will create the new name and bracode if the user change the name or the barcode
            const newNameProduct = name.replace(oldName, newName);
            const newBarcodeProduct = barcode.replace(oldBarCode, newBarCode);

            //we will see if can update the information of the product
            const id_dishes_and_combos=await get_id_combo(id_dish_and_combo_features);
            const id_product_and_suppiles=await get_id_supplies(id_product_and_suppiles_features);

            await update_the_name_and_barcode_of_the_product(newNameProduct, newBarcodeProduct, id_dishes_and_combos);
            await update_the_name_and_barcode_of_the_product_in_the_inventory(newNameProduct, newBarcodeProduct, id_product_and_suppiles);
        }

        //her we will update all the inventory of the product and his data
        await update_the_inventory_of_the_product(existence, id_product_and_suppiles_features);
        await update_the_price_of_the_product(price, id_dish_and_combo_features);
    }
}

async function update_the_name_and_barcode_of_the_product(newNameProduct, newBarcodeProduct, id_dishes_and_combos) {
  if (TYPE_DATABASE === 'mysqlite') {
    const queryText = `
      UPDATE dishes_and_combos
      SET name = ?, barcode = ?
      WHERE id = ?
    `;
    const values = [newNameProduct, newBarcodeProduct, id_dishes_and_combos];

    return new Promise((resolve) => {
      database.run(queryText, values, function(err) {
        if (err) {
          console.error('Error updating name and barcode in SQLite:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } else {
    const queryText = `
      UPDATE "Kitchen".dishes_and_combos
      SET name = $1, barcode = $2
      WHERE id = $3
    `;
    const values = [newNameProduct, newBarcodeProduct, id_dishes_and_combos];

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error updating name and barcode in PostgreSQL:', error);
      return false;
    }
  }
}

async function update_the_name_and_barcode_of_the_product_in_the_inventory(newNameProduct, newBarcodeProduct, id_product_and_supplies) {
  if (TYPE_DATABASE === 'mysqlite') {
    const queryText = `
      UPDATE products_and_supplies
      SET name = ?, barcode = ?
      WHERE id = ?
    `;
    const values = [newNameProduct, newBarcodeProduct, id_product_and_supplies];

    return new Promise((resolve) => {
      database.run(queryText, values, function(err) {
        if (err) {
          console.error('Error updating name and barcode in SQLite:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } else {
    const queryText = `
      UPDATE "Kitchen".products_and_supplies
      SET name = $1, barcode = $2
      WHERE id = $3
    `;
    const values = [newNameProduct, newBarcodeProduct, id_product_and_supplies];

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error updating name and barcode in PostgreSQL:', error);
      return false;
    }
  }
}


async function get_id_combo(id_dish_and_combo_features) {
  if (TYPE_DATABASE === 'mysqlite') {
    const query = 'SELECT id_dishes_and_combos FROM dish_and_combo_features WHERE id = ?';
    const values = [id_dish_and_combo_features];

    return new Promise((resolve) => {
      database.get(query, values, (err, row) => {
        if (err) {
          console.error('Error al obtener id_dishes_and_combos en SQLite:', err);
          resolve(null);
        } else {
          resolve(row ? row.id_dishes_and_combos : null);
        }
      });
    });
  } else {
    const query = 'SELECT id_dishes_and_combos FROM "Inventory".dish_and_combo_features WHERE id=$1';
    const values = [id_dish_and_combo_features];

    try {
      const result = await database.query(query, values);
      if (result.rows.length > 0) {
        return result.rows[0].id_dishes_and_combos;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener id_dishes_and_combos en PostgreSQL:', error);
      return null;
    }
  }
}

async function get_id_supplies(id_product_and_suppiles_features) {
  if (TYPE_DATABASE === 'mysqlite') {
    const query = 'SELECT id_products_and_supplies FROM product_and_suppiles_features WHERE id = ?';
    const values = [id_product_and_suppiles_features];

    return new Promise((resolve) => {
      database.get(query, values, (err, row) => {
        if (err) {
          console.error('Error al obtener id_products_and_supplies en SQLite:', err);
          resolve(null);
        } else {
          resolve(row ? row.id_products_and_supplies : null);
        }
      });
    });
  } else {
    const query = 'SELECT id_products_and_supplies FROM "Inventory".product_and_suppiles_features WHERE id=$1';
    const values = [id_product_and_suppiles_features];

    try {
      const result = await database.query(query, values);
      if (result.rows.length > 0) {
        return result.rows[0].id_products_and_supplies;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener id_products_and_supplies en PostgreSQL:', error);
      return null;
    }
  }
}

async function update_the_inventory_of_the_product(existence, id_product_and_suppiles_features) {
  if (TYPE_DATABASE === 'mysqlite') {
    const queryText = `
      UPDATE product_and_suppiles_features 
      SET existence = ? 
      WHERE id = ?
    `;
    const values = [existence, id_product_and_suppiles_features];

    return new Promise((resolve) => {
      database.run(queryText, values, function (err) {
        if (err) {
          console.error('Error al actualizar existence en SQLite:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } else {
    const queryText = `
      UPDATE "Inventory".product_and_suppiles_features 
      SET existence = $1 
      WHERE id = $2
    `;
    const values = [existence, id_product_and_suppiles_features];

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error al actualizar existence en PostgreSQL:', error);
      return false;
    }
  }
}


async function update_the_price_of_the_product(price_1, id_dish_and_combo_features) {
  if (TYPE_DATABASE === 'mysqlite') {
    const queryText = `
      UPDATE dish_and_combo_features
      SET price_1 = ?
      WHERE id = ?
    `;
    const values = [price_1, id_dish_and_combo_features];

    return new Promise((resolve) => {
      database.run(queryText, values, function (err) {
        if (err) {
          console.error('Error al actualizar price_1 en SQLite:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } else {
    const queryText = `
      UPDATE "Inventory".dish_and_combo_features 
      SET price_1 = $1 
      WHERE id = $2
    `;
    const values = [price_1, id_dish_and_combo_features];

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error al actualizar price_1 en PostgreSQL:', error);
      return false;
    }
  }
}



router.get('/:id_company/:id_branch/:id_boutique/:id_table_boutique/:id_dish_and_combo_features/:id_product_and_suppiles_features/delete-products-boutique', isLoggedIn, async (req, res) => {
    
    const {id_company,id_branch,id_boutique,id_table_boutique,id_dish_and_combo_features,id_product_and_suppiles_features}=req.params;

    const idSupplies=await get_id_supplies(id_product_and_suppiles_features);
    const idCombos=await get_id_combo(id_dish_and_combo_features);

    //this is for delete tha image of the product
    const pathImage=await get_path_image_combo(idCombos);
    await delate_image_upload(pathImage);

    //her we will delete all the data of the product
    let canDelete=true;
    canDelete=await delete_table_boutique(id_table_boutique);
    await delete_all_supplies_combo(idCombos);
    await delete_product_combo_company(idCombos);
    await delete_product_and_suppiles_features(id_product_and_suppiles_features);
    await delete_supplies_company(idSupplies);

    
    if(canDelete){
        req.flash('success', 'El producto fue eliminado con éxito de tu boutique 😉');
    }else{
        req.flash('message', `Ocurrió un error al momento de eliminar el producto 🤕`);
    }

    res.redirect(`/links/${id_company}/${id_branch}/${id_boutique}/edit-boutique`);
})

async function delete_table_boutique(id) {
  if (TYPE_DATABASE === 'mysqlite') {
    const queryText = `DELETE FROM table_boutique WHERE id = ?`;
    return new Promise((resolve) => {
      database.run(queryText, [id], function(err) {
        if (err) {
          console.error('Error al eliminar en SQLite:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } else {
    const queryText = `DELETE FROM "Inventory".table_boutique WHERE id = $1`;
    const values = [id];

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error al eliminar en PostgreSQL:', error);
      return false;
    }
  }
}

async function get_path_image_combo(idCombos) {
  if (TYPE_DATABASE === 'mysqlite') {
    const query = `SELECT img FROM dishes_and_combos WHERE id = ?`;
    return new Promise((resolve) => {
      database.get(query, [idCombos], (err, row) => {
        if (err) {
          console.error('Error al obtener img en SQLite:', err);
          resolve('');
        } else {
          resolve(row ? row.img : '');
        }
      });
    });
  } else {
    const query = `SELECT img FROM "Kitchen".dishes_and_combos WHERE id = $1`;
    const values = [idCombos];
    try {
      const result = await database.query(query, values);
      if (result.rows.length > 0) {
        return result.rows[0].img;
      } else {
        return '';
      }
    } catch (error) {
      console.error('Error al obtener img en PostgreSQL:', error);
      return '';
    }
  }
}



router.get('/:id_company/:id_branch/:id_boutique/delete-all-the-boutique', isLoggedIn, async (req, res) => {
    
    const {id_company,id_branch,id_boutique}=req.params;
    //get all the products of the boutique
    const boutique=await get_all_the_table_boutique(id_boutique);

    //her is for delete all the items that exist in the tabla of boutique
    for (const item of boutique) {
        const idSupplies=await get_id_supplies(item.id_product_and_suppiles_features);
        const idCombos=await get_id_combo(item.id_dish_and_combo_features);
    
        //this is for delete tha image of the product
        const pathImage=await get_path_image_combo(idCombos);
        await delate_image_upload(pathImage);
    
        //her we will delete all the data of the product
        await delete_table_boutique(item.id);
        await delete_all_supplies_combo(idCombos);
        await delete_product_combo_company(idCombos);
        await delete_product_and_suppiles_features(item.id_product_and_suppiles_features);
        await delete_supplies_company(idSupplies);
    }

    //now we will delete the boutique 
    if(await delete_the_boutique(id_boutique)){
        req.flash('success', 'El boutique fue eliminado con éxito 😉');
    }else{
        req.flash('message', `Ocurrió un error al momento de eliminar el boutique 🤕`);
    }
    
    res.redirect(`/links/${id_company}/${id_branch}/boutique`);
})

async function get_all_the_table_boutique(id_boutique) {
  if (TYPE_DATABASE === 'mysqlite') {
    const queryText = `
      SELECT * FROM table_boutique
      WHERE id_boutique = ?
    `;
    return new Promise((resolve) => {
      database.all(queryText, [id_boutique], (err, rows) => {
        if (err) {
          console.error('Error al obtener datos en SQLite:', err);
          resolve([]);
        } else {
          resolve(rows);
        }
      });
    });
  } else {
    const queryText = `
      SELECT * FROM "Inventory".table_boutique
      WHERE id_boutique = $1
    `;
    try {
      const result = await database.query(queryText, [id_boutique]);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener datos en PostgreSQL:', error);
      return [];
    }
  }
}


async function delete_the_boutique(id) {
  if (TYPE_DATABASE === 'mysqlite') {
    const queryText = 'DELETE FROM boutique WHERE id = ?';

    return new Promise((resolve) => {
      database.run(queryText, [id], function(err) {
        if (err) {
          console.error('Error al eliminar boutique en SQLite:', err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } else {
    const queryText = 'DELETE FROM "Inventory".boutique WHERE id = $1';
    const values = [id];

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error al eliminar boutique en PostgreSQL:', error);
      return false;
    }
  }
}

module.exports = router;