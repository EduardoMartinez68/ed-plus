async function delete_provider(idCompany,idProvider,name){
    //if the user is in a branch or is with a subscription in ed one 
    const idBranch=document.getElementById('id_branch').value;
    if(idBranch){
      if(await questionMessage(`Eliminar a '${name}' 😳`,'¿Quieres eliminar a este provedor?')){
        window.location.href = `/links/${idCompany}/${idBranch}/${idProvider}/delete-provider`;
      }
    }else{
        //if not is in a branch or in ed one, the use is in the CEO UI
      if(await questionMessage(`Eliminar a '${name}' 😳`,'¿Quieres eliminar a este provedor?')){
        window.location.href = `/links/${idCompany}/${idProvider}/delete-provider`;
      }
    }
}