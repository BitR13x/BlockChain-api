import express, { Request, Response } from "express";
import { MyDataSource } from "./ormconfig";
import path from 'path';
import "reflect-metadata"
import cors from 'cors';
import bodyParser from "body-parser";
import helmet from "helmet";
import Moralis from "moralis";
const compression = require('compression');
const cookieParser = require("cookie-parser");
const hpp = require('hpp');

import { accountRouter } from "./api/routes/account";
import { testAPIRouter } from "./api/routes/testAPI";
import { blockchainRouter } from "./api/routes/blockchain";
import { HOST, PORT, MORALIS_API_KEY } from './config';
import { ProfileRouter } from "./api/routes/profile";

const app = express();

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "build")));
app.use(bodyParser.json());
app.use(
  cors({
    origin: `http://${HOST}:3000`,
    credentials: true,
  }));
app.use(helmet());
app.use(hpp());
app.use(compression());

app.use("/api", accountRouter);
app.use("/api/profile", ProfileRouter);
app.use("/api/blockchain", blockchainRouter)
app.use("/~testAPI", testAPIRouter);

//? custom 404 not found
app.get('*', (_req: Request, res: Response) => {
    return res.status(404).sendFile(path.join(__dirname, 'build/index.html'));
});

const startServer = async () => { 
    await Moralis.start({
        apiKey: MORALIS_API_KEY,
    });

    //? starting webApp
    MyDataSource.initialize().then(() => {
      app.listen(PORT, HOST, () => {
          console.log(`Web App listening at http://${HOST}:${PORT}`)
      });
    });
};

startServer()


export default app;
