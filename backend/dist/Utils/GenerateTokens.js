"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateTokens = (id, email, role) => {
    const accessToken = jsonwebtoken_1.default.sign({ id, email, role }, process.env.JWT_SECRET || 'arjunsrog12345', { expiresIn: '5m' });
    const refreshToken = jsonwebtoken_1.default.sign({ id, email, role }, process.env.JWT_SECRET || 'arjunsrog12345', { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
