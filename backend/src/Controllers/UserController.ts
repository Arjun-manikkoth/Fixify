import IUserService from "../Interfaces/User/UserServiceInterface";
import { Request, Response } from "express";

class UserController {
    constructor(private UserService: IUserService) {}

    // sign up if account doesnot exists and sends the corresponding success code

    async signUp(req: Request, res: Response): Promise<void> {
        try {
            const user = await this.UserService.createUser(req.body); //this function is called to check and save data to the db

            if (user?.success === true) {
                //sends for successfull sign up

                res.status(201).json({ success: true, message: user.message, data: user.email });
            } else {
                //sends this response for failed sign up

                res.status(400).json({
                    success: false,
                    message: user?.message || "Sign up failed.",
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    // login if account exists and sends the corresponding status code
    async signIn(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.UserService.authenticateUser(req.body); //this function checks and verify the credentials

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
                        name: response.name,
                        phone: response.mobileNo,
                        url: response.url,
                    });
            } else {
                console.log(response?.message);
                // Error handling based on  error messages
                switch (response?.message) {
                    case "Account doesnot exist":
                        res.status(400).json({ success: false, message: response.message });
                        break;

                    case "Invalid Credentials":
                        res.status(401).json({ success: false, message: response.message });
                        break;

                    case "Didn't complete otp verification":
                        res.status(403).json({ success: false, message: response.message });
                        break;

                    case "Please Sign in With Google":
                        res.status(403).json({ success: false, message: response.message });
                        break;

                    case "Account blocked by admin":
                        res.status(403).json({ success: false, message: response.message });
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

            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
    //verifies the otp associated with the mail id for account verification
    async otpVerify(req: Request, res: Response): Promise<void> {
        try {
            const otpStatus = await this.UserService.otpCheck(req.body.otp, req.body.email); //checks for otp and validate

            // Check the OTP verification status
            if (otpStatus.success) {
                //sends on a successfull verification

                res.status(200).json({ success: true, message: otpStatus.message });
            } else {
                // Error handling based on  error messages
                switch (otpStatus.message) {
                    case "Invalid Otp":
                        res.status(400).json({ success: false, message: otpStatus.message });
                        break;
                    case "Otp is expired":
                        res.status(410).json({ success: false, message: otpStatus.message });
                        break;
                    case "Otp error":
                        res.status(500).json({ success: false, message: otpStatus.message });
                        break;
                    default:
                        res.status(404).json({ success: false, message: "User not found" });
                        break;
                }
            }
        } catch (error: any) {
            console.error(error.message);

            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    // this function resends otp for expired otps

    async otpResend(req: Request, res: Response): Promise<void> {
        try {
            const status = await this.UserService.otpResend(req.body.email); // resends otps via mail

            if (status) {
                //sends for sucessfully mail
                res.status(200).json({ success: true, message: "Otp sent Successfully" });
            } else {
                //sends for failed otp
                res.status(500).json({
                    success: true,
                    message: "Otp Cannot be send at this moment",
                });
            }
        } catch (error: any) {
            console.error(error.message);

            res.status(500).json({ success: false, message: "Internal server error" });
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

            res.status(200).json({ success: true, message: "Signed Out Successfully" });
        } catch (error: any) {
            console.error(error.message);

            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    // function which validates the refresh token and sends an access token if required
    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const token = req.cookies.refreshToken;

            if (!token) {
                //if the cookie is deleted or expired

                res.status(401).json({ success: false, message: "Refresh Token missing" });
            } else {
                //checks  the validity of refresh token and returns access token
                const response = await this.UserService.refreshTokenCheck(token);

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
                        .json({ success: true, message: "Access token sent successfully" });
                } else {
                    res.status(401).json({ success: true, message: response.message });
                }
            }
        } catch (error: any) {
            console.error(error.message);

            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    //sign and sign in with google
    async googleAuth(req: Request, res: Response) {
        try {
            const { code } = req.query;

            const response = await this.UserService.googleAuth(code as string);

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
                        name: response.name,
                        phone: response.mobileNo,
                        url: response.url,
                        cookie: response.accessToken,
                        cookie2: response.refreshToken,
                    });
            } else {
                // Error handling based on  error messages
                switch (response?.message) {
                    case "Google Sign In failed":
                        res.status(400).json({ success: false, message: response.message });
                        break;

                    case "Account blocked by admin":
                        res.status(403).json({ success: false, message: response.message });
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

            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
    //update user profile data
    async updateProfile(req: Request, res: Response) {
        try {
            console.log(req.body);
            const status = await this.UserService.editProfile(req.body);
            if (status) {
                res.status(200).json({
                    success: true,
                    message: "Profile updated successfully",
                    data: status,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Profile updated failed",
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    //fetches and send the user profile data
    async getUser(req: Request, res: Response): Promise<void> {
        try {
            const status = await this.UserService.getUserData(req.query.id as string);

            if (status) {
                res.status(200).json({
                    success: true,
                    message: "Profile data fetched successfully",
                    data: status,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Profile fetching failed",
                    data: null,
                });
            }
        } catch (error: any) {
            console.error(error.message);

            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    // Checks email and sends OTP for verifying email for forgot password
    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const status = await this.UserService.forgotPasswordVerify(req.body.email);

            if (status.message === "Mail sent successfully") {
                res.status(200).json({
                    success: true,
                    message: "OTP email sent successfully",
                    data: status.data,
                });
            } else if (status.message === "Mail not registered") {
                res.status(404).json({
                    success: false,
                    message: "Email is not registered",
                    data: null,
                });
            } else if (status.message === "Please Sign in with your google account") {
                res.status(401).json({
                    success: false,
                    message: "Please Sign in with your google account",
                    data: null,
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Failed to verify email",
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Forgot Password Error:", error.message);

            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    //verifies the otp associated with the mail id for forgot password
    async forgotPasswordOtpVerify(req: Request, res: Response): Promise<void> {
        try {
            const otpStatus = await this.UserService.passworOtpCheck(req.body.otp, req.body.email); //checks for otp and validate

            // Check the OTP verification status
            if (otpStatus.success) {
                //sends on a successfull verification

                res.status(200).json({ success: true, message: otpStatus.message });
            } else {
                // Error handling based on  error messages
                switch (otpStatus.message) {
                    case "Invalid Otp":
                        res.status(400).json({ success: false, message: otpStatus.message });
                        break;
                    case "Otp is expired":
                        res.status(410).json({ success: false, message: otpStatus.message });
                        break;
                    case "Otp error":
                        res.status(500).json({ success: false, message: otpStatus.message });
                        break;
                    default:
                        res.status(404).json({ success: false, message: "Account not found" });
                        break;
                }
            }
        } catch (error: any) {
            console.error(error.message);

            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    //updates with new password
    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.UserService.changePassword(
                req.body.email as string,
                req.body.password as string
            );

            if (response.success) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    data: null,
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(500).json({
                success: false,
                message: "An internal server error occurred.",
                data: null,
            });
        }
    }

    //confirm the old password
    async confirmPassword(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.UserService.verifyPassword(
                req.params.id as string,
                req.body.password as string
            );

            if (response.success) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    data: null,
                });
            } else if (response.message === "Failed to verify password") {
                res.status(500).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(500).json({
                success: false,
                message: "An internal server error occurred.",
                data: null,
            });
        }
    }

    // Create a new address for the user
    async createAddress(req: Request, res: Response): Promise<void> {
        try {
            const { address } = req.body;

            if (!address) {
                res.status(400).json({
                    success: false,
                    message: "Address is required.",
                });
            }

            const status = await this.UserService.createAddress(address);
            // Specific failure messages
            const failureMessages = ["Address already added", "You can only add upto 3 addresses"];
            if (status?.success) {
                // Success response
                res.status(201).json({
                    success: true,
                    message: status.message,
                    data: null,
                });
            } else if (failureMessages.includes(status.message)) {
                res.status(400).json({
                    success: false,
                    message: status.message,
                });
            } else {
                // Fallback response for other failures
                res.status(400).json({
                    success: false,
                    message: status?.message || "Address creation failed.",
                });
            }
        } catch (error: any) {
            console.error("Error in createAddress:", error.message);

            res.status(500).json({
                success: false,
                message: "Internal server error.",
            });
        }
    }

    // get all addresses of the user
    async getAddresses(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: "User id is required.",
                });
            } else {
                const status = await this.UserService.findAddresses(userId);

                // Check if the response is successful
                if (status?.success) {
                    res.status(200).json({
                        success: true,
                        message: status.message,
                        data: status.data,
                    });
                }

                // Handle specific failure messages
                if (status?.message === "Failed to fetch addresses") {
                    res.status(500).json({
                        success: false,
                        message: status.message,
                        data: [],
                    });
                }
            }
        } catch (error: any) {
            console.error("Error in getAddresses:", error.message);

            res.status(500).json({
                success: false,
                message: "Internal server error.",
            });
        }
    }

    // delete address
    async deleteAddresses(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({
                    success: false,
                    message: "Address id is required.",
                });
            } else {
                const response = await this.UserService.changeAddressStatus(req.params.id);

                if (response) {
                    res.status(200).json({
                        success: true,
                        message: "Address deleted successfully",
                        data: null,
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        message: "Failed to delete address",
                        data: null,
                    });
                }
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // get single address of the user
    async getAddress(req: Request, res: Response): Promise<void> {
        try {
            const addressId = req.params.id;

            if (!addressId) {
                res.status(400).json({
                    success: false,
                    message: "Address Id is required.",
                });
            } else {
                const status = await this.UserService.getAddress(addressId);

                // Check if the response is successfull
                if (status?.success) {
                    // Success response with the address data
                    res.status(200).json({
                        success: true,
                        message: status.message,
                        data: status.data,
                    });
                }

                // Handle specific failure messages
                if (status?.message === "Failed to fetch address") {
                    res.status(500).json({
                        success: false,
                        message: status.message,
                        data: null,
                    });
                }
            }
        } catch (error: any) {
            console.error("Error in getAddress:", error.message);

            res.status(500).json({
                success: false,
                message: "Internal server error.",
            });
        }
    }

    // updates address for the user
    async updateAddress(req: Request, res: Response): Promise<void> {
        try {
            const { address } = req.body;
            const id = req.params.id;

            if (!address || !id) {
                res.status(400).json({
                    success: false,
                    message: "Address and id are required.",
                });
            }

            const status = await this.UserService.editAddress(address, id);

            if (status?.success) {
                // Success response
                res.status(201).json({
                    success: true,
                    message: status.message,
                    data: null,
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: status?.message || "Address creation failed.",
                });
            }
        } catch (error: any) {
            console.error("Error in createAddress:", error.message);

            res.status(500).json({
                success: false,
                message: "Internal server error.",
            });
        }
    }

    //fetch all available slots based on location
    async fetchSlots(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.UserService.getSlots({
                service_id: req.query.service_id as string,
                lat: parseFloat(req.query.lat as string),
                long: parseFloat(req.query.long as string),
                date: req.query.date as string,
                time: req.query.time as string,
            });

            if (response.success) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
            } else if (response.message === "Failed to fetch slots") {
                res.status(500).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in fetching slots:", error.message);

            res.status(500).json({
                success: false,
                message: "Internal server error.",
            });
        }
    }

    //adds booking request to book slots
    async requestSlots(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.UserService.requestBooking(req.body.data);

            if (response.success) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
                return;
            }

            switch (response.message) {
                case "Booking request exists":
                    res.status(409).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                    break;
                case "Failed to add booking request":
                    res.status(500).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                    break;
                case "Internal server error":
                    res.status(500).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                    break;
                default:
                    res.status(400).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
            }
        } catch (error: any) {
            console.error("Error in requestSlots:", error.message);
            res.status(500).json({
                success: false,
                message: "Internal server error.",
                data: null,
            });
        }
    }
}

export default UserController;
