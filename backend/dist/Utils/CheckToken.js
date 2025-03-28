"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Await the token verification and decode it
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "secret");
        return {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            message: 'Refresh Token valid'
        };
    }
    catch (error) {
        // Handle different types of errors
        if (error.name === 'TokenExpiredError') {
            return {
                id: null,
                email: null,
                role: null,
                message: 'Refresh Token expired'
            };
        }
        else if (error.name === 'JsonWebTokenError') {
            return {
                id: null,
                email: null,
                role: null,
                message: 'Refresh Token invalid'
            };
        }
        else {
            return {
                id: null,
                email: null,
                role: null,
                message: 'Refresh Token verification failed'
            };
        }
    }
});
exports.verifyToken = verifyToken;
