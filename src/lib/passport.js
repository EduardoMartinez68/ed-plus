const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; 

const database=require('../database');
const helpers=require('../lib/helpers.js');

const sendEmail = require('../lib/sendEmail.js'); //this is for send emails 
const addDatabase=require('../router/addDatabase');

const system=require('../lib/system'); //get the variable system for we know where is running the app
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

    if(user.rows.length>0){ //if exist a user with the username of the form
        //we will watch if the password is correct
        if (await helpers.matchPassword(password,user.rows[0].password)){
            done(null,user.rows[0],req.flash('success','Bienvenido '+user.rows[0].user_name+' ❤️'));
        }
        else{
            done(null,false,req.flash('message','tu contraseña es incorrecta 😳'));
        }
    }
    else{
        done(null,false,req.flash('message','Usuario Invalido 👁️'));
    }
}));

async function search_user_for_email(email){
    const queryText = 'SELECT * FROM "Fud".users WHERE email = $1';
    var values = [email] 
    return await database.query(queryText, values);
}

async function search_user_for_user_name(username){
    const queryText = 'SELECT * FROM "Fud".users WHERE user_name = $1';
    var values = [username] 
    return await database.query(queryText, values);
}

//-----------------------------signup with captcha 
const axios = require('axios'); //this is for manage the captcha
const {MY_SECRET_KEY}=process.env; //this code is for get the data of the database
passport.use('local.signup-ad', new LocalStrategy({
    usernameField: 'userName',
    passwordField: 'password',
    emailField: 'email',
    acceptTermsField: 'acceptTerms',
    passReqToCallback: true
}, async (req, userName, password, done) => {
    const RECAPTCHA_SECRET_KEY = MY_SECRET_KEY;

    const recaptchaResponse = req.body['g-recaptcha-response'];
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaResponse}`;

    try {
        const response = await axios.post(verificationURL);
        const data = response.data;

        if (data.success) {
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
        } else {
            return done(null, false, req.flash('message', 'Debes completar el recaptcha correctamente 🤨'));
        }
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

async function this_email_exists(email){
    var queryText = 'SELECT * FROM "Fud".users Where email = $1';
    var values = [email];
    var user=await database.query(queryText, values);
    return user.rows.length>0
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

async function search_id(email){
    var queryText = 'SELECT id FROM "Fud".users WHERE email = $1';
    var values = [email];
    const result = await database.query(queryText, values);
    return result.rows[0].id;
}

async function add_user(user){
    try {
        var queryText = 'INSERT INTO "Fud".users (user_name, first_name,second_name,last_name, email, password, rol_user, id_packs_fud) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
        var values = [user.user_name,user.first_name,user.second_name,user.last_name,user.email,user.password,0,0] 
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error to add the a new user of the database:', error);
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

passport.deserializeUser(async (id,done)=>{

    //if the user exist in the cache, we return the id of the user
    if (userCache.has(id)) {
        return done(null, userCache.get(id));
    }

    //if the user no is save in the cahcer we search his data in the database
    const queryText = `
        SELECT 
            u.id AS id,          -- ID del usuario
            e.id AS id_employee,      -- ID del empleado
            e.id_companies AS id_company,      -- ID del empleado
            e.id_branches AS id_branch,      -- ID del empleado
            r.id AS id_role,          -- ID del rol
            u.*,
            r.name_role,              -- Campos de la tabla "roles_employees" view_products
            r.commissions,
            r.salary,
            r.app_point_sales,
            r.discount_for_product,
            r.add_box,
            r.edit_box,
            r.delete_box,
            r.create_reservation,
            r.view_reservation,
            r.view_reports,
            r.add_customer,
            r.edit_customer,
            r.delete_customer,
            r.cancel_debt,
            r.offer_loan,
            r.get_fertilizer,
            r.view_customer_credits,
            r.send_email,
            r.add_employee,
            r.edit_employee,
            r.delete_employee,
            r.create_schedule,
            r.assign_schedule,
            r.view_schedule,
            r.create_type_user,
            r.create_employee_department,
            r.view_sale_history,
            r.delete_sale_history,
            r.view_movement_history,
            r.delete_movement_history,
            r.view_supplies,
            r.add_supplies,
            r.edit_supplies,
            r.delete_supplies,
            r.view_products,
            r.edit_products,
            r.delete_products,
            r.view_combo,
            r.add_combo,
            r.edit_combo,
            r.delete_combo,
            r.view_food_departament,
            r.add_food_departament,
            r.edit_food_departament,
            r.delete_food_departament,
            r.view_food_category,
            r.add_food_category,
            r.edit_food_category,
            r.delete_food_category,
            r.waste_report,
            r.add_provider,
            r.edit_provider,
            r.delete_provider,
            r.view_provider,
            r.sell,
            r.apply_discount,
            r.apply_returns,
            r.add_offers,
            r.edit_offers,
            r.delete_offers,
            r.change_coins,
            r.modify_hardware,
            r.modify_hardware_kitchen,
            r.give_permissions,
            r.currency,
            r.type_of_salary,
            r.view_inventory,
            r.edit_inventory,
            r.employee_department,
            r.edit_employee_department,
            r.delete_employee_department,
            r.employee_roles,
            r.edit_rol_employee,
            r.delete_rol_employee,
            r.add_employee_department,
            r.add_employee_roles,
            r.view_employee
        FROM 
            "Fud".users AS u
        JOIN 
            "Company".employees AS e
        ON 
            u.id = e.id_users
        JOIN 
            "Employee".roles_employees AS r
        ON 
            e.id_roles_employees = r.id
        WHERE 
            u.id = $1;  -- Filtrar por el ID del usuario
    `;
    var values = [id];

    //get the anser of the database
    const obj = await database.query(queryText, values);
    const user=obj.rows[0];

    //if get the user of the database, we will save the data of the user in cache
    if (user) {
        userCache.set(id, user);
    }

    done(null,user);
});


