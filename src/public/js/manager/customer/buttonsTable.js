async function delete_customer(idCustomer,idCompany,first_name){
    if(await questionMessage(`Eliminar a '${first_name}' 😳`,'¿Quieres eliminar a este cliente?')){
      //get the id of the branch
      const id_branch=document.getElementById('id_branch').value;
      if(id_branch){ //if exist the id branch, send the user to link of the branch
        window.location.href = `/links/${idCompany}/${id_branch}/${idCustomer}/delete-customer`;
      }else{ //if not exist the id branch, means that the user is in the ui CEO
        window.location.href = `/links/${idCompany}/${idCustomer}/delete-customer`;
      }
    }
}

async function edit_customer(idCustomer,idCompany){
  //get the id of the branch
  const id_branch=document.getElementById('id_branch').value;
  if(id_branch){ //if exist the id branch, send the user to link of the branch
    window.location.href = `/links/${idCompany}/${id_branch}/${idCustomer}/edit-customer`;
  }else{ //if not exist the id branch, means that the user is in the ui CEO
    window.location.href = `/links/${idCompany}/${idCustomer}/edit-customer`;
  }
}