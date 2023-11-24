const express = require('express')
const router = express.Router()
const users = require('./users')
const articles = require('./articles')

router.use(express.json())
router.use('/users', users)
router.use('/articles', articles)

module.exports = router