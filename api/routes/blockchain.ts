import express from 'express';
import ethSigUtil from 'eth-sig-util';
import sanitizeHtml from "sanitize-html";

import { production } from "../../config.json";
import { jwtCreateAccessToken, jwtCreateRefreshToken } from '../jwtokens';
import { User } from '../src/entity/User';

const router = express.Router();

router.get("/", async (req, res) => {
    const { userAddress, signedMessage } = req.body;

    // Verify the signed message
    const recoveredAddress = ethSigUtil.recoverPersonalSignature({
      data: signedMessage,
      sig: signedMessage,
    });

    if (recoveredAddress.toLowerCase() === userAddress.toLowerCase()) {
        try {
            var user : User = await User.findOneByOrFail({ address: userAddress.toLowerCase() }) as User;
        } catch {
            var user : User =  User.create({
                role: "user",
                address: userAddress.toLowerCase(),
                username: userAddress.toLowerCase(),
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
    
        return res.status(200).send({ message: "Success" });
    } else {
        return res.status(403).send({ message: "Failed!" });
    }

});

export { router as blockchainRouter }