const express = require('express');
const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../../lib/auth');

router.get('/links/install-desktop', isNotLoggedIn, async (req, res) => {
    res.render('links/desktop');
})


module.exports = router;