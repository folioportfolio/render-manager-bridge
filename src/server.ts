import express from "express";
import http from "http";
import "dotenv/config";
import admin from "firebase-admin";
import { initApiServer } from "./api/apiServer.js";
import { initWebSockets } from "./sockets/socketServer.js";

const port = process.env.SERVER_PORT;

// Set up Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID ?? "",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
        privateKey: process.env.FIREBASE_PRIVATE_KEY ?? "",
    }),
});

// Set up and init Express API
const app = express()
initApiServer(app);

// Set up and init Web Sockets
const server = http.createServer(app)
initWebSockets(server)

server.listen(port, () => {
    console.log(`Bridge listening on port ${port}`)
})