import express, { Request, Response } from "express";
import { MyDataSource } from "./ormconfig";
import path from 'path';
import bcrypt from 'bcrypt';
import "reflect-metadata"
import cors from 'cors';
import bodyParser from "body-parser";
import helmet from "helmet";
const compression = require('compression');
const cookieParser = require("cookie-parser");
const hpp = require('hpp');

import { Router } from "./api/routes/index";
import { testAPIRouter } from "./api/routes/testAPI";
const { HOST, PORT } = require('./config.json');
import { jwtCreateAccessToken, jwtCreateRefreshToken, isAuth } from "./api/jwtokens";


const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "build")));
app.use(bodyParser.json());
app.use(
  cors({
    credentials: true,
  }));
app.use(helmet());
app.use(hpp());
app.use(compression())

app.use("/api", Router);
app.use("/~testAPI", testAPIRouter);

// catch 404 and forward to error handler

//? custom 404 not found
app.get('*', (_req: Request, res: Response) => {
    return res.status(404).sendFile(path.join(__dirname, 'build/index.html'));
});


//? starting webApp
MyDataSource.initialize().then(() => {
    app.listen(PORT, HOST, () => {
        console.log(`Web App listening at http://${HOST}:${PORT}`)
    });
})
