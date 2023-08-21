import express, { Request, Response } from 'express';
import { ethers } from "hardhat";

import { production } from "../../config";
import { getCurrentFormattedTime, web3 } from '../utils';
import { getContractInfo } from '../../scripts/contract-utils';
import { isAuth, jwtCreateAccessToken, jwtCreateRefreshToken } from '../jwtokens';
import { User } from '../src/entity/User';
import logger from '../middleware/logger';

const router = express.Router();

router.post('/request-nonce', async (req: Request, res: Response) => {
    try {
        let uniqueIdentifier = Math.random().toString(36).substring(7);
        
        return res.status(200).json({ 
                                      message: "Success", 
                                      nonce: uniqueIdentifier,
                                      time: getCurrentFormattedTime()
                                    });
    } catch (error) {
        logger.error(error);
        return res.status(400).json({ error: error.message });
    };
  });

router.post("/authenticate", async (req: Request, res: Response) => {
    const { message, signature, address } = req.body;
    //? Verify nonce
    if ( !message || !signature || !address ) {
        return res.status(403).json({message: "Missing signature, message or address!"});
    };
    try {
        let recoveredAddress = web3.eth.accounts.recover(message, signature);
        if (recoveredAddress.toLocaleLowerCase() === address.toLocaleLowerCase()) {
            var user : User = await User.findOneBy({ address: address.toLowerCase() }) as User;
            if (!user) {
                var user : User =  User.create({
                    address: address.toLowerCase(),
                    username: address.toLowerCase(),
                    hsPassword: "",
                });
                await user.save();
            };

            res.cookie("jid", jwtCreateRefreshToken(user), {
                httpOnly: true,
                secure: production,
                sameSite: true
            }).cookie("accessToken", jwtCreateAccessToken(user), {
                httpOnly: true,
                secure: production,
                sameSite: true
            });

            return res.status(200).json({ message: "Success" });
        } else {
            return res.status(403).json({ message: "Failed!",
                                          error: "Recovered address does not equal to original address!"
                                        });
        };
    } catch(e) {
        logger.error(e);
        return res.status(403).json({ message: "Failed!", error: e.message });
    };
});

router.get('/contract-info/:address', isAuth, async (req, res) => {
    //@ts-ignore
    var userId : string = req.userId;
    if (userId) {
        const contractAddress = req.params.address;
        if (!contractAddress) return res.status(403).json({ message: "Address required!" });

        const contractInfo = await getContractInfo(contractAddress);
        return res.status(200).json(contractInfo);
    } else {
        return res.status(403).json({ message: "You're not logged in!" });
    };
});

router.post("/deploy", isAuth, async (req: Request, res: Response) => {
    //@ts-ignore
    var userId : string = req.userId;
    if (userId) {
        const { userAddress, data, hash, visibility } = req.body;
        if (!userAddress || !data || !hash || !visibility) {
            return res.status(403).json({ message: "Missing address or data or hash!" });
        };

        const DataContract = await ethers.getContractFactory('Data');
        let owner = await ethers.getSigner(userAddress);
        let dataContract = await DataContract.connect(owner).deploy(data, hash, true);

        //await dataContract.getAddress()
        return res.status(200).json({ message: "Success", contract_address: dataContract.target });
    } else {
        return res.status(403).json({ message: "You're not logged in!" });
    };
});

export { router as blockchainRouter }