import express, { Router, Request, Response } from "express";

const userRoute: Router = express.Router();

userRoute.post("/sign_in", (req: Request, res: Response) => {
  res.json({ msg: "all set sign in" });
});

userRoute.post("/sign_up", (req: Request, res: Response) => {
  res.json({ msg: "all set sign up" });
});

export default userRoute;
