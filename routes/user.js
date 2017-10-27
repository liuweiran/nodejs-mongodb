const express = require('express');
const router = express.Router();

const {
    list,
    user,
    add
} = require('../mongo/mongo');

router.get('/', (req, res) => {
    list()
        .then(result => {
            res.json(result);
        })
});

router.get('/:id', (req, res) => {
    const id = req.params.id;

    user(id)
        .then(result => {
            res.json(result);
        })
});

router.post('/', (req, res) => {
    const data = req.body;
    add(data)
        .then(result => {
            res.json(result);
        })
});

module.exports = router;