const express = require('express')
const User = require('../models/user')

const router = new express.Router();

router.post('/create-user', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        res.status(201).send({ user })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/login', async (req, res) => {
    try {
        const user = await User.findUserByUsernameAndPassword(req.body.username, req.body.password)
        res.send({ user })
    } catch (e) {
        res.status(400).send({
            status: 400,
            message: e.message
        })
    }
})


router.get('/get-user', async (req, res) => {
    const username = req.query.username
    try {
        const user = await User.findOne({ username })
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

router.get('/get-all-users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send({
            status: 500,
            message: 'something went wrong'
        })
    }
})

router.patch('/change-users-score', async (req, res) => {
    try {
        const winner = await User.findOne({ username: req.body.winner })
        const loser = await User.findOne({ username: req.body.loser })
        // console.log(winner, loser)

        if (!winner || !loser)
            res.status(404).send({
                message: "user not found"
            })

        winner.score = winner.score + 100 + (loser.score > 0 ? (Math.floor(loser.score / 10)) : 0)
        loser.score = loser.score - 50
        await winner.save()
        await loser.save()
        res.send({ winner, loser })
    } catch (e) {
        res.status(500).send({
            status: 500,
            message: 'something went wrong'
        })
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
