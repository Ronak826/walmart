import express from "express";
import { AcceptHelpRequest, CreateHelp, GetAllPendingHelps, ResolveHelpRequest } from "../controllers/helpController";

const router = express.Router();

router.post("/help-request", CreateHelp);
router.get("/help-requests", GetAllPendingHelps);
router.put("/help-request/:id/accept", AcceptHelpRequest);
router.put("/help-request/:id/resolve", ResolveHelpRequest);

export default router;
