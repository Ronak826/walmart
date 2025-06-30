"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const driverController_1 = require("../controllers/driverController");
const router = express_1.default.Router();
router.get("/details/:id", driverController_1.GetHelpCount);
router.put("/details/:id", driverController_1.update);
router.get("/", driverController_1.GetDrivers);
exports.default = router;
