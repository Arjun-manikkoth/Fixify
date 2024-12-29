// checkBlockedStatus.ts
import {Request, Response, NextFunction} from "express";
import UserRepository from "../Repositories/UserRepository";
import ProviderRepository from "../Repositories/ProviderRepository";

//create a user repository instance
const userRepository = new UserRepository();
//create a provider repository instance
const providerRepository = new ProviderRepository();

//middleware to check the block status of user and provider
const checkBlockedStatus = async (req: Request, res: Response, next: NextFunction) => {
     try {
          const id = req.data?.id;
          const role = req.data?.role;

          if (role === "user") {
               const userData = await userRepository.getUserDataWithId(id);

               if (userData?.is_blocked) {
                    res.status(401).json({message: "Blocked by admin", status: false});
               } else {
                    next();
               }
          } else if (role === "provider") {
               const providerData = await providerRepository.getProviderDataWithId(id);
               if (providerData?.is_blocked) {
                    res.status(401).json({message: "Blocked by admin", status: false});
               } else {
                    next();
               }
          }
     } catch (error) {
          res.status(500).json({message: "Internal server error", status: false});
     }
};

export default checkBlockedStatus;
