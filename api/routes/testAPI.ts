import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    return res.send({message: "API is working properly"});
});

export { router as testAPIRouter }