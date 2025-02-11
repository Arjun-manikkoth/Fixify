import IProviderService from "../Interfaces/Provider/ProviderServiceInterface";
import { Request, Response } from "express";

class ProviderController {
    constructor(private providerService: IProviderService) {}

    //get all services
    async getAllServices(req: Request, res: Response): Promise<void> {
        try {
            const services = await this.providerService.getServices();

            res.status(200).json({
                success: true,
                message: "services fetched sucessfully",
                data: services,
            });
        } catch (error: any) {
            console.log(error.message);
        }
    }

    // sign up and sends the corresponding success code
    async signUp(req: Request, res: Response): Promise<void> {
        try {
            const provider = await this.providerService.createProvider(req.body); //this function is called to check and save data to the db

            if (provider?.success === true) {
                //sends for successfull sign up

                res.status(201).json({
                    success: true,
                    message: provider.message,
                    data: provider.email,
                });
            } else {
                //sends this response for failed sign up

                res.status(400).json({
                    success: false,
                    message: provider?.message || "Sign up failed.",
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    // login and sends the corresponding status code
    async signIn(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.providerService.authenticateProvider(req.body); //this function checks and verify the credentials

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
                        url: response.url,
                        service_id: response.service_id,
                        name: response.name,
                        phone: response.mobileNo,
                    });
            } else {
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
                        res.status(401).json({ success: false, message: response.message });
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

    async otpVerify(req: Request, res: Response): Promise<void> {
        try {
            const otpStatus = await this.providerService.otpCheck(req.body.otp, req.body.email); //checks for otp and validate

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
                        res.status(404).json({ success: false, message: "Provider not found" });
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
            const status = await this.providerService.otpResend(req.body.email); // resends otps via mail

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
            console.log("call reached at controller refresh token");
            const token = req.cookies.refreshToken;

            if (!token) {
                //if the cookie is deleted or expired

                res.status(401).json({ success: false, message: "Refresh Token missing" });
            } else {
                //checks  the validity of refresh token and returns access token
                const response = await this.providerService.refreshTokenCheck(token);

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
    //google sign in and sign up route
    async googleAuth(req: Request, res: Response) {
        try {
            const { code } = req.query;

            const response = await this.providerService.googleAuth(code as string);

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
                        url: response.url,
                        name: response.name,
                        phone: response.mobileNo,
                    });
            } else {
                // Error handling based on  error messages
                switch (response?.message) {
                    case "Google Sign In failed":
                        res.status(400).json({ success: false, message: response.message });
                        break;

                    case "Account blocked by admin":
                        res.status(401).json({ success: false, message: response.message });
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
    //update provider profile data
    async updateProfile(req: Request, res: Response) {
        try {
            console.log(req.body);
            const status = await this.providerService.editProfile(req.body);
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
    //fetch provider profile data
    async fetchProfile(req: Request, res: Response) {
        try {
            const status = await this.providerService.getProfileData(req.query.id as string);

            res.status(200).json({
                success: true,
                message: "Data fetched successfully",
                data: status,
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
    //register provider data
    async registerProfile(req: Request, res: Response) {
        try {
            const response = await this.providerService.registerProvider(req.body);
            if (response.success === true) {
                res.status(200).json({
                    success: true,
                    message: "Provider registration successfully",
                    data: "",
                });
            } else {
                switch (response?.message) {
                    case "Already requested for approval":
                        res.status(400).json({ success: false, message: response.message });
                        break;

                    default:
                        res.status(500).json({
                            success: false,
                            message: "Cannot register at this moment",
                        });
                        break;
                }
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    // Checks email and sends OTP for verifying email for forgot password
    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const status = await this.providerService.forgotPasswordVerify(req.body.email);

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
            const otpStatus = await this.providerService.passworOtpCheck(
                req.body.otp,
                req.body.email
            ); //checks for otp and validate

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
            const response = await this.providerService.changePassword(
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
            const response = await this.providerService.verifyPassword(
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

    //creates a schedule for the day with locacation
    async createSchedule(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.providerService.addSchedule(
                req.body.id,
                req.body.date,
                req.body.address
            );

            if (response.success) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    data: null,
                });
            } else if (response.message === "Failed to create schedule") {
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

    //get schedule for a day with date
    async getSchedule(req: Request, res: Response): Promise<void> {
        try {
            const schedule = await this.providerService.getSchedule(
                req.query.id as string,
                req.query.date as string
            );
            if (schedule.success) {
                res.status(200).json({
                    success: true,
                    message: "schedule fetched sucessfully",
                    data: schedule.data,
                });
            } else {
                res.status(schedule.message === "Resource not found" ? 404 : 500).json({
                    success: false,
                    message: schedule.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
        }
    }

    //get all booking requests
    async getBookingRequests(req: Request, res: Response): Promise<void> {
        try {
            const requestData = await this.providerService.getAllRequests(req.query.id as string);

            if (requestData.success) {
                res.status(200).json({
                    success: true,
                    message: requestData.message,
                    data: requestData.data,
                });
            } else {
                res.status(
                    requestData.message === "Failed to retrieve booking requests" ? 404 : 500
                ).json({
                    success: false,
                    message: requestData.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
        }
    }

    //change the booking requests status
    async updateBookingRequestStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id, status } = req.body;

            if (!id || !status) {
                res.status(400).json({
                    success: false,
                    message: "Booking request ID and status are required",
                    data: null,
                });
                return;
            }

            const requestData = await this.providerService.changeBookingRequestStatus(id, status);

            if (!requestData.success) {
                const statusCode = requestData.message === "Booking request not found" ? 404 : 500;
                res.status(statusCode).json({
                    success: false,
                    message: requestData.message,
                    data: null,
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: requestData.message,
                data: requestData.data,
            });
        } catch (error: any) {
            console.error("Error in updateBookingRequestStatus:", error.message);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    //fetch all bookings for provider with id
    async getBookings(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.providerService.fetchBookings(
                req.query.id as string,
                Number(req.query.page)
            );

            if (response.success) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
                return;
            } else {
                res.status(400).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in fetching booking details:", error.message);
            res.status(500).json({
                success: false,
                message: "Internal server error.",
                data: null,
            });
        }
    }

    //fetch bookings details for user
    async getBookingDetails(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.providerService.fetchBookingDetail(req.query.id as string);

            if (response.success) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
                return;
            } else {
                res.status(400).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in fetching booking details:", error.message);
            res.status(500).json({
                success: false,
                message: "Internal server error.",
                data: null,
            });
        }
    }

    //create payment request for the work
    async createPaymentRequest(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.providerService.intiatePaymentRequest(
                req.body.id,
                req.body.amount,
                req.body.method
            );

            if (response.success) {
                res.status(200).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
                return;
            } else {
                res.status(400).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in creating payment request:", error.message);
            res.status(500).json({
                success: false,
                message: "Internal server error.",
                data: null,
            });
        }
    }
}
export default ProviderController;
