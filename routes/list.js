const express = require('express');
const router = express.Router();

const {
    list
} = require('../mongo/mongo');

router.get('/', (req, res) => {
    list()
        .then(result => {
            res.json(result);
        })
});
module.exports = router;