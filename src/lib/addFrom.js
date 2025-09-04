const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const database = require('../database');
const helpers = require('../lib/helpers.js');
const addDatabase = require('../router/addDatabase');
const update = require('../router/updateDatabase');


const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

const rolFree = 0

const fs = require('fs');
const path = require('path');

const printer = require('../lib/printer');

//functions permission
const {
    this_user_have_this_permission
} = require('../services/permission');

//functions branch
const {
    get_data_branch,
    get_branch
} = require('../services/branch');


//config the connection with digitalocean
/*
const AWS = require('aws-sdk');
const { APP_NYCE, APP_ACCESS_KEY_ID, SECRET_ACCESS_KEY } = process.env; //Get our nyce3 for connection with digitalocean
const spacesEndpoint = new AWS.Endpoint(APP_NYCE)

const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: APP_ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
});

const bucketName = APP_NYCE;
*/

const sharp = require('sharp'); //this is for resize the image and make like webp
require('dotenv').config();
const {TYPE_DATABASE, TYPE}=process.env;
const {get_path_folder_upload, get_path_folder_plus}=require('../initialAppForDesktop.js');

async function downloadImageFromUrl(url, filename) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error al descargar imagen: ${res.statusText}`);

    let destPath = get_path_folder_upload();
    if (TYPE === 'server') {
        destPath = path.join(__dirname, '../public/img/uploads', filename);
    } else {
        destPath = path.join(destPath, filename);
    }

    const fileStream = fs.createWriteStream(destPath);

    await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on("error", reject);
        fileStream.on("finish", () => {
            fileStream.close(resolve); // importante para Windows
        });
    });

    // ✅ Esperar 100ms para dar tiempo al sistema a liberar el archivo
    await new Promise(resolve => setTimeout(resolve, 100));

    return destPath; // cambia aquí: devuelve la ruta absoluta
}

async function upload_image_to_space(filePath, objectName) {
    //THIS IS FOR WHEN THE APPLICATION IS FOR DESKTOP
    const currentPath = path.basename(filePath);
    const pathFolderUpload=get_path_folder_upload()
    //return path.join(pathFolderUpload, currentPath);
    const newUploadSpace=path.join('/uploads', currentPath)
    return newUploadSpace;

    /*
    const fileContent = fs.readFileSync(filePath);

    const params = {
        Bucket: bucketName,
        Key: objectName,
        Body: fileContent,
        ACL: 'public-read' // O 'private' si deseas que no sea público
    };

    try {
        const data = await s3.upload(params).promise();
        console.log('Image upload with success digitalocean:', data.Location);
        fs.unlinkSync(filePath); // delete file temporary
        return data.Location;
    } catch (err) {
        console.error('Error to upload the image to digitalocean:', err);
        return '';
    }
    */
};

async function delete_image_upload(pathImg) {
    //THIS IS FOR WHEN THE APPLICATION IS FOR DESKTOP
    /*
    const params = {
        Bucket: bucketName,
        Key: pathImg
    };

    try {
        await s3.deleteObject(params).promise();
        console.log(`Image delete with success`);
        return true;
    } catch (err) {
        console.error('Error to delete the image:', err);
        return false;
    }
    */

    //THIS IS FOR WHEN THE WEB IS IN A SERVER
    //var pathImage = path.join(__dirname, '../public', pathImg); //path.join(__dirname, '../public/img/uploads', pathImg);
    const pathImage=path.join(get_path_folder_plus(), pathImg);
    fs.unlink(pathImage, (error) => {
        if (error) {
            console.error('Error to delate image:', error);
        } else {
            console.log('Image delate success');
        }
    });

    return true;
}

async function create_a_new_image(req) {
    const pathFolderUpload = get_path_folder_upload();

    // 1. Cuando subes un archivo local
    if (req.file) {
        const filePath = req.file.path;

        if (!fs.existsSync(filePath)) {
            console.error(`❌ El archivo no existe: ${filePath}`);
            return null;
        }

        const filenameWebp = path.parse(req.file.filename).name + '.webp';
        const destPath = path.join(path.dirname(filePath), filenameWebp);

        try {
            await sharp(filePath)
                .webp({ quality: 80 })
                .toFile(destPath);

            await new Promise(resolve => setTimeout(resolve, 100));
            await fs.promises.unlink(filePath);
        } catch (err) {
            console.error(`⚠️ Error al procesar la imagen subida: ${err.message}`);
            return `/uploads/${filenameWebp}`;
        }

        const imageUrl = await upload_image_to_space(destPath, filenameWebp);
        return imageUrl;
    }

    // 2. Cuando llega una URL
    if (req.body.imageUrl && req.body.imageUrl.startsWith('http')) {
        const url = req.body.imageUrl.trim();
        const filename = `img_${Date.now()}.webp`;
        //const pathDownload = path.join(pathFolderUpload, `temp_${filename}`);

        // Here we will download the image from the URL and get his name
        const downloadedPath = await downloadImageFromUrl(url, `temp_${filename}`);

        try {
            
            //this is the path where we will save the image finish converted to webp if not exist
            const destPath = path.join(pathFolderUpload, filename);

            //convert the image download to a image webp  with the size of 80 quality
            await sharp(downloadedPath)
                .webp({ quality: 80 })
                .toFile(destPath);

            //wait for the system to release the file
            await new Promise(resolve => setTimeout(resolve, 100));

            await fs.promises.unlink(`temp_${filename}`); //delete the temporary file of the image downloaded
            return `/uploads/${filename}`;
        } catch (err) {
            console.error('⚠️ Error procesando imagen remota:', err.message);
            await delete_image_upload(`temp_${filename}`);
            return `/uploads/${filename}`;
        }
    }
    return '';
}

//packs 
async function get_pack_database(id_company) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT pack_database
                FROM companies
                WHERE id = ?
            `;

            database.get(query, [id_company], (err, row) => {
                if (err) {
                    console.error('Error al obtener pack_database desde SQLite:', err);
                    resolve(0);
                } else {
                    resolve(row ? row.pack_database : null);
                }
            });
        });
    }


    
    try {
        const queryText = `
            SELECT pack_database
            FROM "User".companies
            WHERE id = $1
        `;
        const { rows } = await database.query(queryText, [id_company]);
        if (rows.length > 0) {
            return rows[0].pack_database;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error al obtener pack_database:', error);
        return 0;
    }
}

async function get_pack_branch(id_branch) {
    try {
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
    } catch (error) {
        console.error('Error al obtener pack_database:', error);
        return 0;
    }
}


//add company
passport.use('local.add_company', new LocalStrategy({
    usernameField: 'name',
    passwordField: 'alias',
    passReqToCallback: true
}, async (req, name, password, done) => {
    console.log(req.body);
    if (mandatory_company_data(req)) {
        if (!await compare_company_with_name(req, name)) {
            const newCompany = get_new_company(req);
            if (await addDatabase.add_company(newCompany)) {
                done(null, false, req.flash('success', 'La empresa fue añadida con éxito ❤️'));
            }
            else {
                done(null, false, req.flash('message', 'La empresa no se pudo agregar a la base de datos 😰'));
            }
        }
        else {
            done(null, false, req.flash('message', 'Este nombre ya existe 😅'));
        }
    }
    else {
        done(null, false, req.flash('message', 'Debes completar toda la información requerida 👉👈'));
    }
}));

function mandatory_company_data(req) {
    //we get the required data
    const { name, alias, email, representative, municipality, city, cologne, street, postal_code } = req.body;

    //We will watch if the mandatory data was filled
    return (name != '' && alias != '' && representative != '' && municipality != '' && city != '' && cologne != '' && street != '' && postal_code != '' && email != '')
}

async function compare_company_with_name(req, name) {
    const userId = parseInt(req.user.id);

    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `
                SELECT * FROM companies
                WHERE name = ? AND id_users = ?
            `;
            database.get(queryText, [name, userId], (err, row) => {
                if (err) {
                    console.error('Error en compare_company_with_name (SQLite):', err);
                    return resolve(false);
                }
                resolve(!!row); // true si existe, false si no
            });
        });
    }

    // PostgreSQL
    try {
        const queryText = `
            SELECT * FROM "User".companies
            WHERE name = $1 AND id_users = $2
        `;
        const values = [name, userId];
        const user = await database.query(queryText, values);
        return user.rows.length > 0;
    } catch (err) {
        console.error('Error en compare_company_with_name (PostgreSQL):', err);
        return false;
    }
}


async function get_new_company(req) {
    //we get all the data of the company
    const { image, name, pathImage, alias, tradename, description, representative, phone, cell_phone, email, country, municipality, city, cologne, street, num_o, num_i, postal_code } = req.body;
    var path_image = await create_a_new_image(req);

    const company = {
        id_user: parseInt(req.user.id),
        path_logo: path_image,
        tradename: tradename,
        name: name,
        alias: alias,
        description: description,
        representative: representative,
        phone: phone,
        cell_phone: cell_phone,
        email: email,
        id_country: parseInt(country),
        municipality: municipality,
        city: city,
        cologne: cologne,
        streets: street,
        num_o: num_o,
        num_i: num_i,
        postal_code: postal_code
    }

    return company;
}


//edit company 
async function get_image(id) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `
                SELECT * FROM companies
                WHERE id = ?
            `;
            database.get(queryText, [id], (err, row) => {
                if (err) {
                    console.error('Error en get_image (SQLite):', err);
                    return resolve(null);
                }
                resolve(row ? row.path_logo : null);
            });
        });
    }

    try {
        const queryText = `
            SELECT * FROM "User".companies
            WHERE id = $1
        `;
        const result = await database.query(queryText, [id]);
        return result.rows[0]?.path_logo || null;
    } catch (error) {
        console.error('Error en get_image (PostgreSQL):', error);
        return null;
    }
}

router.post('/fud/:id_company/edit-company', async (req, res) => {
    const { id_company } = req.params;
    const newCompany = await get_new_company(req);
    const { id_branch } = req.body;

    //we will waching if exist a new icon for the company 
    if (newCompany.path_logo != "") {
        const pathImg = await get_image(id_company)
        await delete_image_upload(pathImg)
    }

    //this is for show a message to the user
    if (await update.update_company(newCompany, id_company)) {
        req.flash('success', 'La compañía fue actualizada con exito 💗')
    } else {
        req.flash('message', 'La compañía no fue actualizada 🥺')
    }

    //we will see if the user have a subscription to ONE or is the CEO
    if (id_branch) {
        res.redirect(`/links/${id_company}/${id_branch}/options`);
    } else {
        res.redirect(`/links/${id_company}/options`);
    }
});


//add department
router.post('/fud/:id/add-department', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!await this_department_exists(req, name)) {
        const newDepartment = get_new_department(req);
        if (await addDatabase.add_product_department(newDepartment)) {
            req.flash('success', 'El departamento fue agregado con éxito! 😊');
        }
        else {
            req.flash('message', 'No se pudo agregar a la base de datos 😰');
        }
    }
    else {
        req.flash('message', 'Este departamento ya existe 😅');
    }

    //we will see if the user is in a version of fud one 
    if (req.user.rol_user == rolFree) {
        const { id_branch } = req.body;
        res.redirect(`/links/${id}/${id_branch}/food-department-free`);
    } else {
        res.redirect(`/links/${id}/food-department`);
    }
});

function get_new_department(req) {
    //get the data of the new department
    const { name, description } = req.body;
    const { id } = req.params;

    //add the department
    const department = {
        id_company: id,
        name: name,
        description: description
    }

    return department;

}

async function this_department_exists(req, name) {
    const { id } = req.params;

    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            const queryText = `
                SELECT * FROM product_department
                WHERE id_companies = ? AND name = ?
            `;
            database.get(queryText, [id, name], (err, row) => {
                if (err) {
                    console.error('Error en this_department_exists (SQLite):', err);
                    return resolve(false);
                }
                resolve(!!row); // true si existe, false si no
            });
        });
    }

    // PostgreSQL
    try {
        const queryText = `
            SELECT * FROM "Kitchen".product_department
            WHERE id_companies = $1 AND name = $2
        `;
        const values = [id, name];
        const companies = await database.query(queryText, values);
        return companies.rows.length > 0;
    } catch (err) {
        console.error('Error en this_department_exists (PostgreSQL):', err);
        return false;
    }
}

//add category
router.post('/fud/:id/add-category', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!await this_category_exists(req, name)) {
        const newDepartment = get_new_category(req);
        if (await addDatabase.add_product_category(newDepartment)) {
            req.flash('success', 'El departamento fue agregado con éxito! 😄');
        }
        else {
            req.flash('message', 'El departamento no fue agregado 😰');
        }
    }
    else {
        req.flash('message', 'Este departamento ya existe en tu empresa 👉👈');
    }

    //we will see if the user is in a version of fud one 
    if (req.user.rol_user == rolFree) {
        const { id_branch } = req.body;
        res.redirect(`/links/${id}/${id_branch}/food-area-free`);
    } else {
        res.redirect(`/links/${id}/food-department`);
    }
});


function get_new_category(req) {
    //get the data of the new department
    const { name, description } = req.body;
    const { id } = req.params;

    //add the department
    const department = {
        id_company: id,
        name: name,
        description: description
    }

    return department;

}

async function this_category_exists(req, name) {
    // Get the company ID
    const { id } = req.params;

    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            // Search this category in the database
            const queryText = `
                SELECT * FROM product_department
                WHERE id_companies = ? AND name = ?
            `;
            database.get(queryText, [id, name], (err, row) => {
                if (err) {
                    console.error('Error in this_category_exists (SQLite):', err);
                    return resolve(false);
                }
                resolve(!!row); // true if exists, false if not
            });
        });
    }

    // PostgreSQL
    try {
        // Search this category in the database
        const queryText = `
            SELECT * FROM "Kitchen".product_department
            WHERE id_companies = $1 AND name = $2
        `;
        const values = [id, name];
        const companies = await database.query(queryText, values);
        return companies.rows.length > 0;
    } catch (err) {
        console.error('Error in this_category_exists (PostgreSQL):', err);
        return false;
    }
}

//add supplies 
passport.use('local.add_supplies', new LocalStrategy({
    usernameField: 'name',
    passwordField: 'name',
    passReqToCallback: true
}, async (req, name, password, done) => {
    var path_image = create_a_new_image(req);
    done(null, false, req.flash('success', 'El departamento fue agregado con éxito! 😄'));
}));

//add supplies
router.post('/fud/:id/add-company-supplies', async (req, res) => {
    const { id } = req.params;
    const newSupplies = get_supplies_or_product_company(req, true);
    if (await addDatabase.add_supplies_company(newSupplies)) {
        req.flash('success', 'El insumo fue actualizado con éxito! 👍')
    }
    else {
        req.flash('message', 'El insumo no fue actualizado con éxito 👉👈')
    }

    res.redirect('/links/' + id + '/company-supplies');
});

router.post('/fud/:id/add-company-products', async (req, res) => {
    const { id } = req.params;
    const newSupplies = get_supplies_or_product_company(req, false);
    if (await addDatabase.add_supplies_company(newSupplies)) {
        req.flash('success', 'El producto fue actualizado con éxito 👍')
    }
    else {
        req.flash('message', 'El producto no fue actualizado 😅')
    }

    res.redirect('/links/' + id + '/company-products');
});

async function get_supplies_or_product_company(req, this_is_a_supplies) {
    const { id } = req.params;
    const use_inventory = (req.body.inventory == 'on')
    const { barcode, name, description } = req.body
    const img = await create_a_new_image(req)

    const supplies = {
        id_company: id,
        img,
        barcode,
        name,
        description,
        use_inventory,
        this_is_a_supplies: this_is_a_supplies
    }

    return supplies;
}

//add combo
router.post('/fud/:id_company/add-company-combo', async (req, res) => {
    const { id_company } = req.params;
    const { barcodeProducts, idBranch } = req.body;

    //we will see if the user add a product or supplies 
    if (barcodeProducts == '') {
        req.flash('message', 'the combo need have a product or some supplies 😅')
        res.redirect('/fud/' + id_company + '/add-combos');
    }
    else {
        const packCompany = await get_pack_database(id_company)
        //we will see if the user can save image in the database 
        if (packCompany == 0) {
            req.file = null;
        }

        //get the new combo
        const combo = await create_a_new_combo(req)

        //we will see if can add the combo to the database
        const idCombos = await addDatabase.add_combo_company(combo)

        //we will wach if the user have a branch free or a franquicia
        if (req.user.rol_user != rolFree) {
            if (idCombos) {
                req.flash('success', 'El combo fue agregado con éxito ❤️')
            }
            else {
                req.flash('message', 'El combo no fue agregado con éxito 😳')
            }

            res.redirect('/fud/' + id_company + '/combos');
        } else {
            //get the data combo in the branch
            const comboData = create_combo_data_branch(idCombos, id_company, idBranch);

            // save the combo in the branch
            const idComboFacture = await addDatabase.add_combo_branch(comboData);

            //we will see if can save the combo in the branch
            if (idComboFacture) {
                req.flash('success', 'El combo fue creado con exito ❤️')
                res.redirect('/links/' + id_company + '/' + idBranch + '/' + idComboFacture + '/edit-combo-free');
            } else {
                req.flash('message', 'El combo no fue agregado intentalo de nuevo 😅')
                res.redirect('/links/' + id_company + '/' + idBranch + '/add-combos-free');
            }
        }
    }
});

async function create_a_new_combo(req) {
    const { barcode, name, description, barcodeProducts } = req.body;
    const { id_company } = req.params;

    const supplies = parse_barcode_products(barcodeProducts)
    var path_image = await create_a_new_image(req);
    const combo = {
        id_company: id_company,
        path_image,
        barcode,
        name,
        description,
        id_product_department: req.body.department,
        id_product_category: req.body.category,
        supplies
    }

    return combo;
}

function parse_barcode_products(barcodeProducts) {
    //her is for know if exist barcodeProducts in the form 
    if (!barcodeProducts) {
        return [];
    }

    // Remove leading and trailing brackets if present
    barcodeProducts = barcodeProducts.trim().replace(/^\[|\]$/g, '');

    // Split the string by '],[' to get each object
    var objects = barcodeProducts.split('],[');

    // Create an array to store the resulting objects
    var result = [];

    // Iterate over the objects and build an array for each one
    for (var i = 0; i < objects.length; i++) {
        // Remove leading and trailing brackets for each object
        var objectData = objects[i].replace(/^\[|\]$/g, '');

        // Split the values of the object by ',' and convert them as needed
        var values = objectData.split(',');
        var idProduct = parseFloat(values[0]);
        var amount = parseFloat(values[1]);
        var foodWaste = parseFloat(values[2].trim());
        var unity = values[3].trim();

        var additional = values[4].trim();
        additional = additional.replace("]", "");
        additional = (additional === 'true') //know if the value is true

        // Check if the values are valid before adding them to the result
        if (!isNaN(idProduct) && !isNaN(amount) && unity) {
            result.push({ idProduct: idProduct, amount: amount, foodWaste: foodWaste, unity: unity, additional: additional });
        }
    }

    return result;
}

function create_combo_data_branch(idCombo, idCompany, id_branch) {
    const comboData = {
        idCompany: idCompany,
        idBranch: id_branch,
        idDishesAndCombos: idCombo,
        price_1: 0,
        price_2: 0,
        amount: 0,
        product_cost: 0,
        revenue_1: 0,
        purchase_unit: 'Pza'
    };
    return comboData;
}

//edit combo 
router.post('/fud/:id_company/:id_combo/edit-combo-company', isLoggedIn, async (req, res) => {
    const { id_company, id_combo } = req.params;
    const { barcodeProducts } = req.body;

    //we will see if the user add a product or supplies 
    if (barcodeProducts == '') {
        req.flash('message', 'El combo necesita tener un producto o algunos suministros 😅')
        res.redirect('/links/' + id_company + '/' + id_combo + '/edit-combo-company');
    }
    else {

        //get the new combo
        const combo = await create_a_new_combo(req)
        //we will see if can add the combo to the database
        if (await update.update_combo(id_combo, combo)) {
            //we will delate all the supplies of the combo for to save it later
            await delete_all_supplies_combo(id_combo) //id
            await addDatabase.save_all_supplies_combo_company(id_combo, combo.supplies) //We will save all the supplies again
            req.flash('success', 'El combo fue actualizado con éxito ❤️')
        }
        else {
            req.flash('message', 'El combo no fue actualizado con éxito 😳')
        }

        //we will see if the user have the pack free 
        if (req.user.rol_user != rolFree) {
            //if the user have a rol of admin send to combo company
            res.redirect('/links/' + id_company + '/combos');
        } else {
            //if the user have a count free, get the branch id for redirect to the user 
            const { id_branch } = req.body;
            res.redirect('/links/' + id_company + '/' + id_branch + '/combos-free');
        }
    }
})

async function delete_all_supplies_combo(id) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            // Delete combo supplies in SQLite
            const queryText = `
                DELETE FROM table_supplies_combo
                WHERE id_dishes_and_combos = ?
            `;
            database.run(queryText, [id], function(err) {
                if (err) {
                    console.error('Error deleting supplies combo (SQLite):', err);
                    return resolve(false);
                }
                resolve(true);
            });
        });
    }

    // PostgreSQL
    try {
        // Delete combo supplies in PostgreSQL
        const queryText = `
            DELETE FROM "Kitchen".table_supplies_combo
            WHERE id_dishes_and_combos = $1
        `;
        const values = [id];
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error deleting supplies combo (PostgreSQL):', error);
        return false;
    }
}

//edit supplies 
router.post('/fud/:id_company/:id/edit-supplies-form', isLoggedIn, async (req, res) => {
    const { id_company, id } = req.params;
    const { image, barcode, name, description } = req.body;

    //we know if this object is a supplies or a product 
    const dataSuppliesProcut = await get_data_supplies_product(id)
    const thisIsASupplies = dataSuppliesProcut.supplies
    //we will to see if be a name
    if (barcode == "") {
        req.flash('message', '👁️ Necesitas agregar un código de barras a tus suministros');
    }
    if (name == "") {
        req.flash('message', '👁️ Necesitas agregar un nombre a tus suministros');
    }

    //we will see if can edit the supplies
    if (barcode != "" && name != "") {
        const newSupplies = await get_new_data_supplies_img_company(req);
        //we will waching if the user change the image 
        if (newSupplies.path_image != "") {
            //get the old direction of the imagen 
            const path_photo = dataSuppliesProcut.img

            //we will watching if the user haved a photo for delete
            if (path_photo != null) {
                await delete_image_upload(path_photo);
            }

            //we will creating the new supplies 
            if (await update_supplies_company_img(newSupplies)) {
                req.flash('success', 'El suministro fue actualizados con éxito 😁')
            }
            else {
                req.flash('message', 'El suministro NO fue actualizados 👉👈')
            }
        } else {
            //if the user not change the image 
            if (await update_supplies_company(newSupplies)) {
                req.flash('success', 'El suministro fue actualizados con éxito 😁')
            }
            else {
                req.flash('message', 'El suministro NO fue actualizados 👉👈')
            }
        }
    }

    //we will see if the user have a suscription for fud one 
    if (req.user.rol_user == rolFree) {
        const { id_branch } = req.body; //get the id branch
        res.redirect(`/links/${id_company}/${id_branch}/supplies-free`);
    }
    else {
        //rederict the object for the that be 
        if (thisIsASupplies) {
            res.redirect('/links/' + id_company + '/company-supplies');
        }
        else {
            res.redirect('/links/' + id_company + '/company-products');
        }
    }
})


async function get_data_supplies_product(id) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            // Search the product supplies in SQLite
            const queryText = `
                SELECT * FROM products_and_supplies
                WHERE id = ?
            `;
            database.get(queryText, [id], (err, row) => {
                if (err) {
                    console.error('Error fetching supplies product (SQLite):', err);
                    return resolve(null);
                }
                resolve(row);
            });
        });
    }

    // PostgreSQL
    try {
        // Search the product supplies in PostgreSQL
        const queryText = `
            SELECT * FROM "Kitchen".products_and_supplies
            WHERE id = $1
        `;
        const result = await database.query(queryText, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching supplies product (PostgreSQL):', error);
        return null;
    }
}

async function get_new_data_supplies_company(req) {
    const { id, id_company } = req.params;
    const { image, barcode, name, inventory, description } = req.body;
    const newSupplies = {
        id,
        id_company,
        barcode,
        name,
        description,
        use_inventory: (inventory == 'on')
    }
    return newSupplies;
}

async function update_supplies_company(newSupplies) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            // Update supplies in SQLite
            const queryText = `
                UPDATE products_and_supplies
                SET barcode = ?, name = ?, description = ?, use_inventory = ?
                WHERE id = ?
            `;
            const values = [
                newSupplies.barcode,
                newSupplies.name,
                newSupplies.description,
                newSupplies.use_inventory,
                newSupplies.id
            ];
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error updating supplies (SQLite):', err);
                    return resolve(false);
                }
                resolve(true);
            });
        });
    }

    // PostgreSQL
    try {
        // Update supplies in PostgreSQL
        const queryText = `
            UPDATE "Kitchen".products_and_supplies
            SET barcode = $1, name = $2, description = $3, use_inventory = $4
            WHERE id = $5
        `;
        const values = [
            newSupplies.barcode,
            newSupplies.name,
            newSupplies.description,
            newSupplies.use_inventory,
            newSupplies.id
        ];
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating supplies (PostgreSQL):', error);
        return false;
    }
}
async function get_new_data_supplies_img_company(req) {
    const { id, id_company } = req.params;
    const { image, barcode, name, inventory, description } = req.body;
    var path_image = await create_a_new_image(req);
    const newSupplies = {
        id,
        id_company,
        path_image,
        barcode,
        name,
        description,
        use_inventory: (inventory == 'on')
    }
    return newSupplies;
}

async function update_supplies_company_img(newSupplies) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            // Update supplies with image in SQLite
            const queryText = `
                UPDATE products_and_supplies
                SET barcode = ?, name = ?, description = ?, use_inventory = ?, img = ?
                WHERE id = ?
            `;
            const values = [
                newSupplies.barcode,
                newSupplies.name,
                newSupplies.description,
                newSupplies.use_inventory,
                newSupplies.path_image,
                newSupplies.id
            ];
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error updating supplies with image (SQLite):', err);
                    return resolve(false);
                }
                resolve(true);
            });
        });
    }

    // PostgreSQL
    try {
        // Update supplies with image in PostgreSQL
        const queryText = `
            UPDATE "Kitchen".products_and_supplies
            SET barcode = $1, name = $2, description = $3, use_inventory = $4, img = $5
            WHERE id = $6
        `;
        const values = [
            newSupplies.barcode,
            newSupplies.name,
            newSupplies.description,
            newSupplies.use_inventory,
            newSupplies.path_image,
            newSupplies.id
        ];
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating supplies with image (PostgreSQL):', error);
        return false;
    }
}

//add providers
async function this_provider_exists(provider) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve, reject) => {
            // Search for the provider in SQLite
            const queryText = `
                SELECT * FROM providers
                WHERE id_branches = ? AND name = ?
            `;
            database.all(queryText, [provider.branch, provider.name], (err, rows) => {
                if (err) {
                    console.error('Error checking provider (SQLite):', err);
                    return resolve(false);
                }
                resolve(rows.length > 1);
            });
        });
    }

    // PostgreSQL
    try {
        // Search for the provider in PostgreSQL
        const queryText = `
            SELECT * FROM "Branch".providers
            WHERE id_branches = $1 AND name = $2
        `;
        const values = [provider.branch, provider.name];
        const result = await database.query(queryText, values);
        return result.rows.length > 1;
    } catch (error) {
        console.error('Error checking provider (PostgreSQL):', error);
        return false;
    }
}

async function add_provider_to_database(provider, req) {
    if (await addDatabase.add_provider_company(provider)) {
        req.flash('success', 'El provedor fue agregado con exito 😄')
    }
    else {
        req.flash('message', 'El provedor no fue agregado 😰')
    }
}

router.post('/fud/:id_company/add-providers', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    const provider = create_new_provider(req);
    if (await this_provider_exists(provider)) {
        req.flash('message', 'Este proveedor ya existe en esta sucursal 😅')
    } else {
        await add_provider_to_database(provider, req);
    }
    res.redirect('/links/' + id_company + '/providers');
})

function create_new_provider(req) {
    const { branch, name, representative, rfc, curp, phone, cell_phone, email, website, creditLimit, dayCredit, comment, category, type, businessName, businessRfc, businessCurp, businessRepresentative, businessPhone, businessCell_phone, postalCode, address } = req.body;
    const provider = {
        branch: parseInt(branch),
        name,
        representative,
        email,
        website,
        rfc,
        curp,
        phone,
        cell_phone,
        creditLimit: convertCreditLimit(creditLimit),
        dayCredit: convertDayCredit(dayCredit),
        category,
        comment,
        type,
        businessName,
        businessRepresentative,
        businessRfc,
        businessCurp,
        businessPhone,
        businessCell_phone,
        address,
        postalCode,
    }
    return provider
}

function convertDayCredit(valorString) {
    // Intentar convertir la cadena a un número de punto flotante
    var numeroFloat = parseInt(valorString);

    // Verificar si el resultado es NaN y devolver 0 en ese caso
    if (isNaN(numeroFloat)) {
        return 0;
    }

    // Retornar el número de punto flotante convertido
    return numeroFloat;
}

function convertCreditLimit(valorString) {
    // Intentar convertir la cadena a un número de punto flotante
    var numeroFloat = parseFloat(valorString);

    // Verificar si el resultado es NaN y devolver 0 en ese caso
    if (isNaN(numeroFloat)) {
        return 0;
    }

    // Retornar el número de punto flotante convertido
    return numeroFloat;
}

router.post('/fud/:id_company/:id_branch/:id_provider/edit-providers', isLoggedIn, async (req, res) => {
    const { id_company, id_provider, id_branch } = req.params;
    const provider = create_new_provider(req);
    //we will changing the id branch for knkow
    provider.branch = id_branch;
    if (await this_provider_exists(id_provider)) {
        req.flash('message', 'Este proveedor ya existe en esta sucursal 😅')
    } else {
        await update_provider_to_database(id_provider, provider, req);
    }

    res.redirect('/links/' + id_company + '/providers');
})

async function update_provider_to_database(id_provider, provider, req) {
    if (await update.update_provider_company(id_provider, provider)) {
        req.flash('success', 'El proveedor fue actualizado con éxito 😁')
    }
    else {
        req.flash('message', 'El proveedor no fue actualizado con éxito 👉👈')
    }
}

//add branches
router.post('/fud/:id_company/add-new-branch', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    const { idSubscription } = req.body;

    //we will watching if this subscription exist in my database 
    if (await this_subscription_exist(idSubscription)) {
        //if this subscription was used, show a message of error 
        req.flash('message', 'Esta suscripción ya fue utilizada 😮');
    } else {
        const newBranch = create_new_branch(req);
        const idBranch = await addDatabase.add_branch(newBranch); //get the ID branch that save in the database
        //console.log(idBranch)
        if (idBranch != false) {
            await save_the_id_branch_with_the_id_subscription(idSubscription, idBranch);
            req.flash('success', 'La sucursal fue actualizada con exito ❤️')
        }
        else {
            req.flash('message', 'La sucursal no fue agregada 👉👈')
        }
    }

    res.redirect('/links/' + id_company + '/branches');
})

async function save_the_id_branch_with_the_id_subscription(idSubscription, idBranch) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve) => {
            // Update the subscription branch in SQLite
            const queryText = `
                UPDATE subscription
                SET id_branches = ?
                WHERE id = ?
            `;
            const values = [idBranch, idSubscription];
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error updating subscription branch (SQLite):', err);
                    return resolve(false);
                }
                resolve(true);
            });
        });
    }

    // PostgreSQL
    try {
        // Update the subscription branch in PostgreSQL
        const queryText = `
            UPDATE "User".subscription
            SET id_branches = $1
            WHERE id = $2
        `;
        const values = [idBranch, idSubscription];
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating subscription branch (PostgreSQL):', error);
        return false;
    }
}

async function this_subscription_exist(idSubscription) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve) => {
            // Check if the subscription exists in SQLite and has a non-null id_branches
            const queryText = `
                SELECT * FROM subscription WHERE id = ?
            `;
            database.get(queryText, [idSubscription], (err, row) => {
                if (err) {
                    console.error('Error checking subscription (SQLite):', err);
                    return resolve(false);
                }
                // Return true if row exists and id_branches is not null or undefined
                resolve(row && row.id_branches != null);
            });
        });
    }

    // PostgreSQL
    try {
        // Check if the subscription exists in PostgreSQL and has a non-null id_branches
        const queryText = `
            SELECT * FROM "User".subscription WHERE id = $1
        `;
        const values = [idSubscription];
        const result = await database.query(queryText, values);
        return result.rows[0] && result.rows[0].id_branches != null;
    } catch (error) {
        console.error('Error checking subscription (PostgreSQL):', error);
        return false;
    }
}

router.post('/fud/:id_branch/:id_company/edit-branch', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    //we will watching if this subscription exist in my database 
    const { idSubscription } = req.body;
    if (req.user.rol_user == rolFree) {
        const newBranch = create_new_branch(req);
        if (await update.update_branch(id_branch, newBranch)) {
            req.flash('success', 'La sucursal fue actualizada con exito 😊')
        }
        else {
            req.flash('message', 'La sucursal no fue actualizada 😰')
        }

        res.redirect('/links/home')
        //res.redirect(`/links/${id_company}/${id_branch}/edit-branch-free`);
    } else {
        if (!await this_subscription_exist_with_my_branch(idSubscription, id_branch)) {
            //if this subscription was used, show a message of error 
            req.flash('message', 'Esta suscripción ya fue utilizada 😮');
        }
        else {
            //we will watching if can update the subscription
            if (await update.update_subscription_branch(idSubscription, id_branch)) {
                const newBranch = create_new_branch(req);
                if (await update.update_branch(id_branch, newBranch)) {
                    req.flash('success', 'La sucursal fue actualizada con exito 😊')
                }
                else {
                    req.flash('message', 'La sucursal no fue actualizada 😰')
                }
            } else {
                req.flash('message', 'Ocurrio un error con el servidor, vuelve a intentarlo 👉👈')
            }
        }

        res.redirect(`/links/${id_company}/branches`);
    }
})

async function this_subscription_exist_with_my_branch(idSubscription, id_branch) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve) => {
            // Check subscription in SQLite and compare id_branches
            const queryText = `
                SELECT * FROM subscription WHERE id = ?
            `;
            database.all(queryText, [idSubscription], (err, rows) => {
                if (err) {
                    console.error('Error checking subscription (SQLite):', err);
                    return resolve(false);
                }
                if (rows.length > 1) {
                    return resolve(true);
                }
                if (rows.length === 1) {
                    const idBranches = rows[0].id_branches;
                    return resolve(idBranches == null || idBranches == id_branch);
                }
                resolve(false);
            });
        });
    }

    // PostgreSQL
    try {
        // Check subscription in PostgreSQL and compare id_branches
        const queryText = `
            SELECT * FROM "User".subscription WHERE id = $1
        `;
        const values = [idSubscription];
        const result = await database.query(queryText, values);
        if (result.rows.length > 1) {
            return true;
        } else if (result.rows.length === 1) {
            const idBranches = result.rows[0].id_branches;
            return idBranches == null || idBranches == id_branch;
        }
        return false;
    } catch (error) {
        console.error('Error checking subscription (PostgreSQL):', error);
        return false;
    }
}

function create_new_branch(req) {
    const { id_company } = req.params;
    const { name, alias, representative, phone, cell_phone, email, municipality, city, cologne, street, num_o, num_i, postal_code, token_uber_eat } = req.body;
    const newBranch = {
        id_company: id_company,
        name,
        alias,
        representative,
        phone,
        cell_phone,
        email,
        country: req.body.country,
        municipality,
        city,
        cologne,
        street,
        num_o,
        num_i,
        postal_code,
        token_uber_eat
    }

    return newBranch;
}

//customer
router.post('/fud/:id_company/addCustomer', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    const newCustomer = create_new_customer(req);
    if (await addDatabase.add_customer(newCustomer)) {
        req.flash('success', 'the customer was add with supplies')
    }
    else {
        req.flash('message', 'the customer not was add')
    }
    res.redirect('/links/' + id_company + '/customers-company');
})

router.post('/fud/:id_company/:id_customer/editCustomer', isLoggedIn, async (req, res) => {
    const { id_company, id_customer } = req.params;
    const { id_branch } = req.body;

    const newCustomer = create_new_customer(req);
    if (await update.update_customer(id_customer, newCustomer)) {
        req.flash('success', 'El cliente fue actualizado con exito ❤️')
    }
    else {
        req.flash('message', 'El cliente no fue actualizado 😰')
    }

    //we will see if the user have a UI CEO or Branch
    if (id_branch) {
        res.redirect(`/links/${id_company}/${id_branch}/customers-company`);
    } else {
        res.redirect(`/links/${id_company}/customers-company`);
    }
})




function create_new_customer(req) {
    const { id_company } = req.params;
    const { firstName, secondName, lastName, cellPhone, phone, email, states, city, street, num_o, num_i, postal_code, birthday,
        userType, company_name, company_address, website, contact_name, company_cellphone, company_phone,
    } = req.body

    const newCustomer = {
        id_company,
        firstName,
        secondName,
        lastName,
        country: req.body.country,
        states,
        city,
        street,
        num_o,
        num_i,
        postal_code,
        email,
        phone,
        cellPhone,
        points: 0,
        birthday: birthday || null,  // If birthday is empty, assign null; otherwise, use the provided value
        userType,
        company_name,
        company_address,
        website,
        contact_name,
        company_cellphone,
        company_phone
    }

    return newCustomer
}

//add role employee
router.post('/fud/:id_company/add-department-employees', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    const department = create_department_employee(req)
    if (await addDatabase.add_department_employees(department)) {
        req.flash('success', 'El departamento se agregó con éxito. 👍')
    }
    else {
        req.flash('message', 'El departamento no se agregó. 😰')
    }

    //we will see if the user have the subscription to fud one 
    if (req.user.rol_user == rolFree) {
        const { id_branch } = req.body;
        res.redirect(`/links/${id_company}/${id_branch}/employee-department`);
    } else {
        res.redirect(`/links/${id_company}/employee-department`);
    }
})

function create_department_employee(req) {
    const { id_company } = req.params;
    const { name, description } = req.body
    departament = {
        id_company,
        name,
        description
    }
    return departament
}

//add type user
router.post('/fud/:id_company/add-type-employees', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    const { name_role } = req.body;
    if (await this_type_employee_exist(id_company, name_role)) {
        req.flash('message', 'El tipo de empleado no se agregó porque este nombre ya existe 😅')
    }
    else {
        const typeEmployees = await create_type_employee(id_company, req)
        if (await addDatabase.add_type_employees(typeEmployees)) {
            req.flash('success', 'El rol de empleado fue agregado con exito 😄')
        }
        else {
            req.flash('message', 'El rol de empleado no fue agregado 😰')
        }
    }

    //we will see if the user have a subscription to fud one 
    if (req.user.rol_user == rolFree) {
        const id_branch = req.user.id_branch;
        res.redirect(`/links/${id_company}/${id_branch}/type-employees-free`);
    } else {
        res.redirect(`/links/${id_company}/type-user`);
    }
})

async function this_type_employee_exist(idCompany, name) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve) => {
            // Search for the employee role in SQLite
            const queryText = `
                SELECT * FROM roles_employees WHERE id_companies = ? AND name_role = ?
            `;
            database.all(queryText, [idCompany, name], (err, rows) => {
                if (err) {
                    console.error('Error querying employee roles (SQLite):', err);
                    return resolve(false);
                }
                resolve(rows.length > 0);
            });
        });
    }

    // PostgreSQL
    try {
        // Search for the employee role in PostgreSQL
        const queryText = `
            SELECT * FROM "Employee".roles_employees WHERE id_companies = $1 AND name_role = $2
        `;
        const values = [idCompany, name];
        const result = await database.query(queryText, values);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error querying employee roles (PostgreSQL):', error);
        return false;
    }
}

function create_type_employee2(id_company, req) {
    // Campos base que siempre deben incluirse
    const newRole = {
        id_companies: id_company,
        name_role: req.body.name_role || '',
        salary: Number(req.body.salary) || 0,
        currency: req.body.currency || 'mx',
        type_of_salary: req.body.type_of_salary || 'Hour',
        commissions: Number(req.body.commissions) || 0,
        discount_for_product: Number(req.body.discount_for_product) || 0,
    };

    // Lista completa de permisos que corresponden a columnas booleanas
    const allPermissions = [
        'add_box', 'edit_box', 'delete_box', 'create_reservation', 'view_reservation',
        'report_to_cofepris', 'view_reports', 'add_customer', 'edit_customer', 'delete_customer',
        'cancel_debt', 'offer_loan', 'get_fertilizer', 'view_customer_credits', 'send_email',
        'add_employee', 'edit_employee', 'delete_employee', 'create_schedule', 'assign_schedule',
        'view_schedule', 'create_type_user', 'create_employee_department', 'view_sale_history',
        'delete_sale_history', 'view_movement_history', 'delete_movement_history', 'view_supplies',
        'add_supplies', 'edit_supplies', 'delete_supplies', 'view_products', 'edit_products',
        'delete_products', 'view_combo', 'add_combo', 'edit_combo', 'delete_combo',
        'view_food_departament', 'add_food_departament', 'edit_food_departament', 'delete_food_departament',
        'view_food_category', 'add_food_category', 'edit_food_category', 'delete_food_category',
        'waste_report', 'add_provider', 'edit_provider', 'delete_provider', 'view_provider',
        'sell', 'apply_discount', 'apply_returns', 'add_offers', 'edit_offers', 'delete_offers',
        'change_coins', 'modify_hardware', 'modify_hardware_kitchen', 'give_permissions',
        'app_point_sales', 'view_inventory', 'edit_inventory', 'edit_employee_department',
        'delete_employee_department', 'edit_rol_employee', 'delete_rol_employee', 'employee_roles',
        'employee_department', 'view_employee'
    ];

    // Agregamos cada permiso según si viene en el body
    for (const perm of allPermissions) {
        newRole[perm] = req.body[perm] === 'on';
    }

    return newRole;

    const { name, salary, discount, comissions } = req.body
    const currency = req.body.currency
    const typeSalary = req.body.typeSalary
    newTypeEmployee = [
        id_company,
        name,
        get_value_text(salary),
        currency,
        typeSalary,
        get_value_text(comissions),
        get_value_text(discount),

        watch_permission(req.body.addBox),
        watch_permission(req.body.editBox),
        watch_permission(req.body.deleteBox),
        watch_permission(req.body.createReservation),
        watch_permission(req.body.viewReservation),
        watch_permission(req.body.viewReports),

        watch_permission(req.body.addCustomer),
        watch_permission(req.body.editCustomer),
        watch_permission(req.body.deleteCustomer),
        watch_permission(req.body.cancelDebt),
        watch_permission(req.body.offerLoan),
        watch_permission(req.body.getFertilizer),
        watch_permission(req.body.viewCustomerCredits),
        watch_permission(req.body.sendEmail),

        watch_permission(req.body.addEmployee),
        watch_permission(req.body.editEmployee),
        watch_permission(req.body.deleteEmployee),
        watch_permission(req.body.createSchedule),
        watch_permission(req.body.assignSchedule),
        watch_permission(req.body.viewSchedule),
        watch_permission(req.body.createTypeUser),
        watch_permission(req.body.createEmployeeDepartment),
        watch_permission(req.body.viewSaleHistory),
        watch_permission(req.body.deleteSaleHistory),
        watch_permission(req.body.viewMovementHistory),
        watch_permission(req.body.deleteMovementHistory),

        watch_permission(req.body.viewSupplies),
        watch_permission(req.body.addSupplies),
        watch_permission(req.body.editSupplies),
        watch_permission(req.body.deleteSupplies),

        watch_permission(req.body.viewProducts),
        watch_permission(req.body.editProducts),
        watch_permission(req.body.deleteProducts),

        watch_permission(req.body.viewCombo),
        watch_permission(req.body.addCombo),
        watch_permission(req.body.editCombo),
        watch_permission(req.body.deleteCombo),
        watch_permission(req.body.viewFoodDepartament),
        watch_permission(req.body.addFoodDepartament),
        watch_permission(req.body.editFoodDepartament),
        watch_permission(req.body.deleteFoodDepartament),
        watch_permission(req.body.viewFoodCategory),
        watch_permission(req.body.addFoodCategory),
        watch_permission(req.body.editFoodCategory),
        watch_permission(req.body.deleteFoodCategory),
        watch_permission(req.body.wasteReport),
        watch_permission(req.body.addProvider),
        watch_permission(req.body.editProvider),
        watch_permission(req.body.deleteProvider),
        watch_permission(req.body.viewProvider),

        watch_permission(req.body.sell),
        watch_permission(req.body.applyDiscount),
        watch_permission(req.body.applyReturns),
        watch_permission(req.body.addOffers),
        watch_permission(req.body.editOffers),
        watch_permission(req.body.delateOffers),
        watch_permission(req.body.changeCoins),

        watch_permission(req.body.modifyHardware),
        watch_permission(req.body.modifyHardwareKitchen),
        watch_permission(req.body.givePermissions),

        watch_permission(req.body.pointSales),
        watch_permission(req.body.viewInventory),
        watch_permission(req.body.editInventory),


        watch_permission(req.body.edit_employee_department),
        watch_permission(req.body.delete_employee_department),
        watch_permission(req.body.edit_rol_employee),
        watch_permission(req.body.delete_rol_employee),
        watch_permission(req.body.employee_roles),
        watch_permission(req.body.employee_department),
        watch_permission(req.body.view_employee)
    ]
    return newTypeEmployee
}

const getRoleColumns = async () => {
  if (process.env.TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve, reject) => {
      database.all(`PRAGMA table_info(roles_employees);`, [], (err, rows) => {
        if (err) {
          console.error('Error fetching columns (SQLite):', err);
          return reject(err);
        }
        // PRAGMA table_info devuelve un array con objetos que tienen la propiedad 'name' para el nombre de columna
        const columns = rows.map(row => row.name).filter(col => col !== 'id');
        resolve(columns);
      });
    });
  } else {
    // PostgreSQL
    try {
      const result = await database.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'Employee' AND table_name = 'roles_employees';
      `);
      return result.rows.map(row => row.column_name).filter(col => col !== 'id'); // Exclude the ID column
    } catch (error) {
      console.error('Error fetching columns (PostgreSQL):', error);
      return [];
    }
  }
};

async function create_type_employee(id_company, req) {
    const columns = await getRoleColumns();
    const newRole = {};

    for (const column of columns) {
        if (column === 'id_companies') {
            newRole[column] = id_company;
        } else if (['salary', 'commissions', 'discount_for_product'].includes(column)) {
            newRole[column] = Number(req.body[column]) || 0;
        } else if (['name_role', 'currency', 'type_of_salary'].includes(column)) {
            newRole[column] = req.body[column] || '';
        } else {
            // Para todos los booleanos que vienen como 'on' si están activados
            newRole[column] = req.body[column] === 'on';
        }
    }

    return newRole;
}

function get_value_text(text) {
    return isNaN(parseFloat(text)) ? 0 : parseFloat(text);
}

function watch_permission(permission) {
    return permission == 'on'
}

router.post('/fud/:id_company/:id_role/edit-role-employees', isLoggedIn, async (req, res) => {
    //get the data of the form for that we know if this name exist in the company
    const { id_company, id_role } = req.params;
    const { name } = req.body

    //get the new data role of the employee and update the old role
    const typeEmployees = await create_type_employee(id_company, req)

    if (await update.update_role_employee(id_role, typeEmployees)) {
        req.flash('success', 'El rol de empleado se actualizó con éxito 😄')
    }
    else {
        req.flash('message', 'El rol de empleado no fue actualizado 😅')
    }

    //we will see if the user have the subscription a fud one
    if (req.user.rol_user == rolFree) {
        const id_branch = req.user.id_branch;
        res.redirect(`/links/${id_company}/${id_branch}/type-employees-free`);
    } else {
        res.redirect(`/links/${id_company}/type-user`);
    }
})

//add employees
router.post('/fud/:id_company/add-employees', isLoggedIn, async (req, res) => {
    const { id_company, rol_user } = req.params;
    const { email, username, password1, password2 } = req.body
    //we will see if the email that the user would like to add exist  rol_user
    if (await this_email_exists(email)) {
        req.flash('message', 'El empleado no fue agregado porque este e-mail ya existe 😅')
    }
    else {
        //we will see if the username that the user would like to add exist 
        if (await this_username_exists(username)) {
            req.flash('message', 'El empleado no fue agregado porque este username ya existe 😅')
        }
        else {
            //we will watching if the password is correct 
            if (compare_password(password1, password2)) {
                //we will to create a new user for next save in the database
                const user = await create_new_user(req)
                const idUser = await addDatabase.add_user(user, rol_user) //add the new user and get the id of the employee

                //we will see if the user was add with success
                if (idUser != null) {
                    //we will to create the new employee and add to the database
                    const employee = create_new_employee(idUser, id_company, req)
                    if (await addDatabase.add_new_employees(employee)) {
                        req.flash('success', 'El empleado fue agregado con exito 🥳')
                    }
                    else {
                        /*
                        if the data of the employee not was add but the new user yes was create, we going to make the message of warning
                        for that the manager can edit the employee data in the screen of employees
                        */
                        await delete_user(idUser)
                        req.flash('message', 'Los datos del empleado no fueron agregado. Por favor tu puedes editar los datos del empleado y actualizarlo 😅')
                    }
                }
                else {
                    req.flash('message', 'El empleado no fue agregado 😳')
                }
            } else {
                req.flash('message', 'La password no coinside 😳')
            }
        }
    }
    res.redirect('/links/' + id_company + '/employees');
})

async function delete_user(id) {
  try {
    if (process.env.TYPE_DATABASE === 'mysqlite') {
      // Delete user in SQLite
      return new Promise((resolve) => {
        const queryText = `DELETE FROM users WHERE id = ?`;
        database.run(queryText, [id], function (err) {
          if (err) {
            console.error('Error deleting user (SQLite):', err);
            return resolve(false);
          }
          resolve(true);
        });
      });
    } else {
      // Delete user in PostgreSQL
      const queryText = 'DELETE FROM "Fud".users WHERE id = $1';
      const values = [id];
      await database.query(queryText, values);
      return true;
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

function compare_password(P1, P2) {
    if (P1 == '') {
        return false;
    }

    return P1 == P2;
}

async function this_email_exists(email) {
  if (process.env.TYPE_DATABASE === 'mysqlite') {
    // Search for this email in SQLite database
    return new Promise((resolve) => {
      const queryText = `SELECT * FROM users WHERE email = ?`;
      database.all(queryText, [email], (err, rows) => {
        if (err) {
          console.error('Error querying email (SQLite):', err);
          return resolve(false);
        }
        resolve(rows.length > 0);
      });
    });
  } else {
    // Search for this email in PostgreSQL database
    const queryText = 'SELECT * FROM "Fud".users WHERE email = $1';
    const values = [email];
    try {
      const companies = await database.query(queryText, values);
      return companies.rows.length > 0;
    } catch (error) {
      console.error('Error querying email (PostgreSQL):', error);
      return false;
    }
  }
}


async function this_username_exists(username) {
  if (process.env.TYPE_DATABASE === 'mysqlite') {
    // Search for this username in SQLite database
    return new Promise((resolve) => {
      const queryText = `SELECT * FROM users WHERE user_name = ?`;
      database.all(queryText, [username], (err, rows) => {
        if (err) {
          console.error('Error querying username (SQLite):', err);
          return resolve(false);
        }
        resolve(rows.length > 0);
      });
    });
  } else {
    // Search for this username in PostgreSQL database
    const queryText = 'SELECT * FROM "Fud".users WHERE user_name = $1';
    const values = [username];
    try {
      const companies = await database.query(queryText, values);
      return companies.rows.length > 0;
    } catch (error) {
      console.error('Error querying username (PostgreSQL):', error);
      return false;
    }
  }
}


async function create_new_user(req) {
    const { user_name, email, first_name, second_name, last_name, password1 } = req.body;
    const image = await create_a_new_image(req)
    const new_user = {
        image,
        user_name,
        first_name,
        second_name,
        last_name,
        email,
        password: password1
    }
    new_user.password = await helpers.encryptPassword(password1); //create a password encrypt
    return new_user;
}

function create_new_employee(id_user, id_company, req) {
    const { phone, cell_phone, city, street, num_ext, num_int } = req.body;
    const id_role_employee = req.body.role_employee;
    const id_departament_employee = req.body.departament_employee;
    const id_branch = req.body.branch;
    const id_country = req.body.country;

    const new_employee = {
        id_company,
        id_user,
        id_role_employee,
        id_departament_employee,
        id_branch,
        id_country,
        city,
        street,
        num_int,
        num_ext,
        phone,
        cell_phone
    }

    return new_employee;
}

router.post('/fud/:id_user/:id_company/:id_employee/edit-employees', isLoggedIn, async (req, res) => {
    const { id_company, id_employee, id_user } = req.params;
    await update_employee(req, res);
    res.redirect('/links/' + id_company + '/employees');
})

async function update_employee(req, res) {
    const { id_company, id_employee, id_user } = req.params;
    const { email, username } = req.body
    const newDataUser = await new_data_user(req)
    const newDataEmployee = new_data_employee(req)

    //we will see if exist a new perfil photo 
    if (newDataUser.image != "") {
        //get the old direction of the imagen 
        const path_photo = await get_profile_picture(id_user)
        //we will watching if the user haved a photo for delete
        if (path_photo != null) {
            await delete_image_upload(path_photo);
        }
    }

    if (await update.update_user(id_user, newDataUser)) {
        if (await update.update_employee(id_user, newDataEmployee)) {
            req.flash('success', 'El empleado fue actualizado con exito 🥳')
        }
        else {
            req.flash('message', 'El empleado no fue actualizado con exito 😅')
        }
    }
    else {
        req.flash('message', 'Los datos del usuario no fueron actualizado con exito 😅')
    }
}

async function get_profile_picture(idUser) {
  if (process.env.TYPE_DATABASE === 'mysqlite') {
    // Search for the user's photo in SQLite database
    return new Promise((resolve) => {
      const queryText = `SELECT photo FROM users WHERE id = ?`;
      database.get(queryText, [idUser], (err, row) => {
        if (err) {
          console.error('Error querying profile picture (SQLite):', err);
          return resolve(null);
        }
        resolve(row ? row.photo : null);
      });
    });
  } else {
    // Search for the user's photo in PostgreSQL database
    const queryText = 'SELECT photo FROM "Fud".users WHERE id = $1';
    const values = [idUser];
    try {
      const result = await database.query(queryText, values);
      if (result.rows.length > 0 && 'photo' in result.rows[0]) {
        return result.rows[0].photo;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error querying profile picture (PostgreSQL):', error);
      return null;
    }
  }
}


async function new_data_user(req) {
    const { user_name, email, first_name, second_name, last_name, rol_user } = req.body;
    const image = await create_a_new_image(req);
    const new_user = {
        image,
        user_name,
        email,
        first_name,
        second_name,
        last_name,
        rol_user
    }

    return new_user;
}

function new_data_employee(req) {
    const { phone, cell_phone, city, street, num_ext, num_int } = req.body;
    const id_role_employee = req.body.role_employee;
    const id_departament_employee = req.body.departament_employee;
    const id_branch = req.body.branch;
    const id_country = req.body.country;

    const new_employee = {
        id_role_employee,
        id_departament_employee,
        id_branch,
        id_country,
        city,
        street,
        num_int,
        num_ext,
        phone,
        cell_phone
    }

    return new_employee;
}
//---------------------------------------------------------------------------------------------------------OPTIONS---------------------------------------------------------------
router.post('/fud/:id_company/:id_branch/change-navbar', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const { navbar } = req.body;

    //we will see if can update the navbar
    if (await update_navbar(id_company, navbar)) {
        req.flash('success', '¡La interfaz de usuario fue actualizada con éxito! 🤗')
    } else {
        req.flash('message', 'La interfaz de usuario no fue actualizada 👉👈');
    }

    res.redirect(`/links/${id_company}/${id_branch}/options`);
})

router.post('/fud/:id_company/change-navbar', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    const { navbar } = req.body;

    //we will see if can update the navbar
    if (await update_navbar(id_company, navbar)) {
        req.flash('success', 'La barra de tarreas fue actualizada con éxito! 🤗')
    } else {
        req.flash('message', 'La barra de tarreas no fue actualizada 👉👈');
    }

    res.redirect(`/links/${id_company}/options`);
})


async function update_navbar(id_companies, navbar) {
    if (process.env.TYPE_DATABASE === 'mysqlite') {
        return await update_navbar_mysql(id_companies, navbar);
    }else{
        return await update_navbar_posgresql(id_companies, navbar);
    }
}

async function update_navbar_posgresql(id_companies, navbar) {
    // get all the IDs of the users that work in the company
    var queryText = `
        SELECT id_users
        FROM "Company".employees
        WHERE id_companies = $1
    `;
    var values = [id_companies];
    const result = await database.query(queryText, values);

    if (result.rows.length > 0) {
        // get all the IDs of the users 
        const userIds = result.rows.map(row => row.id_users);

        // update the navbar of all the employees for unclock all the navbar
        var updateQueryText = `
            UPDATE "Fud".users
            SET navbar_1 = $1,
                navbar_2 = $2,
                navbar_3 = $3
            WHERE id = ANY($4::bigint[])
        `;
        var updateValues = [null, null, null, userIds];
        await database.query(updateQueryText, updateValues);

        // update the navbar of all the employees
        var updateQueryText = `
            UPDATE "Fud".users
            SET navbar_${navbar} = $1
            WHERE id = ANY($2::bigint[])
        `;
        var updateValues = [navbar, userIds];
        await database.query(updateQueryText, updateValues);


        return true;
    } else {
        return false;
    }
}

async function update_navbar_mysql(id_companies, navbar) {
    // Obtener los IDs de los usuarios que trabajan en la empresa
    const queryText = `
        SELECT id_users
        FROM Company_employees
        WHERE id_companies = ?
    `;
    const values = [id_companies];
    const result = await database.query(queryText, values);

    if (result.length > 0) {
        // Obtener todos los IDs de usuarios
        const userIds = result.map(row => row.id_users);

        if (userIds.length === 0) {
            return false;
        }

        // Crear placeholders para la cláusula IN (por ejemplo: "?, ?, ?")
        const placeholders = userIds.map(() => '?').join(',');

        // Actualizar navbar_1, navbar_2, navbar_3 a NULL para esos usuarios
        const resetQueryText = `
            UPDATE Fud_users
            SET navbar_1 = NULL,
                navbar_2 = NULL,
                navbar_3 = NULL
            WHERE id IN (${placeholders})
        `;
        await database.query(resetQueryText, userIds);

        // Validar que navbar sea 1, 2 o 3 para evitar SQL injection
        if (![1, 2, 3].includes(navbar)) {
            throw new Error('Invalid navbar value');
        }

        // Actualizar el navbar específico para esos usuarios
        const updateQueryText = `
            UPDATE Fud_users
            SET navbar_${navbar} = ?
            WHERE id IN (${placeholders})
        `;
        // El primer parámetro es true para activar el navbar específico
        await database.query(updateQueryText, [true, ...userIds]);

        return true;
    } else {
        return false;
    }
}


//---------------------------------------------------------------------------------------------------------BRANCHES---------------------------------------------------------------
/*
SELECT * FROM "Inventory".dish_and_combo_features;
SELECT * FROM "Inventory".product_and_suppiles_features;
SELECT * FROM "Kitchen".dishes_and_combos;
SELECT * FROM "Kitchen".table_supplies_combo;
SELECT * FROM "Kitchen".products_and_supplies;
*/
const XLSX = require('xlsx');


router.post('/links/:id_company/:id_branch/upload-products', async (req, res) => {
    const { id_company, id_branch } = req.params;

    //get the file excle and save the file in the folder upload
    const filePath = req.file.path;
    const products = read_file_product(filePath);

    //this is for delete the file when read all the container
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error al eliminar el archivo:', err);
        } else {
            console.log('Archivo eliminado correctamente');
        }
    });


    //we will see if exist all the column need for create the new product
    const requiredColumns = [
        "Barcode", "Producto", "Description", 'Precio', 'Cantidad', 'UsaInventario', 'EsUnInsumo',
        'MontoDeCompra', 'UnidadDeCompra', 'PrecioDeCompra', 'MontoDeVenta', 'UnidadDeVenta', 'InventarioMáximo', 'InventarioMínimo', 'UnidadDeMedida'
    ];
    const fileColumns = Object.keys(products[0]); // get the key of the first object 

    const isValid = requiredColumns.every(column => fileColumns.includes(column));

    //we will see if the file excel is success
    if (!isValid) {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error al eliminar el archivo:', err);
        });

        req.flash('message', 'El archivo Excel no tiene el formato correcto. Asegúrate de incluir las columnas: ' + requiredColumns.join(', '));
        return res.redirect(`/links/${id_company}/${id_branch}/upload-products`);
    }

    let canAdd = true;
    let productsThatNoWasAdd = '';

    //we will read all the products that is in the file
    for (const product of products) {
        //get all the data of the product
        const barcode = product.Barcode;
        const name = product.Producto;
        const description = product.Description;
        const use_inventory = product.UsaInventario;
        const this_is_a_supplies = product.EsUnInsumo;
        const newProducts = create_new_product_with_excel(id_company, barcode, name, description, use_inventory, this_is_a_supplies);
        const infoSupplies = await addDatabase.add_supplies_company(newProducts);
        const idSupplies = infoSupplies.id;

        //we will see if the product can be save in the database
        if (idSupplies) {
            //get the data of the combo in the file excel 
            const purchase_amount = product.MontoDeCompra;
            const purchase_unity = product.UnidadDeCompra;
            const purchase_price = product.PrecioDeCompra;

            const sale_amount = product.MontoDeVenta;
            const sale_unity = product.UnidadDeVenta;
            const sale_price = product.Precio;

            const max_inventory = product.InventarioMáximo;
            const minimum_inventory = product.InventarioMínimo;
            const unit_inventory = product.UnidadDeMedida;
            const existence = product.Cantidad;

            //we will create the supplies in the branch
            const idSuppliesFactures = await addDatabase.add_product_and_suppiles_features(id_branch, idSupplies) //add the supplies in the branch 

            //we will watch if not can added the supplies in the branch 
            if (idSuppliesFactures == null) {
                //if we not can added the supplies in the branch, we will to delete the supplies of the company for avoid mistakes
                await delete_supplies_company(idSupplies);
            } else {
                //we will creating the data of the supplies and we will saving with the id of the supplies that create
                const supplies = create_supplies_branch_with_excel(purchase_amount, purchase_unity, purchase_price, sale_amount, sale_unity, sale_price, max_inventory, minimum_inventory, unit_inventory, existence, idSuppliesFactures);

                //update the data in the branch for save the new product in his branch
                if (await update.update_supplies_branch(supplies)) {

                    //get the new combo
                    const combo = create_a_new_combo_with_excel(id_company, barcode, name, description);
                    const dataProduct = { idProduct: idSupplies, amount: 1, foodWaste: supplies.sale_amount, unity: supplies.sale_unity, additional: 0 }
                    combo.supplies.push(dataProduct); //update the data of supplies use only the barcode of the product

                    //we will see if can add the combo to the database
                    const idCombos = await addDatabase.add_product_combo_company(combo);

                    //get the data combo in the branch
                    const comboData = create_combo_data_branch(idCombos, id_company, id_branch);

                    // save the combo in the branch
                    const idComboFacture = await addDatabase.add_combo_branch(comboData);
                    if (!idComboFacture) {
                        await delete_all_supplies_combo(idCombos);
                        await delete_product_combo_company(idCombos);
                        await delete_product_and_suppiles_features(idSuppliesFactures);
                        await delete_supplies_company(idSupplies);

                        canAdd = false;
                        productsThatNoWasAdd += name + ',';
                    } else {
                        //if we can added the combo to the branch, update the price of the combo
                        await update_price_combo_for_excel(sale_price, idComboFacture)
                    }
                } else {
                    //if we not can update the supplies in the branch, we will delete the supplis in the branch and in the company
                    await delete_product_and_suppiles_features(idSuppliesFactures);
                    await delete_supplies_company(idSupplies);
                }
            }
        } else {
            productsThatNoWasAdd += name + ',';
            canAdd = false;
        }

    };

    //we will see if can save all the products 
    if (canAdd) {
        req.flash('success', 'Productos subidos con éxito 😉');
    } else {
        req.flash('message', `Ocurrio un error al momento de cargar los siguientes productos:  ${productsThatNoWasAdd}. Tal vez su barcode y nombres ya existen en la base de datos 😬.`);
    }

    res.redirect(`/links/${id_company}/${id_branch}/upload-products`);
});


router.post('/links/:id_company/:id_branch/upload-inventory-products-with-excel', async (req, res) => {
    const { id_company, id_branch } = req.params;

    //get the file excle and save the file in the folder upload
    const filePath = req.file.path;
    const products = read_file_product(filePath);

    //this is for delete the file when read all the container
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error al eliminar el archivo:', err);
        } else {
            console.log('Archivo eliminado correctamente');
        }
    });


    //we will see if exist all the column need for create the new product
    const requiredColumns = [
        "Barcode", "Producto", "Description", 'Precio', 'Cantidad', 'UsaInventario', 'EsUnInsumo',
        'MontoDeCompra', 'UnidadDeCompra', 'PrecioDeCompra', 'MontoDeVenta', 'UnidadDeVenta', 'InventarioMáximo', 'InventarioMínimo', 'UnidadDeMedida'
    ];
    const fileColumns = Object.keys(products[0]); // get the key of the first object 

    const isValid = requiredColumns.every(column => fileColumns.includes(column));

    //we will see if the file excel is success
    if (!isValid) {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error al eliminar el archivo:', err);
        });

        req.flash('message', 'El archivo Excel no tiene el formato correcto. Asegúrate de incluir las columnas: ' + requiredColumns.join(', '));
        return res.redirect(`/links/${id_company}/${id_branch}/upload-inventory-products-with-excel`);
    }

    let canAdd = true;
    let productsThatNoWasAdd = '';

    //we will read all the products that is in the file
    for (const product of products) {
        //get all the data of the product
        const barcode = product.Barcode;
        const name = product.Producto;
        const description = product.Description;
        const use_inventory = product.UsaInventario;
        const this_is_a_supplies = product.EsUnInsumo;
        const newProducts = create_new_product_with_excel(id_company, barcode, name, description, use_inventory, this_is_a_supplies);
        const infoSupplies = await addDatabase.add_supplies_company(newProducts);
        const idSupplies = infoSupplies.id;

        //we will see if the product can be save in the database
        if (idSupplies) {
            //get the data of the combo in the file excel 
            const purchase_amount = product.MontoDeCompra;
            const purchase_unity = product.UnidadDeCompra;
            const purchase_price = product.PrecioDeCompra;

            const sale_amount = product.MontoDeVenta;
            const sale_unity = product.UnidadDeVenta;
            const sale_price = product.Precio;

            const max_inventory = product.InventarioMáximo;
            const minimum_inventory = product.InventarioMínimo;
            const unit_inventory = product.UnidadDeMedida;
            const existence = product.Cantidad;
        } else {
            productsThatNoWasAdd += name + ',';
            canAdd = false;
        }

    };

    //we will see if can save all the products 
    if (canAdd) {
        req.flash('success', 'Productos actualizados con éxito 😉');
    } else {
        req.flash('message', `Ocurrio un error al momento de actualizar los siguientes productos:  ${productsThatNoWasAdd}. Tal vez su barcode y nombres no existen en la base de datos 😬.`);
    }

    res.redirect(`/links/${id_company}/${id_branch}/upload-inventory-products-with-excel`);
});

function read_file_product(path) {
    const libro = XLSX.readFile(path);
    const hoja = libro.Sheets[libro.SheetNames[0]];
    return XLSX.utils.sheet_to_json(hoja);
}

function create_new_product_with_excel(id_company, barcode, name, description, use_inventory, this_is_a_supplies) {
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

function create_supplies_branch_with_excel(purchase_amount, purchase_unity, purchase_price, sale_amount, sale_unity, sale_price, max_inventory, minimum_inventory, unit_inventory, existence, id_supplies) {
    const supplies = {
        purchase_amount: string_to_float(purchase_amount),
        purchase_unity,
        purchase_price: string_to_float(purchase_price),
        currency_purchase: 'MXN',
        sale_amount: string_to_float(sale_amount),
        sale_unity,
        sale_price: string_to_float(sale_price),
        currency_sale: 'MXN',
        max_inventory: string_to_float(max_inventory),
        minimum_inventory: string_to_float(minimum_inventory),
        unit_inventory,
        existence: string_to_float(existence),
        id_supplies: id_supplies,
    };

    return supplies;
}

function create_a_new_combo_with_excel(id_company, barcode, name, description) {
    const combo = {
        id_company: id_company,
        path_image: '',
        barcode,
        name,
        description,
        id_product_department: '',
        id_product_category: '',
        supplies: []
    }

    return combo;
}

async function update_price_combo_for_excel(newPrice, id) {
  if (process.env.TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `UPDATE dish_and_combo_features SET price_1 = ? WHERE id = ?`;
      database.run(queryText, [newPrice, id], function (err) {
        if (err) {
          console.error('Error updating price (SQLite):', err);
          return resolve(false);
        }
        resolve(true);
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
      console.error('Error updating price (PostgreSQL):', error);
      return false;
    }
  }
}

async function delete_product_and_suppiles_features(id) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `DELETE FROM product_and_suppiles_features WHERE id = ?`;
      database.run(queryText, [id], function (err) {
        if (err) {
          console.error('Error al eliminar en SQLite product_and_suppiles_features:', err);
          return resolve(null);
        }
        resolve(true);
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
    return new Promise((resolve) => {
      const queryText = `DELETE FROM products_and_supplies WHERE id = ?`;
      database.run(queryText, [id], function (err) {
        if (err) {
          console.error('Error al eliminar el supply (SQLite):', err);
          return resolve(null);
        }
        resolve(true);
      });
    });
  } else {
    const queryText = 'DELETE FROM "Kitchen".products_and_supplies WHERE id = $1';
    const values = [id];

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error al eliminar el supply (PostgreSQL):', error);
      return null;
    }
  }
}


async function delete_product_combo_company(id) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `DELETE FROM dishes_and_combos WHERE id = ?`;
      database.run(queryText, [id], function (err) {
        if (err) {
          console.error('Error al eliminar en la base de datos (SQLite):', err);
          return resolve(false);
        }
        resolve(true);
      });
    });
  } else {
    const queryText = 'DELETE FROM "Kitchen".dishes_and_combos WHERE id = $1';
    const values = [id];

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error al eliminar en la base de datos (PostgreSQL):', error);
      return false;
    }
  }
}

//----
router.post('/fud/:id_company/:id_branch/add-product-free', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    let canAdd = false;

    //this is for create the new supplies and save the id of the supplies
    const newSupplies = await get_supplies_or_product_company(req, false);
    newSupplies.id_company = id_company; //update the data of id_company because the function "get_supplies_or_product_company" not have this data,

    const infoSupplies = await addDatabase.add_supplies_company(newSupplies); //get the id of the supplies that added
    const idSupplies = infoSupplies.id;

    //we will see if the product can be save in the database
    if (idSupplies) {
        //we will create the supplies in the branch
        const idSuppliesFactures = await addDatabase.add_product_and_suppiles_features(id_branch, idSupplies) //add the supplies in the branch 

        //we will creating the data of the supplies and we will saving with the id of the supplies that create
        const supplies = create_supplies_branch(req, idSuppliesFactures);

        //update the data in the branch for save the new product in his branch
        if (await update.update_supplies_branch(supplies)) {

            //get the new combo
            const combo = await create_a_new_combo(req);
            combo.path_image = infoSupplies.img;
            console.log(combo)
            console.log(infoSupplies)
            const dataProduct = { idProduct: idSupplies, amount: 1, foodWaste: supplies.sale_amount, unity: supplies.sale_unity, additional: 0 }
            combo.supplies.push(dataProduct); //update the data of supplies use only the barcode of the product

            //we will see if can add the combo to the database
            const idCombos = await addDatabase.add_product_combo_company(combo);

            //we will wach if the user have a branch free or a franquicia
            if (req.user.rol_user != rolFree) {
                if (idCombos) {
                    req.flash('success', 'El combo fue agregado con éxito ❤️')
                }
                else {
                    req.flash('message', 'El combo no fue agregado con éxito 😳')
                }

                //if the user have a franquicia we will save the combo in the company
                res.redirect('/links/' + id_company + '/combos');
            } else {
                //get the data combo in the branch
                const comboData = create_combo_data_branch(idCombos, id_company, id_branch);
                comboData.price_1=req.body.sale_price;
                comboData.price_2=req.body.sale_price;
                comboData.amount=req.body.sale_amount;
                // save the combo in the branch
                const idComboFacture = await addDatabase.add_combo_branch(comboData); //--
                if (idComboFacture) {
                    canAdd = true;
                    //await update_price_combo_for_excel(supplies.sale_price, idComboFacture);
                    res.redirect(`/links/${id_company}/${id_branch}/${idComboFacture}/edit-products-free`);
                }
            }
        }
    }


    //we will see if exit a error in the process
    if (!canAdd) {
        req.flash('message', 'El producto no fue agregado con éxito 👉👈')
        res.redirect(`/links/${id_company}/${id_branch}/products-free`);
    }
})

router.post('/fud/:id_company/:id_branch/add-product-free-speed', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    let canAdd = false;

    //this is for create the new supplies and save the id of the supplies
    const newSupplies = await get_supplies_or_product_company(req, false);
    console.log(newSupplies)
    newSupplies.id_company = id_company; //update the data of id_company because the function "get_supplies_or_product_company" not have this data,

    const infoSupplies = await addDatabase.add_supplies_company(newSupplies);
    const idSupplies = infoSupplies.id; //get the id of the supplies that added

    //we will see if the product can be save in the database
    if (idSupplies) {
        //we will create the supplies in the branch
        const idSuppliesFactures = await addDatabase.add_product_and_suppiles_features(id_branch, idSupplies) //add the supplies in the branch 

        //we will creating the data of the supplies and we will saving with the id of the supplies that create
        const supplies = create_supplies_branch(req, idSuppliesFactures);

        //update the data in the branch for save the new product in his branch
        if (await update.update_supplies_branch(supplies)) {

            //get the new combo
            const combo = await create_a_new_combo(req);
            console.log(combo)

            const dataProduct = { idProduct: idSupplies, amount: 1, foodWaste: supplies.sale_amount, unity: supplies.sale_unity, additional: 0 }
            combo.supplies.push(dataProduct); //update the data of supplies use only the barcode of the product

            //we will see if can add the combo to the database
            const idCombos = await addDatabase.add_product_combo_company(combo)

            //we will wach if the user have a branch free or a franquicia
            if (req.user.rol_user != rolFree) {
                if (idCombos) {
                    req.flash('success', 'El combo fue agregado con éxito ❤️')
                }
                else {
                    req.flash('message', 'El combo no fue agregado con éxito 😳')
                }

                //if the user have a franquicia we will save the combo in the company
                res.redirect('/links/' + id_company + '/combos');
            } else {
                //get the data combo in the branch
                const comboData = create_combo_data_branch(idCombos, id_company, id_branch);

                // save the combo in the branch
                const idComboFacture = await addDatabase.add_combo_branch(comboData);
                if (idComboFacture) {
                    canAdd = true;
                    await update_price_combo_for_excel(supplies.sale_price, idComboFacture);
                    req.flash('success', 'El producto fue agregado con éxito ❤️')
                    res.redirect(`/links/${id_company}/${id_branch}/products-free`);
                }
            }
        }
    }


    //we will see if exit a error in the process
    if (!canAdd) {
        req.flash('message', 'El producto no fue agregado con éxito 👉👈')
        res.redirect(`/links/${id_company}/${id_branch}/products-free`);
    }
})

router.post('/links/add_new_product_with_flask', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.user;
    let canAdd = false;
    let idComboFacture=null;

    //this is for create the new supplies and save the id of the supplies
    const newSupplies = await get_supplies_or_product_company(req, false);
    newSupplies.id_company = id_company; //update the data of id_company because the function "get_supplies_or_product_company" not have this data,

    const infoSupplies = await addDatabase.add_supplies_company(newSupplies);
    const idSupplies = infoSupplies.id; //get the id of the supplies that added

    //we will see if the product can be save in the database
    if (idSupplies) {
        //we will create the supplies in the branch
        const idSuppliesFactures = await addDatabase.add_product_and_suppiles_features(id_branch, idSupplies) //add the supplies in the branch 

        //we will creating the data of the supplies and we will saving with the id of the supplies that create
        const supplies = create_supplies_branch(req, idSuppliesFactures);

        //update the data in the branch for save the new product in his branch
        if (await update.update_supplies_branch(supplies)) {

            //get the new combo
            const combo = await create_a_new_combo(req);

            const dataProduct = { idProduct: idSupplies, amount: 1, foodWaste: supplies.sale_amount, unity: supplies.sale_unity, additional: 0 }
            combo.supplies.push(dataProduct); //update the data of supplies use only the barcode of the product

            //we will see if can add the combo to the database
            const idCombos = await addDatabase.add_product_combo_company(combo)

            //we will wach if the user have a branch free or a franquicia
            if (req.user.rol_user != rolFree) {
                if (idCombos) {
                    return true;
                }
                else {
                    return false;
                }
            } else {
                //get the data combo in the branch
                const comboData = create_combo_data_branch(idCombos, id_company, id_branch);

                // save the combo in the branch
                idComboFacture = await addDatabase.add_combo_branch(comboData);
                if (idComboFacture) {
                    canAdd = true;
                    await update_price_combo_for_excel(supplies.sale_price, idComboFacture);
                }
            }
        }
    }


    //we will see if exit a error in the process
    if (!canAdd) {
        return res.status(400).json({
            message: 'El producto no fue agregado con éxito 👉👈',
            code:false
        });
    }else{
        return res.status(200).json({
            message: 'El producto fue agregado con éxito ❤️',
            code:true,
            idComboFacture: idComboFacture,
            link:'/links/' + id_company + '/' + id_branch + '/' + idComboFacture + '/edit-products-free'
        });
    }
})

router.post('/fud/:id_company/:id_branch/:id_combo/update-product-branch', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_combo } = req.params;
    const { name, barcode, description } = req.body;


    //get the id of the supplies and of the combo for edit his data in the company
    const idSuppliesCompany = req.body.id_products_and_supplies;
    const idComboCompany = req.body.id_dishes_and_combos;

    //we will to see if the user add a name and a barcode to the product
    if (barcode == "") {
        req.flash('message', '👁️ Necesitas agregar un código de barras a tus suministros');
    }
    if (name == "") {
        req.flash('message', '👁️ Necesitas agregar un nombre a tus suministros');
    }

    //we will see if can edit the supplies
    let newSupplies;
    if (barcode != "" && name != "") {
        //this is when the user would like edit the supplies in the company. Not all the user can do this only the user Plus One
        newSupplies = await get_new_data_supplies_img_company(req);
    } else {
        //if the user not add a barcode and no name, we will send to the page of edit
        return res.redirect(`/links/${id_company}/${id_branch}/${id_combo}/edit-products-free`);
    }

    let canUpdateAllTheProduct = false; //this is for know if we can update all the container

    //we will see if the after create also the imagen when update the supplies 
    let image;
    if (newSupplies.path_image != '') {
        image = newSupplies.path_image;
    } else {
        //we will see if exist a new image 
        image = await create_a_new_image(req);
    }

    //we will creating the new supplies and we will saving the id of the supplies
    const supplies = create_supplies_branch(req, req.body.id_productFacture);

    //when the user update the supplies of the branch, also update the supplies of the company 
    newSupplies.id = idSuppliesCompany; //complete the information of the supplies company
    await update_supplies_company(newSupplies);

    //we will watching if the supplies can update 
    if (await update.update_supplies_branch(supplies)) {
        //when the supplies is updating, we will create the new combo for update 
        const combo = create_new_combo_branch(req, id_combo);
        if (await update.update_combo_branch(combo)) {
            canUpdateAllTheProduct = true;
        }
    }

    //this is for update if the product is in inventory or not is in inventory
    await update_product_in_inventory(idSuppliesCompany, req.body.inventory);

    //if exist a new image, we will update the imagen of the combo and of the supplies 
    if (image.trim() != "") {
        //get the path image of the combo and of the image, if not exist, we not do nathing 
        var path_photo = await get_data_photo(idComboCompany);
        if (path_photo != null) {
            //if exist a imagen, we will delete 
            await delete_image_upload(path_photo);
        }

        await update_combo_image(idComboCompany, image);
        await update_supplies_image(idSuppliesCompany, image);
    }

    await update_other_information_of_combo(req, idComboCompany);

    //update the combo of the company
    const thisProductIsSoldInBulk = req.body.thisProductIsSoldInBulk; //get is the product is sold in bulk
    await update_information_combo_product(name, barcode, description, thisProductIsSoldInBulk, idComboCompany);

    //we will see if can update all the product or exist a error for try again
    if (canUpdateAllTheProduct) {
        req.flash('success', 'El Producto se actualizó con éxito 😄');
        res.redirect(`/links/${id_company}/${id_branch}/products-free`);
    } else {
        req.flash('message', 'El Producto no se actualizo 😳');
        res.redirect(`/links/${id_company}/${id_branch}/${id_combo}/edit-products-free`);
    }
})

async function create_a_new_products(req, path_image) {
    const { barcode, name, description, barcodeProducts } = req.body;
    const { id_company } = req.params;

    const supplies = parse_barcode_products(barcodeProducts)
    const combo = {
        id_company: id_company,
        path_image: path_image,
        barcode,
        name,
        description,
        id_product_department: req.body.department,
        id_product_category: req.body.category,
        supplies
    }

    return combo;
}

async function update_product_in_inventory(id_product, inventory) {
  const answer = (inventory === 'on');

  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        UPDATE products_and_supplies
        SET use_inventory = ?
        WHERE id = ?
      `;
      database.run(queryText, [answer, id_product], function (err) {
        if (err) {
          console.error('Error al actualizar inventario (SQLite):', err);
          return resolve(null);
        }
        resolve(true);
      });
    });
  } else {
    const queryText = `
      UPDATE "Kitchen".products_and_supplies
      SET use_inventory = $1
      WHERE id = $2
    `;
    const values = [answer, id_product];
    try {
      const result = await database.query(queryText, values);
      return result.rows;
    } catch (error) {
      console.error('Error al actualizar inventario (PostgreSQL):', error);
      return null;
    }
  }
}

async function get_data_photo(id_combo) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        SELECT img 
        FROM dishes_and_combos 
        WHERE id = ?
      `;
      database.get(queryText, [id_combo], (err, row) => {
        if (err) {
          console.error("Error al obtener la imagen (SQLite):", err);
          return resolve(null);
        }
        resolve(row ? row.img : null);
      });
    });
  } else {
    const queryText = `
      SELECT img 
      FROM "Kitchen".dishes_and_combos 
      WHERE id = $1
    `;
    const values = [id_combo];
    try {
      const result = await database.query(queryText, values);
      return result.rows.length > 0 ? result.rows[0].img : null;
    } catch (error) {
      console.error("Error al obtener la imagen (PostgreSQL):", error);
      return null;
    }
  }
}

async function update_other_information_of_combo(req, id_combo) {
  const this_product_need_recipe =
    req.body.this_product_need_recipe === 'on' || req.body.this_product_need_recipe === 'true';
  const id_product_department = req.body.department;
  const id_product_category = req.body.category;

  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        UPDATE dishes_and_combos
        SET 
          this_product_need_recipe = ?,
          id_product_department = ?,
          id_product_category = ?
        WHERE id = ?
      `;
      const values = [
        this_product_need_recipe,
        id_product_department,
        id_product_category,
        id_combo,
      ];

      database.run(queryText, values, function (err) {
        if (err) {
          console.error('Error actualizando combo (SQLite):', err);
          return resolve(null);
        }
        resolve(true);
      });
    });
  } else {
    const queryText = `
      UPDATE "Kitchen".dishes_and_combos
      SET 
        this_product_need_recipe = $1,
        id_product_department = $2,
        id_product_category = $3
      WHERE id = $4
    `;
    const values = [
      this_product_need_recipe,
      id_product_department,
      id_product_category,
      id_combo,
    ];

    try {
      const result = await database.query(queryText, values);
      return result.rows;
    } catch (error) {
      console.error('Error actualizando combo (PostgreSQL):', error);
      return null;
    }
  }
}

async function update_combo_image(id_combo, image) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        UPDATE dishes_and_combos
        SET img = ?
        WHERE id = ?
      `;
      const values = [image, id_combo];

      database.run(queryText, values, function (err) {
        if (err) {
          console.error('Error actualizando imagen del combo (SQLite):', err);
          return resolve(null);
        }
        resolve(true);
      });
    });
  } else {
    const queryText = `
      UPDATE "Kitchen".dishes_and_combos
      SET img = $1
      WHERE id = $2
    `;
    const values = [image, id_combo];

    try {
      const result = await database.query(queryText, values);
      return result.rows;
    } catch (error) {
      console.error('Error actualizando imagen del combo (PostgreSQL):', error);
      return null;
    }
  }
}

async function update_information_combo_product(name, barcode, description, thisProductIsSoldInBulk, id_combo) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        UPDATE dishes_and_combos
        SET 
          name = ?,
          barcode = ?,
          description = ?,
          this_product_is_sold_in_bulk = ?
        WHERE 
          id = ?
      `;
      const values = [name, barcode, description, thisProductIsSoldInBulk, id_combo];

      database.run(queryText, values, function (err) {
        if (err) {
          console.error('Error actualizando información del combo (SQLite):', err);
          return resolve(null);
        }
        resolve(true);
      });
    });
  } else {
    const queryText = `
      UPDATE "Kitchen".dishes_and_combos
      SET 
        name = $1,
        barcode = $2,
        description = $3,
        this_product_is_sold_in_bulk = $4
      WHERE 
        id = $5
    `;
    const values = [name, barcode, description, thisProductIsSoldInBulk, id_combo];

    try {
      const result = await database.query(queryText, values);
      return result.rows;
    } catch (error) {
      console.error('Error actualizando información del combo (PostgreSQL):', error);
      return null;
    }
  }
}

async function update_supplies_image(id_supplies, image) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        UPDATE products_and_supplies
        SET img = ?
        WHERE id = ?
      `;
      const values = [image, id_supplies];

      database.run(queryText, values, function(err) {
        if (err) {
          console.error('Error actualizando imagen del suministro (SQLite):', err);
          return resolve(null);
        }
        resolve(true);
      });
    });
  } else {
    const queryText = `
      UPDATE "Kitchen".products_and_supplies
      SET img = $1
      WHERE id = $2
    `;
    const values = [image, id_supplies];

    try {
      const result = await database.query(queryText, values);
      return result.rows;
    } catch (error) {
      console.error('Error actualizando imagen del suministro (PostgreSQL):', error);
      return null;
    }
  }
}
//------------------------------------taxes--------------------------------------
router.post('/links/add-taxe', isLoggedIn, async (req, res) => {
  try {
    const id_branches = req.user.id_branch; // Ajusta según dónde guardes id_branch en usuario
    const { name, taxId, rate, isRetention } = req.body;

    if (!name || !taxId || rate === undefined) {
      return res.status(400).json({ succes:false,  error: 'Faltan datos obligatorios' });
    }

    const rateNum = parseFloat(rate);
    if (isNaN(rateNum) || rateNum < 0) {
      return res.status(400).json({ succes:false,  error: 'Tasa inválida' });
    }

    const id = await add_tax({
      id_branches,
      name,
      taxId,
      rate: rateNum,
      is_retention: isRetention === true || isRetention === 'true',
    });

    if (id) {
      res.json({  succes:true, message: 'Impuesto creado', id });
    } else {
      res.status(500).json({ succes:false, error: 'No se pudo crear el impuesto' });
    }

  } catch (error) {
    console.error('Error en /links/add-taxe:', error);
    res.status(500).json({ succes:false, error: 'Error interno del servidor' });
  }
});

async function add_tax({ id_branches, name, taxId, rate, is_retention }) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const query = `
        INSERT INTO taxes_product (id_branches, name, "taxId", rate, is_retention, base, activate, this_taxes_is_in_all)
        VALUES (?, ?, ?, ?, ?, 100, 1, 0)
      `;
      database.run(query, [id_branches, name, taxId, rate, is_retention ? 1 : 0], function (err) {
        if (err) {
          console.error('Error al insertar impuesto (SQLite):', err);
          return resolve(null);
        }
        resolve(this.lastID);
      });
    });
  } else {
    const query = `
      INSERT INTO "Branch".taxes_product (id_branches, name, "taxId", rate, is_retention, base, activate, this_taxes_is_in_all)
      VALUES ($1, $2, $3, $4, $5, 100, true, false)
      RETURNING id
    `;
    try {
      const result = await database.query(query, [id_branches, name, taxId, rate, is_retention]);
      return result.rows[0]?.id || null;
    } catch (error) {
      console.error('Error al insertar impuesto (PostgreSQL):', error);
      return null;
    }
  }
}

router.post('/links/:id_product/:id_tax/add-tax-to-the-product', isLoggedIn, async (req, res) => {
  const { id_product, id_tax } = req.params;

  if (!id_product || !id_tax) {
    return res.status(400).json({ success: false, error: 'Faltan parámetros' });
  }

  const success = await add_tax_relation_to_product(id_product, id_tax);
  if (success) {
    res.json({ success: true, message: 'Impuesto vinculado al producto' , idTax:success});
  } else {
    res.status(500).json({ success: false, error: 'No se pudo agregar el impuesto' });
  }
});


async function add_tax_relation_to_product(id_product, id_tax) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const query = `
        INSERT INTO taxes_relation (id_dish_and_combo_features, id_taxes)
        VALUES (?, ?)
      `;
      database.run(query, [id_product, id_tax], function (err) {
        if (err) {
          console.error('❌ Error en add_tax_relation_to_product (SQLite):', err);
          return resolve(null);
        }
        resolve(this.lastID); // ✅ Devolvemos el ID insertado
      });
    });
  } else {
    const query = `
      INSERT INTO "Branch".taxes_relation (id_dish_and_combo_features, id_taxes)
      VALUES ($1, $2)
      RETURNING id
    `;
    try {
      const result = await database.query(query, [id_product, id_tax]);
      return result.rows[0]?.id || null; // ✅ Devolvemos el ID insertado
    } catch (error) {
      console.error('❌ Error en add_tax_relation_to_product (PostgreSQL):', error);
      return null;
    }
  }
}



router.post('/links/delete-tax-from-product/:id_product/:idTaxRelation', isLoggedIn, async (req, res) => {
  const { idTaxRelation, id_product } = req.params;

  if (!idTaxRelation) {
    return res.status(400).json({ success: false, error: 'ID de impuesto no especificado' });
  }

  const result = await delete_tax_from_product(id_product, idTaxRelation);

  if (result) {
    return res.json({ success: true, message: 'Impuesto eliminado correctamente' });
  } else {
    return res.status(500).json({ success: false, error: 'No se pudo eliminar el impuesto' });
  }
});

async function delete_tax_from_product(id_dish_and_combo_features,id_taxes_product) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const query = `DELETE FROM taxes_relation WHERE id_dish_and_combo_features = ? and id_taxes= ?`;
      database.run(query, [id_dish_and_combo_features, id_taxes_product], function (err) {
        if (err) {
          console.error('Error al eliminar impuesto (SQLite):', err);
          return resolve(false);
        }
        resolve(this.changes > 0);
      });
    });
  } else {
    try {
      const query = `DELETE FROM "Branch".taxes_relation WHERE id_dish_and_combo_features = $1 and id_taxes = $2 `;
      const result = await database.query(query, [id_dish_and_combo_features, id_taxes_product]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error al eliminar impuesto (PostgreSQL):', error);
      return false;
    }
  }
}

//-----------------------------------
router.post('/fud/:id/:id_branch/add-supplies-free', isLoggedIn, async (req, res) => {
    const { id, id_branch } = req.params;

    //get the pack branch and database 
    //const packBranc= await get_pack_branch(id_branch);
    const packDatabase = await get_pack_database(id);

    //we will see if the user can add most supplies 
    //const allSupplies = await get_all_the_supplies_of_this_company(id, true);
    //if (allSupplies < get_supplies_max(packDatabase)) {
    //we will waching if the supplies can save the image 
    if (packDatabase == 0) {
        req.file = null;
    }

    //this is for create the new supplies and save the id of the supplies
    const newSupplies = await get_supplies_or_product_company(req, true);
    const infoSupplies = await addDatabase.add_supplies_company(newSupplies);
    const idSupplies = infoSupplies.id; //get the id of the supplies that added
    if (idSupplies) {
        //we will create the supplies in the branch
        const idSuppliesFactures = await addDatabase.add_product_and_suppiles_features(id_branch, idSupplies) //add the supplies in the branch 

        //we will creating the data of the supplies and we will saving with the id of the supplies that create
        const supplies = create_supplies_branch(req, idSuppliesFactures);

        //update the data in the branch
        if (await update.update_supplies_branch(supplies)) {
            req.flash('success', 'El insumo fue agregado con éxito! 👍')
        }
        else {
            req.flash('message', 'El insumo no fue agregado 👉👈');
        }
    }
    else {
        req.flash('message', 'El insumo no fue agregado con éxito 👉👈')
    }
    //} else {
    //req.flash('message', 'El insumo no fue agregado porque necesitas actualizar tu version de base de datos 👉👈')
    //}


    res.redirect(`/links/${id}/${id_branch}/supplies-free`);
})

function get_supplies_max(packBranch) {
    switch (packBranch) {
        case 0:
            return 50
        case 1:
            return 600
        case 2:
            return 1200
        case 3:
            return 3000
        default:
            return 50
    }
}

async function get_all_the_supplies_of_this_company(id_branch, type) {
    var queryText = `
        SELECT 
            f.*,
            p.id_companies,
            p.img,
            p.barcode,
            p.name,
            p.description,
            p.use_inventory
        FROM "Inventory".product_and_suppiles_features f
        INNER JOIN "Kitchen".products_and_supplies p ON f.id_products_and_supplies = p.id
        WHERE f.id_branches = $1 and p.supplies =$2
    `;
    var values = [id_branch, type];
    const result = await database.query(queryText, values);
    const data = result.rows;
    return data;
}

//edit supplies branch car-post
router.post('/fud/:id_company/:id_branch/:id_supplies/update-supplies-branch', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_supplies } = req.params;

    //we will creating the new supplies and we will saving the id of the supplies
    const supplies = create_supplies_branch(req, id_supplies);

    //we will watching if the supplies can update 
    if (await update.update_supplies_branch(supplies)) {
        req.flash('success', 'Los insumos se actualizaron con éxito. 👍');
    }
    else {
        req.flash('message', 'Los insumos no se actualizaron 👉👈');
    }

    if (req.user.rol_user == rolFree) {
        res.redirect(`/links/${id_company}/${id_branch}/supplies-free`);
    } else {
        res.redirect(`/links/${id_company}/${id_branch}/supplies`);
    }
})

function create_supplies_branch(req, id_supplies) {
    const { purchase_amount, purchase_price, sale_amount, sale_price, max_inventory, minimum_inventory, existence } = req.body;
    const supplies = {
        purchase_amount: string_to_float(purchase_amount),
        purchase_unity: req.body.purchase_unity,
        purchase_price: string_to_float(purchase_price),
        currency_purchase: req.body.currency_purchase,
        sale_amount: string_to_float(sale_amount),
        sale_unity: req.body.sale_unity,
        sale_price: string_to_float(sale_price),
        currency_sale: req.body.currency_sale,
        max_inventory: string_to_float(max_inventory),
        minimum_inventory: string_to_float(minimum_inventory),
        unit_inventory: req.body.unit_inventory,
        existence: string_to_float(existence),
        id_supplies: id_supplies,
    };

    return supplies;
}

function string_to_float(str) {
    let floatValue = parseFloat(str);
    return isNaN(floatValue) ? 0 : floatValue;
}

//add provider 
router.post('/fud/:id_company/:id_branch/add-providers', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const provider = create_new_provider(req);
    if (await this_provider_exists(provider)) {
        req.flash('message', 'Este proveedor ya existe en esta sucursal 😅')
    } else {
        await add_provider_to_database(provider, req);
    }


    //we will see if the user is use ed one 
    if (req.user.rol_user == rolFree) {
        res.redirect(`/links/${id_company}/${id_branch}/providers-free`);
    } else {
        res.redirect(`/links/${id_company}/${id_branch}/providers`);
    }
})


router.post('/fud/:id_company/:id_branch/:id_provider/edit-providers-branch', isLoggedIn, async (req, res) => {
    const { id_company, id_provider, id_branch } = req.params;
    const provider = create_new_provider(req);
    //we will changing the id branch for knkow
    provider.branch = id_branch;
    if (await this_provider_exists(provider)) {
        req.flash('message', 'Este proveedor ya existe en esta sucursal 😅')
    } else {
        await update_provider_to_database(id_provider, provider, req);
    }

    //we will see if the user is use ed one 
    if (req.user.rol_user == rolFree) {
        res.redirect(`/links/${id_company}/${id_branch}/providers-free`);
    } else {
        res.redirect(`/links/${id_company}/${id_branch}/providers`);
    }
})

//edit products branch 
router.post('/fud/:id_company/:id_branch/:id_supplies/update-products-branch', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_supplies } = req.params;

    //we will creating the new product and we will saving the id of the supplies
    const product = create_supplies_branch(req, id_supplies);

    //we will watching if the product can update 
    if (await update.update_supplies_branch(product)) {
        req.flash('success', 'El producto se actualizó con éxito 👍');
    }
    else {
        req.flash('message', 'El no producto se actualizó 👉👈');
    }

    res.redirect(`/links/${id_company}/${id_branch}/product`);
})

router.post('/fud/:id_company/:id_branch/:id_combo/update-combo-branch', isLoggedIn, async (req, res) => {
    const { id_company, id_combo, id_branch } = req.params;
    const combo = create_new_combo_branch(req, id_combo);


    if (await update.update_combo_branch(combo)) {
        req.flash('success', 'El combo se actualizó con éxito 😄');
    } else {
        req.flash('message', 'El combo no actualizó 😳');
    }

    if (req.user.rol_user === rolFree) {
        res.redirect(`/links/${id_company}/${id_branch}/combos-free`);
    } else {
        res.redirect(`/links/${id_company}/${id_branch}/combos`);
    }
})

function create_new_combo_branch(req, id_combo) {
    const { price1, revenue1, price2, revenue2, price3, revenue3, satKey } = req.body;
    const favorites = (req.body.favorites == 'on')
    combo = {
        favorites,
        price1: string_to_float(price1),
        revenue1: string_to_float(revenue1),
        price2: string_to_float(price2),
        revenue2: string_to_float(revenue2),
        price3: string_to_float(price3),
        revenue3: string_to_float(revenue3),
        satKey,
        id_combo: id_combo
    }
    return combo;
}

router.post('/fud/:id_user/:id_company/:id_branch/:id_employee/edit-employees', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    await update_employee(req, res);
    res.redirect('/links/' + id_company + '/' + id_branch + '/employees-branch');
})

router.post('/fud/:id_company/:id_branch/add-employees', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const { email, username, password1, password2 } = req.body;
    const rol_user = req.body.rol_user;
    //we will see if the email that the user would like to add exist 
    if (await this_email_exists(email)) {
        req.flash('message', 'El empleado no fue agregado porque este nombre de usuario ya existe 😅')
    }
    else {
        //we will see if the username that the user would like to add exist 
        if (await this_username_exists(username)) {
            req.flash('message', 'El empleado no fue añadido porque este nombre de usuario ya existe 😅')
        }
        else {
            //we will watching if the password is correct 
            if (compare_password(password1, password2)) {
                //we will to create a new user for next save in the database
                const user = await create_new_user(req)
                const idUser = await addDatabase.add_user(user, rol_user) //add the new user and get the id of the employee

                //we will see if the user was add with success
                if (idUser != null) {
                    //we will to create the new employee and add to the database
                    const employee = create_new_employee(idUser, id_company, req)
                    if (await addDatabase.add_new_employees(employee)) {
                        req.flash('success', 'El empleado fue añadido con exito 🥳')
                    }
                    else {
                        /*
                        if the data of the employee not was add but the new user yes was create, we going to make the message of warning
                        for that the manager can edit the employee data in the screen of employees
                        */
                        await delete_user(idUser)
                        req.flash('message', 'El empleado no fue añadido por favor vuelve a intentarlo 😅')
                    }
                }
                else {
                    req.flash('message', 'El empleado no fue añadido 😳')
                }
            } else {
                req.flash('message', 'La contraseña era incorrecta 😳')
            }
        }
    }

    res.redirect('/links/' + id_company + '/' + id_branch + '/employees-branch');
})

router.post('/fud/:id_company/:id_branch/add-box', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const { number, ipPrinter, ipBox } = req.body;

    //we will watching if this number of box exist in the branch 
    if (await this_box_exist_in_this_branch(id_branch, number)) {
        req.flash('message', 'Esta caja existe en la sucursal 👉👈')
    } else {
        //we will watching if can add the box to the database
        if (await addDatabase.add_box(id_branch, number, ipPrinter, ipBox)) {
            req.flash('success', 'La caja fue añadida con exito 🥳')
        } else {
            req.flash('message', 'La caja no fue agregada 😳')
        }
    }

    res.redirect('/links/' + id_company + '/' + id_branch + '/box');
})

async function this_box_exist_in_this_branch(idBranch, numer) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `SELECT * FROM boxes WHERE id_branches = ? AND num_box = ?`;
      database.all(queryText, [idBranch, numer], (err, rows) => {
        if (err) {
          console.error('Error al buscar la caja (SQLite):', err);
          return resolve(false);
        }
        resolve(rows.length > 0);
      });
    });
  } else {
    const queryText = `SELECT * FROM "Branch".boxes WHERE id_branches = $1 AND num_box = $2`;
    const values = [idBranch, numer];
    try {
      const result = await database.query(queryText, values);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error al buscar la caja (PostgreSQL):', error);
      return false;
    }
  }
}


router.post('/fud/:id_company/:id_branch/ad-offer', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    //we will to create the ad and save the image in the server
    const newAd = await create_ad(req, id_branch, 'offer');

    //we will watching if can save the ad in the database
    if (await addDatabase.add_ad(newAd)) {
        req.flash('success', 'El anuncio fue agregado con exito 🥳')
    } else {
        req.flash('message', 'El anuncio no fue agregado 👉👈')
    }

    res.redirect('/links/' + id_company + '/' + id_branch + '/ad');
})

router.post('/fud/:id_company/:id_branch/ad-new', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    //we will to create the ad and save the image in the server
    const newAd = await create_ad(req, id_branch, 'new');

    //we will watching if can save the ad in the database
    if (await addDatabase.add_ad(newAd)) {
        req.flash('success', 'El anuncio fue agregado con exito 🥳')
    } else {
        req.flash('message', 'El anuncio no fue agregado 👉👈')
    }

    res.redirect('/links/' + id_company + '/' + id_branch + '/ad');
})

router.post('/fud/:id_company/:id_branch/ad-comboAd', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;

    //we will to create the ad and save the image in the server
    const newAd = await create_ad(req, id_branch, 'combo');

    //we will watching if can save the ad in the database
    if (await addDatabase.add_ad(newAd)) {
        req.flash('success', 'El anuncio fue agregado con exito 🥳')
    } else {
        req.flash('message', 'El anuncio no fue agregado 👉👈')
    }

    res.redirect('/links/' + id_company + '/' + id_branch + '/ad');
})

router.post('/fud/:id_company/:id_branch/ad-specialAd', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;

    //we will to create the ad and save the image in the server
    const newAd = await create_ad(req, id_branch, 'special');

    //we will watching if can save the ad in the database
    if (await addDatabase.add_ad(newAd)) {
        req.flash('success', 'El anuncio fue agregado con exito 🥳')
    } else {
        req.flash('message', 'El anuncio no fue agregado 👉👈')
    }

    res.redirect('/links/' + id_company + '/' + id_branch + '/ad');
})

async function create_ad(req, id_branch, type) {
    const image = await create_a_new_image(req);
    const { name } = req.body; //get the name of the image 

    //we will watching if the user is creating an ad of combo or spacial
    if (name) {
        const ad = {
            id_branch,
            image,
            name: name,
            type
        }

        return ad;
    }

    //else if the user not is creating an ad of combo or spacial, return the body norm 
    const ad = {
        id_branch,
        image,
        name: '',
        type,
    }

    return ad;
}

router.post('/fud/:id_company/:id_branch/add-schedule', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    //we will create the new schedule 
    const schedule = create_schedule(req, id_branch);

    //add the new schedule to the database
    if (await addDatabase.add_schedule(schedule)) {
        req.flash('success', 'El horario fue agregado con exito 🥳');
    } else {
        req.flash('message', 'Ups! El horario no fue agregado 👉👈');
    }

    res.redirect('/links/' + id_company + '/' + id_branch + '/schedules');
})

function create_schedule(req, id_branch) {
    const { name_schedule, tolerance, color, ms, mf, ts, tf, ws, wf, ths, thf, fs, ff, sas, saf, sus, suf } = req.body;

    // Función para obtener el tiempo en formato adecuado
    function get_time_form(value1, value2) {
        return (value1 !== undefined && value1 !== null && value1 !== '') && (value2 !== undefined && value2 !== null && value2 !== '') ? value1 : '00:00';
    }

    // Crear el objeto schedule con las variables ajustadas
    const schedule = {
        id_branch,
        name_schedule: name_schedule,
        tolerance: tolerance,
        color: color,
        monda: is_valid_value(ms, mf),
        tuesday: is_valid_value(ts, tf),
        wedsney: is_valid_value(ws, wf),
        thuesday: is_valid_value(ths, thf),
        friday: is_valid_value(fs, ff),
        saturday: is_valid_value(sas, saf),
        sunday: is_valid_value(sus, suf),
        ms: get_time_form(ms, mf),
        mf: get_time_form(mf, ms),
        ts: get_time_form(ts, tf),
        tf: get_time_form(tf, ts),
        ws: get_time_form(ws, wf),
        wf: get_time_form(wf, ws),
        ths: get_time_form(ths, thf),
        thf: get_time_form(thf, ths),
        fs: get_time_form(fs, ff),
        ff: get_time_form(ff, fs),
        sas: get_time_form(sas, saf),
        saf: get_time_form(saf, sas),
        sus: get_time_form(sus, suf),
        suf: get_time_form(suf, sus)
    };

    return schedule;
}

function is_valid_value(value1, value2) {
    return (value1 ?? '') !== '' && (value2 ?? '') !== '';
}

router.post('/fud/:id_company/:id_branch/:id_schedule/edit-schedule', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_schedule } = req.params;
    //we will create the new schedule 
    const schedule = create_schedule(req, id_branch);

    //add the new schedule to the database
    if (await update_schedule_by_id(schedule, id_schedule)) {
        req.flash('success', 'El horario fue actualizado con exito 🥳');
    } else {
        req.flash('message', 'Ups! El horario no fue actualizado 👉👈');
    }

    res.redirect('/links/' + id_company + '/' + id_branch + '/schedules');
})

async function update_schedule_by_id(schedule, id) {
  try {
    if (TYPE_DATABASE === 'mysqlite') {
      return await new Promise((resolve) => {
        const queryText = `
          UPDATE schedules SET
            id_branches = ?,
            name = ?,
            tolerance_time = ?,
            color = ?,
            monday = ?,
            tuesday = ?,
            wednesday = ?,
            thursday = ?,
            friday = ?,
            saturday = ?,
            sunday = ?,
            ms = ?,
            mf = ?,
            ts = ?,
            tf = ?,
            ws = ?,
            wf = ?,
            ths = ?,
            thf = ?,
            fs = ?,
            ff = ?,
            sas = ?,
            saf = ?,
            sus = ?,
            suf = ?
          WHERE id = ?
        `;

        // Asegúrate que el orden de Object.values(schedule) coincida con el orden de las columnas arriba
        const values = [
          schedule.id_branches, schedule.name, schedule.tolerance_time, schedule.color,
          schedule.monday, schedule.tuesday, schedule.wednesday, schedule.thursday, schedule.friday, schedule.saturday, schedule.sunday,
          schedule.ms, schedule.mf, schedule.ts, schedule.tf, schedule.ws, schedule.wf,
          schedule.ths, schedule.thf, schedule.fs, schedule.ff, schedule.sas, schedule.saf,
          schedule.sus, schedule.suf,
          id
        ];

        database.run(queryText, values, function(err) {
          if (err) {
            console.error('Error updating schedule (SQLite):', err);
            return resolve(false);
          }
          resolve(true);
        });
      });
    } else {
      // PostgreSQL
      const queryText = `
        UPDATE "Employee".schedules SET
          id_branches = $1,
          name = $2,
          tolerance_time = $3,
          color = $4,
          monday = $5,
          tuesday = $6,
          wednesday = $7,
          thursday = $8,
          friday = $9,
          saturday = $10,
          sunday = $11,
          ms = $12,
          mf = $13,
          ts = $14,
          tf = $15,
          ws = $16,
          wf = $17,
          ths = $18,
          thf = $19,
          fs = $20,
          ff = $21,
          sas = $22,
          saf = $23,
          sus = $24,
          suf = $25
        WHERE id = $26
      `;
      var values = Object.values(schedule);
      values.push(id);
      await database.query(queryText, values);
      return true;
    }
  } catch (error) {
    console.error('Error updating schedule:', error);
    return false;
  }
}

//------------------------------------------------------------------------------------------------cart
router.post('/fud/client', isLoggedIn, async (req, res) => {
  try {
    // Los datos que vienen en req.body asumo que son un arreglo [email, id_company]
    const email = req.body[0];
    const idCompany = req.body[1];

    if (TYPE_DATABASE === 'mysqlite') {
      const queryText = `SELECT * FROM customers WHERE id_companies = ? AND email = ?`;
      database.get(queryText, [idCompany, email], (err, row) => {
        if (err) {
          console.error('Error querying customer (SQLite):', err);
          return res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
        }
        if (row) {
          const { id: idCustomer, first_name: firstName, second_name: secondName, last_name: lastName, email } = row;
          res.status(200).json({ idCustomer, firstName, secondName, lastName, email });
        } else {
          res.status(200).json({ idCustomer: null });
        }
      });
    } else {
      // PostgreSQL
      const queryText = `SELECT * FROM "Company".customers WHERE id_companies = $1 AND email = $2`;
      const values = [idCompany, email];
      const result = await database.query(queryText, values);
      if (result.rows.length > 0) {
        const row = result.rows[0];
        const { id: idCustomer, first_name: firstName, second_name: secondName, last_name: lastName, email } = row;
        res.status(200).json({ idCustomer, firstName, secondName, lastName, email });
      } else {
        res.status(200).json({ idCustomer: null });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
  }
});


router.post('/fud/car-post', isLoggedIn, async (req, res) => {
    await add_table_box_history(); //this is for create the table that the new user neeed
    var commander = ''
    var text = ''

    const idCompany = req.user.id_company;
    const idEmployee = req.user.id_employee;
    const idBranch = req.user.id_branch;

    try {
        //get the data of the server
        const products = req.body.products;

        //we will seeing if can create all the combo of the car
        text = await watch_if_can_create_all_the_combo(products);
        //if can buy this combos, we going to add this buy to the database 
        if (text == 'success') {
            const id_customer = req.body.id_customer;

            //get the day of sale
            const date=new Date()
            const day = date.toLocaleString("es-MX", { timeZone: "America/Mexico_City" });//new Date().toISOString()//new Date();

            const commanderDish = []
            for (const product of products) {

                const nameProduct = product.name;
                const priceProduct = product.name;
                const amount = product.quantity;
                const totalPrice = product.price * product.quantity;
                commanderDish.push({
                    nameProduct,
                    priceProduct,
                    amount,
                    totalPrice
                });

                //save the buy in the database req.boyd.pointMoney;    
                await addDatabase.add_buy_history(idCompany, idBranch, idEmployee, id_customer, product.id_dishes_and_combos, product.price, product.quantity, totalPrice, day);
                await save_box_history(idEmployee, id_customer, req.body.cash, req.body.credit, req.body.debit, req.body.pointMoney ,req.body.pointsThatUsedTheUser,req.body.comment, day, req.body.change);
            }

            //her we will save the ticket in our database
            await save_the_ticket(idCompany,idBranch,idEmployee, id_customer, req.body.total, req.body.cash, req.body.credit, req.body.debit, req.body.pointMoney ,req.body.pointsThatUsedTheUser, req.body.comment, date, req.body.change, req.body.token, products)

            //save the comander
            commander = create_commander(idBranch, idEmployee, id_customer, commanderDish, req.body.total, req.body.moneyReceived, req.body.change, req.body.comment, day);
            text = await addDatabase.add_commanders(commander); //save the id commander


            //here we will see if the sale have a user and used point of sale, we will update the information of points of the user
            if(id_customer!=null){
                //here is if the user use points
                await update_points_of_the_customer(idCompany, id_customer, req.body.pointsThatUsedTheUser);

                //this is for add point to the wallet of the customer
                const pointsGet=await transform_diner_to_points(idBranch, req.body.cash, req.body.credit, req.body.debit, req.body.change);
                await add_points_to_the_customer(idCompany, id_customer, pointsGet)
            }
        }

        //send an answer to the customer
        res.status(200).json({ message: text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
    }
})

async function transform_diner_to_points(id_branch, cash, credit, debit, change){
  const parseToFloat = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    return parseFloat(value) || 0;
  };

  cash = parseToFloat(cash);
  credit = parseToFloat(credit);
  debit = parseToFloat(debit);
  change = parseToFloat(change);
  const total=cash+credit+debit-change;
  const branchFree = await get_data_branch(id_branch);
  const money_to_points= branchFree[0].money_to_points;
  //1 point==money_to_points
  //? points == total

  return (total/money_to_points)
}

async function update_points_of_the_customer(id_company, id_customer, pointUsed) {
    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite
        const queryText = `
            UPDATE customers
            SET points = points - ?
            WHERE id = ?
            AND id_companies = ?
            RETURNING id, first_name, last_name, points
        `;
        const values = [pointUsed, id_customer, id_company];

        try {
            const rows = await new Promise((resolve, reject) => {
                database.all(queryText, values, (err, rows) => {
                    if (err) {
                        console.error("Error SQLite in update_points_of_the_customer:", err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            return true;
        } catch (err) {
            console.error("Error SQLite in update_points_of_the_customer:", err);
            return null;
        }

    } else {
        // PostgreSQL
        const queryText = `
            UPDATE "Company".customers
            SET points = points - $3
            WHERE id = $1
            AND id_companies = $2
            RETURNING id, first_name, last_name, points
        `;
        const values = [id_customer, id_company, pointUsed];

        try {
            const result = await database.query(queryText, values);
            return true;
        } catch (err) {
            console.error("Error PostgreSQL in update_points_of_the_customer:", err);
            return null;
        }
    }
}

async function add_points_to_the_customer(id_company, id_customer, pointGet) {
    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite
        const queryText = `
            UPDATE customers
            SET points = points + ?
            WHERE id = ?
            AND id_companies = ?
            RETURNING id, first_name, last_name, points
        `;
        const values = [pointGet, id_customer, id_company];

        try {
            const rows = await new Promise((resolve, reject) => {
                database.all(queryText, values, (err, rows) => {
                    if (err) {
                        console.error("Error SQLite in update_points_of_the_customer:", err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            return true;
        } catch (err) {
            console.error("Error SQLite in update_points_of_the_customer:", err);
            return null;
        }

    } else {
        // PostgreSQL
        const queryText = `
            UPDATE "Company".customers
            SET points = points + $3
            WHERE id = $1
            AND id_companies = $2
            RETURNING id, first_name, last_name, points
        `;
        const values = [id_customer, id_company, pointGet];

        try {
            const result = await database.query(queryText, values);
            return true;
        } catch (err) {
            console.error("Error PostgreSQL in update_points_of_the_customer:", err);
            return null;
        }
    }
}

async function save_the_ticket(id_company,id_branch,id_employee, id_customer, total, cash, credit, debit, pointMoney, pointsThatUsedTheUser, note, day, change, token, products){
  const idCustomerParam = id_customer === "null" ? null : id_customer;

  // Helper para convertir a número
  const parseToFloat = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    return parseFloat(value) || 0;
  };

  cash = parseToFloat(cash);
  credit = parseToFloat(credit);
  debit = parseToFloat(debit);
  change = parseToFloat(change);
  pointsThatUsedTheUser = parseToFloat(pointsThatUsedTheUser);
  pointMoney = parseToFloat(pointMoney);
  
    const now = new Date();
    const mexicoTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Mexico_City" })
    );
    const time =  mexicoTime.toISOString();
    //new Date().toISOString(),
  //now we will save in the database 
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        INSERT INTO ticket 
        (key, original_ticket, current_ticket, cash, debit, credit, total, note, id_customers, id_employees, id_branches, id_companies, date_sale, points, moneyPoints)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      database.run(
        queryText,
        [
          token,
          JSON.stringify(products),
          JSON.stringify(products),
          cash,
          debit,
          credit,
          total,
          note,
          idCustomerParam,
          id_employee,
          id_branch,
          id_company,
          day.toISOString(),
          pointsThatUsedTheUser,
          pointMoney
        ],
        function (err) {
          if (err) {
            console.error('Error save_ticket (SQLite):', err);
            return resolve(false);
          }
          resolve(true);
        }
      );
    });
  } else {
    const queryText = `
      INSERT INTO "Box".ticket 
      (key, original_ticket, current_ticket, cash, debit, credit, total, note, id_customers, id_employees, id_branches, id_companies, points, moneyPoints)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `;
    try {
      await database.query(queryText, [
        token,
        JSON.stringify(products),
        JSON.stringify(products),
        cash,
        debit,
        credit,
        total,
        note,
        idCustomerParam,
        id_employee,
        id_branch,
        id_company,
        pointsThatUsedTheUser,
        pointMoney
      ]);
      return true;
    } catch (error) {
      console.error('Error save_ticket (PostgreSQL):', error);
      return false;
    }
  }
}

async function save_box_history(idEmployee, id_customer, cash, credit, debit, pointMoney ,pointsThatUsedTheUser, comment, day, change) {
  const idCustomerParam = id_customer === "null" ? null : id_customer;

  // Helper para convertir a número
  const parseToFloat = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    return parseFloat(value) || 0;
  };

  cash = parseToFloat(cash);
  credit = parseToFloat(credit);
  debit = parseToFloat(debit);
  change = parseToFloat(change);
  pointMoney = parseToFloat(pointMoney);
  pointsThatUsedTheUser = parseToFloat(pointsThatUsedTheUser);

  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        INSERT INTO box_history 
        (id_employee, id_customers, buy_for_cash, buy_for_credit_card, buy_for_debit_card, buy_for_points, points, comment, date_sales, change_of_sale)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      database.run(queryText, [idEmployee, idCustomerParam, cash, credit, debit, pointMoney, pointsThatUsedTheUser, comment, day, change], function(err) {
        if (err) {
          console.error('Error save_box_history (SQLite):', err);
          return resolve(false);
        }
        resolve(true);
      });
    });
  } else {
    const queryText = `
      INSERT INTO "Box".box_history 
      (id_employee, id_customers, buy_for_cash, buy_for_credit_card, buy_for_debit_card, buy_for_points, points, comment, date_sales, change_of_sale)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9, $10)
    `;
    try {
      await database.query(queryText, [idEmployee, idCustomerParam, cash, credit, debit, pointMoney, pointsThatUsedTheUser, comment, day, change]);
      return true;
    } catch (error) {
      console.error('Error save_box_history (PostgreSQL):', error);
      return false;
    }
  }
}

async function add_table_box_history() {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        CREATE TABLE IF NOT EXISTS box_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          id_employee INTEGER NOT NULL,
          id_customers INTEGER,
          buy_for_cash REAL NOT NULL,
          buy_for_credit_card REAL NOT NULL,
          buy_for_debit_card REAL NOT NULL,
          buy_for_points numeric(10,2) DEFAULT 0,
          points numeric(10,2) DEFAULT 0,
          change_of_sale REAL DEFAULT 0,
          comment TEXT,
          date_sales DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `;
      database.run(queryText, (err) => {
        if (err) {
          console.error('Error creating table box_history (SQLite):', err);
          return resolve(false);
        }
        resolve(true);
      });
    });
  } else {
    // PostgreSQL
    const queryText = `
      CREATE TABLE IF NOT EXISTS "Box".box_history (
        id BIGSERIAL PRIMARY KEY,
        id_employee INTEGER NOT NULL,
        id_customers INTEGER,
        buy_for_cash NUMERIC(10,2) NOT NULL,
        buy_for_credit_card NUMERIC(10,2) NOT NULL,
        buy_for_debit_card NUMERIC(10,2) NOT NULL,
        buy_for_points numeric(10,2) DEFAULT 0,
        points numeric(10,2) DEFAULT 0,
        change_of_sale NUMERIC(10,2) DEFAULT 0,
        comment TEXT,
        date_sales TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    try {
      await database.query(queryText);
      return true;
    } catch (error) {
      console.error('Error creating table box_history (PostgreSQL):', error);
      return false;
    }
  }
}


function create_commander(id_branch, id_employee, id_customer, commanderDish, total, moneyReceived, change, comment, date) {
    const commander = {
        id_branch,
        id_employee,
        id_customer: id_customer === 'null' ? null : id_customer,
        commanderDish: JSON.stringify(commanderDish),
        total,
        moneyReceived,
        change,
        status: 0,
        comment,
        date
    }
    return commander;
}

//this is for save the recipe of the product that need recipe
router.post('/fud/recipe-post', isLoggedIn, async (req, res) => {
    //get the data of the user
    const idCompany = req.user.id_company;
    const idEmployee = req.user.id_employee;
    const idBranch = req.user.id_branch;
    const information_of_recipe = req.body;

    //her we will read all the recipe and we will save in the database
    for (let recipe of information_of_recipe) {
        try {
            await addDatabase.add_recipe(idCompany, idBranch, idEmployee, recipe);
            res.status(200).json({ message: true });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
        }
    }
})

/*
router.post('/fud/:id_customer/car-post', isLoggedIn, async (req, res) => {
    var commander = ''
    var text = ''
    var total=0
    try {
        //get the data of the server
        const combos = req.body;

        //we will seeing if can create all the combo of the car
        text = await watch_if_can_create_all_the_combo(combos);

        //if can buy this combos, we going to add this buy to the database 
        if (text == 'success') {
            const { id_customer } = req.params;
            const id_employee = await get_id_employee(req.user.id);
            const day = new Date();

            //we will to save the data for create the commander
            var commanderDish = []
            var idBranch = 0;

            //we will read all the combos and save in the database 
            for (const combo of combos) {
                const dataComboFeatures = await get_data_combo_features(combo.id); //get the data of the combo
                idBranch = dataComboFeatures.id_branches; //change the id branch for save the commander
                const dataComandera = create_data_commander(combo)
                commanderDish.push(dataComandera);

                //save the buy in the database 
                await addDatabase.add_buy_history(dataComboFeatures.id_companies, dataComboFeatures.id_branches, id_employee, id_customer, dataComboFeatures.id_dishes_and_combos,combo.price,combo.amount,combo.total,day);
            }

            //save the comander
            commander = create_commander(idBranch, id_employee, id_customer, commanderDish, combos[0].totalCar, combos[0].moneyReceived, combos[0].exchange, combos[0].comment, day)
            text = await addDatabase.add_commanders(commander); //save the id commander
            total=combos[0].totalCar
        }

        //send an answer to the customer
        res.status(200).json({ message: text});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
    }
})

router.post('/fud/:id_customer/:ipPrinter/car-post', isLoggedIn, async (req, res) => {
    var commander = ''
    var text = ''
    var total=0
    try {
        //get the data of the server
        const combos = req.body;

        //we will seeing if can create all the combo of the car
        text = await watch_if_can_create_all_the_combo(combos);

        //if can buy this combos, we going to add this buy to the database 
        if (text == 'success') {
            const { id_customer } = req.params;
            const id_employee = await get_id_employee(req.user.id);
            const day = new Date();

            //we will to save the data for create the commander
            var commanderDish = []
            var idBranch = 0;

            //we will read all the combos and save in the database 
            for (const combo of combos) {
                const dataComboFeatures = await get_data_combo_features(combo.id); //get the data of the combo
                idBranch = dataComboFeatures.id_branches; //change the id branch for save the commander
                const dataComandera = create_data_commander(combo)
                commanderDish.push(dataComandera);

                //save the buy in the database 
                //await addDatabase.add_buy_history(dataComboFeatures.id_companies, dataComboFeatures.id_branches, id_employee, id_customer, dataComboFeatures.id_dishes_and_combos,combo.price,combo.amount,combo.total,day);
            }

            //save the comander
            commander = create_commander(idBranch, id_employee, id_customer, commanderDish, combos[0].totalCar, combos[0].moneyReceived, combos[0].exchange, combos[0].comment, day)
            text = await addDatabase.add_commanders(commander); //save the id commander
            total=combos[0].totalCar
        }

        //send an answer to the customer
        //res.status(200).json({ message: text});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
    }

    //this is for that not exist a error when printer
    try {
        await printer.print_ticket(commander,total); //this is for print the ticket 
        res.status(200).json({ message: text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'No podemos imprimir el ticket' });
    }
})

*/

router.post('/fud/car-customer-post', async (req, res) => {
    var commander = ''
    var text = ''
    try {
        //get the data of the server
        const combos = req.body;

        //we will seeing if can create all the combo of the car
        text = await watch_if_can_create_all_the_combo(combos);
    
        //if can buy this combos, we going to add this buy to the database 
        if (text == 'success') {
            const id_customer = null;
            const id_employee = null;
            const day = new Date();

            //we will to save the data for create the commander
            var commanderDish = []
            var idBranch = 0;

            //we will read all the combos and save in the database 
            for (const combo of combos) {
                const dataComboFeatures = await get_data_combo_features(combo.id); //get the data of the combo
           
                idBranch = dataComboFeatures.id_branches; //change the id branch for save the commander
                const dataComandera = create_data_commander(combo)
                commanderDish.push(dataComandera);

                //save the buy in the database 
                //await addDatabase.add_buy_history(dataComboFeatures.id_companies, dataComboFeatures.id_branches, id_employee, id_customer, dataComboFeatures.id_dishes_and_combos,combo.price,combo.amount,combo.total,day);
            }

            //save the comander
            commander = create_commander(idBranch, id_employee, id_customer, commanderDish, combos[0].totalCar, combos[0].moneyReceived, combos[0].exchange, combos[0].comment, day)
            text = await addDatabase.add_commanders(commander); //save the id commander

        }
        //send an answer to the customer
        //res.status(200).json({ message: text});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
    }
    console.log('texto')
    console.log(text)
    try {
        await printer.print_ticket(commander); //this is for print the ticket 
        res.status(200).json({ message: text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'No podemos imprimir el ticket' });
    }
})


function create_data_commander(combo) {
    const name = combo.name;
    const price = combo.price;
    const amount = combo.amount;
    const total = combo.total;
    return { name, price, amount, total }
}

function create_commander(id_branch, id_employee, id_customer, commanderDish, total, moneyReceived, change, comment, date) {
    const commander = {
        id_branch,
        id_employee,
        id_customer: id_customer === 'null' ? null : id_customer,
        commanderDish: JSON.stringify(commanderDish),
        total,
        moneyReceived,
        change,
        status: 0,
        comment,
        date
    }
    return commander;
}

async function get_id_employee(idUser) {
    var queryText = 'SELECT id FROM "Company".employees WHERE id_users = $1';
    var values = [idUser];
    try {
        const result = await database.query(queryText, values);
        // Verificar si se obtuvo algún resultado
        if (result.rows.length > 0) {
            // Devolver el ID del empleado
            return result.rows[0].id;
        } else {
            console.error('No se encontró ningún empleado con el ID de usuario proporcionado.');
            return null; // O cualquier otro valor que indique que no se encontró el empleado
        }
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        throw error; // Lanzar el error para que sea manejado en otro lugar si es necesario
    }
}

async function watch_if_can_create_all_the_combo(combos) {
    // Iterate through all the combos
    var arrayCombo = await get_all_supplies_of_the_combos(combos)
    var listSupplies = calculate_the_supplies_that_need(arrayCombo);

    //we will to calculate if have the supplies need for create all the combos that the customer would like eat
    const answer = await exist_the_supplies_need_for_creat_all_the_combos(listSupplies);
    if (answer == true) {
        //if exist all the supplies, we update the inventory 
        for (const supplies of listSupplies) {
            /*
            if the supplies is equal to a empty space, this means that the products not use inventrory, else if exist a name
            the producuts if use inventory
            */
            if (supplies.name != '') {
                //get the data feature of the supplies and his existence 
                const dataSuppliesFeactures = await get_data_supplies_features(supplies.idBranch, supplies.idSupplies)
                const existence = dataSuppliesFeactures.existence;
                const newAmount = parseFloat(existence) - parseFloat(supplies.amount); //calculate the new amount for update in the inventory
                await update_inventory(supplies.idBranch, supplies.idSupplies, newAmount);
            }
        }
    } else {
        return 'No se puede crear el combo porque no existe suficiente ' + answer;
    }

    // If cannot create the combo, send a message of warning
    return 'success';
}

async function get_all_supplies_of_the_combos(combos) {
    // Iterate through all the combos
    var arrayCombo = []
    for (const combo of combos) {
        const amountCombo = combo.quantity;
        const dataComboFeatures = await get_data_combo_features(combo.id_dishes_and_combos);


        if (dataComboFeatures != null) {
            //get the supplies that need this combo for his creation
            const supplies = await get_all_supplies_this_combo(dataComboFeatures, amountCombo);
            arrayCombo.push(supplies)
        }
    }

    return arrayCombo;
}

async function exist_the_supplies_need_for_creat_all_the_combos(listSupplies) {
    //we will to calculate if have the supplies need for create all the combos that the customer would like eat
    for (const supplies of listSupplies) {
        /*
        if the supplies is equal to a empty space, this means that the products not use inventrory, else if exist a name
        the producuts if use inventory
        */
        if (supplies.name != '') {
            if (!await exist_supplies_for_create_this_combo(supplies.idBranch, supplies.idSupplies, supplies.amount)) {
                //if there are not enough supplies, we will send the supplies that need buy the restaurant 
                return supplies.name;
            }
        }
    }

    return true;
}

async function get_data_supplies_features(idBranch, idSupplies) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        SELECT 
          existence,
          minimum_inventory
        FROM product_and_suppiles_features
        WHERE id_branches = ? AND id_products_and_supplies = ?
      `;
      database.get(queryText, [idBranch, idSupplies], (err, row) => {
        if (err) {
          console.error('Error get data supplies features (SQLite):', err);
          return resolve(false);
        }
        resolve(row || null);
      });
    });
  } else {
    // PostgreSQL
    const queryText = `
      SELECT 
        existence,
        minimum_inventory
      FROM "Inventory".product_and_suppiles_features
      WHERE id_branches = $1 AND id_products_and_supplies = $2
    `;
    try {
      const result = await database.query(queryText, [idBranch, idSupplies]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error get data supplies features (PostgreSQL):', error);
      return false;
    }
  }
}


async function get_data_combo_features(idCombo) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        SELECT dc.name, df.id_companies, df.id_branches, df.id_dishes_and_combos
        FROM dish_and_combo_features df
        INNER JOIN dishes_and_combos dc
          ON dc.id = df.id_dishes_and_combos
        WHERE df.id_dishes_and_combos = ?
      `;
      database.get(queryText, [idCombo], (err, row) => {
        if (err) {
          console.error('Error get data combo features (SQLite):', err);
          return resolve(null);
        }
        resolve(row || null);
      });
    });
  } else {
    // PostgreSQL
    const queryText = `
    SELECT dc.name, df.id_companies, df.id_branches, df.id_dishes_and_combos
    FROM "Inventory".dish_and_combo_features df
    INNER JOIN "Kitchen".dishes_and_combos dc
    ON dc.id = df.id_dishes_and_combos
    WHERE df.id_dishes_and_combos = $1;
    `;
    try {
      const result = await database.query(queryText, [idCombo]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error get data combo features (PostgreSQL):', error);
      return null;
    }
  }
}

async function get_all_supplies_this_combo(dataComboFeatures, amountCombo) {
    // Get the data of the combo to check if the inventory has the supplies to create the combo
    const idCombo = dataComboFeatures.id_dishes_and_combos;
    const idBranch = dataComboFeatures.id_branches;
    const dataSupplies = await get_all_price_supplies_branch(idCombo, idBranch);

    // first Iterate through all the supplies needed for this combo
    var arraySupplies = []
    for (const supplies of dataSupplies) {
        const name = supplies.product_name;
        const idSupplies = supplies.id_products_and_supplies;
        const amount = supplies.amount * amountCombo;
        arraySupplies.push({ idBranch, name, idSupplies, amount });
    }

    return arraySupplies;
}

async function get_all_price_supplies_branch22(idCombo, idBranch) {
    try {
        // Consulta para obtener los suministros de un combo específico
        const comboQuery = `
            SELECT tsc.id_products_and_supplies, tsc.amount, tsc.unity, psf.currency_sale
            FROM "Kitchen".table_supplies_combo tsc
            INNER JOIN "Inventory".product_and_suppiles_features psf
            ON tsc.id_products_and_supplies = psf.id_products_and_supplies
            WHERE tsc.id_dishes_and_combos = $1 ORDER BY id_products_and_supplies DESC
        `;
        const comboValues = [idCombo];
        const comboResult = await database.query(comboQuery, comboValues);

        // Consulta para obtener el precio de los suministros en la sucursal específica
        const priceQuery = `
            SELECT psf.id_products_and_supplies, psf.sale_price, psf.sale_unity
            FROM "Inventory".product_and_suppiles_features psf
            WHERE psf.id_branches = $1 ORDER BY id_products_and_supplies DESC
        `;
        const priceValues = [idBranch];
        const priceResult = await database.query(priceQuery, priceValues);

        // Construir un objeto que contenga los suministros y sus precios en la sucursal específica
        const suppliesWithPrice = {};
        priceResult.rows.forEach(row => {
            suppliesWithPrice[row.id_products_and_supplies] = row.sale_price;
        });

        // Agregar los suministros y sus cantidades del combo junto con sus precios
        const suppliesInfo = [];
        comboResult.rows.forEach(row => {
            const supplyId = row.id_products_and_supplies;
            const supplyPrice = suppliesWithPrice[supplyId] || 0; // Precio predeterminado si no se encuentra
            suppliesInfo.push({
                img: '',
                product_name: '',
                product_barcode: '',
                description: '',
                id_products_and_supplies: supplyId,
                amount: row.amount,
                unity: row.unity,
                sale_price: supplyPrice,
                currency: row.currency_sale
            });
        });

        //agregamos los datos del combo 
        const suppliesCombo = await search_supplies_combo(idCombo);
        for (var i = 0; i < suppliesCombo.length; i++) {
            suppliesInfo[i].img = suppliesCombo[i].img;
            suppliesInfo[i].product_name = suppliesCombo[i].product_name;
            suppliesInfo[i].product_barcode = suppliesCombo[i].product_barcode;
            suppliesInfo[i].description = suppliesCombo[i].description;
        }

        return suppliesInfo;
    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error;
    }
}

async function get_all_price_supplies_branch(idCombo, idBranch) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
        const comboQuery = `
        SELECT tsc.id_products_and_supplies, tsc.amount, tsc.unity, psf.currency_sale
        FROM table_supplies_combo tsc
        INNER JOIN product_and_suppiles_features psf
        ON tsc.id_products_and_supplies = psf.id_products_and_supplies
        WHERE tsc.id_dishes_and_combos = ?
        ORDER BY tsc.id_products_and_supplies DESC
        `;
      const priceQuery = `
        SELECT id_products_and_supplies, sale_price, sale_unity
        FROM product_and_suppiles_features
        WHERE id_branches = ? ORDER BY id_products_and_supplies DESC
      `;

      const suppliesInfo = [];

      database.all(comboQuery, [idCombo], (errCombo, comboRows) => {
        if (errCombo) {
          console.error("Error en comboQuery (SQLite):", errCombo);
          return resolve([]);
        }

        database.all(priceQuery, [idBranch], async (errPrice, priceRows) => {
          if (errPrice) {
            console.error("Error en priceQuery (SQLite):", errPrice);
            return resolve([]);
          }

          const suppliesWithPrice = {};
          priceRows.forEach(row => {
            suppliesWithPrice[row.id_products_and_supplies] = row.sale_price;
          });

          for (const row of comboRows) {
            const supplyId = row.id_products_and_supplies;
            const supplyPrice = suppliesWithPrice[supplyId] || 0;
            suppliesInfo.push({
              img: '',
              product_name: '',
              product_barcode: '',
              description: '',
              id_products_and_supplies: supplyId,
              amount: row.amount,
              unity: row.unity,
              sale_price: supplyPrice,
              currency: row.currency_sale
            });
          }

          // obtener datos visuales del combo
          const suppliesCombo = await search_supplies_combo(idCombo);
          for (let i = 0; i < suppliesCombo.length; i++) {
            if (suppliesInfo[i]) {
              suppliesInfo[i].img = suppliesCombo[i].img;
              suppliesInfo[i].product_name = suppliesCombo[i].product_name;
              suppliesInfo[i].product_barcode = suppliesCombo[i].product_barcode;
              suppliesInfo[i].description = suppliesCombo[i].description;
            }
          }

          resolve(suppliesInfo);
        });
      });
    });

  } else {
    // PostgreSQL (original)
    try {
      const comboQuery = `
        SELECT tsc.id_products_and_supplies, tsc.amount, tsc.unity, psf.currency_sale
        FROM "Kitchen".table_supplies_combo tsc
        INNER JOIN "Inventory".product_and_suppiles_features psf
        ON tsc.id_products_and_supplies = psf.id_products_and_supplies
        WHERE tsc.id_dishes_and_combos = $1 ORDER BY id_products_and_supplies DESC
      `;
      const comboResult = await database.query(comboQuery, [idCombo]);

      const priceQuery = `
        SELECT psf.id_products_and_supplies, psf.sale_price, psf.sale_unity
        FROM "Inventory".product_and_suppiles_features psf
        WHERE psf.id_branches = $1 ORDER BY id_products_and_supplies DESC
      `;
      const priceResult = await database.query(priceQuery, [idBranch]);

      const suppliesWithPrice = {};
      priceResult.rows.forEach(row => {
        suppliesWithPrice[row.id_products_and_supplies] = row.sale_price;
      });

      const suppliesInfo = [];
      comboResult.rows.forEach(row => {
        const supplyId = row.id_products_and_supplies;
        const supplyPrice = suppliesWithPrice[supplyId] || 0;
        suppliesInfo.push({
          img: '',
          product_name: '',
          product_barcode: '',
          description: '',
          id_products_and_supplies: supplyId,
          amount: row.amount,
          unity: row.unity,
          sale_price: supplyPrice,
          currency: row.currency_sale
        });
      });

      const suppliesCombo = await search_supplies_combo(idCombo);
      for (let i = 0; i < suppliesCombo.length; i++) {
        if (suppliesInfo[i]) {
          suppliesInfo[i].img = suppliesCombo[i].img;
          suppliesInfo[i].product_name = suppliesCombo[i].product_name;
          suppliesInfo[i].product_barcode = suppliesCombo[i].product_barcode;
          suppliesInfo[i].description = suppliesCombo[i].description;
        }
      }

      return suppliesInfo;
    } catch (error) {
      console.error("Error en la consulta (PostgreSQL):", error);
      throw error;
    }
  }
}


function calculate_the_supplies_that_need(arrayCombo) {
    var listSupplies = [] //this list is for save all the supplies for that do not repeat

    //we will to read all the combos of the array 
    for (const combo of arrayCombo) {
        //this for read all the supplies of the combo current
        for (const suppliesCombo of combo) {
            //we will see if exist this supplies in our list of supplies not repeat 
            var thisSuppliesExistInMyList = false;
            for (const supplies of listSupplies) {
                //if the supplies exist in our list, we will increase the amount of supplies we will use
                if (supplies.idSupplies == suppliesCombo.idSupplies) {
                    thisSuppliesExistInMyList = true;

                    //we will to calculate the new amount of the supplies 
                    const newAmount = supplies.amount + suppliesCombo.amount;
                    supplies.amount = newAmount;
                    break;
                }
            }

            //if the supplies not exist we will add to the list 
            if (!thisSuppliesExistInMyList) {
                listSupplies.push(suppliesCombo);
            }
        }
    }
    return listSupplies;
}

async function update_inventory(idBranch, idCombo, newAmount) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText1 = `
        UPDATE product_and_suppiles_features
        SET existence = ?
        WHERE id_branches = ? AND id_products_and_supplies = ?
      `;
      const queryText = `
        UPDATE product_and_suppiles_features
        SET existence = ?
        WHERE id_branches = ? AND id_products_and_supplies = ?
      `;
      const values = [newAmount, idBranch, idCombo];

      database.run(queryText, values, function (err) {
        if (err) {
          console.error('Error updating provider (SQLite):', err);
          return resolve(false);
        }
        resolve(true);
      });
    });
  } else {
    // PostgreSQL
    const queryText = `
      UPDATE "Inventory".product_and_suppiles_features
      SET existence = $1
      WHERE id_branches = $2 AND id_products_and_supplies = $3
    `;
    const values = [newAmount, idBranch, idCombo];

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error updating provider (PostgreSQL):', error);
      return false;
    }
  }
}


async function search_supplies_combo(id_dishes_and_combos) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        SELECT tsc.*, pas.img AS img, pas.name AS product_name, pas.barcode AS product_barcode
        FROM table_supplies_combo tsc
        JOIN products_and_supplies pas ON tsc.id_products_and_supplies = pas.id
        WHERE tsc.id_dishes_and_combos = ? AND pas.use_inventory = 1
        ORDER BY id_products_and_supplies DESC
      `;
      database.all(queryText, [id_dishes_and_combos], (err, rows) => {
        if (err) {
          console.error('Error in search_supplies_combo (SQLite):', err);
          return resolve([]);
        }
        resolve(rows);
      });
    });
  } else {
    // PostgreSQL
    const queryText = `
      SELECT tsc.*, pas.img AS img, pas.name AS product_name, pas.barcode AS product_barcode
      FROM "Kitchen".table_supplies_combo tsc
      JOIN "Kitchen".products_and_supplies pas ON tsc.id_products_and_supplies = pas.id
      WHERE tsc.id_dishes_and_combos = $1 AND pas.use_inventory = TRUE
      ORDER BY id_products_and_supplies DESC
    `;
    const values = [id_dishes_and_combos];
    try {
      const result = await database.query(queryText, values);
      return result.rows;
    } catch (error) {
      console.error('Error in search_supplies_combo (PostgreSQL):', error);
      return [];
    }
  }
}

async function exist_supplies_for_create_this_combo(idBranch, idSupplies, amount) {
    try {
        //we going to get the data that need for calculate if we can create the combo
        const dataSuppliesFeactures = await get_data_supplies_features(idBranch, idSupplies)
        const existence = dataSuppliesFeactures.existence;
        const minimumInventory = dataSuppliesFeactures.minimum_inventory;
        //we will calculate if can create the combo
        return (existence - amount >= 0);
    } catch (error) {
        return false;
    }
}

router.post('/fud/:id_branch/:id_employee/:id_box/move', isLoggedIn, async (req, res) => {
    try {
        //we will to add the information to the database 
        const move = create_move(req);
        const answer = await addDatabase.add_movement_history(move);

        // send an answer to the customer
        res.status(200).json({ message: answer });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
    }
})

function create_move(req) {
    //get the data of the server
    const { id_branch, id_employee, id_box } = req.params;
    const data = req.body;
    const cash = data[0]
    const comment = data[1]
    const moveDtae = new Date().toISOString();

    const move = {
        id_branch,
        id_box,
        id_employee,
        cash,
        comment,
        moveDtae
    }

    return move;
}

router.post('/fud/add-order-post', async (req, res) => {
    try {
        //we will to add the information to the database 
        const answer = await addDatabase.add_order(req.body);
        // send an answer to the customer
        res.status(200).json({ message: answer });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud de la orden' });
    }
})

router.post('/fud/:id_company/:id_branch/edit-order', async (req, res) => {
    const { id_company, id_branch } = req.params;
    const { customer_name, address, cellphone, phone, comment, id_order } = req.body;
    const { delivery_driver } = req.body;
    const { statusOrder } = req.body;
    if (await update_rder(id_order, customer_name, address, cellphone, phone, delivery_driver, comment, statusOrder)) {
        req.flash('success', 'El pedido fue actualizado con exito 🥳');
    } else {
        req.flash('message', 'El pedido no fue actualizado 😰');
    }
    res.redirect(`/fud/${id_company}/${id_branch}/order-free`)
});

router.post('/fud/edit-order', async (req, res) => {
    const { customer_name, address, cellphone, phone, comment, id_order } = req.body;
    const { delivery_driver } = req.body;
    const { statusOrder } = req.body;
    if (await update_rder(id_order, customer_name, address, cellphone, phone, delivery_driver, comment, statusOrder)) {
        req.flash('success', 'El pedido fue actualizado con exito 🥳');
    } else {
        req.flash('message', 'El pedido no fue actualizado 😰');
    }

    res.redirect(`/fud/my-order`)
});

async function update_rder(id_order, name_customer, address, cellphone, phone, id_employees, comment, status) {
  const values = [id_order, name_customer, address, cellphone, phone, id_employees, comment, status];

  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        UPDATE 'order'
        SET 
          name_customer = ?,
          address = ?,
          cellphone = ?,
          phone = ?,
          id_employees = ?,
          comment = ?,
          status = ?
        WHERE id = ?
      `;
      // SQLite usa orden diferente de valores: los parámetros deben coincidir
      const sqliteValues = [name_customer, address, cellphone, phone, id_employees, comment, status, id_order];

      database.run(queryText, sqliteValues, function (err) {
        if (err) {
          console.error('Error al actualizar la orden (SQLite):', err);
          return resolve(false);
        }
        resolve(true);
      });
    });
  } else {
    // PostgreSQL
    try {
      const queryText = `
        UPDATE "Branch".order
        SET 
          name_customer = $2,
          address = $3,
          cellphone = $4,
          phone = $5,
          id_employees = $6,
          comment = $7,
          status = $8
        WHERE id = $1
      `;
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error al actualizar la orden (PostgreSQL):', error);
      return false;
    }
  }
}

router.get('/fud/:id_company/:id_branch/:id_order/delete-order', async (req, res) => {
    const { id_company, id_branch, id_order } = req.params;
    if (await delete_order_by_id(id_order)) {
        req.flash('success', 'El pedido fue eliminado con exito 🥳');
    } else {
        req.flash('message', 'El pedido no eliminado 😰');
    }
    res.redirect(`/fud/${id_company}/${id_branch}/order-free`)
});

async function delete_order_by_id(id_order) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        DELETE FROM 'order'
        WHERE id = ?
      `;
      database.run(queryText, [id_order], function (err) {
        if (err) {
          console.error('Error al eliminar la orden (SQLite):', err);
          return resolve(false);
        }
        resolve(true);
      });
    });
  } else {
    // PostgreSQL
    try {
      const queryText = `
        DELETE FROM "Branch".order
        WHERE id = $1
      `;
      await database.query(queryText, [id_order]);
      return true;
    } catch (err) {
      console.error('Error al eliminar la orden (PostgreSQL):', err);
      return false;
    }
  }
}




//-------------------------------------------------------customer branch or One
router.post('/fud/:id_company/:id_branch/addCustomer', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const newCustomer = create_new_customer(req);

    //we will see if the customer exist in the database 
    if (await addDatabase.this_customer_exists(newCustomer.id_company, newCustomer.email)) {
        req.flash('message', 'Este correo electrónico ya está registrado 😬')
        res.redirect(`/links/${id_company}/${id_branch}/add-customer`);
    }
    else {
        //we will see if can added the new customer to the database
        if (await addDatabase.add_customer(newCustomer)) {
            req.flash('success', 'El clienta fue agregada con exito ❤️')
        }
        else {
            req.flash('message', 'El cliente no fue agregado 👉👈')
        }

        res.redirect(`/links/${id_company}/${id_branch}/customers-company`);
    }
})

router.post('/fud/:id_company/:id_customer/editCustomer', isLoggedIn, async (req, res) => {
    const { id_company, id_customer } = req.params;
    const newCustomer = create_new_customer(req);
    if (await update.update_customer(id_customer, newCustomer)) {
        req.flash('success', 'the customer was upload with supplies ❤️')
    }
    else {
        req.flash('message', 'the customer not was upload 😰')
    }
    res.redirect('/links/' + id_company + '/customers-company');
})

//-------------------------------------------------------CRM
//functions CRM
const {
    delete_sale_stage_in_my_company
} = require('../services/CRM');

router.post('/fud/:id_company/add-table-crm', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    const { table_name, id_branch } = req.body;
    const salesStage = {
        id_company,
        table_name
    }

    //we will see if can added the new sales stage to the database
    if (await addDatabase.add_new_sales_stage(salesStage)) {
        req.flash('success', 'La etapa de venta fue agregada con éxito ❤️')
    }
    else {
        req.flash('message', 'La etapa de venta no fue agregado 👉👈')
    }

    //we will see if the user have the subscription ONE or is in a branch
    if (id_branch) {
        res.redirect(`/links/${id_company}/${id_branch}/CRM`);
    } else {
        res.redirect(`/links/${id_company}/CRM`);
    }
})

router.get('/fud/:id_company/:id_branch/:id_sales_stage/delete-table-crm', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_sales_stage } = req.params;

    //we will see if can added the new sales stage to the database
    if (await delete_sale_stage_in_my_company(id_sales_stage)) {
        req.flash('success', 'La etapa de venta fue eliminada con éxito 😊')
    }
    else {
        req.flash('message', 'La etapa de venta no fue eliminada 👉👈')
    }

    res.redirect(`/links/${id_company}/${id_branch}/CRM`);
})

router.post('/fud/update-stage-columns', isLoggedIn, async (req, res) => {
    const { order, ids, dataTanks, dataProspects } = req.body;

    let answer = true;

    //this is for update the columns 
    for (var i = 0; i <= ids.length; i++) {
        const id = ids[i];
        const newName = order[i];

        //we will see if can update all the position and the name of stage
        if (!await update_position_stage(id, newName, i)) {
            answer = false;
            break;
        }
    }

    //this is for update the prospects 
    for (var j = 0; j < dataProspects.length; j++) {
        const prospect = dataProspects[j]
        if (!await update_task(prospect[0], prospect[1])) {
            answer = false;
            break;
        }
    }

    //we will see if can update all the data in the columsn and the thanks
    if (answer) {
        res.json({ success: true, message: 'Orden actualizada correctamente' });
    } else {
        res.json({ success: false, message: 'Error al actualizar Orden' });
    }
})

async function update_position_stage(id, name, position) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        UPDATE sales_stage
        SET 
          name = ?,
          position = ?
        WHERE 
          id = ?
      `;
      const values = [name, position, id];

      database.run(queryText, values, function (err) {
        if (err) {
          console.error('Error updating sales stage (SQLite):', err);
          return resolve(false);
        }
        resolve(true);
      });
    });
  } else {
    // PostgreSQL
    const queryText = `
      UPDATE "CRM".sales_stage
      SET 
        name = $1,
        position = $2
      WHERE 
        id = $3
    `;
    const values = [name, position, id];

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error updating sales stage (PostgreSQL):', error);
      return false;
    }
  }
}

async function update_task(idTask, idColumn) {
  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        UPDATE prospects
        SET 
          id_sales_stage = ?
        WHERE 
          id = ?
      `;
      const values = [idColumn, idTask];

      database.run(queryText, values, function (err) {
        if (err) {
          console.error('Error updating task (SQLite):', err);
          return resolve(false);
        }
        resolve(true);
      });
    });
  } else {
    // PostgreSQL
    const queryText = `
      UPDATE "CRM".prospects
      SET 
        id_sales_stage = $1
      WHERE 
        id = $2
    `;
    const values = [idColumn, idTask];

    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error updating task (PostgreSQL):', error);
      return false;
    }
  }
}


router.post('/fud/:id_company/:id_branch/add-chance', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    if (await addDatabase.add_new_prospects(req.body)) {
        req.flash('success', 'La oportunidad de venta fue agregada con éxito ❤️');
    } else {
        req.flash('message', 'La oportunidad de venta no fue agregada 👉👈');
    }

    res.redirect(`/links/${id_company}/${id_branch}/CRM`);
})


router.post('/fud/:id_company/:id_branch/:id_prospect/update-prospect', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_prospect } = req.params;

    //we will see if fan update the prospect
    if (await update_prospect(req.body, id_prospect)) {
        req.flash('success', 'La oportunidad de venta fue actualizada con éxito ❤️');
    } else {
        req.flash('message', 'La oportunidad de venta no fue actualizada 😮');
    }

    res.redirect(`/links/${id_company}/${id_branch}/CRM`);
})


router.post('/fud/update-prospect', isLoggedIn, async (req, res) => {
    const { formData, linkData } = req.body;
    const form = formData;

    //we will see if fan update the prospect
    if (await update_prospect(form, linkData.id_form)) {
        res.status(200).json({ message: 'La oportunidad de venta fue actualizada con éxito ❤️' }); // Return data to the client
    } else {
        res.status(200).json({ message: 'La oportunidad de venta no fue actualizada 😮' }); // Return data to the client
    }
})

async function update_prospect(prospects, id_prospect) {
  const values = [
    prospects.id_sales_stage,
    prospects.customerName,
    prospects.email,
    prospects.estimatedRevenue,
    prospects.probability,
    prospects.phone,
    prospects.cellPhone,
    prospects.notes,
    prospects.label,
    prospects.priority,
    prospects.id_company,
    prospects.id_branch,
    prospects.id_employee,
    prospects.closureDate,
    prospects.id_sales_team,
    prospects.expectedClosing,
    prospects.id_product_to_sell,
    prospects.category,
    prospects.salesRep,
    prospects.userType,
    prospects.company_name,
    prospects.company_address,
    prospects.website,
    prospects.contact_name,
    prospects.company_cellphone,
    prospects.company_phone,
    id_prospect
  ];

  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        UPDATE prospects SET
          id_sales_stage = ?, name = ?, email = ?, estimated_income = ?, probability = ?, cellphone = ?, phone = ?, notes = ?,
          color = ?, priority = ?, id_companies = ?, id_branches = ?, id_employees = ?, planned_closure = ?, id_sales_team = ?,
          expected_closing_percentage = ?, id_product_to_sell = ?, category = ?, salesrep = ?, type_customer = ?,
          company_name = ?, address = ?, website = ?, contact_name = ?, company_cellphone = ?, company_phone = ?
        WHERE id = ?;
      `;
      database.run(queryText, values, function (err) {
        if (err) {
          console.error('Error update prospect (SQLite):', err);
          return resolve(false);
        }
        resolve(true);
      });
    });
  } else {
    // PostgreSQL
    const queryText = `
      UPDATE "CRM".prospects SET
        id_sales_stage = $1, name = $2, email = $3, estimated_income = $4, probability = $5, cellphone = $6, phone = $7, notes = $8,
        color = $9, priority = $10, id_companies = $11, id_branches = $12, id_employees = $13, planned_closure = $14, id_sales_team = $15,
        expected_closing_percentage = $16, id_product_to_sell = $17, category = $18, salesrep = $19, type_customer = $20,
        company_name = $21, address = $22, website = $23, contact_name = $24, company_cellphone = $25, company_phone = $26
      WHERE id = $27;
    `;
    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error update prospect (PostgreSQL):', error);
      return false;
    }
  }
}

router.post('/fud/:id_company/:id_branch/:id_prospect/create-message-history', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_prospect } = req.params;
    const { formData, linkData } = req.body;
    const form = formData;

    //we will see if fan update the prospect
    if (await addDatabase.add_message_to_the_customer_history(req.user.id, id_prospect, form.comment, form.link)) {
        res.status(200).json({ message: 'La Nota de venta fue agregada con éxito ❤️' }); // Return data to the client
    } else {
        res.status(200).json({ message: 'La Nota de venta no fue agregada 😮' }); // Return data to the client
    }
})

//-----------------------------------------------appointment
router.post('/fud/:id_company/:id_branch/:id_prospect/create-appointment-server', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_prospect } = req.params;
    const { formData } = req.body;

    //we will create the appointment
    const appointment = create_appointment(id_company, id_branch, id_prospect, formData)

    //we will see if we could add the appointment
    if (await addDatabase.add_appointment(appointment)) {
        //this is for save the update of the customer
        await addDatabase.add_message_to_the_customer_history(req.user.id, id_prospect, `Se creó una cita con el cliente para el día ${appointment.date}`, '');
        res.status(200).json({ message: 'La cita se reservó con éxito ❤️' }); // Return data to the client
    } else {
        res.status(400).json({ message: 'La cita no se reservó 😳' }); // Return data to the client
    }
})

router.post('/fud/:id_company/:id_branch/:id_prospect/create-appointment', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_prospect } = req.params;

    //we will create the appointment
    const appointment = create_appointment(id_company, id_branch, id_prospect, req.body)

    //we will see if we could add the appointment
    if (await addDatabase.add_appointment(appointment)) {
        req.flash('success', 'La cita se reservó con éxito ❤️');
    } else {
        req.flash('message', 'La cita no se reservó 😳');
    }

    res.redirect(`/links/${id_company}/${id_branch}/CRM`);
})

function create_appointment(id_company, id_branch, id_prospect, body) {
    const appointment = {
        id_company,
        id_branch,
        id_prospect,
        id_employee: body.idEmployee,
        affair: body.affair,
        date: body.date,
        duration: body.duration,
        ubication: body.ubication,
        notes: body.notes,
        color: body.color
    }

    return appointment;
}

router.post('/fud/:id_company/:id_branch/:id_prospect/:id_appointment/edit-appointment', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_prospect, id_appointment } = req.params;

    //we will create the appointment
    const appointment = create_appointment(id_company, id_branch, id_prospect, req)
    console.log(appointment)
    //we will see if we could add the appointment
    if (await update_appointment(appointment, id_appointment)) {
        req.flash('success', 'La cita se actualizo con éxito ❤️');
    } else {
        req.flash('message', 'La cita no se actualizo 😳');
    }

    res.redirect(`/links/${id_company}/${id_branch}/appointment`);
})

router.post('/fud/:id_company/:id_branch/:id_prospect/:id_appointment/edit-appointment-crm', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_prospect, id_appointment } = req.params;

    //we will create the appointment
    const appointment = create_appointment(id_company, id_branch, id_prospect, req)

    //we will see if we could add the appointment
    if (await update_appointment(appointment, id_appointment)) {
        req.flash('success', 'La cita se actualizo con éxito ❤️');
    } else {
        req.flash('message', 'La cita no se actualizo 😳');
    }

    res.redirect(`/links/${id_company}/${id_branch}/CRM`);
})

async function update_appointment(appointment, id_appointment) {
  const values = [
    appointment.id_company,
    appointment.id_branch,
    appointment.id_prospect,
    appointment.id_employee,
    appointment.affair,
    appointment.date,
    appointment.duration,
    appointment.ubication,
    appointment.notes,
    appointment.color,
    id_appointment
  ];

  if (TYPE_DATABASE === 'mysqlite') {
    return new Promise((resolve) => {
      const queryText = `
        UPDATE appointment
        SET 
          id_companies = ?, id_branches = ?, id_prospects = ?, id_employees = ?, affair = ?, meeting_date = ?, end_date = ?, location = ?, notes = ?, color = ?
        WHERE id = ?;
      `;
      database.run(queryText, values, function (err) {
        if (err) {
          console.error('Error update appointment (SQLite):', err);
          return resolve(false);
        }
        resolve(true);
      });
    });
  } else {
    // PostgreSQL
    const queryText = `
      UPDATE "CRM".appointment
      SET 
        id_companies=$1, id_branches=$2, id_prospects=$3, id_employees=$4 ,affair=$5, meeting_date=$6, end_date=$7, location=$8, notes=$9, color=$10
      WHERE id = $11;
    `;
    try {
      await database.query(queryText, values);
      return true;
    } catch (error) {
      console.error('Error update appointment (PostgreSQL):', error);
      return false;
    }
  }
}


//-----------------------------------------------options
const crypto = require('crypto');
// Cargar variables de entorno
require('dotenv').config();
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); //use the key like buffer

// Clave secreta y vector de inicialización
const IV = crypto.randomBytes(16); // 16 bytes para AES

function encryptPassword(password) {
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: IV.toString('hex'),
        encryptedData: encrypted
    };
}

function decryptPassword(encryptedData, iv) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

router.post('/links/update_session_prontipagos', isLoggedIn, async (req, res) => {
    try {
        const { user, password } = req.body;
        if (!user || !password) {
            return res.status(400).json({ error: "Usuario y contraseña son obligatorios" });
        }

        //first we will see if this count exist in the database of prontipagos
        const answerServerPreontipagos = await loginProntipagos(user, password);
        if (answerServerPreontipagos == null) {
            return res.status(400).json({ error: "Hubo un error con los servidores de prontipagos vuelve a intentarlo mas tarde." });
        } else if (!answerServerPreontipagos) {
            return res.status(400).json({ error: "Usuario o contraseña incorrectos." });
        }



        //we will get the 
        const id_branch = req.user.id_branch;

        const newPassword = encryptPassword(password); // Encriptar la contraseña

        //we will see if can save this data in the database
        if (await update_session_prontipagos(id_branch, user, newPassword.encryptedData, newPassword.iv)) {
            res.json({ message: "Cuenta activada correctamente -> " + user });
        }
        else {
            return res.status(400).json({ error: "Error al guardar tus datos en la base de datos. Intentalo de nuevo." });
        }
    } catch (error) {
        console.error("Error en update_session_prontipagos:", error);
        res.status(500).json({ error: "Ocurrió un error en el servidor" });
    }
})

router.post('/links/decryptPassword_of_prontipagos', isLoggedIn, async (req, res) => {
    try {
        const { encryptedData, iv } = req.body;

        if (!encryptedData || !iv) {
            return res.status(400).json({
                success: false,
                message: "Los campos 'encryptedData' e 'iv' son obligatorios."
            });
        }

        const password = decryptPassword(encryptedData, iv);

        if (!password) {
            return res.status(500).json({
                success: false,
                message: "No se pudo desencriptar la contraseña."
            });
        }

        res.status(200).json({
            success: true,
            message: "Contraseña desencriptada correctamente.",
            password: password
        });

    } catch (error) {
        console.error("Error en decryptPassword_of_prontipagos:", error);
        res.status(500).json({
            success: false,
            message: "Ocurrió un error al desencriptar la contraseña.",
            error: error.message
        });
    }
});

async function loginProntipagos(user, password) {
    const url = 'https://prontipagos-api-dev.domainscm.com/prontipagos-external-api-ws/ws/v1/auth/login';

    const body = {
        username: user,
        password: password
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log("Login response:", data.code == 0);
        return data.code == 0;

    } catch (error) {
        console.error("Error al hacer login:", error);
        return null;
    }
}

async function update_session_prontipagos(id_branch, user, password, iv) {
    const values = [user, password, iv, id_branch];

    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve) => {
            const queryText = `
                UPDATE branches
                SET 
                    user_prontipagos = ?, 
                    password_prontipagos = ?, 
                    iv_for_password = ?
                WHERE 
                    id = ?;
            `;
            database.run(queryText, values, function (err) {
                if (err) {
                    console.error('Error updating session_prontipagos (SQLite):', err);
                    return resolve(false);
                }
                resolve(true);
            });
        });
    } else {
        // PostgreSQL
        const queryText = `
            UPDATE "Company".branches
            SET 
                user_prontipagos = $1,
                password_prontipagos = $2,
                iv_for_password = $3
            WHERE 
                id = $4;
        `;
        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error updating session_prontipagos (PostgreSQL):', error);
            return false;
        }
    }
}


//-----------------------------------------------------------------------------------labels
router.post('/links/save_label', isLoggedIn, async (req, res) => {
    //we will see if the user have the permission for this App.
    const { id_company, id_branch } = req.user;
    if (!this_user_have_this_permission(req.user, id_company, id_branch, 'add_label')) {
        res.status(500).json({ error: "Lo siento, no tienes permiso para esta acción 😅" });
    }

    try {
        const { id_company, name, width, length, label } = req.body;
        const id_branch = req.user.id_branch;

        const newLabel = {
            id_company,
            id_branch,
            name,
            width,
            length,
            label
        };

        const insertedId = await insert_label(newLabel);
        if (insertedId) {
            res.json({ message: "Etiqueta guardada correctamente", id: insertedId });
        }
        else {
            res.status(500).json({ error: "No se pudo guardar la etiqueta" });
        }
    } catch (error) {
        console.error("Error en save_label:", error);
        res.status(500).json({ error: "No se pudo guardar la etiqueta" });
    }
})

async function insert_label(label) {
    // Validación de campos requeridos
    if (!label.id_company || !label.name || !label.width || !label.length || !label.label || !label.id_branch) {
        return false;
    }

    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite
        return new Promise((resolve) => {
            const queryText = `
                INSERT INTO labels (id_companies, id_branches, name, width, length, label)
                VALUES (?, ?, ?, ?, ?, ?);
            `;
            const values = [
                label.id_company,
                label.id_branch,
                label.name,
                parseInt(label.width),
                parseInt(label.length),
                label.label // JSON string
            ];

            database.run(queryText, values, function (err) {
                if (err) {
                    console.log('Error al insertar etiqueta (SQLite):', err);
                    return resolve(false);
                }
                resolve(this.lastID); // Devuelve el ID insertado
            });
        });
    } else {
        // PostgreSQL
        const queryText = `
            INSERT INTO "Branch".labels (id_companies, id_branches, name, width, length, label)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id;
        `;
        const values = [
            label.id_company,
            label.id_branch,
            label.name,
            parseInt(label.width),
            parseInt(label.length),
            label.label
        ];
        try {
            const result = await database.query(queryText, values);
            return result.rows[0].id; // Devuelve el ID insertado
        } catch (error) {
            console.log('Error al insertar etiqueta (PostgreSQL):', error);
            return false;
        }
    }
}


router.post('/links/delete_label', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.user;
    if (!this_user_have_this_permission(req.user, id_company, id_branch, 'delete_label')) {
        res.status(500).json({ error: "Lo siento, no tienes permiso para esta acción 😅" });
    }


    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: "El ID de la etiqueta es obligatorio." });
    }

    try {
        const deleted = await delete_label_by_id(id);

        if (deleted) {
            res.json({ message: "Etiqueta eliminada correctamente." });
        } else {
            res.status(404).json({ error: "Etiqueta no encontrada o no se pudo eliminar." });
        }
    } catch (error) {
        console.error("Error al eliminar la etiqueta:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

async function delete_label_by_id(id) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve) => {
            const queryText = `DELETE FROM labels WHERE id = ?`;
            database.run(queryText, [id], function (err) {
                if (err) {
                    console.error("Error al eliminar etiqueta en delete_label_by_id (SQLite):", err);
                    return resolve(false);
                }
                resolve(this.changes > 0); // true si eliminó alguna fila
            });
        });
    } else {
        const queryText = `DELETE FROM "Branch".labels WHERE id = $1`;
        try {
            const result = await database.query(queryText, [id]);
            return result.rowCount > 0;
        } catch (error) {
            console.error("Error al eliminar etiqueta en delete_label_by_id (PostgreSQL):", error);
            return false;
        }
    }
}

router.post('/links/update-labels/:id', async (req, res) => {
    const { id_company, id_branch } = req.user;
    if (!this_user_have_this_permission(req.user, id_company, id_branch, 'edit_label')) {
        res.status(500).json({ error: "Lo siento, no tienes permiso para esta acción 😅" });
    }

    const { id } = req.params;
    const { name, width, length, label } = req.body;

    const result = await update_label(id, name, width, length, label);
    if (result.success) {
        res.json({ success: true, message: 'Etiqueta actualizada correctamente' });
    } else {
        res.status(500).json({ success: false, message: 'Error al actualizar etiqueta' });
    }
});

async function update_label(id, name, width, length, labelJson) {
    if (TYPE_DATABASE === 'mysqlite') {
        // SQLite usa '?' para placeholders y tabla sin schema
        return new Promise((resolve) => {
            const queryText = `
                UPDATE labels
                SET name = ?,
                    width = ?,
                    length = ?,
                    label = ?
                WHERE id = ?
            `;
            database.run(queryText, [name, width, length, labelJson, id], function(err) {
                if (err) {
                    console.error('Error updating label (SQLite):', err);
                    return resolve({ success: false, error: err });
                }
                resolve({ success: this.changes > 0 });
            });
        });
    } else {
        // PostgreSQL con placeholders $1, $2, ...
        const queryText = `
            UPDATE "Branch".labels
            SET name = $1,
                width = $2,
                length = $3,
                label = $4
            WHERE id = $5
        `;
        try {
            const result = await database.query(queryText, [name, width, length, labelJson, id]);
            return { success: result.rowCount > 0 };
        } catch (error) {
            console.error('Error updating label (PostgreSQL):', error);
            return { success: false, error };
        }
    }
}


router.post('/links/update_rfc', async (req, res) => {
    const { id_company, id_branch } = req.user;
    const { rfc } = req.body;
    await update_rfc_branch(id_branch,rfc)
    res.json({ success: true, message: 'Etiqueta actualizada correctamente' });
 
});

async function update_rfc_branch(id_branch, rfc) {
    if (TYPE_DATABASE === 'mysqlite') {
        return new Promise((resolve) => {
            // Verifica que la columna exista en SQLite
            database.all(`PRAGMA table_info(branches)`, [], function (err, columns) {
                if (err) {
                    console.error('Error al obtener columnas de branches (SQLite):', err);
                    return resolve(false);
                }

                const existingColumns = columns.map(col => col.name);
                if (!existingColumns.includes('rfc')) {
                    console.warn('La columna "rfc" no existe en SQLite.');
                    return resolve(false);
                }

                const queryText = `
                    UPDATE branches
                    SET rfc = ?
                    WHERE id = ?
                `;

                database.run(queryText, [rfc, id_branch], function (err) {
                    if (err) {
                        console.error('Error actualizando RFC en SQLite:', err);
                        return resolve(false);
                    }
                    resolve(this.changes > 0);
                });
            });
        });
    } else {
        // PostgreSQL
        const queryText = `
            UPDATE "Company".branches
            SET rfc = $1
            WHERE id = $2
        `;

        try {
            await database.query(queryText, [rfc, id_branch]);
            return true;
        } catch (error) {
            console.error('Error actualizando RFC en PostgreSQL:', error);
            return false;
        }
    }
}



//-----------------------------------------------------------------------------------notifications----------------------------------------------------
router.post('/links/update_notification', async (req, res) => {
    const { id_company, id_branch } = req.user;
    const data=req.body;

    if (await update_data_notification_of_the_branch(id_branch,data)){
        res.status(200).json({ status:true, message: "Datos actualizados correctamente" });
    }else{
        console.error('Error updating notification data:');
        return res.status(500).json({ success: false, error: 'Error al actualizar los datos de la notificación' });
    }
});

async function update_data_notification_of_the_branch(id_branch, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    values.push(id_branch);

    if (TYPE_DATABASE === 'mysqlite') {
        const valuesOriginal = Object.values(data);
        const fieldsOriginal = Object.keys(data);
        return new Promise((resolve) => {
            // Obtener columnas reales de la tabla en SQLite
            database.all(`PRAGMA table_info(branches)`, [], function (err, columns) {
                if (err) {
                    console.error('Error al obtener columnas de branches (SQLite):', err);
                    return resolve(false);
                }

                const existingColumns = columns.map(col => col.name);
                const validFields = [];
                const validValues = [];

                for (let i = 0; i < fieldsOriginal.length; i++) {
                    if (existingColumns.includes(fieldsOriginal[i])) {
                        validFields.push(`"${fieldsOriginal[i]}" = ?`);
                        validValues.push(valuesOriginal[i]);
                    }
                }

                if (validFields.length === 0) {
                    console.warn('No hay campos válidos para actualizar en SQLite.');
                    return resolve(false);
                }

                validValues.push(id_branch); // WHERE id = ?

                const setClause = validFields.join(', ');
                const queryText = `
                    UPDATE branches
                    SET ${setClause}
                    WHERE id = ?
                `;

                database.run(queryText, validValues, function (err) {
                    if (err) {
                        console.error('Error actualizando datos en SQLite:', err);
                        return resolve(false);
                    }
                    resolve(this.changes > 0);
                });
            });
        });
    } else {
        // PostgreSQL: placeholders $1, $2, ...
        const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
        const queryText = `
            UPDATE "Company".branches
            SET ${setClause}
            WHERE id = $${fields.length + 1}
        `;

        try {
            await database.query(queryText, values);
            return true;
        } catch (error) {
            console.error('Error updating branch data:', error);
            return false;
        }
    }
}



const nodemailer = require('nodemailer'); //this is for send emails 
router.post('/links/notification/cash-cut', async (req, res) => {
    const { id_company, id_branch } = req.user;
    const data=req.body;
    const {emailNotification,tokenEmailNotification,toNotification, message}=req.body


    await send_email(emailNotification,tokenEmailNotification,toNotification, 'Corte de caja', message)
    return res.status(500).json({ success: false, error: 'Error al actualizar los datos de la notificación' });
});

async function send_email(APP_EMAIL_EMAIL,APP_PASSWORD_EMAIL,toEmail, subjectEmail, message) {
    console.log(APP_EMAIL_EMAIL)
    console.log(APP_PASSWORD_EMAIL)
    console.log(toEmail)
  try {
    //this is for email google
    const transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: APP_EMAIL_EMAIL,
            pass: APP_PASSWORD_EMAIL
        }
    });

    //we will to create the content of the message 
    const mailOptions = {
        from: 'Plus Notificaciones 🚀',
        to: toEmail,
        subject: subjectEmail,
        html: message
    };

    //send 
    transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo electrónico:', error);
        } else {
            console.log('Correo electrónico enviado:', info.response);
        }
    });

    return true;
  } catch (error) {
    console.error('❌ Error al enviar el correo electrónico:', error);
    return false;
  }
}

router.post('/links/send_facture_for_email', async (req, res) => {
    const { id_company, id_branch } = req.user;
    const {contenidoHtml, toNotification, emailNotification, tokenEmailNotification}=req.body;
    
    if(await send_email(emailNotification,tokenEmailNotification,toNotification, 'Factura', contenidoHtml)){
        return res.status(200).json({ success: true, error: 'Correo enviado con exito' });
    }else{
        return res.status(500).json({ success: false, error: 'Correo no enviado' });
    }
});

//-----------------------------------------------------------------------------------Prontipagos------------------------------------------------------
const fetch = require('node-fetch');
//const helpers=require('../lib/helpers.js');
const urlProntipagos='https://api.prontipagos.mx' //'https://prontipagos-api-dev.domainscm.com'
//-----this is for do a sale in prontipagos cada 2 segundos. 
router.post('/links/send_information_to_prontipagos', async (req, res) => {

    const { amount, reference, sku, company, moneyReceived, changeOFTheBuy } = req.body;
    
    //we will see if the user do a valid request
    if (!amount || !reference) {
        return res.status(400).json({ status: false, message: 'Faltan campos obligatorios' });
    }

    //now we will create the payload to send to prontipagos
    let payload = {
        sku,
        amount,
        reference,
        transacctionId:0
    };

    //this is for save in the database of PLUS
    let service = {
        sku,
        moneyReceived,
        company,
        change: changeOFTheBuy,
        amount
    }

    //if the sku have onlye numbers, we will convert in a string empty (this is for service like telcel)
    if (/^\d+$/.test(sku)) {
        //when the sku is only numbers, we will set the sku to empty string, not is necessary to send the sku to prontipagos (this is for telcel)
        payload = {
            amount,
            reference,
            transacctionId: 0
        };

        service.sku='';
    }

    //we will insert the service in the database of PLUS
    const id_customer = '';
    const transacctionId = await insert_reachange_service(req.user.id_company, req.user.id_branch, req.user.id, id_customer, service)+200;

    //her we will see if we could insert the service in the database
    if (!transacctionId) {
        return res.status(500).json({ status: false, message: 'Error al insertar el servicio. Intentalo otra vez.' });
    }

    //if we could insert the service, we will add the transacctionId to the payload fot send to prontipagos
    payload.transacctionId = transacctionId;  

    //first we will get the password and user of prontipagos use the id of the branch
    const id_branch = req.user.id_branch;
    const token = await get_token_prontipagos(id_branch); //create the token for the prontipagos API
    const startTime = Date.now();
    try {
        const url = `${urlProntipagos}/prontipagos-external-api-ws/ws/protected/v1/sell/product`;

        //send the message to the server of prontipagos
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        //we will see if the response is ok
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();

            //this is when the request not is ok, we will delete this sale of the database of PLUS
            if(data.code !== 0) {
                await delete_reachange_service(transacctionId);
                res.json(data);
            }else{
                //her we will see if the service have a status success
                const answerServerPorntiPagos=await update_status_prontipagos(transacctionId, id_branch, token,startTime);
                if(answerServerPorntiPagos.status==false){
                    //await delete_reachange_service(transacctionId); //delete the services when exist a error
                    res.status(500).json({
                        code:1,
                        status: false,
                        message: answerServerPorntiPagos.message
                    });
                }
                else{
                    res.json(data);
                }
            }
        } else {
            const rawText = await response.text();
            console.log('Respuesta no JSON de Prontipagos:', rawText);

            //her we will see if the service have a status success
            const answerServerPorntiPagos=await update_status_prontipagos(transacctionId, id_branch, token,startTime);
            if(answerServerPorntiPagos.status==false){
                //await delete_reachange_service(transacctionId); //delete the services when exist a error
                res.status(500).json({
                    code:1,
                    status: false,
                    message: 'La API no devolvió un JSON' 
                });
            }
            else{
                res.status(500).json({
                    status: false,
                    message: answerServerPorntiPagos.message,
                    raw: rawText
                });
            }

            //await delete_reachange_service(transacctionId); //this is for delete the service in the database of PLUS
        }

    } catch (error) {
        console.log('Error al enviar a Prontipagos:', error);
        await delete_reachange_service(transacctionId);
        res.status(500).json({
            status: false,
            message: `Error al enviar a Prontipagos: ${error.message}`
        });
    }
});

async function insert_reachange_service(id_company, id_branch, id_employee, id_customer, service) {
    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `
            INSERT INTO reachange_services 
            (id_companies, id_branches, id_employees, id_customers, key_services, money_received, service_name, change, service_money)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            id_company,
            id_branch,
            id_employee,
            id_customer === '' ? null : parseInt(id_customer),
            service.sku,
            service.moneyReceived,
            service.company,
            service.change === '' ? null : parseFloat(service.change),
            service.amount
        ];

        return new Promise((resolve) => {
            database.run(queryText, values, function(err) {
                if (err) {
                    console.error('Error inserting reachange_service (SQLite):', err);
                    return resolve(false);
                }
                resolve(this.lastID);  // Devuelve el ID insertado en SQLite
            });
        });

    } else {
        // PostgreSQL
        const queryText = `
            INSERT INTO "Box".reachange_services 
            (id_companies, id_branches, id_employees, id_customers, key_services, money_received, service_name, change, service_money)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id;
        `;

        const values = [
            id_company,
            id_branch,
            id_employee,
            id_customer === '' ? null : parseInt(id_customer),
            service.sku,
            service.moneyReceived,
            service.company,
            service.change === '' ? null : parseFloat(service.change),
            service.amount
        ];

        try {
            const result = await database.query(queryText, values);
            return result.rows[0].id;
        } catch (error) {
            console.error('Error inserting reachange_service (PostgreSQL):', error);
            return false;
        }
    }
}

async function delete_reachange_service(id) {
    if (!id) return false;

    if (TYPE_DATABASE === 'mysqlite') {
        const queryText = `
            DELETE FROM reachange_services
            WHERE id = ?
        `;

        return new Promise((resolve) => {
            database.run(queryText, [id], function(err) {
                if (err) {
                    console.error('Error al eliminar reachange_service (SQLite):', err);
                    return resolve(false);
                }
                resolve(this.changes > 0); // true si eliminó
            });
        });
    } else {
        // PostgreSQL
        const queryText = `
            DELETE FROM "Box".reachange_services
            WHERE id = $1
            RETURNING id;
        `;

        try {
            const result = await database.query(queryText, [id]);
            return result.rowCount > 0; // true si eliminó
        } catch (error) {
            console.error('Error al eliminar reachange_service (PostgreSQL):', error);
            return false;
        }
    }
}


//cada 2 segundos hasta completar 61 segundos 5555444666
async function update_status_prontipagos(transaction_id, id_branch, token,startTime2) {
    const url = `${urlProntipagos}/prontipagos-external-api-ws/ws/protected/v1/check-status?transactionId=${transaction_id}`;

    let success = false;
    let attempt = 0;
    let maxInitialTime = 61000; // 61 segundos
    const intervalShort = 2000;   // 2 segundos
    const startTime = Date.now();

    console.log('🚀 Iniciando verificación rápida durante 61 segundos...');

    // 🔁 Fase 1: Verificar cada 2 segundos por 61 segundos
    while ((Date.now() - startTime < maxInitialTime)) {
        attempt++;
        console.log(`🕐 Intento rápido #${attempt}||tiempo: ${Date.now() - startTime }...`);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('📦 Respuesta de Prontipagos:', data);
            if(data.code==0){
                //we will see if the transition was success
                const payload=data.payload;

                //her we will see if was success
                if(payload.codeDescription=='Transaccion exitosa'){
                    return {status: true, message:payload.codeDescription}
                }
                //her we will see if not have status
                else if(payload.codeDescription=='Procesando Transaccion'){
                    
                }
                else if(payload.codeDescription=='Transaccion rechazada por time-out'){
                    return {status: false,message:payload.codeDescription}
                }
                else{ //her is a error
                    return {status: false,message:payload.codeDescription}
                }
            }
        } catch (error) {
            console.log(error)
            //token = await get_token_prontipagos(id_branch);
        }

        await new Promise(resolve => setTimeout(resolve, intervalShort));
    }

    return {status: false,message:''}
}

async function update_status_prontipagos2(transaction_id, id_branch, token) {
    const url = `${urlProntipagos}/prontipagos-external-api-ws/ws/protected/v1/check-status?transactionId=${transaction_id}`;

    let attempt = 0;
    let maxInitialTime = 61000; // 61 segundos
    const intervalShort = 2000; // cada 2 segundos
    const startTime = Date.now();

    console.log('🚀 Iniciando verificación rápida durante 61 segundos...');

    while ((Date.now() - startTime) < maxInitialTime) {
        attempt++;
        const elapsed = Date.now() - startTime;
        console.log(`🕐 Intento rápido #${attempt} || Tiempo transcurrido: ${elapsed}ms`);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            // ⚠️ Validación de errores HTTP
            if (!response.ok) {
                console.warn(`⚠️ Error HTTP ${response.status}. Reintentando...`);
                if (response.status === 401) {
                    token = await get_token_prontipagos(id_branch); // actualiza token si es 401
                }
                continue;
            }

            const data = await response.json();
            console.log('📦 Respuesta de Prontipagos:', data);

            if (data.code === 0) {
                const payload = data.payload;
                const description = payload.codeDescription;

                if (description === 'Transaccion exitosa') {
                    return { status: true, message: description };
                } else if (description === 'Procesando Transaccion') {
                    // seguimos esperando
                } /*else if (description === 'Transaccion rechazada por time-out') {
                    maxInitialTime += 61000; // extendemos el tiempo de espera
                } */else {
                    // otros errores conocidos
                    return { status: false, message: description };
                }
            }

        } catch (error) {
            console.error('❌ Error al consultar Prontipagos:', error);
            token = await get_token_prontipagos(id_branch); // intentar con nuevo token
        }

        await new Promise(resolve => setTimeout(resolve, intervalShort));
    }

    // ⏱ Intento final en el milisegundo 60.999 si aún no se obtuvo respuesta exitosa
    const remaining = maxInitialTime - (Date.now() - startTime);
    if (remaining > 0) {
        console.log(`⏳ Esperando ${remaining}ms para el intento final en 60.999s`);
        await new Promise(resolve => setTimeout(resolve, remaining));
        try {
            const finalResponse = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (finalResponse.ok) {
                const finalData = await finalResponse.json();
                console.log('🔁 Intento final:', finalData);

                if (finalData.code === 0) {
                    const payload = finalData.payload;
                    const description = payload.codeDescription;

                    if (description === 'Transaccion exitosa') {
                        return { status: true, message: description };
                    } else {
                        return { status: false, message: description };
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error en el intento final:', error);
        }
    }

    // 🚫 Si se agota el tiempo y no hay una respuesta definitiva
    return { status: false, message: 'No se obtuvo una respuesta definitiva en el tiempo establecido.' };
}


//-----this is get the status of the sale in prontipagos
router.post('/links/get_status_sale_in_prontipagos/:transaction_id', async (req, res) => {
    const { transaction_id } = req.params;
    try {
        const url = `${urlProntipagos}/prontipagos-external-api-ws/ws/protected/v1/check-status?transactionId=${transaction_id}`;

        //first we will get the password and user of prontipagos use the id of the branch
        const id_branch = req.user.id_branch;
        const token = await get_token_prontipagos(id_branch); //create the token for the prontipagos API
        //send the message to the server of prontipagos
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        res.status(200).json({status:true,dataServer:data});
        console.log('Respuesta de Prontipagos:', data);
    } catch (error) {
        console.log('Error al enviar a Prontipagos:', error);
        res.status(500).json({
            status: false,
            message: `Error al enviar a Prontipagos: ${error.message}`
        });
    }
});







async function get_token_prontipagos(id_branch) {
    const getBranch=await get_data_branch(id_branch); //get the data of the branch 
    const dataBranch = getBranch[0]; // Import the database connection

    const username=dataBranch.user_prontipagos; //get the user of prontipagos
    const password = decryptPassword(dataBranch.password_prontipagos, dataBranch.iv_for_password);  //check if the user is correct

    try {
        const response = await fetch(`https://api.prontipagos.mx/prontipagos-external-api-ws/ws/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.code === 0 && data.payload?.accessToken) {
            return data.payload.accessToken;
        } else {
            console.log("Error al obtener el token: " + JSON.stringify(data))
            return '';
        }
    } catch (error) {
        console.log("Fallo en la solicitud del token: " + error.message)
        return '';
    }
}

async function get_password(encryptedPassword,iv){
    try {
        const response = await fetch('http://localhost:3000/links/decryptPassword_of_prontipagos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                encryptedData: encryptedPassword,
                iv: iv
            })
        });

        const result = await response.json();
        console.log("Resultado de desencriptación:", result);
        if (result.success) {
            return result.password;
        } else {
            console.error("Error al desencriptar:", result.message);
        }

    } catch (error) {
        console.error("Error de red o servidor:", error);
    }
}



//-----------------------------------------------apps
const {
    insert_app_in_my_list,
    create_constructor_app
} = require('../services/apps');


router.post('/fud/:id_company/:id_branch/create-app', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const answer = req.body;
    const app = create_constructor_app(id_company, id_branch, answer)

    //we will see if can create the team
    if (await create_team_of_my_app(app)) {
        req.flash('success', 'Tu aplicacion fue creada con éxito ❤️')
    } else {
        req.flash('message', 'Hubo un error al crear tu base de datos 👉👈')
    }

    res.redirect(`/links/${id_company}/${id_branch}/ed-studios`);
})

router.post('/fud/:id_company/:id_branch/app/create-database', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const answer = req.body;

    if (await create_the_database_of_my_app(answer, id_company, id_branch)) {
        req.flash('success', 'Tu aplicacion fue creada con éxito ❤️')
    } else {
        req.flash('message', 'Hubo un error al crear tu base de datos 👉👈')
    }

    res.redirect(`/links/${id_company}/${id_branch}/ed-studios`);
})


async function create_team_of_my_app(app) {
    //get the schema of the user for create the database
    const schema = `_company_${app.id_company}_branch_${app.id_branch}`;
    const tableNameForm = app.name;
    const tableName = tableNameForm.replace(/\s+/g, '_'); // Replace whitespace with underscores

    try {
        //this is for save the app of team in my list of apps of the company/branch
        await insert_app_in_my_list(app.id_company, app.id_branch, tableName, app.icon, tableName, '', '', '') //if we can create the tabla, save the code in the list of my apps
        return true;
    } catch (error) {
        console.error('Error to create the database apps in addfrom: ', error);
        return false;
    }
}


async function create_the_database_of_my_app(answer, id_company, id_branch) {
    //get the schema of the user for create the database
    const schema = `_company_${id_company}_branch_${id_branch}`;
    const tableNameForm = answer.name_app;
    const tableName = tableNameForm.replace(/\s+/g, '_'); // Replace whitespace with underscores

    //get the rows of the table
    const rows = Object.keys(answer);
    var queryText = `
    CREATE TABLE IF NOT EXISTS ${schema}.${tableName} (
        id SERIAL PRIMARY KEY`
    for (let i = 1; i < rows.length; i += 3) {
        const name = rows[i];
        const valueVariable = rows[i + 1];
        const requeride = rows[i + 2];
        queryText += `\n,${name} ${answer[valueVariable]} ${answer[requeride]}`;
    }
    queryText += `\n);`;

    try {
        //this is for create the table
        await database.query(queryText);
        await insert_app_in_my_list(id_company, id_branch, tableName, '', tableNameForm, '', '', queryText) //if we can create the tabla, save the code in the list of my apps
        return true;
    } catch (error) {
        console.error('Error to create the database apps in addfrom: ', error);
        return false;
    }
}



module.exports = router;