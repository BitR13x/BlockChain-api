import express from 'express';
import argon2 from "argon2";
import rateLimit from 'express-rate-limit';
import sanitizeHtml from 'sanitize-html';

import { production } from "../../config.json";
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


router.post('/login', AccountLimiter, async (req, res) => {
    var username: string = req.body.user;
    var password: string = req.body.password;
    if (!username || !password) return res.status(403).send({message: "Username or password don't have enough length."})

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
      return res.status(422).send({ message: message });
    } else {
      
        if (username.includes("@")){
            var user : User = await User.findOneBy({ email: value.email }) as User;
        } else {
            var user : User = await User.findOneBy({ username: value.username }) as User;
        }
        if (!user) return res.status(403).send({ message: "Wrong username or password!" });
      
      try {
          if (await argon2.verify(value.password, user.hsPassword)) {
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
  
              return res.status(200).send({ message: "Success" });
        } else {
              return res.status(403).send({ message: "Failed" });
        };
      } catch (err) {
          // internal failure
          logger.error(err);
          return res.status(500).send({ message: "Something went wrong!"});
      };
    };
});


router.post('/register', AccountLimiter, async (req, res) => {
    var email: string = req.body.email;
    var username: string = req.body.user;
    var password: string = req.body.password;
    if (!username || !password ) return res.status(401).send({message: "You must specify username, password!"});

    if (email) {
      var [ message, value ] = inputValidate({
        username: username,
        email: email,
        password: password,
      });

      email = sanitizeHtml(value.email, { allowedTags: false,
        allowedAttributes: false });

    } else {
      var [ message, value ] = inputValidate({
        username: username,
        password: password,
      });
      email = "";
    }

    if (message) return res.status(422).send({ message: message });

    username = sanitizeHtml(value.username, { allowedTags: false,
      allowedAttributes: false });
    password = value.password;

    try {
      let userTest_user = await User.findOneBy({ username: username });
      let userTest_email = await User.findOneBy({ email: email });
      if (userTest_email || userTest_user) return res.status(403).send({ message: "User already exists!" });
    } catch (err) {
      logger.error(err);
    };

    try {
        const hash = await argon2.hash(password);
        User.create({
          role: "user",
          email: email,
          username: username,
          hsPassword: hash,
        }).save();

    } catch (err) {
        logger.error(err);
        return res.status(500).send("Something went wrong!");
    };
    //? MailSend({ sendTo: email, username: username });
    return res.status(200).send({ message: "Success" });
});


router.post('/delete/account', isAuth, async (req, res) => {
  //@ts-ignore
  let userId : number = req.userId;
  if (!userId) {
      return res.status(401).send({ message: "You're not logged in!"});
  } else {
      const user : User = await User.findOneBy({id: userId});
      if (!user) {
          return res.status(404).send({message: "Account not found!"});
      } else {
          await user.remove();
          return res.status(200).send({message: "Success"});
      };
  };
});


router.post("/logout", isAuth, (req, res) => {
  //@ts-ignore
  let userId = req.userId;
  if (!userId) {
      return res.status(401).send({ message: "You're not logged in!" });
  } else {
      MyDataSource.getRepository(User).increment({ id: userId }, 'tokenVersion', 1).then(() => {
        return res
          .clearCookie("accessToken")
          .clearCookie("jid")
          .status(200).send({ message: "Successfully logged off" });
      })
  }
});

export { router as accountRouter }
