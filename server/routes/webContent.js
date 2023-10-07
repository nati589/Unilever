import express from "express";
import { getContent, changeContent } from "../controllers/webContent.js";

const router = express.Router();

router.get('/getContent', getContent);
// router.put('/updateMember', updateMember);
// router.delete('/deleteMember', deleteMember);
router.post('/changeContent', changeContent);

export default router