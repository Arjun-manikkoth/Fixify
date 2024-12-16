"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const Db_1 = require("./Database/Db");
const cors_1 = __importDefault(require("cors"));
const UserRoutes_1 = __importDefault(require("./Routes/UserRoutes"));
const ProviderRoutes_1 = __importDefault(require("./Routes/ProviderRoutes"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const AdminRoutes_1 = __importDefault(require("./Routes/AdminRoutes"));
const app = (0, express_1.default)();
//Db connection
(0, Db_1.connectDB)();
// CORS configuration
const corsOptions = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorisation"],
    credentials: true, // Allow (cookies, authentication)
};
//cors middleware
app.use((0, cors_1.default)(corsOptions));
//middleware to parser cookies
app.use((0, cookie_parser_1.default)());
//parsing datas
app.use(express_1.default.urlencoded());
app.use(express_1.default.json());
//logging middleware
app.use((0, morgan_1.default)("dev"));
//user router
app.use("/users", UserRoutes_1.default);
//provider router
app.use("/providers", ProviderRoutes_1.default);
//admin routeer
app.use("/admins", AdminRoutes_1.default);
//port configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, (error) => {
    if (!error) {
        console.log("server listening at 5000");
    }
    else {
        console.log("Error occcured at server", error.message);
    }
});
