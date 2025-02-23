import IUserService from "../Interfaces/User/UserServiceInterface";
import { Request, Response } from "express";
import { HttpStatus } from "../Constants/StatusCodes";

const {
    OK,
    CREATED,
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
    CONFLICT,
    GONE,
    INTERNAL_SERVER_ERROR,
} = HttpStatus;

class UserController {
    constructor(private UserService: IUserService) {}

    // Sign up if account does not exist and sends the corresponding success code
    async signUp(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.password || !req.body.userName || !req.body.mobileNo) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Email, password, username, and mobile number are required fields",
                });
                return;
            }

            const user = await this.UserService.createUser(req.body);

            if (user?.success === true) {
                res.status(CREATED).json({
                    success: true,
                    message: user.message,
                    data: user.email,
                });
            } else {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: user?.message || "Sign up failed",
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Login if account exists and sends the corresponding status code
    async signIn(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.password) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Email and password are required fields",
                });
                return;
            }

            const response = await this.UserService.authenticateUser(req.body);

            if (response?.success && response?.accessToken && response?.refreshToken) {
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
                        email: response.email,
                        id: response._id,
                        name: response.name,
                        phone: response.mobileNo,
                        url: response.url,
                    });
            } else {
                switch (response?.message) {
                    case "Account does not exist":
                        res.status(NOT_FOUND).json({ success: false, message: response.message });
                        break;
                    case "Invalid Credentials":
                        res.status(UNAUTHORIZED).json({
                            success: false,
                            message: response.message,
                        });
                        break;
                    case "Didn't complete OTP verification":
                    case "Please Sign in With Google":
                    case "Account blocked by admin":
                        res.status(FORBIDDEN).json({ success: false, message: response.message });
                        break;
                    default:
                        res.status(INTERNAL_SERVER_ERROR).json({
                            success: false,
                            message: "Internal server error",
                        });
                        break;
                }
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Verify OTP for account verification
    async otpVerify(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.otp) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Email and OTP are required fields",
                });
                return;
            }

            const otpStatus = await this.UserService.otpCheck(req.body.otp, req.body.email);

            if (otpStatus.success) {
                res.status(OK).json({ success: true, message: otpStatus.message });
            } else {
                switch (otpStatus.message) {
                    case "Invalid OTP":
                        res.status(BAD_REQUEST).json({
                            success: false,
                            message: otpStatus.message,
                        });
                        break;
                    case "OTP is expired":
                        res.status(GONE).json({ success: false, message: otpStatus.message });
                        break;
                    case "OTP error":
                        res.status(INTERNAL_SERVER_ERROR).json({
                            success: false,
                            message: otpStatus.message,
                        });
                        break;
                    default:
                        res.status(NOT_FOUND).json({ success: false, message: "User not found" });
                        break;
                }
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Resend OTP for expired OTPs
    async otpResend(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Email is a required field",
                });
                return;
            }

            const status = await this.UserService.otpResend(req.body.email);

            if (status) {
                res.status(OK).json({ success: true, message: "OTP sent successfully" });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "OTP cannot be sent at this moment",
                });
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Sign out by clearing cookies
    async signOut(req: Request, res: Response): Promise<void> {
        try {
            res.clearCookie("accessToken", { httpOnly: true, secure: false });
            res.clearCookie("refreshToken", { httpOnly: true, secure: false });

            res.status(OK).json({ success: true, message: "Signed out successfully" });
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Refresh token logic
    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const token = req.cookies.refreshToken;

            if (!token) {
                res.status(UNAUTHORIZED).json({
                    success: false,
                    message: "Refresh token missing",
                });
                return;
            }

            const response = await this.UserService.refreshTokenCheck(token);

            if (response.accessToken) {
                res.status(OK)
                    .cookie("accessToken", response.accessToken, {
                        httpOnly: true,
                        secure: false,
                        maxAge: process.env.MAX_AGE_ACCESS_COOKIE
                            ? parseInt(process.env.MAX_AGE_ACCESS_COOKIE)
                            : 15 * 60 * 1000, // 15 minutes
                    })
                    .json({ success: true, message: "Access token sent successfully" });
            } else {
                res.status(UNAUTHORIZED).json({ success: false, message: response.message });
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Google authentication logic
    async googleAuth(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.code) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Google sign-in code is required",
                });
                return;
            }

            const { code } = req.query;
            const response = await this.UserService.googleAuth(code as string);

            if (response?.success && response?.accessToken && response?.refreshToken) {
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
                        email: response.email,
                        id: response._id,
                        name: response.name,
                        phone: response.mobileNo,
                        url: response.url,
                        cookie: response.accessToken,
                        cookie2: response.refreshToken,
                    });
            } else {
                switch (response?.message) {
                    case "Google Sign In failed":
                        res.status(BAD_REQUEST).json({ success: false, message: response.message });
                        break;
                    case "Account blocked by admin":
                        res.status(FORBIDDEN).json({ success: false, message: response.message });
                        break;
                    default:
                        res.status(INTERNAL_SERVER_ERROR).json({
                            success: false,
                            message: "Internal server error",
                        });
                        break;
                }
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Update user profile data
    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.userName || !req.body.mobileNo || !req.body.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Name, mobile number, and ID are required fields",
                });
                return;
            }

            const status = await this.UserService.editProfile(req.body);

            if (status) {
                res.status(OK).json({
                    success: true,
                    message: "Profile updated successfully",
                    data: status,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "Profile update failed",
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Fetch user profile data
    async getUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "ID is a required field",
                });
                return;
            }

            const status = await this.UserService.getUserData(req.query.id as string);

            if (status) {
                res.status(OK).json({
                    success: true,
                    message: "Profile data fetched successfully",
                    data: status,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "Profile fetching failed",
                    data: null,
                });
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Forgot password logic
    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Email is a required field",
                });
                return;
            }

            const status = await this.UserService.forgotPasswordVerify(req.body.email);

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
            } else if (status.message === "Please Sign in with your Google account") {
                res.status(UNAUTHORIZED).json({
                    success: false,
                    message: "Please Sign in with your Google account",
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
            });
        }
    }

    // Verify OTP for forgot password
    async forgotPasswordOtpVerify(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.otp) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Email and OTP are required fields",
                });
                return;
            }

            const otpStatus = await this.UserService.passworOtpCheck(req.body.otp, req.body.email);

            if (otpStatus.success) {
                res.status(OK).json({ success: true, message: otpStatus.message });
            } else {
                switch (otpStatus.message) {
                    case "Invalid OTP":
                        res.status(BAD_REQUEST).json({
                            success: false,
                            message: otpStatus.message,
                        });
                        break;
                    case "OTP is expired":
                        res.status(GONE).json({ success: false, message: otpStatus.message });
                        break;
                    case "OTP error":
                        res.status(INTERNAL_SERVER_ERROR).json({
                            success: false,
                            message: otpStatus.message,
                        });
                        break;
                    default:
                        res.status(NOT_FOUND).json({
                            success: false,
                            message: "Account not found",
                        });
                        break;
                }
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Reset password logic
    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.password) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Email and password are required fields",
                });
                return;
            }

            const response = await this.UserService.changePassword(
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
                    message: "ID and password are required fields",
                });
                return;
            }

            const response = await this.UserService.verifyPassword(
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

    // Create a new address for the user
    async createAddress(req: Request, res: Response): Promise<void> {
        try {
            const { address } = req.body;

            if (!address) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Address is required",
                });
                return;
            }

            const status = await this.UserService.createAddress(address);

            if (status?.success) {
                res.status(CREATED).json({
                    success: true,
                    message: status.message,
                    data: null,
                });
            } else if (
                status?.message === "Address already added" ||
                status?.message === "You can only add up to 3 addresses"
            ) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: status.message,
                });
            } else {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: status?.message || "Address creation failed",
                });
            }
        } catch (error: any) {
            console.error("Error in createAddress:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Get all addresses of the user
    async getAddresses(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;

            if (!userId) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "User ID is required",
                });
                return;
            }

            const status = await this.UserService.findAddresses(userId);

            if (status?.success) {
                res.status(OK).json({
                    success: true,
                    message: status.message,
                    data: status.data,
                });
            } else if (status?.message === "Failed to fetch addresses") {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: status.message,
                    data: [],
                });
            }
        } catch (error: any) {
            console.error("Error in getAddresses:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Delete address logic
    async deleteAddresses(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Address ID is required",
                });
                return;
            }

            const response = await this.UserService.changeAddressStatus(req.params.id);

            if (response) {
                res.status(OK).json({
                    success: true,
                    message: "Address deleted successfully",
                    data: null,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "Failed to delete address",
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Get single address of the user
    async getAddress(req: Request, res: Response): Promise<void> {
        try {
            const addressId = req.params.id;

            if (!addressId) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Address ID is required",
                });
                return;
            }

            const status = await this.UserService.getAddress(addressId);

            if (status?.success) {
                res.status(OK).json({
                    success: true,
                    message: status.message,
                    data: status.data,
                });
            } else if (status?.message === "Failed to fetch address") {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: status.message,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in getAddress:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Update address for the user
    async updateAddress(req: Request, res: Response): Promise<void> {
        try {
            const { address } = req.body;
            const id = req.params.id;

            if (!address || !id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Address and ID are required",
                });
                return;
            }

            const status = await this.UserService.editAddress(address, id);

            if (status?.success) {
                res.status(CREATED).json({
                    success: true,
                    message: status.message,
                    data: null,
                });
            } else {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: status?.message || "Address update failed",
                });
            }
        } catch (error: any) {
            console.error("Error in updateAddress:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Fetch all available slots based on location
    async fetchSlots(req: Request, res: Response): Promise<void> {
        try {
            if (
                !req.query.service_id ||
                !req.query.lat ||
                !req.query.long ||
                !req.query.date ||
                !req.query.time
            ) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Service ID, location, date, and time are required fields",
                    data: null,
                });
                return;
            }

            const response = await this.UserService.getSlots({
                service_id: req.query.service_id as string,
                lat: parseFloat(req.query.lat as string),
                long: parseFloat(req.query.long as string),
                date: req.query.date as string,
                time: req.query.time as string,
            });

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
            } else if (response.message === "Failed to fetch slots") {
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
            console.error("Error in fetching slots:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // Add booking request to book slots
    async requestSlots(req: Request, res: Response): Promise<void> {
        try {
            if (
                !req.body.data.user_id ||
                !req.body.data.slot_id ||
                !req.body.data.time ||
                !req.body.data.address ||
                !req.body.data.description
            ) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "User ID, slot ID, time, address, and description are required fields",
                    data: null,
                });
                return;
            }

            const response = await this.UserService.requestBooking(req.body.data);

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
                return;
            }

            switch (response.message) {
                case "Booking request exists":
                    res.status(CONFLICT).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                    break;
                case "Failed to add booking request":
                    res.status(INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                    break;
                default:
                    res.status(BAD_REQUEST).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
            }
        } catch (error: any) {
            console.error("Error in requestSlots:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error",
                data: null,
            });
        }
    }

    // Fetch all bookings for user with ID
    async getBookings(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.id || !req.query.page) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "ID and page number are required fields",
                    data: null,
                });
                return;
            }

            const response = await this.UserService.fetchBookings(
                req.query.id as string,
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
            if (!req.query.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "ID is a required field",
                    data: null,
                });
                return;
            }

            const response = await this.UserService.fetchBookingDetail(req.query.id as string);

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

    // Logic to handle payment intent
    async createStripePayment(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.id || !req.body.amount) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "ID and amount are required fields",
                    data: null,
                });
                return;
            }

            const response = await this.UserService.processOnlinePayment(
                req.body.id,
                req.body.amount
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

    // Cancel booking based on the time
    async cancelBooking(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "ID is a required field",
                    data: null,
                });
                return;
            }

            const response = await this.UserService.cancelBooking(req.body.id);

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

    // Fetch chat data
    async fetchChat(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Room ID is a required field",
                    data: null,
                });
                return;
            }

            const response = await this.UserService.fetchChat(req.query.id as string);

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

    // Add review to bookings
    async addReview(req: Request, res: Response): Promise<void> {
        try {
            if (
                !req.body.rating ||
                !req.body.review ||
                !req.body.description ||
                !req.files ||
                !req.body.booking_id ||
                !req.body.provider_id
            ) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Rating, review, description, and images are required fields",
                    data: null,
                });
                return;
            }

            const response = await this.UserService.processReviewCreation(
                req.body,
                req.files as Express.Multer.File[]
            );

            if (response.message === "Review added already") {
                res.status(CONFLICT).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            } else if (response.message === "Failed to store image") {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            } else if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: "Review added successfully",
                    data: response.data,
                });
            } else {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Failed to add review",
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in fetching booking details:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error.",
                data: null,
            });
        }
    }
}

export default UserController;
