import express from "express"

import { GetDrivers, GetHelpCount, update } from "../controllers/driverController";

const router=express.Router()

router.get("/details/:id",GetHelpCount);

router.put("/details/:id",update);

router.get("/",GetDrivers);

export default router