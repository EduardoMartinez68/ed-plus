const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');

//------------------------------------CRM 
//functions CRM
const {
    get_sales_stage_with_company_id,
    add_the_new_sales_stage_in_my_company,
    delete_sale_stage_in_my_company,
    get_all_sales_teams_with_company_id,
    add_new_sales_team_in_my_company,
    get_all_prospects_of_my_company,
    get_data_of_a_prospect_with_his_id,
    delete_prospect_with_id,
    get_appointment_with_user_id,
    get_appointment_of_this_week_with_user_id,
    delete_appointment_with_id,
    get_the_first_ten_event_in_the_history_of_the_prospects,
    get_more_message_of_the_prospects
} = require('../../services/CRM');

//functions branch
const {
    get_data_branch,
    get_branch
} = require('../../services/branch');

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
    get_data_employee
} = require('../../services/employees');


//functions customers
const {
    search_all_customers,
} = require('../../services/customers');

//------------------------------------ED STUDIOS 
const {
    get_all_apps_of_this_company
} = require('../../services/apps');

router.get('/:id_company/:id_branch/CRM', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const apps=await get_all_apps_of_this_company(id_company,id_branch)
    
    // we will see if exist sales stage in the company
    //if not exist data in the database, we going to add (new, qualified, proposition, won)
    var salesStage=await get_sales_stage_with_company_id(id_company);
    if(salesStage.length === 0 || salesStage==null){
        await add_the_new_sales_stage_in_my_company(id_company) //this is for add the 
        salesStage=await get_sales_stage_with_company_id(id_company); //we get the new groups we added again
    }

    const employees=await get_data_employee(req);
    const prospects=await get_all_prospects_of_my_company(id_company);
    const appointment=await get_appointment_of_this_week_with_user_id(employees[0].id)

    res.render('links/branch/CRM/crm', { branchFree, apps, salesStage, prospects, appointment});
})

router.get('/:id_company/:id_branch/add-prospects', isLoggedIn, async (req, res) => {
    const { id_company, id_branch } = req.params;
    const branchFree = await get_data_branch(id_branch);
    const apps=await get_all_apps_of_this_company(id_company,id_branch)

    
    // we will see if exist sales stage in the company
    //if not exist data in the database, we going to add (new, qualified, proposition, won)
    var salesStage=await get_sales_stage_with_company_id(id_company);
    if(salesStage.length === 0 || salesStage==null){
        await add_the_new_sales_stage_in_my_company(id_company) //this is for add the 
        salesStage=await get_sales_stage_with_company_id(id_company); //we get the new groups we added again
    }

    // we will see if exist team sales in the company
    //if not exist team sales in the database, we going to add (team sales)
    var salesTeam=await get_all_sales_teams_with_company_id(id_company);
    if(salesTeam.length === 0 || salesTeam==null){
        //this is for add the 
        if(await add_new_sales_team_in_my_company(id_company)){
            salesTeam=await get_all_sales_teams_with_company_id(id_company); //we get the new groups we added again
        }
    }

    const customers = await search_all_customers(id_company)
    const dataCompany=await get_data_company_with_id(id_company)
    const branches=branchFree;
    const username=req.user.first_name+' '+req.user.second_name+' '+req.user.last_name;
    const dataEmployees=await get_data_employee(req)
    const idEmployee=dataEmployees[0].id
    const employees=[{id:idEmployee,username: username}]
    res.render('links/branch/CRM/addProspects', { branchFree, apps, salesStage , customers, salesTeam, dataCompany, branches, employees});
})

router.get('/:id_company/:id_branch/:id_prospects/edit-prospects', isLoggedIn, async (req, res) => {
    const { id_company, id_branch , id_prospects} = req.params;
    const branchFree = await get_data_branch(id_branch);
    const apps=await get_all_apps_of_this_company(id_company,id_branch)

    //this is for get the data of the prospect and his history 
    const customer=await get_data_of_a_prospect_with_his_id(id_prospects)
    const historyProspect=await get_the_first_ten_event_in_the_history_of_the_prospects(id_prospects)
    
    // we will see if exist sales stage in the company
    //if not exist data in the database, we going to add (new, qualified, proposition, won)
    var salesStage=await get_sales_stage_with_company_id(id_company);
    if(salesStage.length === 0 || salesStage==null){
        await add_the_new_sales_stage_in_my_company(id_company) //this is for add the 
        salesStage=await get_sales_stage_with_company_id(id_company); //we get the new groups we added again
    }

    // we will see if exist team sales in the company
    //if not exist team sales in the database, we going to add (team sales)
    var salesTeam=await get_all_sales_teams_with_company_id(id_company);
    if(salesTeam.length === 0 || salesTeam==null){
        //this is for add the 
        if(await add_new_sales_team_in_my_company(id_company)){
            salesTeam=await get_all_sales_teams_with_company_id(id_company); //we get the new groups we added again
        }
    }

    const dataCompany=await get_data_company_with_id(id_company)
    const branches=branchFree;
    const username=req.user.first_name+' '+req.user.second_name+' '+req.user.last_name;
    const dataEmployees=await get_data_employee(req)
    const idEmployee=dataEmployees[0].id
    const employees=[{id:idEmployee,username: username}]
    res.render('links/branch/CRM/editProspects', { branchFree, apps, salesStage , salesTeam, dataCompany, branches, employees, customer, historyProspect});
})

router.post('/get-more-prospect', async (req, res) => {
    const { oldRange, newRange, id_prospect} = req.body;

    // Validate the data
    if (!id_prospect || isNaN(oldRange) || isNaN(newRange)) {
        return res.status(400).json({ error: 'Parámetros inválidos' });
    }

    const answer=await get_more_message_of_the_prospects(id_prospect,oldRange,newRange);
    res.status(200).json({ message: answer }); // Return data to the client
})



router.get('/:id_company/:id_branch/:id_prospects/delete-prospect', isLoggedIn, async (req, res) => {
    const { id_company, id_branch , id_prospects} = req.params;
    if(await delete_prospect_with_id(id_prospects)){
        req.flash('success', 'La oportunidad fue eliminada con éxito 😉');
    }else{
        req.flash('message', 'La oportunidad no fue eliminada 🤔 ');
    }
    res.redirect(`/links/${id_company}/${id_branch}/CRM`);
})

router.get('/:id_company/:id_branch/appointment', isLoggedIn, async (req, res) => {
    const { id_company, id_branch , id_prospects} = req.params;
    const branchFree = await get_data_branch(id_branch);
    const apps=await get_all_apps_of_this_company(id_company,id_branch)
    const employees=await get_data_employee(req)
    const appointment=await get_appointment_with_user_id(employees[0].id)
    res.render('links/branch/CRM/appointment', { branchFree, apps, appointment});
})

router.get('/:id_company/:id_branch/:id_appointment/delete-appointment', isLoggedIn, async (req, res) => {
    const { id_company, id_branch , id_appointment} = req.params;
    const dataEmployees=await get_data_employee(req)
    const idEmployee=dataEmployees[0].id;

    //we will see if can delete the appointment, only the employee can delete his appointment
    if(await delete_appointment_with_id(id_appointment,idEmployee)){
        req.flash('success', 'La cita fue eliminada con éxito 😉');
    }else{
        req.flash('message', 'La cita no fue eliminada 👉👈');
    }

    res.redirect(`/links/${id_company}/${id_branch}/appointment`);
})

router.get('/:id_company/:id_branch/:id_appointment/delete-appointment-crm', isLoggedIn, async (req, res) => {
    const { id_company, id_branch , id_appointment} = req.params;
    const dataEmployees=await get_data_employee(req)
    const idEmployee=dataEmployees[0].id;
    
    //we will see if can delete the appointment, only the employee can delete his appointment
    if(await delete_appointment_with_id(id_appointment,idEmployee)){
        req.flash('success', 'La cita fue eliminada con éxito 😉');
    }else{
        req.flash('message', 'La cita no fue eliminada 👉👈');
    }

    res.redirect(`/links/${id_company}/${id_branch}/CRM`);
})


router.get('/:id_company/:id_branch/watch-invoice-crm', isLoggedIn, async (req, res) => {
    const { id_company, id_branch , id_prospect} = req.params;
    const branchFree = await get_data_branch(id_branch);
    const dataProspect=await get_data_of_a_prospect_with_his_id(id_prospect)
    res.render('links/branch/CRM/tableInvoice',{branchFree, dataProspect});
})


//functions customers
const combos = require('../../services/combos');

router.get('/:id_company/:id_branch/:id_prospect/create-invoice-crm', isLoggedIn, async (req, res) => {
    const { id_company, id_branch , id_prospect} = req.params;
    const branchFree = await get_data_branch(id_branch);
    const dataProspect=await get_data_of_a_prospect_with_his_id(id_prospect)
    const salesStage=await get_sales_stage_with_company_id(id_company)
    const products=await combos.get_all_dish_and_combo(id_company,id_branch);
    const dataCompany=await get_data_company_with_id(id_company)
    console.log(dataCompany)
    res.render('links/branch/CRM/createInvoice',{branchFree, dataProspect,salesStage, products});
})



module.exports = router;
