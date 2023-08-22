import express, { Request, Response, NextFunction } from 'express';
import argon2 from "argon2";

import { inputValidate } from '../inputValidation';
import { User } from '../src/entity/User';
import { web3 } from '../utils';
import { isAuth } from '../jwtokens';
import logger from '../middleware/logger';

const router = express.Router();


router.post("/change-password", isAuth, async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    let userId : string = req.userId;
    if (userId) {
        let newPassword = req.body.newPassword;
        let oldPassword = req.body.oldPassword;
        if (!oldPassword || !newPassword) return res.status(403).json({message: "Missing new password or old password!"});
        let user = await User.findOneBy({id: userId});
        if (!user) return res.status(404).json({message: "User not found!"});

        try {
            if (!user.hsPassword) {
                user.hsPassword = await argon2.hash(newPassword);
                return res.status(200).json({message: "Success"});
            };

            if (await argon2.verify(user.hsPassword, oldPassword)) {
                user.hsPassword = await argon2.hash(newPassword);
                await user.save();
                return res.status(200).json({message: "Success"});
            } else {
                return res.status(403).json({message: "Password does not match original!"});
            };
        } catch (e) {
            logger.error(e);
            return res.status(500).json({message: "Internal error!"});
        };

    } else {
        return res.status(200).json({message: "You are not logged in!"});
    };
});


router.post("/change-username", isAuth, async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    let userId : string = req.userId;
    if (userId) {
        let user = await User.findOneBy({id: userId});
        if (!user) return res.status(404).json({message: "User not found!"});
        let username = req.body.username;
        if (!username) return res.status(403).json({message: "Missing username!"});
        // check if valid username
        let [ message, value ] = inputValidate({ username: username});
        if (message) return res.status(422).json({ message: message });

        if (await User.findOneBy({username: value.username})) {
            return res.status(403).json({message: "User already exists with this username!"}); 
        };

        user.username = value.username;
        await user.save();

        return res.status(200).json({message: "Success"});

    } else {
        return res.status(200).json({message: "You are not logged in!"});
    };
});


router.post("/change-address", isAuth, async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    let userId : string = req.userId;
    if (userId) {
        let user = await User.findOneBy({id: userId});
        if (!user) return res.status(404).json({message: "User not found!"});
        
        // check if valid address
        const { message, signature, address } = req.body;
        if ( !message || !signature || !address ) {
            return res.status(403).json({message: "Missing signature, message or address!"});
        };
        let recoveredAddress = web3.eth.accounts.recover(message, signature);
        if (recoveredAddress.toLocaleLowerCase() === address.toLocaleLowerCase()) {
            if (await User.findOneBy({address: address.toLocaleLowerCase()})) {
                return res.status(403).json({message: "User already exists with this username!"}); 
            };

            user.address = address;
            await user.save();

            return res.status(200).json({message: "Success"});
        } else {
            return res.status(403).json({ message: "Failed!",
                                          error: "Recovered address does not equal to original address!"
                                        });
        };

    } else {
        return res.status(200).json({message: "You are not logged in!"});
    };
});


export { router as ProfileRouter }