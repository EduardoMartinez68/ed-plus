const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');
/*
*----------------------functions-----------------*/
//functions branch
const {
    get_data_branch,
    get_branch
} = require('../../services/branch');

/*
*----------------------links-----------------*/ 
router.get('/:id_company/:id_branch/warehouses', isLoggedIn, async (req, res) => {
    const {id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);
    res.render('links/warehouses/warehouses', { branchFree });
})

router.get('/:id_company/:id_branch/evaluateDelivery', isLoggedIn, async (req, res) => {
    const {id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);
    res.render('links/warehouses/evaluateDelivery', { branchFree});
})
module.exports = router;