const request = require('supertest')
const { response } = require('../src/app.js')
const app = require('../src/app.js')
const User = require('../src/models/user')

const userOne = {
    username: 'user1',
    password: 'user1'
}

beforeEach(async () => {
    await User.deleteMany();
    await new User(userOne).save()
})


test('should login a user', async () => {
    await request(app).post('/login').send({
        username: 'user1',
        password: 'user1'
    }).expect(200)
})

test('should join a new user', async () => {
    await request(app).post('/create-user').send({
        username: 'stromae',
        password: 'stromae'
    }).expect(201)
})

test('should get the user', async () => {
    await request(app).get('/get-user?username=user1').expect(200)
})