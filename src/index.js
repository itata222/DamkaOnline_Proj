const app = require('./app')

const http = require('http')
const port = process.env.PORT;

const server = http.createServer(app)
module.exports = server;

require('./socket')

server.listen(port, () => {
    console.log('server up, port:', port)
})