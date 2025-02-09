const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
//functions branch
const {
    get_data_branch,
    get_all_box_of_the_branch_with_his_id
} = require('../../services/branch');

router.get('/:id_company/:id_branch/boutique', isLoggedIn, async (req, res) => {
    const {id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);
    res.render('links/boutique/boutique.hbs',{branchFree});
})

router.get('/:id_company/:id_branch/add-boutique', isLoggedIn, async (req, res) => {
    const {id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);
    res.render('links/boutique/addBoutique.hbs',{branchFree});
})

router.post('/:id_company/:id_branch/add-boutique', isLoggedIn, async (req, res) => {
    const {id_company,id_branch}=req.params;

    //get the data of the product
    const {barcode,name,price,description,variant_count,max_inventary}=req.body;
    //we will see if can save the boutique in the database
    

    //get the variants of the clothes
    const tallas = req.body['talla[]'];    
    const colores = req.body['color[]'];
    const prices = req.body['prices[]'];
    const existences = req.body['prices[]'];

    //use this variable for know if we could add all the variants of the product 
    let canAdd=true;
    let productsThatNoWasAdd='';

    //her we will read all the variants of the clothes
    for (let i = 0; i < tallas.length; i++) {
        //get the data of the variants
        const size=tallas[i];
        const color=colores[i];
        const priceProduct=prices[i];
        const existence=existences[i];

        //make the new barcode and the new name use the size and the color of the product
        const newBarcode=`${barcode}-${color}-${size}`;
        const newName=`${name}-color ${color} talla ${size}`;

        //her we will save all the new product and the new combo in the company and in the branch
        if(await add_product_to_boutique(id_company, id_branch, newBarcode,newName,description,priceProduct,1,priceProduct,existence,max_inventary)==false){
            canAdd=false;
            productsThatNoWasAdd+=newName+',';
        }
    }

    //we will see if can save all the products 
    if(canAdd){
        req.flash('success', 'Productos subidos con éxito 😉');
    }else{
        req.flash('message', `Ocurrio un error al momento de cargar los siguientes productos:  ${productsThatNoWasAdd}. Tal vez su barcode y nombres ya existen en la base de datos 😬.`);
    }

    res.redirect(`/links/${id_company}/${id_branch}/add-boutique`);
})


async function add_product_to_boutique( id_company, id_branch, barcode,name,description,sale_price,purchase_amount,purchase_price,existence,max_inventory){
    let canAdd=true;
    let productsThatNoWasAdd='';

    //get all the data of the product
    const use_inventory=1;
    const this_is_a_supplies=0;
    const newProducts=create_new_product_with_excel(id_company, barcode, name, description, use_inventory, this_is_a_supplies);
    const idSupplies = await addDatabase.add_supplies_company(newProducts);

    //we will see if the product can be save in the database
    if (idSupplies) {
        //get the data of the combo in the file excel 
        const purchase_unity='Pza';

        const sale_amount=1;
        const sale_unity=purchase_unity;

        const minimum_inventory=0;
        const unit_inventory=purchase_unity;

        //we will create the supplies in the branch
        const idSuppliesFactures = await addDatabase.add_product_and_suppiles_features(id_branch, idSupplies) //add the supplies in the branch 

        //we will watch if not can added the supplies in the branch 
        if(idSuppliesFactures==null){
            //if we not can added the supplies in the branch, we will to delete the supplies of the company for avoid mistakes
            await delete_supplies_company(idSupplies);
        }else{
            //we will creating the data of the supplies and we will saving with the id of the supplies that create
            const supplies = create_supplies_branch_with_excel(purchase_amount,purchase_unity,purchase_price,sale_amount,sale_unity,sale_price,max_inventory,minimum_inventory,unit_inventory,existence,idSuppliesFactures);
            
            //update the data in the branch for save the new product in his branch
            if (await update.update_supplies_branch(supplies)){

                //get the new combo
                const combo = create_a_new_combo_with_excel(id_company,barcode,name,description);
                const dataProduct={idProduct:idSupplies,amount: 1,foodWaste: supplies.sale_amount,unity: supplies.sale_unity,additional: 0}
                combo.supplies.push(dataProduct); //update the data of supplies use only the barcode of the product
                
                //we will see if can add the combo to the database
                const idCombos = await addDatabase.add_product_combo_company(combo);

                //get the data combo in the branch
                const comboData = create_combo_data_branch(idCombos, id_company, id_branch);

                // save the combo in the branch
                const idComboFacture = await addDatabase.add_combo_branch(comboData);
                if(!idComboFacture){
                    await delete_all_supplies_combo(idCombos);
                    await delete_product_combo_company(idCombos);
                    await delete_product_and_suppiles_features(idSuppliesFactures);
                    await delete_supplies_company(idSupplies);

                    canAdd=false;
                    productsThatNoWasAdd+=name+',';
                }else{
                    //if we can added the combo to the branch, update the price of the combo
                    await update_price_combo_for_excel(sale_price,idComboFacture)
                }
            }else{
                //if we not can update the supplies in the branch, we will delete the supplis in the branch and in the company
                await delete_product_and_suppiles_features(idSuppliesFactures);
                await delete_supplies_company(idSupplies);
            }
        }
    }else{
        productsThatNoWasAdd+=name+',';
        canAdd=false;
    }


    res.redirect(`/links/${id_company}/${id_branch}/upload-products`);
}
module.exports = router;