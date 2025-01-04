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

//config the connection with digitalocean
const AWS = require('aws-sdk');
const { APP_NYCE, APP_ACCESS_KEY_ID, SECRET_ACCESS_KEY } = process.env; //Get our nyce3 for connection with digitalocean
const spacesEndpoint = new AWS.Endpoint(APP_NYCE)

const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: APP_ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
});

const bucketName = APP_NYCE;

async function upload_image_to_space(filePath, objectName) {
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
};

async function delete_image_upload(pathImg) {
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
    /*
    var pathImage = path.join(__dirname, '../public/img/uploads', pathImg);
    fs.unlink(pathImage, (error) => {
        if (error) {
            console.error('Error to delate image:', error);
        } else {
            console.log('Image delate success');
        }
    });*/
}

//packs 
async function get_pack_database(id_company) {
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
    var queryText = 'SELECT * FROM "User".companies Where name = $1 and id_users= $2';
    var values = [name, parseInt(req.user.id)];
    var user = await database.query(queryText, values);
    return user.rows.length > 0
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

async function create_a_new_image(req) {
    if (req.file) {
        const filePath = req.file.path;
        const objectName = req.file.filename;
        const imageUrl = await upload_image_to_space(filePath, objectName);

        return imageUrl;
    }

    return '';
}

//edit company 
async function get_image(id) {
    var queryText = 'SELECT * FROM "User".companies Where  id= $1';
    var values = [id];
    const result = await database.query(queryText, values);
    return result.rows[0].path_logo;
}

router.post('/fud/:id_company/edit-company', async (req, res) => {
    const { id_company } = req.params;
    const newCompany = await get_new_company(req);
    const {id_branch}=req.body;

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
    if(id_branch){
        res.redirect(`/links/${id_company}/${id_branch}/options`);
    }else{
        res.redirect(`/links/${id_company}/options`);
    }
});


//add department
router.post('/fud/:id/add-department', async (req, res) => {
    const {id}=req.params;
    const {name}=req.body;
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
    if(req.user.rol_user==rolFree){
        const {id_branch}=req.body;
        res.redirect(`/links/${id}/${id_branch}/food-department-free`);
    }else{
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
    //get the id of the company
    const { id } = req.params;

    //we going to search this department in the list of the database
    var queryText = 'SELECT * FROM "Kitchen".product_department Where id_companies = $1 and name= $2';
    var values = [id, name];
    var companies = await database.query(queryText, values);
    return companies.rows.length > 0;
}

//add category
router.post('/fud/:id/add-category', async (req, res) => {
    const {id}=req.params;
    const {name}=req.body;
    
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
    if(req.user.rol_user==rolFree){
        const {id_branch}=req.body;
        res.redirect(`/links/${id}/${id_branch}/food-area-free`);
    }else{
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
    //get the id of the company
    const { id } = req.params;

    //we going to search this department in the list of the database
    var queryText = 'SELECT * FROM "Kitchen".product_department Where id_companies = $1 and name= $2';
    var values = [id, name];
    var companies = await database.query(queryText, values);
    return companies.rows.length > 0;
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
            if(idComboFacture){
                req.flash('success', 'El combo fue creado con exito ❤️')
                res.redirect('/links/' + id_company + '/' + idBranch + '/' + idComboFacture + '/edit-combo-free');
            }else{
                req.flash('message', 'El combo no fue agregado intentalo de nuevo 😅')
                res.redirect('/links/' + id_company + '/' + idBranch  + '/add-combos-free');
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
    if(!barcodeProducts){
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
    const { barcodeProducts} = req.body;

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
        if(req.user.rol_user!=rolFree){
            //if the user have a rol of admin send to combo company
            res.redirect('/links/' + id_company + '/combos');
        }else{
            //if the user have a count free, get the branch id for redirect to the user 
            const { id_branch} = req.body;
            res.redirect('/links/'+id_company+'/'+id_branch+'/combos-free');
        }
    }
})

async function delete_all_supplies_combo(id) {
    try {
        var queryText = 'DELETE FROM "Kitchen".table_supplies_combo WHERE id_dishes_and_combos = $1';
        var values = [id];
        await database.query(queryText, values); // Delete combo
        return true;
    } catch (error) {
        console.error('Error al eliminar en la base de datos:', error);
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
    if (req.user.rol_user==rolFree){
        const { id_branch} = req.body; //get the id branch
        res.redirect(`/links/${id_company}/${id_branch}/supplies-free`);
    }    
    else{
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
    //we will search the company of the user 
    var queryText = 'SELECT * FROM "Kitchen".products_and_supplies WHERE id= $1';
    const result = await database.query(queryText, [id]);

    return result.rows[0];
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
    try {
        var queryText = `UPDATE "Kitchen".products_and_supplies SET barcode = $1, name = $2, description = $3, 
        use_inventory = $4 WHERE id = $5`;
        var values = [newSupplies.barcode, newSupplies.name, newSupplies.description, newSupplies.use_inventory, newSupplies.id];
        await database.query(queryText, values); // update supplies
        return true;
    } catch (error) {
        console.log(error)
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
    try {
        var queryText = `UPDATE "Kitchen".products_and_supplies SET barcode = $1, name = $2, description = $3, 
        use_inventory = $4, img=$5 WHERE id = $6`;
        var values = [newSupplies.barcode, newSupplies.name, newSupplies.description, newSupplies.use_inventory, newSupplies.path_image, newSupplies.id];
        await database.query(queryText, values); // update supplies
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

//add providers
async function this_provider_exists(provider) {
    //we will search the department employees of the user 
    var queryText = `SELECT * FROM "Branch".providers WHERE id_branches = $1 AND name = $2`;
    var values = [provider.branch, provider.name];
    const result = await database.query(queryText, values);
    return result.rows.length > 1;
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
    try {
        //this function is for save the branch with the subscription 
        const queryText = 'UPDATE "User".subscription SET id_branches = $1 WHERE id = $2';
        const values = [idBranch, idSubscription];
        await database.query(queryText, values); //update the status
        return true;
    } catch (error) {
        console.error('Error to update subscription branch:', error);
        return false;
    }
}

async function this_subscription_exist(idSubscription) {
    try {
        //we going to know if this subscription is save in the database 
        const queryText = 'SELECT * FROM "User".subscription WHERE id = $1';
        const values = [idSubscription];
        const result = await database.query(queryText, values);
        return result.rows[0].id_branches != null;
    } catch (error) {
        console.error('Error for know if exist the subscription:', error);
        return false;
    }
}

router.post('/fud/:id_branch/:id_company/edit-branch', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    //we will watching if this subscription exist in my database 
    const { idSubscription } = req.body;
    if(req.user.rol_user==rolFree){
        const newBranch = create_new_branch(req);
        if (await update.update_branch(id_branch, newBranch)) {
            req.flash('success', 'La sucursal fue actualizada con exito 😊')
        }
        else {
            req.flash('message', 'La sucursal no fue actualizada 😰')
        }
        res.redirect('/fud/home');
    }else{
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
        res.redirect('/links/' + id_company + '/branches');
    }
})

async function this_subscription_exist_with_my_branch(idSubscription, id_branch) {
    try {
        //we going to know if this subscription is save in the database 
        const queryText = 'SELECT * FROM "User".subscription WHERE id = $1';
        const values = [idSubscription];
        const result = await database.query(queryText, values);
        //we will watching if exist most data save the ID 
        if (result.rows.length > 1) {
            return true;
        } else {
            return result.rows[0].id_branches == null || result.rows[0].id_branches == id_branch;
        }

    } catch (error) {
        console.error('Error for know if exist the subscription:', error);
        return false;
    }
}

function create_new_branch(req) {
    const { id_company } = req.params;
    const { name, alias, representative, phone, cell_phone, email, municipality, city, cologne, street, num_o, num_i, postal_code, token_uber_eat} = req.body;
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
    const {id_branch}=req.body;

    const newCustomer = create_new_customer(req);
    if (await update.update_customer(id_customer, newCustomer)) {
        req.flash('success', 'El cliente fue actualizado con exito ❤️')
    }
    else {
        req.flash('message', 'El cliente no fue actualizado 😰')
    }

    //we will see if the user have a UI CEO or Branch
    if(id_branch){
        res.redirect(`/links/${id_company}/${id_branch}/customers-company`);
    }else{
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
    if(req.user.rol_user==rolFree){
        const { id_branch } = req.body;
        res.redirect(`/links/${id_company}/${id_branch}/employee-department`);
    }else{
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
    const { name } = req.body
    if (await this_type_employee_exist(id_company, name)) {
        req.flash('message', 'El tipo de empleado no se agregó porque este nombre ya existe 😅')
    }
    else {
        const typeEmployees = create_type_employee(id_company, req)
        if (await addDatabase.add_type_employees(typeEmployees)) {
            req.flash('success', 'El tipo de empleado fue agregado con exito 😄')
        }
        else {
            req.flash('message', 'El tipo de empleado no fue agregado 😰')
        }
    }

    //we will see if the user have a subscription to fud one 
    if(req.user.rol_user==rolFree){
        const { id_branch } = req.body;
        res.redirect(`/links/${id_company}/${id_branch}/type-employees-free`);
    }else{
        res.redirect(`/links/${id_company}/type-user`);
    }
})

async function this_type_employee_exist(idCompany, name) {
    //we will search the department employees of the user 
    var queryText = `SELECT * FROM "Employee".roles_employees WHERE id_companies = $1 AND name_role = $2`;
    var values = [idCompany, name];
    const result = await database.query(queryText, values);
    return result.rows.length > 0;
}

function create_type_employee(id_company, req) {
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

        watch_permission(req.body.pointSales)
    ]
    return newTypeEmployee
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
    const typeEmployees = create_type_employee(id_company, req)
    if (await update.update_role_employee(id_role, typeEmployees)) {
        req.flash('success', 'El rol de empleado se actualizó con éxito 😄')
    }
    else {
        req.flash('message', 'El rol de empleado no fue actualizado 😅')
    }

    //we will see if the user have the subscription a fud one
    if(req.user.rol_user==rolFree){
        const { id_branch } = req.body;
        res.redirect(`/links/${id_company}/${id_branch}/type-employees-free`);
    }else{
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
        // Script para eliminar el usuario de la base de datos
        var queryText = 'DELETE FROM "Fud".users WHERE id=$1';
        var values = [id];
        const result = await database.query(queryText, values);
        return true;
    } catch (error) {
        console.log("delete user: " + error);
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
    //we going to search this email in the list of the database
    var queryText = 'SELECT * FROM "Fud".users Where email = $1';
    var values = [email];
    var companies = await database.query(queryText, values);
    return companies.rows.length > 0;
}

async function this_username_exists(username) {
    //we going to search this email in the list of the database
    var queryText = 'SELECT * FROM "Fud".users Where user_name = $1';
    var values = [username];
    var companies = await database.query(queryText, values);
    return companies.rows.length > 0;
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
    //we will search the user that the manager would like delete
    var queryText = 'SELECT photo FROM "Fud".users WHERE id= $1';
    var values = [idUser];
    const result = await database.query(queryText, values);
    if (result.rows.length > 0 && 'photo' in result.rows[0]) {
        return result.rows[0].photo;
    } else {
        return null;
    }
}

async function new_data_user(req) {
    const { user_name, email, first_name, second_name, last_name, rol_user } = req.body;
    const image = await create_a_new_image(req)
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
    const {navbar}=req.body;

    //we will see if can update the navbar
    if(await update_navbar(id_company, navbar)){
        req.flash('success', '¡La interfaz de usuario fue actualizada con éxito! 🤗')
    }else{
        req.flash('message', 'La interfaz de usuario no fue actualizada 👉👈');
    }

    res.redirect(`/links/${id_company}/${id_branch}/options`);
})

router.post('/fud/:id_company/change-navbar', isLoggedIn, async (req, res) => {
    const { id_company } = req.params;
    const {navbar}=req.body;

    //we will see if can update the navbar
    if(await update_navbar(id_company, navbar)){
        req.flash('success', 'La barra de tarreas fue actualizada con éxito! 🤗')
    }else{
        req.flash('message', 'La barra de tarreas no fue actualizada 👉👈');
    }

    res.redirect(`/links/${id_company}/options`);
})


async function update_navbar(id_companies, navbar) {
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


//---------------------------------------------------------------------------------------------------------BRANCHES---------------------------------------------------------------
/*
SELECT * FROM "Inventory".dish_and_combo_features;
SELECT * FROM "Inventory".product_and_suppiles_features;
SELECT * FROM "Kitchen".dishes_and_combos;
SELECT * FROM "Kitchen".table_supplies_combo;
SELECT * FROM "Kitchen".products_and_supplies;
*/
router.post('/fud/:id_company/:id_branch/add-product-free', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    let canAdd=false;

    //this is for create the new supplies and save the id of the supplies
    const newSupplies = await get_supplies_or_product_company(req, false);
    newSupplies.id_company=id_company; //update the data of id_company because the function "get_supplies_or_product_company" not have this data,

    const idSupplies = await addDatabase.add_supplies_company(newSupplies); //get the id of the supplies that added

    //we will see if the product can be save in the database
    if (idSupplies) {
        //we will create the supplies in the branch
        const idSuppliesFactures = await addDatabase.add_product_and_suppiles_features(id_branch, idSupplies) //add the supplies in the branch 

        //we will creating the data of the supplies and we will saving with the id of the supplies that create
        const supplies = create_supplies_branch(req, idSuppliesFactures);
        
        //update the data in the branch for save the new product in his branch
        if (await update.update_supplies_branch(supplies)){

            //get the new combo
            const combo = await create_a_new_combo(req);
            const dataProduct={idProduct:idSupplies,amount: 1,foodWaste: supplies.sale_amount,unity: supplies.sale_unity,additional: 0}
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
                res.redirect('/fud/' + id_company + '/combos');
            } else {
                //get the data combo in the branch
                const comboData = create_combo_data_branch(idCombos, id_company, id_branch);

                // save the combo in the branch
                const idComboFacture = await addDatabase.add_combo_branch(comboData);
                if(idComboFacture){
                    canAdd=true;
                    res.redirect(`/links/${id_company}/${id_branch}/${idComboFacture}/edit-products-free`);
                }
            }
        }
    }


    //we will see if exit a error in the process
    if(!canAdd){
        req.flash('message', 'El producto no fue agregado con éxito 👉👈')
        res.redirect(`/links/${id_company}/${id_branch}/products-free`);
    }
})

router.post('/fud/:id_company/:id_branch/:id_combo/update-product-branch', isLoggedIn, async (req, res) => {
    const {id_company,id_branch,id_combo}=req.params;
    let canUpdateAllTheProduct=false; //this is for know if we can update all the container

    //we will creating the new supplies and we will saving the id of the supplies
    const supplies = create_supplies_branch(req, req.body.id_productFacture);

    //we will watching if the supplies can update 
    if (await update.update_supplies_branch(supplies)) {
        //when the supplies is updating, we will create the new combo for update 
        const combo = create_new_combo_branch(req, id_combo);

        if (await update.update_combo_branch(combo)) {
            canUpdateAllTheProduct=true;
        } 
    }

    //we will see if can update all the product or exist a error for try again
    if(canUpdateAllTheProduct){
        req.flash('success', 'El Producto se actualizó con éxito 😄');
        res.redirect(`/links/${id_company}/${id_branch}/products-free`);
    }else{
        req.flash('message', 'El Producto no se actualizo 😳');
        res.redirect(`/links/${id_company}/${id_branch}/${id_combo}/edit-products-free`);
    }
})

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
        const idSupplies = await addDatabase.add_supplies_company(newSupplies); //get the id of the supplies that added
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
    if(req.user.rol_user==rolFree){
        res.redirect(`/links/${id_company}/${id_branch}/providers-free`);
    }else{
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
    if(req.user.rol_user==rolFree){
        res.redirect(`/links/${id_company}/${id_branch}/providers-free`);
    }else{
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
                        req.flash('message', 'Los datos del empleado no fueron añadidos. Por favor, edita los datos y actualízalos 😅')
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
    //we will search all the box that exist in the branch
    var queryText = 'SELECT * FROM "Branch".boxes WHERE id_branches= $1 and num_box=$2';
    var values = [idBranch, numer];
    const result = await database.query(queryText, values);
    return result.rows.length > 0;
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
        const queryText = 'UPDATE "Employee".schedules SET id_branches = $1, name = $2, tolerance_time = $3, color = $4, monday = $5, tuesday = $6, wednesday = $7, thursday = $8, friday = $9, saturday = $10, sunday = $11, ms = $12, mf = $13, ts = $14, tf = $15, ws = $16, wf = $17, ths = $18, thf = $19, fs = $20, ff = $21, sas = $22, saf = $23, sus = $24, suf = $25 WHERE id = $26';
        var values = Object.values(schedule);
        values.push(id);
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating schedule:', error);
        return false;
    }
}

//------------------------------------------------------------------------------------------------cart
router.post('/fud/client', isLoggedIn, async (req, res) => {
    try {
        //get the data of the server
        const email = req.body;
        var queryText = 'SELECT * FROM "Company".customers WHERE id_companies= $1 and email= $2';
        var values = [email[1], email[0]];
        const result = await database.query(queryText, values);
        console.log(result.rows[0])
        if (result.rows.length > 0) {
            const idCustomer = result.rows[0].id;
            const firstName = result.rows[0].first_name;
            const secondName = result.rows[0].second_name;
            const lastName = result.rows[0].last_name;
            const email = result.rows[0].email;
            res.status(200).json({ idCustomer, firstName, secondName, lastName, email });
        } else {
            res.status(200).json({ idCustomer: null });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
    }
})

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
                //await addDatabase.add_buy_history(dataComboFeatures.id_companies, dataComboFeatures.id_branches, id_employee, id_customer, dataComboFeatures.id_dishes_and_combos,combo.price,combo.amount,combo.total,day);
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
            const id_customer  = null;
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
            //get the data feature of the supplies and his existence 
            const dataSuppliesFeactures = await get_data_supplies_features(supplies.idBranch, supplies.idSupplies)
            const existence = dataSuppliesFeactures.existence;
            const newAmount = existence - supplies.amount; //calculate the new amount for update in the inventory
            await update_inventory(supplies.idBranch, supplies.idSupplies, newAmount);
        }
    } else {
        return 'not can create the combo becaus not exist enough ' + answer;
    }

    // If cannot create the combo, send a message of warning
    return 'success';
}

async function exist_the_supplies_need_for_creat_all_the_combos(listSupplies) {
    //we will to calculate if have the supplies need for create all the combos that the customer would like eat
    for (const supplies of listSupplies) {
        if (!await exist_supplies_for_create_this_combo(supplies.idBranch, supplies.idSupplies, supplies.amount)) {
            //if there are not enough supplies, we will send the supplies that need buy the restaurant 
            return supplies.name;
        }
    }

    return true;
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

async function get_data_supplies_features(idBranch, idSupplies) {
    const queryText = `
    SELECT 
        existence,
        minimum_inventory
    FROM "Inventory".product_and_suppiles_features
    WHERE id_branches = $1 and id_products_and_supplies=$2
    `;

    try {
        const result = await database.query(queryText, [idBranch, idSupplies]);
        return result.rows[0];
    } catch (error) {
        console.error('Error get data combo feactures car:', error);
        return false;
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

async function get_all_supplies_of_the_combos(combos) {
    // Iterate through all the combos
    var arrayCombo = []
    for (const combo of combos) {
        const amountCombo = combo.amount;
        const dataComboFeatures = await get_data_combo_features(combo.id);
        if (dataComboFeatures != null) {
            //get the supplies that need this combo for his creation
            const supplies = await get_all_supplies_this_combo(dataComboFeatures, amountCombo);

            arrayCombo.push(supplies)
        }
    }

    return arrayCombo;
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

async function get_all_price_supplies_branch(idCombo, idBranch) {
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

async function update_inventory(idBranch, idCombo, newAmount) {
    const queryText = `
    UPDATE "Inventory".product_and_suppiles_features
    SET 
        existence=$1
    WHERE 
        id_branches=$2 and id_products_and_supplies=$3
    `;

    //create the array of the new data supplies
    var values = [newAmount, idBranch, idCombo];

    //update the provider data in the database
    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating provider:', error);
        return false;
    }
}

async function get_data_combo_features(idCombo) {
    const queryText = `
    SELECT dc.name, df.id_companies, df.id_branches, df.id_dishes_and_combos
    FROM "Kitchen".dishes_and_combos dc
    INNER JOIN "Inventory".dish_and_combo_features df
    ON dc.id = df.id_dishes_and_combos
    WHERE df.id = $1;
    `;

    //update the provider data in the database
    try {
        const result = await database.query(queryText, [idCombo]);
        return result.rows[0];
    } catch (error) {
        console.error('Error get data combo feactures car:', error);
        return null;
    }
}

async function search_supplies_combo(id_dishes_and_combos) {
    var queryText = `
        SELECT tsc.*, pas.img AS img, pas.name AS product_name, pas.barcode AS product_barcode
        FROM "Kitchen".table_supplies_combo tsc
        JOIN "Kitchen".products_and_supplies pas ON tsc.id_products_and_supplies = pas.id
        WHERE tsc.id_dishes_and_combos = $1 ORDER BY id_products_and_supplies DESC
    `;
    var values = [id_dishes_and_combos];
    const result = await database.query(queryText, values);
    return result.rows;
}

router.post('/fud/:id_branch/:id_employee/:id_box/move', isLoggedIn, async (req, res) => {
    try {
        //we will to add the information to the database 
        const move = create_move(req);
        console.log(move)
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
    const moveDtae = new Date();

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
    console.log('bodyyy')
    console.log(req.body)
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
    const { customer_name, address, cellphone, phone, comment, id_order} = req.body;
    const { delivery_driver } = req.body;
    const {statusOrder} =req.body;
    console.log(delivery_driver)
    if (await update_rder(id_order, customer_name, address, cellphone, phone, delivery_driver, comment, statusOrder)) {
        req.flash('success', 'El pedido fue actualizado con exito 🥳');
    } else {
        req.flash('message', 'El pedido no fue actualizado 😰');
    }
    res.redirect(`/fud/${id_company}/${id_branch}/order-free`)
});

router.post('/fud/edit-order', async (req, res) => {
    const { customer_name, address, cellphone, phone, comment, id_order} = req.body;
    const { delivery_driver } = req.body;
    const {statusOrder} =req.body;
    console.log(statusOrder)
    if (await update_rder(id_order, customer_name, address, cellphone, phone, delivery_driver, comment, statusOrder)) {
        req.flash('success', 'El pedido fue actualizado con exito 🥳');
    } else {
        req.flash('message', 'El pedido no fue actualizado 😰');
    }

    res.redirect(`/fud/my-order`)
});

async function update_rder(id_order, name_customer, address, cellphone, phone, id_employees, comment,status) {
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
                status= $8
            WHERE
                id = $1
        `;
        const values = [id_order, name_customer, address, cellphone, phone, id_employees, comment, status];
        const result = await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error al actualizar la orden:', error);
        return false;
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
    try {
        const queryText = `
        DELETE FROM "Branch".order
        WHERE id = $1
    `;
        const values = [id_order];
        const result = await database.query(queryText, values);
        return true;
    } catch (err) {
        console.error('Error al eliminar la orden:', err);
        return false;
    }
}



//-------------------------------------------------------customer branch or One
router.post('/fud/:id_company/:id_branch/addCustomer', isLoggedIn, async (req, res) => {
    const { id_company, id_branch} = req.params;
    const newCustomer = create_new_customer(req);

    //we will see if the customer exist in the database 
    if(await addDatabase.this_customer_exists(newCustomer.id_company,newCustomer.email)){
        req.flash('message', 'Este correo electrónico ya está registrado 😬')
        res.redirect(`/links/${id_company}/${id_branch}/add-customer`);
    }
    else{
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
    const { id_company} = req.params;
    const {table_name, id_branch} = req.body;
    const salesStage={
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
    if(id_branch){
        res.redirect(`/links/${id_company}/${id_branch}/CRM`);
    }else{
        res.redirect(`/links/${id_company}/CRM`);
    }
})

router.get('/fud/:id_company/:id_branch/:id_sales_stage/delete-table-crm', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_sales_stage} = req.params;
    
    //we will see if can added the new sales stage to the database
    if(await delete_sale_stage_in_my_company(id_sales_stage)){
        req.flash('success', 'La etapa de venta fue eliminada con éxito 😊')
    }
    else {
        req.flash('message', 'La etapa de venta no fue eliminada 👉👈')
    }

    res.redirect(`/links/${id_company}/${id_branch}/CRM`);
})

router.post('/fud/update-stage-columns', isLoggedIn, async (req, res) => {
    const { order,ids, dataTanks, dataProspects} = req.body;

    let answer=true;

    //this is for update the columns 
    for(var i=0;i<=ids.length;i++){
        const id=ids[i];
        const newName=order[i];

        //we will see if can update all the position and the name of stage
        if(!await update_position_stage(id,newName,i)){
            answer=false;
            break;
        }
    }

    //this is for update the prospects 
    for(var j=0;j<dataProspects.length;j++){
        const prospect=dataProspects[j]
        if(!await update_task(prospect[0],prospect[1])){
            answer=false;
            break;
        }
    }

    //we will see if can update all the data in the columsn and the thanks
    if(answer){
        res.json({ success: true, message: 'Orden actualizada correctamente' });
    }else{
        res.json({ success: false, message: 'Error al actualizar Orden' });
    }
})

async function update_position_stage(id,name,position){
    const queryText = `
    UPDATE "CRM".sales_stage
    SET 
        name=$1,
        position=$2
    WHERE 
        id=$3
    `;

    //create the array of the new data
    var values = [name, position, id];

    //update the stage sales in the database
    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating provider:', error);
        return false;
    }
}

async function update_task(idTask,idColumn){
    const queryText = `
    UPDATE "CRM".prospects
    SET 
        id_sales_stage=$1
    WHERE 
        id=$2
    `;

    //create the array of the new data
    var values = [idColumn, idTask];

    //update the prospect in the database
    try {
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error updating provider:', error);
        return false;
    }
}

router.post('/fud/:id_company/:id_branch/add-chance', isLoggedIn, async (req, res) => {
    const { id_company, id_branch} = req.params;
    if(await addDatabase.add_new_prospects(req.body)){
        req.flash('success', 'La oportunidad de venta fue agregada con éxito ❤️');
    }else{
        req.flash('message', 'La oportunidad de venta no fue agregada 👉👈');
    }

    res.redirect(`/links/${id_company}/${id_branch}/CRM`);
})


router.post('/fud/:id_company/:id_branch/:id_prospect/update-prospect', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_prospect} = req.params;

    //we will see if fan update the prospect
    if(await update_prospect(req.body,id_prospect)){
        req.flash('success', 'La oportunidad de venta fue actualizada con éxito ❤️');
    }else{
        req.flash('message', 'La oportunidad de venta no fue actualizada 😮');
    }

    res.redirect(`/links/${id_company}/${id_branch}/CRM`);
})


router.post('/fud/update-prospect', isLoggedIn, async (req, res) => {
    const { formData, linkData} = req.body;
    const form=formData;

    //we will see if fan update the prospect
    if(await update_prospect(form,linkData.id_form)){
        res.status(200).json({ message: 'La oportunidad de venta fue actualizada con éxito ❤️' }); // Return data to the client
    }else{
        res.status(200).json({ message: 'La oportunidad de venta no fue actualizada 😮' }); // Return data to the client
    }
})

async function update_prospect(prospects, id_prospect){
    const queryText = `
        UPDATE "CRM".prospects
        SET 
            id_sales_stage = $1, name = $2, email = $3, estimated_income = $4, probability = $5, cellphone = $6, phone = $7, notes = $8,
            color = $9, priority = $10, id_companies = $11, id_branches = $12, id_employees = $13, planned_closure = $14, id_sales_team = $15, 
            expected_closing_percentage = $16, id_product_to_sell = $17, category = $18, salesrep = $19, type_customer = $20, 
            company_name = $21, address = $22, website = $23, contact_name = $24, company_cellphone = $25, company_phone = $26
        WHERE id = $27;
    `;
    const values = [
        prospects.id_sales_stage,     // $1
        prospects.customerName,       // $2
        prospects.email,              // $3
        prospects.estimatedRevenue,   // $4
        prospects.probability,        // $5
        prospects.phone,              // $6
        prospects.cellPhone,          // $7
        prospects.notes,              // $8
        prospects.label,              // $9
        prospects.priority,           // $10
        prospects.id_company,         // $11
        prospects.id_branch,          // $12
        prospects.id_employee,        // $13
        prospects.closureDate,        // $14
        prospects.id_sales_team,      // $15
        prospects.expectedClosing,    // $16
        prospects.id_product_to_sell, // $17
        prospects.category,           // $18
        prospects.salesRep,           // $19
        prospects.userType,           // $20
        prospects.company_name,       // $21
        prospects.company_address,    // $22
        prospects.website,            // $23
        prospects.contact_name,       // $24
        prospects.company_cellphone,  // $25
        prospects.company_phone,      // $26
        id_prospect
      ];
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error update prospects in update_prospect in the file addFrom: ', error);
        return false;
    }
}

router.post('/fud/:id_company/:id_branch/:id_prospect/create-message-history', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_prospect} = req.params;
    const { formData, linkData} = req.body;
    const form=formData;
    
    //we will see if fan update the prospect
    if(await addDatabase.add_message_to_the_customer_history(req.user.id,id_prospect,form.comment,form.link)){
        res.status(200).json({ message: 'La Nota de venta fue agregada con éxito ❤️' }); // Return data to the client
    }else{
        res.status(200).json({ message: 'La Nota de venta no fue agregada 😮' }); // Return data to the client
    }
})

//-----------------------------------------------appointment
router.post('/fud/:id_company/:id_branch/:id_prospect/create-appointment-server', isLoggedIn, async (req, res) => {
    const {id_company, id_branch, id_prospect} = req.params;
    const {formData}=req.body;

    //we will create the appointment
    const appointment=create_appointment(id_company, id_branch,id_prospect,formData)

    //we will see if we could add the appointment
    if(await addDatabase.add_appointment(appointment)){
        //this is for save the update of the customer
        await addDatabase.add_message_to_the_customer_history(req.user.id,id_prospect,`Se creó una cita con el cliente para el día ${appointment.date}`,'');
        res.status(200).json({ message: 'La cita se reservó con éxito ❤️' }); // Return data to the client
    }else{
        res.status(400).json({ message: 'La cita no se reservó 😳' }); // Return data to the client
    }
})

router.post('/fud/:id_company/:id_branch/:id_prospect/create-appointment', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_prospect} = req.params;

    //we will create the appointment
    const appointment=create_appointment(id_company, id_branch,id_prospect,req.body)

    //we will see if we could add the appointment
    if(await addDatabase.add_appointment(appointment)){
        req.flash('success', 'La cita se reservó con éxito ❤️');
    }else{
        req.flash('message', 'La cita no se reservó 😳');
    }

    res.redirect(`/links/${id_company}/${id_branch}/CRM`);
})

function create_appointment(id_company, id_branch,id_prospect,body){
    const appointment={
        id_company, 
        id_branch,
        id_prospect,
        id_employee: body.idEmployee,
        affair: body.affair,
        date: body.date,
        duration: body.duration,
        ubication: body.ubication,
        notes: body.notes,
        color:body.color
    }

    return appointment;
}

router.post('/fud/:id_company/:id_branch/:id_prospect/:id_appointment/edit-appointment', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_prospect, id_appointment} = req.params;

    //we will create the appointment
    const appointment=create_appointment(id_company, id_branch,id_prospect,req)
    console.log(appointment)
    //we will see if we could add the appointment
    if(await update_appointment(appointment,id_appointment)){
        req.flash('success', 'La cita se actualizo con éxito ❤️');
    }else{
        req.flash('message', 'La cita no se actualizo 😳');
    }

    res.redirect(`/links/${id_company}/${id_branch}/appointment`);
})

router.post('/fud/:id_company/:id_branch/:id_prospect/:id_appointment/edit-appointment-crm', isLoggedIn, async (req, res) => {
    const { id_company, id_branch, id_prospect, id_appointment} = req.params;

    //we will create the appointment
    const appointment=create_appointment(id_company, id_branch,id_prospect,req)
    console.log(appointment)
    //we will see if we could add the appointment
    if(await update_appointment(appointment,id_appointment)){
        req.flash('success', 'La cita se actualizo con éxito ❤️');
    }else{
        req.flash('message', 'La cita no se actualizo 😳');
    }

    res.redirect(`/links/${id_company}/${id_branch}/CRM`);
})

async function update_appointment(appointment, id_appointment){
    const queryText = `
        UPDATE "CRM".appointment
        SET 
            id_companies=$1, id_branches=$2, id_prospects=$3, id_employees=$4 ,affair=$5, meeting_date=$6, end_date=$7, location=$8, notes=$9, color=$10
        WHERE id = $11;
    `;
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

    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error update appointment in update_appointment in the file addFrom: ', error);
        return false;
    }
}



//-----------------------------------------------apps
const {
    insert_app_in_my_list,
    create_constructor_app
} = require('../services/apps');


router.post('/fud/:id_company/:id_branch/create-app', isLoggedIn, async (req, res) => {
    const { id_company, id_branch} = req.params;
    const answer=req.body;
    const app=create_constructor_app(id_company,id_branch,answer)

    //we will see if can create the team
    if(await create_team_of_my_app(app)){
        req.flash('success', 'Tu aplicacion fue creada con éxito ❤️')
    }else{
        req.flash('message', 'Hubo un error al crear tu base de datos 👉👈')
    }

    res.redirect(`/links/${id_company}/${id_branch}/ed-studios`);
})

router.post('/fud/:id_company/:id_branch/app/create-database', isLoggedIn, async (req, res) => {
    const { id_company, id_branch} = req.params;
    const answer=req.body;

    if(await create_the_database_of_my_app(answer,id_company,id_branch)){
        req.flash('success', 'Tu aplicacion fue creada con éxito ❤️')
    }else{
        req.flash('message', 'Hubo un error al crear tu base de datos 👉👈')
    }

    res.redirect(`/links/${id_company}/${id_branch}/ed-studios`);
})


async function create_team_of_my_app(app){
    //get the schema of the user for create the database
    const schema=`_company_${app.id_company}_branch_${app.id_branch}`;
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


async function create_the_database_of_my_app(answer,id_company,id_branch){
    //get the schema of the user for create the database
    const schema=`_company_${id_company}_branch_${id_branch}`;
    const tableNameForm = answer.name_app;
    const tableName = tableNameForm.replace(/\s+/g, '_'); // Replace whitespace with underscores

    //get the rows of the table
    const rows = Object.keys(answer);
    var queryText = `
    CREATE TABLE IF NOT EXISTS ${schema}.${tableName} (
        id SERIAL PRIMARY KEY`
        for(let i=1;i<rows.length;i+=3){
            const name = rows[i];
            const valueVariable = rows[i+1];
            const requeride = rows[i+2];
            queryText+=`\n,${name} ${answer[valueVariable]} ${answer[requeride]}`;
        }
    queryText+=`\n);`;

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