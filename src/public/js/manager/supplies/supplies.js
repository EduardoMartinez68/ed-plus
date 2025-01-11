async function edit_supplies(id_company,id_branch,id_supplies){
    //we will see if this products have a purchase amount, if not have a purchase amount we will to send to the user to that add this data
    window.location.href = `/links/${id_company}/${id_branch}/${id_supplies}/edit-supplies-branch`;
}

async function edit_inventory(id_company,id_branch,id_supplies,img,barcode,nameDepartment,existence,purchaseAmount){
    //we will see if this products have a purchase amount, if not have a purchase amount we will to send to the user to that add this data
    if(purchaseAmount!=''){
        show_message_edit(id_supplies,id_company,id_branch,img,barcode,nameDepartment,existence,purchaseAmount);
    }else{
        window.location.href = `/links/${id_company}/${id_branch}/${id_supplies}/edit-supplies-branch`;
    }     
}