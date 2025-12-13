import express from "express";
import http from "http";
import "dotenv/config";
import { initApiServer } from "./api/apiServer.js";
import { initWebSockets } from "./sockets/socketServer.js";

const port = process.env.SERVER_PORT;

// Set up and init Express API
const app = express()
initApiServer(app);

// Set up and init Web Sockets
const server = http.createServer(app)
initWebSockets(server)

server.listen(port, () => {
    console.log(`Bridge listening on port ${port}`)
})