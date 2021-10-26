const express = require('express');
const router = express.Router();
const nameParserService = require('../service/parsers/nameParserService');


router.get('/hello', async function (req, res) {
    res.json({ "hello" : "world" });
});

//health
router.get(`/health`,(req,res) => {
    const reuslt = {
        text:"Name parser is on!",
        timestamp: Date.now()
    }
    res.json(reuslt);
});

//name parser
router.post('/nameParser/parse',express.text(),(req, res) => {
    const text = req.body;
    const response = nameParserService.parseName(text);
    res.json(response);
})

module.exports = router;
