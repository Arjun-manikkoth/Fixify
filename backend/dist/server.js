"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
require("dotenv/config");
const Db_1 = require("./Database/Db");
const cors_1 = __importDefault(require("cors"));
const UserRoutes_1 = __importDefault(require("./Routes/UserRoutes"));
const ProviderRoutes_1 = __importDefault(require("./Routes/ProviderRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const AdminRoutes_1 = __importDefault(require("./Routes/AdminRoutes"));
const Socket_1 = require("./Utils/Socket");
const Socket_2 = require("./Utils/Socket");
const Logging_1 = __importDefault(require("./Middlewares/Logging"));
const app = (0, express_1.default)();
//Db connection
(0, Db_1.connectDB)();
// Create HTTP server
const server = http_1.default.createServer(app);
// Initialize Socket.IO
const io = (0, Socket_2.initializeSocket)(server);
// Initialize WebSockets
(0, Socket_1.configureSockets)(io);
// CORS configuration
const corsOptions = {
    origin: process.env.FRONT_END_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorisation"],
    credentials: true, // Allow (cookies, authentication)
};
//cors middleware
app.use((0, cors_1.default)(corsOptions));
//logging middleware
app.use(Logging_1.default);
//middleware to parser cookies
app.use((0, cookie_parser_1.default)());
//parsing datas
app.use(express_1.default.urlencoded());
app.use(express_1.default.json());
//user router
app.use("/users", UserRoutes_1.default);
//provider router
app.use("/providers", ProviderRoutes_1.default);
//admin router
app.use("/admins", AdminRoutes_1.default);
//port configuration
const PORT = process.env.PORT || 5000;
server.listen(PORT, (error) => {
    if (!error) {
        console.log("server listening at 5000");
    }
    else {
        console.log("Error occcured at server", error.message);
    }
});
