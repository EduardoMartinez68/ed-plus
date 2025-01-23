const id_branch = document.getElementById('id_branch').value;

async function delete_department(id, id_company) {
    if (await questionMessage('Eliminar departamento 😱', '¿Quieres eliminar este departamento?')) {
        //we will see if the user have a count of fud one 
        if (id_branch) {
            window.location.href = `/links/${id_company}/${id_branch}/${id}/delete-food-department`;
        } else {
            window.location.href = `/links/${id_company}/${id}/delete-food-department`;
        }
    }
}

async function edit_department(id, id_company, nameDepartment, descriptionDepartment) {
    //we will to delate the space in 
    if (descriptionDepartment == "-") {
        descriptionDepartment = ""
    }

    //we will to get the data of the new department
    const data = await edit_data_departments('Editar departamento ✏️', nameDepartment, descriptionDepartment);
    if (data) {
        //get the data of the from 
        var name = data[0];
        var description = data[1];

        //we will to see if be a name
        if (name != "") {
            if (description == "") {
                description = "-";
            }

            //we will see if the user have a count of fud one 
            if (id_branch) {
                window.location.href = `/links/${id_company}/${id_branch}/${id}/${name}/${description}/edit-food-department`;
            } else {
                window.location.href = `/links/${id_company}/${id}/${name}/${description}/edit-food-department`;
            }
        }
        else {
            warningMessage('Department', 'Necesitas agregar un nombre al departamento');
        }
    }
}



////////////////////////////////////////////////////////////////////////
async function delete_category(id,id_company){
    if(await questionMessage('Eliminar departamento 😳','¿Quieres eliminar este departamento?')){
        //we will see if the user have a count of fud one
        const id_branch=document.getElementById('id_branch').value;
        if(id_branch){
            window.location.href = `/links/${id_company}/${id_branch}/${id}/delete-food-category`;
        }else{
            window.location.href = `/links/${id_company}/${id}/delete-food-category`;
        }
    }
}

async function edit_category(id,id_company,nameDepartment,descriptionDepartment){
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

            //we will see if the user have a count of fud one
            const id_branch=document.getElementById('id_branch').value;
            if(id_branch){
                window.location.href = `/links/${id_company}/${id_branch}/${id}/${name}/${description}/edit-food-category-free`;
            }else{
                window.location.href = `/links/${id_company}/${id}/${name}/${description}/edit-food-category`;
            }
        }
        else{
            warningMessage('Department','Debes agregar un nombre al departamento');
        }
    }
}