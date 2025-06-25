"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helpController_1 = require("../controllers/helpController");
const router = express_1.default.Router();
router.post("/help-request", helpController_1.CreateHelp);
router.get("/help-requests", helpController_1.GetAllPendingHelps);
router.put("/help-request/:id/accept", helpController_1.AcceptHelpRequest);
router.put("/help-request/:id/resolve", helpController_1.ResolveHelpRequest);
exports.default = router;
