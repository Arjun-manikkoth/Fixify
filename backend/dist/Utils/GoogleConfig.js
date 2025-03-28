"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oAuth2Client = void 0;
const googleapis_1 = require("googleapis");
const GOOGLE_CLIENT_ID = process.env.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.CLIENT_SECRET;
const oAuth2Client = new googleapis_1.google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, "postmessage");
exports.oAuth2Client = oAuth2Client;
