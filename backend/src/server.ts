import express, { Express } from "express";
import http from "http";
import "dotenv/config";
import { connectDB } from "./Database/Db";
import cors from "cors";
import userRoute from "./Routes/UserRoutes";
import providerRoute from "./Routes/ProviderRoutes";
import cookieParser from "cookie-parser";
import adminRoute from "./Routes/AdminRoutes";
import { configureSockets } from "./Utils/Socket";
import { initializeSocket } from "./Utils/Socket";
import loggingMiddleware from "./Middlewares/Logging";

const app: Express = express();

//Db connection
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Initialize WebSockets
configureSockets(io);

// CORS configuration
const corsOptions = {
    origin: process.env.FRONT_END_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorisation"],
    credentials: true, // Allow (cookies, authentication)
};

//cors middleware
app.use(cors(corsOptions));

//logging middleware
app.use(loggingMiddleware);

//middleware to parser cookies
app.use(cookieParser());

//parsing datas
app.use(express.urlencoded());
app.use(express.json());

//user router
app.use("/users", userRoute);

//provider router
app.use("/providers", providerRoute);

//admin router
app.use("/admins", adminRoute);

//port configuration
const PORT: number | string = process.env.PORT || 5000;

server.listen(PORT, (error?: Error) => {
    if (!error) {
        console.log("server listening at 5000");
    } else {
        console.log("Error occcured at server", error.message);
    }
});
