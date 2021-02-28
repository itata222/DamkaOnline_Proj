const express = require('express')
const User = require('../models/user')
const auth = require('../middlewares/auth');

const router = new express.Router();

router.post('/create-user', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/login', async (req, res) => {
    try {
        const user = await User.findUserByUsernameAndPassword(req.body.username, req.body.password)
        const currentToken = await user.generateAuthToken();
        res.send({ user, currentToken })
    } catch (e) {
        res.status(400).send({
            status: 400,
            message: e.message
        })
    }
})


router.get('/get-user', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username })
        if (!user)
            res.status(404).send({
                message: "user not found"
            })
        res.send(user)
    } catch (e) {
        res.status(500).send({
            status: 500,
            message: 'something went wrong'
        })
    }
})

router.patch('/change-user-score', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username })
        if (!user)
            res.status(404).send({
                message: "user not found"
            })
        user.score = user.score
    } catch (e) {

    }
})


module.exports = router



// router.post('/user-connects', async (req, res) => {
    //     try {
    //         const users = await User.find({})
    //         let user = users.find((user) => {
    //             return req.body.username === user.username
    //         })
    //         if (user == undefined && req.body.option === 'login') {
    //             console.log('failed login')
    //             res.status(400).send({
    //                 status: 400,
    //                 message: "Unable to login"
    //             })
    //         } else if (user == undefined && req.body.option === 'join') {
    //             user = new User(req.body)
    //             await user.save()
    //             const currentToken = await user.generateAuthToken();
    //             res.send({ user, currentToken })
    //         }
    //         else if (user && req.body.option === 'join') {
    //             res.status(400).send({
    //                 status: 400,
    //                 message: "Username already exist"
    //             })
    //         }
    //         else {
    //             user = await User.findUserByUsernameAndPassword(req.body.username, req.body.password)
    //             if (!user)
    //                 res.status(400).send({
    //                     status: 400,
    //                     message: "Unable to Login"
    //                 })
    //             else {
    //                 const currentToken = await user.generateAuthToken();
    //                 res.send({ user, currentToken })
    //             }
    //             console.log('successful login')
    //         }
    //     } catch (e) {
    //         res.status(400).send({
    //             status: 400,
    //             message: e
    //         })
    //     }
    // })
