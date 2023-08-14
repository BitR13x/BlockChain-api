import express, { Request, Response } from "express";
import { MyDataSource } from "./ormconfig";
import path from 'path';
import "reflect-metadata"
import cors from 'cors';
import bodyParser from "body-parser";
import helmet from "helmet";
const compression = require('compression');
const cookieParser = require("cookie-parser");
const hpp = require('hpp');

import { accountRouter } from "./api/routes/account";
import { testAPIRouter } from "./api/routes/testAPI";
import { blockchainRouter } from "./api/routes/blockchain";
const { HOST, PORT } = require('./config.json');

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

app.use("/api", accountRouter);
app.use("/api/blockchain", blockchainRouter)
app.use("/~testAPI", testAPIRouter);

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

export default app;
