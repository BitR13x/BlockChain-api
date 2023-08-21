import express, { Request, Response} from 'express';
import argon2 from "argon2";
import rateLimit from 'express-rate-limit';
import sanitizeHtml from 'sanitize-html';

import { production } from "../../config";
import { jwtCreateAccessToken, jwtCreateRefreshToken, isAuth } from "../jwtokens";
import { inputValidate } from '../inputValidation';
import { User } from '../src/entity/User';
import { MyDataSource } from '../../ormconfig';
import logger from "../middleware/logger";

const router = express.Router();
const AccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});


router.post('/login', AccountLimiter, async (req: Request, res: Response) => {
    var username: string = req.body.user;
    var password: string = req.body.password;
    if (!username || !password) {
        return res.status(403).json({message: "Missing username or password!"});
    };
  
    // verify string
    if (username.includes("@")) {
      var [ message, value ] = inputValidate({
        email: username,
        password: password,
      });
    } else {
      var [ message, value ] = inputValidate({
        username: username,
        password: password,
      });
    };


    if (message){
      return res.status(422).json({ message: message });
    } else {
      
        if (username.includes("@")){
            var user : User = await User.findOneBy({ email: value.email }) as User;
        } else {
            var user : User = await User.findOneBy({ username: value.username }) as User;
        }
        if (!user) return res.status(403).json({ message: "Wrong username or password!" });
      
      try {
          if (await argon2.verify(user.hsPassword, value.password)) {
              // password match
              //? setting tokens
              res.cookie("jid", jwtCreateRefreshToken(user), {
                httpOnly: true,
                secure: production, // false if using http
                sameSite: true
              }).cookie("accessToken", jwtCreateAccessToken(user), {
                httpOnly: true,
                secure: production,
                sameSite: true
              });
  
              return res.status(200).json({ message: "Success" });
        } else {
              return res.status(403).json({ message: "Failed" });
        };
      } catch (err) {
          // internal failure
          logger.error(err);
          return res.status(500).json({ message: "Something went wrong!"});
      };
    };
});


router.post('/register', AccountLimiter, async (req: Request, res: Response) => {
    var email: string = req.body.email;
    var username: string = req.body.user;
    var password: string = req.body.password;
    if (!username || !password ) {
      return res.status(403).json({
        message: "You must specify username, password!"
      });
    };

    if (email) {
        var [ message, value ] = inputValidate({
          username: username,
          email: email,
          password: password,
        });

        email = sanitizeHtml(value.email, { allowedTags: false,
          allowedAttributes: false, allowVulnerableTags: false });

    } else {
        var [ message, value ] = inputValidate({
          username: username,
          password: password,
        });
        email = "";
    };

    if (message) return res.status(422).json({ message: message });

    username = sanitizeHtml(value.username, { allowedTags: false,
      allowedAttributes: false, allowVulnerableTags: false });
    password = value.password;

    try {
      let userTest_email = null;
      let userTest_user = await User.findOneBy({ username: username });
      if (email) userTest_email = await User.findOneBy({ email: email });
      if (userTest_email || userTest_user) return res.status(403).json({ message: "User already exists!" });
    } catch (err) {
      logger.error(err);
    };

    try {
        const hash = await argon2.hash(password);
        User.create({
          email: email,
          username: username,
          hsPassword: hash,
        }).save();

    } catch (err) {
        logger.error(err);
        return res.status(500).json("Something went wrong!");
    };
    //? Mailjson({ jsonTo: email, username: username });
    return res.status(200).json({ message: "Success" });
});


router.post('/delete/account', isAuth, async (req: Request, res: Response) => {
    //@ts-ignore
    let userId : string = req.userId;
    if (!userId) {
        return res.status(401).json({ message: "You're not logged in!"});
    } else {
        const user : User = await User.findOneBy({id: userId});
        if (!user) {
            return res.status(404).json({message: "Account not found!"});
        } else {
            await user.remove();
            return res.status(200).json({message: "Success"});
        };
    };
});


router.post("/logout", isAuth, (req: Request, res: Response) => {
    //@ts-ignore
    let userId : string = req.userId;
    if (userId) {
        MyDataSource.getRepository(User).increment({ id: userId }, 'tokenVersion', 1).then(() => {
          return res
            .clearCookie("accessToken")
            .clearCookie("jid")
            .status(200).json({ message: "Successfully logged off" });
      })
        
    } else {
        return res.status(401).json({ message: "You're not logged in!" });
    };
});

export { router as accountRouter }
