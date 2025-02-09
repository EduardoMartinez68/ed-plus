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
    const {barcode,name,price,description,variant_count}=req.body;
    //we will see if can save the 

    //get the variants of the clothes
    const tallas = req.body['talla[]'];    
    const colores = req.body['color[]'];
    console.log(tallas)
    console.log(colores)
    //her we will read all the variants of the clothes
    for (let i = 0; i < tallas.length; i++) {
        //get the data of the variants
        const size=tallas[i];
        const color=colores[i];

        //make the new barcode and the new name use the size and the color of the product
        const newBarcode=`${barcode}-${color}-${size}`;
        const newName=`${name}-color ${color} talla ${size}`;

        //her we will save all the new product and the new combo in the company and in the branch
        console.log(newBarcode)
        console.log(newName)
    }

    req.flash('message', 'Lo siento, no tienes permiso para esta acción 😅');
    req.flash('success', 'El empleado fue eliminado 👍');
    res.redirect(`/links/${id_company}/${id_branch}/add-boutique`);
})

module.exports = router;