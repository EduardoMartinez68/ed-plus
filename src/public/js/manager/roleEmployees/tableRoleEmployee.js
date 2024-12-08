async function watch_role_employee(id,id_company){
    //we will get the id of the branch 
    const row = document.querySelector('tr');
    const idBranch = row.getAttribute('id_branch');

    //We will visit the corresponding website
    window.location.href = "/links/"+id_company+"/"+idBranch+"/"+id+"/edit-role-user";
}