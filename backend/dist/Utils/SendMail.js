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
exports.sentMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sentMail = (email, subject, body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //smtp server set up
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.TRANSPORTER_GMAIL,
                pass: process.env.TRANSPORTER_PASSWORD,
            },
        });
        const mailOptions = {
            from: process.env.TRANSPORTER_GMAIL,
            to: email,
            subject: subject,
            html: body,
        };
        yield transporter.sendMail(mailOptions);
        return true;
    }
    catch (error) {
        console.log(error.message);
        return false;
    }
});
exports.sentMail = sentMail;
