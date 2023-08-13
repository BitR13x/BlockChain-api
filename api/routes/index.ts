import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  return res.send({message: "api is working fine" });
});

export { router as Router }
