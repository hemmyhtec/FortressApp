const express = require('express')
const router = express.Router()
const actions = require('../methods/actions')
const upload = require('../ulit/index')


router.post('/register', actions.addNew)
router.post('/login', actions.login)

router.get('/verify/:userId/:uniqueString', actions.verify)
    // router.post('/verify', actions.verify)

router.put('/update/:id', upload.single('profileImage'), actions.updateProfile);

router.post('/eventcreator/:id', upload.array('eventFlyers', 3), actions.eventCreator);

module.exports = router