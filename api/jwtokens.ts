import { Request, Response, NextFunction } from "express";
import { verify, sign } from "jsonwebtoken";
import { User } from "./src/entity/User";

const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET, production } = require("./config.json");

export const jwtCreateAccessToken = (user: User) => {
    const payload = {
        userId: user.id,
        userName: user.userName,
        userRole: user.role,
    }

    return sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
};

export const jwtCreateRefreshToken = (user: User) => {
    const payload = {
        userId: user.id,
        tokenVersion: user.tokenVersion
    }

    return sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "8hr" })
};

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.jid;

    try {
        //? verifying accessToken
        if (!accessToken) {
            // throw new Error("Bad accessToken");
            return next();
        }
        var payload = verify(accessToken, ACCESS_TOKEN_SECRET);

        if (payload) {
            // @ts-ignore
            req.userId = payload.userId;
            // @ts-ignore
            req.userName = payload.userName;
            // @ts-ignore
            req.userRole = payload.userRole;

            return next();
        }

    } catch {
        //? working with refreshToken if accessToken expired
        if (!refreshToken) {
            // throw new Error("Bad refreshToken");
            return next();
        }
        try {
            payload = verify(refreshToken, REFRESH_TOKEN_SECRET);
            //@ts-ignore
            User.findOne({ id: payload.userId }).then(user => {
                // throw new Error("Wrong refreshToken");
                if (!user) return next();
    
                if (user.tokenVersion !== payload.tokenVersion) {
                    // throw new Error("Wrong tokenVersion");
                    return next();;
                }
    
                // @ts-ignore
                req.userId = user.id;
                // @ts-ignore
                req.userName = user.userName;
                // @ts-ignore
                req.userRole = user.role;
    
                res.cookie("accessToken", jwtCreateAccessToken(user), {
                    httpOnly: true,
                    secure: production,
                    sameSite: true
                });
    
                return next()
            });
    
        } catch {
            return next()            
        }

    } 
    // finally {
    //     if (!payload) {
    //         return res.status(401);
    //     } else {
    //         return res.status(200);
    //     }
    // }
};
