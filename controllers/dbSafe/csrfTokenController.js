const express = require('express');
const router = express.Router();
const {csrfProtection} = require('../../utils/csrfToken'); // Импортируем CSRF-мидлвейр

router.get('/getCsrfToken', csrfProtection, (req, res) => {
    res.json({ CSRFToken: req.csrfToken()});
});

module.exports = router;
