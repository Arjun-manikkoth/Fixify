"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const Db_1 = require("./Database/Db");
const cors_1 = __importDefault(require("cors"));
const UserRoute_1 = __importDefault(require("./Routes/UserRoute"));
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
(0, Db_1.connectDB)();
// CORS configuration options
const corsOptions = {
    origin: "http://localhost:3000", // Specify the allowed origin
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Specify allowed HTTP methods
    allowedHeaders: ["Content-Type"], // Specify allowed headers
    credentials: true, // Allow credentials (cookies, authentication)
};
// Apply CORS middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.urlencoded());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
//user router
app.use("/users", UserRoute_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, (error) => {
    if (!error) {
        console.log("server listening at 5000");
    }
    else {
        console.log("Error occcured at server", error.message);
    }
});
