import IProviderService from "../Interfaces/Provider/ProviderServiceInterface";
import { Request, Response } from "express";
import { HttpStatus } from "../Constants/StatusCodes";

const {
    OK,
    CREATED,
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
    GONE,
    CONFLICT,
    INTERNAL_SERVER_ERROR,
} = HttpStatus;

class ProviderController {
    constructor(private providerService: IProviderService) {}

    // Get all services
    async getAllServices(req: Request, res: Response): Promise<void> {
        try {
            const services = await this.providerService.getServices();

            res.status(OK).json({
                success: true,
                message: "services fetched sucessfully",
                data: services,
            });
        } catch (error: any) {
            console.log(error.message);

            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Sign up and sends the corresponding success code
    async signUp(req: Request, res: Response): Promise<void> {
        try {
            if (
                !req.body.email ||
                !req.body.password ||
                !req.body.userName ||
                !req.body.mobileNo ||
                !req.body.service_id
            ) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Email,password,username,mobile no and service id are required feilds",
                    data: null,
                });
                return;
            }

            const provider = await this.providerService.createProvider(req.body); // This function is called to check and save data to the db

            if (provider?.success === true) {
                // Sends for successful sign up
                res.status(CREATED).json({
                    success: true,
                    message: provider.message,
                    data: provider.email,
                });
            } else {
                // Sends this response for failed sign up
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: provider?.message || "Sign up failed",
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Login and sends the corresponding status code
    async signIn(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.password) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Email,password are required feilds",
                    data: null,
                });
                return;
            }

            const response = await this.providerService.authenticateProvider(req.body); // This function checks and verifies the credentials

            if (response?.success && response?.accessToken && response?.refreshToken) {
                // Sends user data, access, and refresh token in cookie after a successful sign-in
                res.status(OK)
                    .cookie("accessToken", response.accessToken, {
                        httpOnly: true,
                        secure: false,
                        maxAge: process.env.MAX_AGE_ACCESS_COOKIE
                            ? parseInt(process.env.MAX_AGE_ACCESS_COOKIE)
                            : 15 * 60 * 1000, // 15 minutes
                    })
                    .cookie("refreshToken", response.refreshToken, {
                        httpOnly: true,
                        secure: false,
                        maxAge: process.env.MAX_AGE_REFRESH_COOKIE
                            ? parseInt(process.env.MAX_AGE_REFRESH_COOKIE)
                            : 7 * 24 * 60 * 60 * 1000, // 7 days
                    })
                    .json({
                        success: true,
                        message: response.message,
                        data: {
                            email: response.email,
                            id: response._id,
                            url: response.url,
                            service_id: response.service_id,
                            name: response.name,
                            phone: response.mobileNo,
                        },
                    });
            } else {
                // Error handling based on error messages
                switch (response?.message) {
                    case "Account does not exist":
                        res.status(BAD_REQUEST).json({
                            success: false,
                            message: response.message,
                            data: null,
                        });
                        break;
                    case "Invalid Credentials":
                        res.status(UNAUTHORIZED).json({
                            success: false,
                            message: response.message,
                            data: null,
                        });
                        break;
                    case "Didn't complete otp verification":
                        res.status(FORBIDDEN).json({
                            success: false,
                            message: response.message,
                            data: null,
                        });
                        break;
                    case "Please Sign in With Google":
                        res.status(UNAUTHORIZED).json({
                            success: false,
                            message: response.message,
                            data: null,
                        });
                        break;
                    case "Account blocked by admin":
                        res.status(FORBIDDEN).json({
                            success: false,
                            message: response.message,
                            data: null,
                        });
                        break;
                    default:
                        res.status(INTERNAL_SERVER_ERROR).json({
                            success: false,
                            message: "Internal server error",
                            data: null,
                        });
                        break;
                }
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Verify OTP
    async otpVerify(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.otp) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Email,otp are required feilds",
                    data: null,
                });
                return;
            }

            const otpStatus = await this.providerService.otpCheck(req.body.otp, req.body.email); // Checks for OTP and validates

            if (otpStatus.success) {
                // Sends on a successful verification
                res.status(OK).json({ success: true, message: otpStatus.message, data: null });
            } else {
                // Error handling based on error messages
                switch (otpStatus.message) {
                    case "Invalid Otp":
                        res.status(BAD_REQUEST).json({
                            success: false,
                            message: otpStatus.message,
                            data: null,
                        });
                        break;
                    case "Otp is expired":
                        res.status(GONE).json({
                            success: false,
                            message: otpStatus.message,
                            data: null,
                        });
                        break;
                    case "Otp error":
                        res.status(INTERNAL_SERVER_ERROR).json({
                            success: false,
                            message: otpStatus.message,
                            data: null,
                        });
                        break;
                    default:
                        res.status(NOT_FOUND).json({
                            success: false,
                            message: "Provider not found",
                            data: null,
                        });
                        break;
                }
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Resend OTP for expired OTPs
    async otpResend(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Email is a required feild",
                    data: null,
                });
                return;
            }
            const status = await this.providerService.otpResend(req.body.email); // Resends OTPs via mail

            if (status) {
                // Sends for successfully sent mail
                res.status(OK).json({
                    success: true,
                    message: "Otp sent Successfully",
                    data: null,
                });
            } else {
                // Sends for failed OTP
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: true,
                    message: "Otp Cannot be send at this moment",
                    data: null,
                });
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Sign out function which clears the cookie
    async signOut(req: Request, res: Response): Promise<void> {
        try {
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: false,
            });

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: false,
            });

            res.status(OK).json({ success: true, message: "Signed Out Successfully", data: null });
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Validate refresh token and send access token if required
    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const token = req.cookies.refreshToken;

            if (!token) {
                // If the cookie is deleted or expired
                res.status(UNAUTHORIZED).json({
                    success: false,
                    message: "Refresh Token missing",
                    data: null,
                });
            } else {
                // Checks the validity of refresh token and returns access token
                const response = await this.providerService.refreshTokenCheck(token);

                if (response.accessToken) {
                    // Sends the token via cookie for successful refresh token
                    res.status(OK)
                        .cookie("accessToken", response.accessToken, {
                            httpOnly: true,
                            secure: false,
                            maxAge: process.env.MAX_AGE_ACCESS_COOKIE
                                ? parseInt(process.env.MAX_AGE_ACCESS_COOKIE)
                                : 15 * 60 * 1000, // 15 minutes
                        })
                        .json({
                            success: true,
                            message: "Access token sent successfully",
                            data: null,
                        });
                } else {
                    res.status(UNAUTHORIZED).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                }
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Google sign-in and sign-up route
    async googleAuth(req: Request, res: Response) {
        try {
            if (!req.query.code) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Google signin code is required feild",
                    data: null,
                });
                return;
            }
            const { code } = req.query;

            const response = await this.providerService.googleAuth(code as string);

            if (response?.success && response?.accessToken && response?.refreshToken) {
                // Sends user data, access, and refresh token in cookie after a successful sign-in
                res.status(OK)
                    .cookie("accessToken", response.accessToken, {
                        httpOnly: true,
                        secure: false,
                        maxAge: process.env.MAX_AGE_ACCESS_COOKIE
                            ? parseInt(process.env.MAX_AGE_ACCESS_COOKIE)
                            : 15 * 60 * 1000, // 15 minutes
                    })
                    .cookie("refreshToken", response.refreshToken, {
                        httpOnly: true,
                        secure: false,
                        maxAge: process.env.MAX_AGE_REFRESH_COOKIE
                            ? parseInt(process.env.MAX_AGE_REFRESH_COOKIE)
                            : 7 * 24 * 60 * 60 * 1000, // 7 days
                    })
                    .json({
                        success: true,
                        message: response.message,
                        data: {
                            email: response.email,
                            id: response._id,
                            url: response.url,
                            name: response.name,
                            phone: response.mobileNo,
                        },
                    });
            } else {
                // Error handling based on error messages
                switch (response?.message) {
                    case "Google Sign In failed":
                        res.status(BAD_REQUEST).json({
                            success: false,
                            message: response.message,
                            data: null,
                        });
                        break;
                    case "Account blocked by admin":
                        res.status(UNAUTHORIZED).json({
                            success: false,
                            message: response.message,
                            data: null,
                        });
                        break;
                    default:
                        res.status(INTERNAL_SERVER_ERROR).json({
                            success: false,
                            message: "Internal server error",
                            data: null,
                        });
                        break;
                }
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Update provider profile data
    async updateProfile(req: Request, res: Response) {
        try {
            if (!req.body.userName || !req.body.mobileNo || !req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Name,mobile no and id are required feilds",
                    data: null,
                });
                return;
            }

            let image = null;

            if (req.file) {
                image = req.file;
            }

            const status = await this.providerService.editProfile(
                { ...req.body, id: req.params.id },
                image
            );

            if (status) {
                res.status(OK).json({
                    success: true,
                    message: "Profile updated successfully",
                    data: status,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "Profile updated failed",
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Fetch provider profile data
    async fetchProfile(req: Request, res: Response) {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id is a required feild",
                    data: null,
                });
                return;
            }
            const status = await this.providerService.getProfileData(req.params.id as string);

            res.status(OK).json({
                success: true,
                message: "Profile fetched successfully",
                data: status,
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Register provider data
    async registerProfile(req: Request, res: Response) {
        try {
            if (
                !req.params.id ||
                !req.body.description ||
                !req.body.expertise_id ||
                !req.body.aadharImage ||
                !req.body.workImages
            ) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message:
                        "provider ID , description, expertise ID ,aadhar Image and workImages are a required feild",
                    data: null,
                });
                return;
            }

            const response = await this.providerService.registerProvider({
                ...req.body,
                provider_id: req.params.id,
                ...(req.files as Express.Multer.File[]),
            });
            if (response.success === true) {
                res.status(OK).json({
                    success: true,
                    message: "Provider registration successfully",
                    data: "",
                });
            } else {
                switch (response?.message) {
                    case "Already requested for approval":
                        res.status(BAD_REQUEST).json({
                            success: false,
                            message: response.message,
                            data: null,
                        });
                        break;
                    default:
                        res.status(INTERNAL_SERVER_ERROR).json({
                            success: false,
                            message: "Cannot register at this moment",
                            data: null,
                        });
                        break;
                }
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Forgot password logic
    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Email is a required feild",
                    data: null,
                });
                return;
            }
            const status = await this.providerService.forgotPasswordVerify(req.body.email);

            if (status.message === "Mail sent successfully") {
                res.status(OK).json({
                    success: true,
                    message: "OTP email sent successfully",
                    data: status.data,
                });
            } else if (status.message === "Mail not registered") {
                res.status(NOT_FOUND).json({
                    success: false,
                    message: "Email is not registered",
                    data: null,
                });
            } else if (status.message === "Please Sign in with your google account") {
                res.status(UNAUTHORIZED).json({
                    success: false,
                    message: "Please Sign in with your google account",
                    data: null,
                });
            } else {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Failed to verify email",
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Forgot Password Error:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Verify OTP for forgot password
    async forgotPasswordOtpVerify(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.otp) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Email and otp are a required feilds",
                    data: null,
                });
                return;
            }

            const otpStatus = await this.providerService.passworOtpCheck(
                req.body.otp,
                req.body.email
            ); // Checks for OTP and validates

            if (otpStatus.success) {
                // Sends on a successful verification
                res.status(OK).json({ success: true, message: otpStatus.message, data: null });
            } else {
                // Error handling based on error messages
                switch (otpStatus.message) {
                    case "Invalid Otp":
                        res.status(BAD_REQUEST).json({
                            success: false,
                            message: otpStatus.message,
                            data: null,
                        });
                        break;
                    case "Otp is expired":
                        res.status(GONE).json({
                            success: false,
                            message: otpStatus.message,
                            data: null,
                        });
                        break;
                    case "Otp error":
                        res.status(INTERNAL_SERVER_ERROR).json({
                            success: false,
                            message: otpStatus.message,
                            data: null,
                        });
                        break;
                    default:
                        res.status(NOT_FOUND).json({
                            success: false,
                            message: "Account not found",
                            data: null,
                        });
                        break;
                }
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Reset password logic
    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.password) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Email and password are a required feilds",
                    data: null,
                });
                return;
            }
            const response = await this.providerService.changePassword(
                req.body.email as string,
                req.body.password as string
            );

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: response.message,
                    data: null,
                });
            } else {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "An internal server error occurred",
                data: null,
            });
        }
    }

    // Confirm old password logic
    async confirmPassword(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.body.password) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id and password are a required feilds",
                    data: null,
                });
                return;
            }
            const response = await this.providerService.verifyPassword(
                req.params.id as string,
                req.body.password as string
            );

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: response.message,
                    data: null,
                });
            } else if (response.message === "Failed to verify password") {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            } else {
                res.status(UNAUTHORIZED).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "An internal server error occurred",
                data: null,
            });
        }
    }

    // Create a schedule for the day with location
    async createSchedule(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.body.address || !req.body.date) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id,address and date are required feilds",
                    data: null,
                });
                return;
            }

            const response = await this.providerService.addSchedule(
                req.params.id,
                req.body.date,
                req.body.address
            );

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: response.message,
                    data: null,
                });
            } else if (response.message === "Failed to create schedule") {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            } else {
                res.status(FORBIDDEN).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "An internal server error occurred",
                data: null,
            });
        }
    }

    // Get schedule for a day with date
    async getSchedule(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.query.date) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id and date are required feilds",
                    data: null,
                });
                return;
            }
            const schedule = await this.providerService.getSchedule(
                req.params.id as string,
                req.query.date as string
            );
            if (schedule.success) {
                res.status(OK).json({
                    success: true,
                    message: "schedule fetched sucessfully",
                    data: schedule.data,
                });
            } else {
                res.status(
                    schedule.message === "Resource not found" ? NOT_FOUND : INTERNAL_SERVER_ERROR
                ).json({
                    success: false,
                    message: schedule.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "An internal server error occurred",
                data: null,
            });
        }
    }

    // Get all booking requests
    async getBookingRequests(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id is a required feild",
                    data: null,
                });
                return;
            }
            const requestData = await this.providerService.getAllRequests(req.params.id);

            if (requestData.success) {
                res.status(OK).json({
                    success: true,
                    message: requestData.message,
                    data: requestData.data,
                });
            } else {
                res.status(
                    requestData.message === "Failed to retrieve booking requests"
                        ? NOT_FOUND
                        : INTERNAL_SERVER_ERROR
                ).json({
                    success: false,
                    message: requestData.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "An internal server error occurred",
                data: null,
            });
        }
    }

    // Change the booking request status
    async updateBookingRequestStatus(req: Request, res: Response): Promise<void> {
        try {
            const { status } = req.body;

            if (!req.params.id || !status) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Booking request ID and status are required",
                    data: null,
                });
                return;
            }

            const requestData = await this.providerService.changeBookingRequestStatus(
                req.params.id,
                status
            );

            if (!requestData.success) {
                const statusCode =
                    requestData.message === "Booking request not found"
                        ? NOT_FOUND
                        : INTERNAL_SERVER_ERROR;
                res.status(statusCode).json({
                    success: false,
                    message: requestData.message,
                    data: null,
                });
                return;
            }

            res.status(OK).json({
                success: true,
                message: requestData.message,
                data: requestData.data,
            });
        } catch (error: any) {
            console.error("Error in updateBookingRequestStatus:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Fetch all bookings for provider with ID
    async getBookings(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.query.page) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id and page are required fields",
                    data: null,
                });
                return;
            }
            const response = await this.providerService.fetchBookings(
                req.params.id,
                Number(req.query.page)
            );

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
            } else {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in fetching booking details:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Fetch booking details for user
    async getBookingDetails(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id is a required field",
                    data: null,
                });
                return;
            }
            const response = await this.providerService.fetchBookingDetail(req.params.id as string);

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
            } else {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in fetching booking details:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Create payment request for the work
    async createPaymentRequest(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.body.amount || !req.body.method) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id,amount and payment method are required fields",
                    data: null,
                });
                return;
            }

            const response = await this.providerService.intiatePaymentRequest(
                req.params.id,
                req.body.amount,
                req.body.method
            );

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in creating payment request:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Fetch chat data
    async fetchChat(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id is a required field",
                    data: null,
                });
                return;
            }

            const response = await this.providerService.fetchChat(req.params.id);

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
            }
        } catch (error: any) {
            console.error("Error in fetching chat details:", error.message);

            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Fetch dashboard details
    async fetchDashboard(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.query.revenueBy || !req.query.hoursBy) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id,revenue filter and working hours filters are required fields",
                    data: null,
                });
                return;
            }

            const response = await this.providerService.fetchDashboard({
                provider_id: req.params.id as string,
                revenueBy: req.query.revenueBy as string,
                hoursBy: req.query.hoursBy as string,
            });

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
            }
        } catch (error: any) {
            console.error("Error in fetching chat details:", error.message);

            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // report account
    async report(req: Request, res: Response): Promise<void> {
        try {
            if (
                !req.body.reason ||
                !req.body.reported_id ||
                !req.body.reported_role ||
                !req.body.reporter_id ||
                !req.params.id
            ) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message:
                        "Reason, reportedId, reporterId, and reporterdRole are required fields",
                    data: null,
                });
                return;
            }

            const response = await this.providerService.report({
                ...req.body,
                bookingId: req.params.id,
            });

            if (response.message === "Failed report account") {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            } else if (response.message === "Already reported") {
                res.status(CONFLICT).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
            } else if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: "Reported successfully",
                    data: response.data,
                });
            } else {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Failed to report",
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in reporting account:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error.",
                data: null,
            });
        }
    }

    // fetch notifications count
    async fetchNotificationsCount(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.query.page) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "User id ,page no are required feilds",
                    data: null,
                });
                return;
            }

            const response = await this.providerService.fetchUnreadNotificationsCount(
                req.params.id
            );

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: "Fetched notification count successfully",
                    data: response.data,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "Internal server error.",
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in reporting account:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error.",
                data: null,
            });
        }
    }

    // fetch notifications
    async fetchNotifications(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.query.page) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "User id , page no are required feilds",
                    data: null,
                });
                return;
            }

            const response = await this.providerService.fetchNotifications(
                req.params.id,
                Number(req.query.page)
            );

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: "Fetched notifications successfully",
                    data: response.data,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "Internal server error.",
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in fetching notifications:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error.",
                data: null,
            });
        }
    }
}

export default ProviderController;
