const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');

const database = require('../../database');
const addDatabase = require('../addDatabase');
const update = require('../updateDatabase');

//functions branch
const {
    get_data_branch,
    get_all_box_of_the_branch_with_his_id
} = require('../../services/branch');

const {
    delate_image_upload,
} = require('../../services/connectionWithDatabaseImage');
const { get } = require('node-persist');

const {
    get_inventory_products_branch,
    get_inventory_supplies_branch
} = require('../../services/supplies');

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

router.get('/:id_company/:id_branch/mass-product-adjustment', isLoggedIn, async (req, res) => {
    const {id_company,id_branch}=req.params;
    const branchFree = await get_data_branch(id_branch);
    res.render('links/free/inventory/updateInventory.hbs',{branchFree});
})

router.post('/:id_branch/search_products_for_update_the_inventory', isLoggedIn, async (req, res) => {
    const {id_branch } = req.params;
    const {barcode}=req.body;
    const products = await get_inventory_products_branch(id_branch,barcode);
    const supplies = await get_inventory_supplies_branch(id_branch,barcode);
    res.json({ products, supplies });
});

module.exports = router;