import express, { Express } from "express";
import http from "http";
import "dotenv/config";
import { connectDB } from "./Database/Db";
import cors from "cors";
import userRoute from "./Routes/UserRoutes";
import providerRoute from "./Routes/ProviderRoutes";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import adminRoute from "./Routes/AdminRoutes";
import { Server } from "socket.io";
import configureSockets from "./Utils/Socket";

const app: Express = express();

//Db connection
connectDB();

//socket io connection
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

// Initialize WebSockets
configureSockets(io);

// CORS configuration
const corsOptions = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorisation"],
    credentials: true, // Allow (cookies, authentication)
};

//cors middleware
app.use(cors(corsOptions));

//middleware to parser cookies
app.use(cookieParser());

//parsing datas
app.use(express.urlencoded());
app.use(express.json());

//logging middleware
app.use(morgan("dev"));

//user router
app.use("/users", userRoute);

//provider router
app.use("/providers", providerRoute);

//admin routeer
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
