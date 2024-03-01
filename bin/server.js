"use strict";
import express from 'express';
import session from "express-session";
import helmet from 'helmet';
import 'dotenv/config';
import cors from 'cors';
import router from '../src/routes/index.js';
import db from '../src/config/db.js';
import { authMiddleWare } from '../src/middlewares/authMiddleware.js';
const app = express();

app.use(session({   
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(helmet());

app.use(cors({
    origin: '*',
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    exposedHeaders: ["X-CSRF-Token", 'date', 'content-type', 'content-length', 'connection', 'server', 'x-powered-by', 'access-control-allow-origin', 'authorization', 'x-final-url'],
    preflightContinue: false,
    credentials: true,
    optionsSuccessStatus: 204
}));

app.use(authMiddleWare);

app.use('/api', router);

process.setMaxListeners(0)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



export default app