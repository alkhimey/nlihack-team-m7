var express = require('express')
    , router = express.Router()
    , Mission = require('../models/mission')

router.get('/:id', function (req, res) {
    Mission.get(req.params.id, function (err, comment) {
        res.render('missions/mission', { id: req.params.id, comment: comment })
    })
})

module.exports = router