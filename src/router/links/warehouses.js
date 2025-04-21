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

const path=require('path');
const nodePersist = require('node-persist');
nodePersist.init({
  dir: path.join(__dirname, '../../data')
});

/*
*----------------------links-----------------*/ 
router.get('/:id_company/:id_branch/warehouses', isLoggedIn, async (req, res) => {
    const {id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);

    const token = await nodePersist.get('installToken');
    //const dataServer={token:token};
    const dataServer=[{token:'5a39270b'}];
    res.render('links/warehouses/warehouses', { branchFree, dataServer});
})

router.get('/:id_company/:id_branch/evaluateDelivery', isLoggedIn, async (req, res) => {
    const {id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);
    res.render('links/warehouses/evaluateDelivery', { branchFree});
})

router.get('/:id_company/:id_branch/requesShipping', isLoggedIn, async (req, res) => {
    const {id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);
    res.render('links/warehouses/requesShipping', { branchFree});
})

router.get('/:id_company/:id_branch/request_transfer', isLoggedIn, async (req, res) => {
    const {id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);
    const dataServer=[{token:'5a39270b'}];
    res.render('links/warehouses/requestTransfer', { branchFree,dataServer});
})
module.exports = router;