"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRoute = express_1.default.Router();
userRoute.post("/sign_in", (req, res) => {
    res.json({ msg: "all set sign in" });
});
userRoute.post("/sign_up", (req, res) => {
    res.json({ msg: "all set sign up" });
});
exports.default = userRoute;
