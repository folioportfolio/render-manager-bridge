import express from "express"
import http from "http"
import { initApiServer } from "./api/apiServer.js"
import { initWebSockets } from "./sockets/socketServer.js"

const port = 7777

// Set up and init Express API
const app = express()
initApiServer(app);

// Set up and init Web Sockets
const server = http.createServer(app)
initWebSockets(server)

server.listen(port, () => {
    console.log(`Bridge listening on port ${port}`)
})