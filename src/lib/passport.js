const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; 

const database=require('../database');
const helpers=require('../lib/helpers.js');

const sendEmail = require('../lib/sendEmail.js'); //this is for send emails 
const addDatabase=require('../router/addDatabase');

const system=require('../lib/system'); //get the variable system for we know where is running the app
require('dotenv').config();
const {TYPE_DATABASE}=process.env;

//-----------------------------login
passport.use('local.login', new LocalStrategy({
    usernameField: 'userName',
    passwordField: 'password',
    passReqToCallback: true
}, async (req ,userName, password, done) => {
    //we delete the space empty for avoid error when search the user in the database
    userName = userName.trim();
    password = password.trim();

    //search the user in the database 
    let user;
    if(system=='desktop'){
        //if the user is in the desktop, we will see to user for his name
        user=await search_user_for_user_name(userName);
    }else{
        //if the user is in the desktop, we will see to user for his email
        user=await search_user_for_email(userName);
    }

    if(user.length>0){ //if exist a user with the username of the form
        //we will watch if the password is correct
        if (await helpers.matchPassword(password,user[0].password)){
            done(null,user[0],req.flash('success','Bienvenido '+user[0].user_name+' ❤️'));
        }
        else{
            done(null,false,req.flash('message','tu contraseña es incorrecta 😳'));
        }
    }
    else{
        done(null,false,req.flash('message','Usuario Invalido 👁️'));
    }
}));

async function search_user_for_email(email) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            // SQLite: sin esquema, sin comillas en tablas y columnas, parámetro con ?
            const queryText = `
                SELECT *
                FROM users
                WHERE email = ?
            `;
            return new Promise((resolve, reject) => {
                database.all(queryText, [email], (err, rows) => {
                    if (err) {
                        console.error('SQLite error searching user by email:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            // PostgreSQL: con esquema, con comillas dobles y parámetro $1
            const queryText = `
                SELECT *
                FROM "Fud".users
                WHERE email = $1
            `;
            const values = [email];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error in search_user_for_email:', error);
        throw error;
    }
}

async function search_user_for_user_name(username) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const queryText = `
                SELECT *
                FROM users
                WHERE user_name = ?
            `;
            return new Promise((resolve, reject) => {
                database.all(queryText, [username], (err, rows) => {
                    if (err) {
                        console.error('SQLite error searching user by user_name:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
        } else {
            const queryText = `
                SELECT *
                FROM "Fud".users
                WHERE user_name = $1
            `;
            const values = [username];
            const result = await database.query(queryText, values);
            return result.rows;
        }
    } catch (error) {
        console.error('Error in search_user_for_user_name:', error);
        throw error;
    }
}


//-----------------------------signup with captcha 
passport.use('local.signup-ad', new LocalStrategy({
    usernameField: 'userName',
    passwordField: 'password',
    emailField: 'email',
    acceptTermsField: 'acceptTerms',
    passReqToCallback: true
}, async (req, userName, password, done) => {

    try {
        const { email, Name, confirmPassword, acceptTerms } = req.body;

        if (!acceptTerms) {
            return done(null, false, req.flash('message', 'Debe aceptar los términos y condiciones para continuar 👁️'));
        }

        if (!all_data_exists(req)) {
            return done(null, false, req.flash('message', 'Necesitas completar todos los campos requeridos 🤨'));
        }
        
        /*
        if (await this_user_exists(userName)) {
            return done(null, false, req.flash('message', 'Este usuario ya existe 😅'));
        }*/

        if (await this_email_exists(email)) {
            return done(null, false, req.flash('message', 'Este email ya existe 😅'));
        }

        if (!compare_password(password, confirmPassword)) {
            return done(null, false, req.flash('message', 'Tus contraseñas no coinciden 👁️'));
        }

        // Create a new user
        const newUser = await create_a_new_user(req, userName, password);
        return done(null, newUser);
    } catch (error) {
        console.error(error);
        return done(null, false, req.flash('message', 'Error al verificar reCAPTCHA.'));
    }
}));

async function create_a_new_user(req,userName,password){
    const {first_name,second_name,last_name,email,birthday} = req.body; //get the value of the from
    //create a new user 
    const newUser={
        user_name:userName,
        first_name: first_name,
        second_name: second_name,
        last_name: last_name,
        email:email,
        password:password,
        birthday:birthday
    };

    newUser.password=await helpers.encryptPassword(password); //create a password encrypt
    //add the user to the database
    if(await add_user(newUser)){
        //if the user was add with success, sen a email of welcome 
        subjectEmail=''
        const nameUser=first_name+' '+second_name+' '+last_name;
        await sendEmail.welcome_email(email,nameUser);
    }

    //add the id of the user 
    newUser.id=await search_id(email);    

    return newUser;
}

async function this_user_exists(user_name){
    var queryText = 'SELECT * FROM "Fud".users Where user_name = $1';
    var values = [user_name];
    var user=await database.query(queryText, values);
    return user.rows.length>0
}

async function this_email_exists(email) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const queryText = `
                SELECT *
                FROM users
                WHERE email = ?
            `;
            return new Promise((resolve, reject) => {
                database.all(queryText, [email], (err, rows) => {
                    if (err) {
                        console.error('SQLite error checking email existence:', err.message);
                        reject(err);
                    } else {
                        resolve(rows.length > 0);
                    }
                });
            });
        } else {
            const queryText = `
                SELECT *
                FROM "Fud".users
                WHERE email = $1
            `;
            const values = [email];
            const result = await database.query(queryText, values);
            return result.rows.length > 0;
        }
    } catch (error) {
        console.error('Error in this_email_exists:', error);
        throw error;
    }
}


function all_data_exists(req){
    const {Name,email,birthday} = req.body;
    return Name!='' && email!='' && birthday!=''
}

function compare_password(P1,P2){
    if (P1==''){
        return false;
    }

    return P1==P2;
}

async function search_id(email) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const queryText = `
                SELECT id
                FROM users
                WHERE email = ?
            `;
            return new Promise((resolve, reject) => {
                database.get(queryText, [email], (err, row) => {
                    if (err) {
                        console.error('SQLite error searching id:', err.message);
                        reject(err);
                    } else {
                        resolve(row ? row.id : null);
                    }
                });
            });
        } else {
            const queryText = `
                SELECT id
                FROM "Fud".users
                WHERE email = $1
            `;
            const values = [email];
            const result = await database.query(queryText, values);
            return result.rows.length > 0 ? result.rows[0].id : null;
        }
    } catch (error) {
        console.error('Error in search_id:', error);
        throw error;
    }
}

async function add_user(user) {
    try {
        if (TYPE_DATABASE === 'mysqlite') {
            const queryText = `
                INSERT INTO users 
                (user_name, first_name, second_name, last_name, email, password, rol_user, id_packs_fud) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [
                user.user_name,
                user.first_name,
                user.second_name,
                user.last_name,
                user.email,
                user.password,
                0,
                0
            ];
            return new Promise((resolve, reject) => {
                database.run(queryText, values, function (err) {
                    if (err) {
                        console.error('SQLite error adding user:', err.message);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        } else {
            const queryText = `
                INSERT INTO "Fud".users 
                (user_name, first_name, second_name, last_name, email, password, rol_user, id_packs_fud) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            const values = [
                user.user_name,
                user.first_name,
                user.second_name,
                user.last_name,
                user.email,
                user.password,
                0,
                0
            ];
            await database.query(queryText, values);
            return true;
        }
    } catch (error) {
        console.error('Error adding new user to the database:', error);
        return false;
    }
}




//-----------------------------signup
passport.use('local.signup', new LocalStrategy({
    usernameField: 'businessName',
    passwordField: 'phone',
    emailField: 'email',
    acceptTermsField: 'acceptTerms',
    passReqToCallback: true
}, async (req, userName2, password, done) => {
    try {
        const { email, phone, businessName, acceptTerms } = req.body;
        const correctedEmail = email.trim(); //this is for delete the space empty of the form for avoid a error in the login 

        //we know if this user accept the terms and condition 
        if (!acceptTerms) {
            return done(null, false, req.flash('message', 'Debe aceptar los términos y condiciones para continuar 👁️'));
        }

        //we know if this email exist in the database 
        if (await this_email_exists(correctedEmail)) {
            return done(null, false, req.flash('message', 'Este email ya existe 😅'));
        }
    
        //create the username 
        let formattedName = businessName.replace(/ /g, "_"); //this is for delete all the space in white
        const userName='admin_'+formattedName;
    
        //create the password 
        const password=create_password();
    
        // Create a new user
        let newUser;
        if(system=='desktop'){
            //if the user is in the desktop, we will save the admin
            newUser = await create_a_new_user_ad(req, 'admin', 'admin',correctedEmail,businessName);
        }else{
            //if the user is in the desktop, we will save the user in the server
            newUser = await create_a_new_user_ad(req, userName, password,correctedEmail,businessName);
        }


        //we send the information of the new user 
        const message=`
            new user <br>
            Negocio: ${businessName} <br>
            phone: ${phone} <br>
            email: ${correctedEmail}
        `
        //await sendEmail.send_email('technologyfud@gmail.com','eduardoa4848@Outlook.es',message)
        
        //create a company for the user 
        const newCompany=await get_new_company(newUser.id,correctedEmail,businessName,phone);
        const idCompany=await addDatabase.add_company(newCompany) //add the new company and get the id 
        if (idCompany){ //if we can add the new company 
            const newBranch=create_branch_free(idCompany,businessName,phone, userName)
            const idBranch=await addDatabase.save_branch(newBranch);

            const departament=create_a_departments(idCompany)
            const idDepartment=await addDatabase.save_department_employees(departament);

            const rol=create_rol(idCompany)
            const idRol=await addDatabase.add_type_employees(rol);

            const employee=create_a_new_employe(idCompany,newUser.id,idBranch,idDepartment,idRol);
            await addDatabase.add_new_employees(employee)
        }

        return done(null, newUser);
    } catch (error) {
        console.error(error);
        return done(null, false, req.flash('message', 'Error en el formulario.'));
    }
}));

function create_rol(idCompanies){
    const role = {
        idCompanies,
        name_role:'Admin',
        salary:0,
        currency: '',
        type_of_salary: '',
        commissions: 0,
        discount_for_product: 0,
        add_box: true,
        edit_box: true,
        delete_box: true,
        create_reservation: true,
        view_reservation: true,
        view_reports: true,
        add_customer: true,
        edit_customer: true,
        delete_customer: true,
        cancel_debt: true,
        offer_loan: true,
        get_fertilizer: true,
        view_customer_credits: true,
        send_email: true,
        add_employee: true,
        edit_employee: true,
        delete_employee: true,
        create_schedule: true,
        assign_schedule: true,
        view_schedule: true,
        create_type_user: true,
        create_employee_department: true,
        view_sale_history: true,
        delete_sale_history: true,
        view_movement_history: true,
        delete_movement_history: true,
        view_supplies: true,
        add_supplies: true,
        edit_supplies: true,
        delete_supplies: true,
        view_products: true,
        edit_products: true,
        delete_products: true,
        view_combo: true,
        add_combo: true,
        edit_combo: true,
        delete_combo: true,
        view_food_departament: true,
        add_food_departament: true,
        edit_food_departament: true,
        delete_food_departament: true,
        view_food_category: true,
        add_food_category: true,
        edit_food_category: true,
        delete_food_category: true,
        waste_report: true,
        add_provider: true,
        edit_provider: true,
        delete_provider: true,
        view_provider: true,
        sell: true,
        apply_discount: true,
        apply_returns: true,
        add_offers: true,
        edit_offers: true,
        delete_offers: true,
        change_coins: true,
        modify_hardware: true,
        modify_hardware_kitchen: true,
        give_permissions: true
    };

    return role;
}

function create_a_departments(idCompanies){
    const departament={
        idCompanies,
        name_departaments: 'Caja',
        description:''
    }

    return departament
}

function create_a_new_employe(id_companies,id_users,id_branches,id_departments_employees,id_roles_employees){
    const employee={
         id_companies,
         id_users, 
         id_roles_employees, 
         id_departments_employees, 
         id_branches, 
         id_country:1, 
         city:'', 
         street:'', 
         num_int:'', 
         num_ext:'',
         phone:'',
         cell_phone:''
    }

    return employee;
}

function create_branch_free(id_companies,name_branch,phone,representative){
    const branch={
        id_companies,
        name_branch,
        alias: name_branch,
        representative,
        phone,
        cell_phone:phone,
        email_branch:'',
        id_country:1,
        municipality:'',
        city:'',
        cologne:'',
        address:'',
        num_ext:'',
        num_int:'',
        postal_code:''
    }
    return branch;
}

function create_password() {
    var character = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var password = '';
    for (var i = 0; i < 5; i++) {
      var characterSelect = character.charAt(Math.floor(Math.random() * character.length));
      password += characterSelect;
    }
    return password;
}

async function create_a_new_user_ad(req,userName,password,email,businessName){
    const {birthday} = req.body; //get the value of the from
    //create a new user 
    const newUser={
        user_name:userName,
        first_name: businessName,
        second_name: businessName,
        last_name: businessName,
        email:email,
        password:password,
        birthday:birthday
    };

    newUser.password=await helpers.encryptPassword(password); //create a password encrypt

    //add the user to the database
    if(await add_user(newUser)){
        //if the user was add with success, sen a email of welcome 
        subjectEmail=''
        const nameUser='tu negocio '+businessName+' esta listo!';
        await sendEmail.welcome_email_ad(email,nameUser,password);
    }

    //add the id of the user 
    newUser.id=await search_id(email);    

    return newUser;
}

async function get_new_company(userId,email,businessName,phone){
    const company={
        id_user:parseInt(userId),
        path_logo:null,
        tradename:'',
        name:businessName,
        alias:businessName,
        description:'',
        representative:'',
        phone:phone,
        cell_phone:phone,
        email:email,
        id_country:1,
        municipality:'',
        city:'',
        cologne:'',
        streets:'',
        num_o:'',
        num_i:'',
        postal_code:''
    }  

    return company;
}







//this function not mov
passport.serializeUser((user,done)=>{
    done(null,user.id);
});


const userCache=require('../lib/databaseCache.js');

passport.deserializeUser(async (id, done) => {
    try {

        if (userCache.has(id)) {
            return done(null, userCache.get(id));
        }

        let user;

        if (TYPE_DATABASE === 'mysqlite') {
            const queryText = `
                SELECT 
                    e.id AS id_employee,
                    e.id_companies AS id_company,
                    e.id_branches AS id_branch,
                    r.id AS id_role,
                    u.*,
                    r.*
                FROM users u
                JOIN employees e ON u.id = e.id_users
                JOIN roles_employees r ON e.id_roles_employees = r.id
                WHERE u.id = ?
            `;
            user = await new Promise((resolve, reject) => {
                database.get(queryText, [id], (err, row) => {
                    if (err) {
                        console.error('SQLite error in deserializeUser:', err.message);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });
        } else {
            const queryText = `
                SELECT 
                    e.id AS id_employee,
                    e.id_companies AS id_company,
                    e.id_branches AS id_branch,
                    r.id AS id_role,
                    u.*,
                    r.* 
                FROM "Fud".users AS u
                JOIN "Company".employees AS e ON u.id = e.id_users
                JOIN "Employee".roles_employees AS r ON e.id_roles_employees = r.id
                WHERE u.id = $1;
            `;
            const result = await database.query(queryText, [id]);
            user = result.rows[0];
        }

        if (user) {
            user.id = id;
            userCache.set(id, user);
        }

        done(null, user);
    } catch (error) {
        console.error('Error in passport.deserializeUser:', error);
        done(error);
    }
});


