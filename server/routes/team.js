import express from "express";
import { getMembers, addMember, updateMember ,deleteMember } from "../controllers/team.js";

const router = express.Router();

router.get('/getMembers', getMembers);
router.put('/updateMember', updateMember);
router.delete('/deleteMember', deleteMember);
router.post('/addMember', addMember);

export default router