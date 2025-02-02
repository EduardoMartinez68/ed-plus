async function delete_employee(idCompany,idBranch,idUser){
    if(await questionMessage('Eliminar empleado 😬','¿Te gustaría eliminar a este empleado?')){
        window.location.href = "/links/"+idCompany+'/'+idBranch+'/'+idUser+"/delete-employee";
    }
}

function the_user_is_in_a_cellphone(){
    return (window.innerWidth <= 769)
}

//get the divs of the tabla employees and descriptions employee
const tableEmployee=document.getElementById('container-table-employee')
const descriptionEmployee=document.getElementById('container-description-employee')

//get all the employees in the screen 
const divsEmployees = document.getElementsByClassName('container-data-employee');


function select_employee(idCompany,idBranch,idUser){
    if(the_user_is_in_a_cellphone()){
        //if the user is a cellphone, we activate the description div and we will hide the employee table  
        tableEmployee.classList.add('card-employee-cellphone'); 
        descriptionEmployee.classList.remove('card-employee-cellphone');
    }


    //we will to read all the employees div
    for (let i = 0; i < divsEmployees.length; i++) {
        //add the class <disabled> for that the div not can show his information 
        if (!divsEmployees[i].classList.contains('disabled')) {
            divsEmployees[i].classList.add('disabled');
        }
    }

    //we will get the div select for the user for remove the class disabled 
    let divSelect=document.getElementById(idUser)
    divSelect.classList.remove('disabled'); //this is for that can show in the screen 
}

function return_table(){
    if(the_user_is_in_a_cellphone()){
        //if the user is a cellphone, we activate the description div and we will hide the employee table  
        descriptionEmployee.classList.add('card-employee-cellphone'); 
        tableEmployee.classList.remove('card-employee-cellphone');
    }
}