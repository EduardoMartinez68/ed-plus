async function watch_role_employee(id,id_company){
    //we will get the id of the branch 
    const row = document.querySelector('tr');
    const idBranch = row.getAttribute('id_branch');

    //We will visit the corresponding website
    window.location.href = "/links/"+id_company+"/"+idBranch+"/"+id+"/edit-role-user";
}

/*------DEPARTAMENTS------*/
const id_branch=document.getElementById('id_branch').value;
async function delete_departament(id,id_company){
    if(await questionMessage('Eliminar departamento','¿Quieres eliminar este departamento? 🤔')){
        //we will see if exist a subscription to fud one 
        if(id_branch){
            window.location.href = `/links/${id_company}/${id_branch}/${id}/delete_departament`;
        }else{
            window.location.href = `/links/${id_company}/${id}/delete_departament`;
        }
    }
}

async function edit_departament(id,id_company,nameDepartment,descriptionDepartment){
    //we will to delate the space in 
    if(descriptionDepartment=="-"){
        descriptionDepartment=""
    }
    //we will to get the data of the new department
    const data=await edit_data_departments('Edit department',nameDepartment,descriptionDepartment);
    if(data){
        //get the data of the from 
        var name = data[0];
        var description = data[1];

        //we will to see if be a name
        if(name!=""){
            if(description==""){
                description="-";
            }         

            //we will see if exist a subscription to fud one 
            if(id_branch){
                window.location.href = `/links/${id_company}/${id_branch}/${id}/${name}/${description}/edit-department-employee`;
            }else{
                window.location.href = `/links/${id_company}/${id}/${name}/${description}/edit-department-employee`;
            }
        }
        else{
            warningMessage('Error 👁️','Necesitas agregar un nombre a tu departamento');
        }
    }
}