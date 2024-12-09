import express, { Express, Request, Response } from "express";
import "dotenv/config";
import { connectDB } from "./Database/Db";
import cors from "cors";
import userRoute from "./Routes/UserRoute";
import morgan from "morgan";

const app: Express = express();
//Db connectiongit
connectDB();

// CORS configuration options
const corsOptions = {
  origin: "http://localhost:3000", // Specify the allowed origin
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Specify allowed HTTP methods
  allowedHeaders: ["Content-Type"], // Specify allowed headers
  credentials: true, // Allow credentials (cookies, authentication)
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.urlencoded());
app.use(express.json());

app.use(morgan("dev"));
//user router
app.use("/users", userRoute);

const PORT: number | string = process.env.PORT || 5000;

app.listen(PORT, (error?: Error) => {
  if (!error) {
    console.log("server listening at 5000");
  } else {
    console.log("Error occcured at server", error.message);
  }
});
