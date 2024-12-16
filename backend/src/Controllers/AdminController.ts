import IAdminService from "../Interfaces/Admin/AdminServiceInterface";
import {Request, Response} from "express";

class AdminController {
     constructor(private AdminService: IAdminService) {}

     // login and sends the corresponding status code
     async signIn(req: Request, res: Response): Promise<void> {
          try {
               const response = await this.AdminService.authenticateAdmin(req.body); //this function checks and verify the credentials

               if (response?.success && response?.accessToken && response?.refreshToken) {
                    //sends user data ,access and refresh token in cookie after a sucessfull signin

                    res.status(200)
                         .cookie("accessToken", response.accessToken, {
                              httpOnly: true,
                              secure: false,
                              // sameSite: 'none',
                              maxAge: process.env.MAX_AGE_ACCESS_COOKIE
                                   ? parseInt(process.env.MAX_AGE_ACCESS_COOKIE)
                                   : 15 * 60 * 1000, // 15 minutes
                         })
                         .cookie("refreshToken", response.refreshToken, {
                              httpOnly: true,
                              secure: false,
                              //  sameSite: 'none',
                              maxAge: process.env.MAX_AGE_REFRESH_COOKIE
                                   ? parseInt(process.env.MAX_AGE_REFRESH_COOKIE)
                                   : 7 * 24 * 60 * 60 * 1000, // 7 days
                         })
                         .json({
                              success: true,
                              message: response.message,
                              email: response.email,
                              id: response._id,
                         });
               } else {
                    // Error handling based on  error messages
                    switch (response?.message) {
                         case "Account doesnot exist":
                              res.status(400).json({success: false, message: response.message});
                              break;

                         case "Invalid Credentials":
                              res.status(401).json({success: false, message: response.message});
                              break;

                         case "Didn't complete otp verification":
                              res.status(403).json({success: false, message: response.message});
                              break;

                         default:
                              res.status(500).json({
                                   success: false,
                                   message: "Internal server error",
                              });
                              break;
                    }
               }
          } catch (error: any) {
               console.log(error.message);

               res.status(500).json({success: false, message: "Internal server error"});
          }
     }

     // sign out function which clears the cookie
     async signOut(req: Request, res: Response): Promise<void> {
          try {
               res.clearCookie("accessToken", {
                    httpOnly: true,
                    secure: false,
                    // sameSite: 'none',
               });

               res.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: false,
                    //  sameSite: 'none',
               });

               res.status(200).json({success: true, message: "Signed Out Successfully"});
          } catch (error: any) {
               console.error(error.message);

               res.status(500).json({success: false, message: "Internal server error"});
          }
     }

     // function which validates the refresh token and sends an access token if required
     async refreshToken(req: Request, res: Response): Promise<void> {
          try {
               console.log("call reached at controller refresh token");
               const token = req.cookies.refreshToken;

               if (!token) {
                    //if the cookie is deleted or expired

                    res.status(401).json({success: false, message: "Token missing"});
               }

               //checks  the validity of refresh token and returns access token
               const response = await this.AdminService.refreshTokenCheck(token);

               if (response.accessToken) {
                    //sends the token via cookie for successfull refresh token

                    res.status(200)
                         .cookie("accessToken", response.accessToken, {
                              httpOnly: true,
                              secure: false,
                              // sameSite: 'none',
                              maxAge: process.env.MAX_AGE_ACCESS_COOKIE
                                   ? parseInt(process.env.MAX_AGE_ACCESS_COOKIE)
                                   : 15 * 60 * 1000, // 15 minutes
                         })
                         .json({success: true, message: "Access token sent successfully"});
               } else {
                    res.status(401).json({success: true, message: response.message});
               }
          } catch (error: any) {
               console.error(error.message);

               res.status(500).json({success: false, message: "Internal server error"});
          }
     }

     //testing function for authenticated route
     async test(req: Request, res: Response): Promise<void> {
          try {
               console.log("reached at test controller");
               res.status(200).json({
                    success: true,
                    message: "inside the test controller function",
               });
          } catch (error: any) {
               console.error(error.message);

               res.status(500).json({success: false, message: "Internal server error"});
          }
     }
}
export default AdminController;
