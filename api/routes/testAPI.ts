import express from 'express';
const router = express.Router();

router.get("/", (req, res, next) => {
    return res.send("API is working properly");
});

export { router as testAPIRouter }