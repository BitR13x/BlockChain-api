import { Request, Response, NextFunction } from "express";
import { verify, sign } from "jsonwebtoken";
import { User } from "./src/entity/User";

import { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET, production } from "../config";

export const jwtCreateAccessToken = (user: User) => {
    const payload = {
        userId: user.id,
        username: user.username,
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
    const accessToken: string = req.cookies.accessToken;
    const refreshToken: string = req.cookies.jid;

    try {
        //? verifying accessToken
        if (!accessToken) {
            // throw new Error("Bad accessToken");
            return next();
        };
        var payload = verify(accessToken, ACCESS_TOKEN_SECRET);

        if (payload) {
            // @ts-ignore
            req.userId = payload.userId;
            // @ts-ignore
            req.username = payload.username;
            // @ts-ignore
            req.userRole = payload.userRole;

            return next();
        };

    } catch {
        //? working with refreshToken if accessToken expired
        if (!refreshToken) {
            // throw new Error("Bad refreshToken");
            return next();
        }
        try {
            payload = verify(refreshToken, REFRESH_TOKEN_SECRET);
            User.findOneBy({ id: payload.userId }).then(user => {
                // throw new Error("Wrong refreshToken");
                if (!user) return next();
    
                if (user.tokenVersion !== payload.tokenVersion) {
                    // throw new Error("Wrong tokenVersion");
                    return next();
                };
    
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
    
                return next();
            });
    
        } catch {
            // throw new Error("Wrong refreshToken");
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
