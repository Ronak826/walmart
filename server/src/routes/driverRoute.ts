import express from "express"

import { GetDrivers } from "../controllers/driverController";

const router=express.Router()


router.get("/",GetDrivers);


export default router