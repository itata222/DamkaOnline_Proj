const express = require('express')
const User = require('../models/user')
const auth = require('../middlewares/auth');
const app = require('../app');

const router = new express.Router();


router.post('/lobby', auth, async (req, res) => {
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

router.post('/game', auth, async (req, res) => {
    try {
        res.send({
            message: 'Success'
        })
    } catch (e) {
        res.status(500).send({
            status: 500,
            message: 'something went wrong'
        })
    }
})

router.post('/create-user', async (req, res) => {
    try {
        const user = new User(req.body)
        const currentToken = await user.generateAuthToken();
        res.status(201).send({ user, currentToken })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/login', async (req, res) => {
    try {
        const user = await User.findUserByUsernameAndPassword(req.body.username, req.body.password)
        const currentToken = await user.generateAuthToken();
        console.log(currentToken)
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
        const username = req.query.username
        const user = await User.findOne({ username })
        if (!user)
            res.status(404).send({
                message: "user not found"
            })
        res.send(user)
    } catch (e) {
        console.log(e)
    }
})

router.patch('/change-users-score', async (req, res) => {
    try {
        console.log('why')
        const winner = await User.findOne({ username: req.body.winner })
        const loser = await User.findOne({ username: req.body.loser })
        console.log('its')

        if (!winner || !loser)
            return res.status(404).send({
                message: "user not found"
            })
        console.log('not')

        winner.score = winner.score + 100 + (loser.score > 0 ? (Math.floor(loser.score / 10)) : 0)
        loser.score = loser.score - 50
        console.log('working')
        await winner.save()
        await loser.save()
    } catch (e) {
        console.log(e)
    }
})

router.get('*', async (req, res) => {
    try {
        res.status(404).send({
            message: 'Go to /'
        })
    } catch (e) {
        res.status(400).send({
            status: 400,
            message: e.message
        })
    }
})

router.post('/logout', auth, async (req, res) => {
    try {
        console.log(req.user)
        req.user.token = null
        await req.user.save()
        res.send(req.user)
    } catch (err) {
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
