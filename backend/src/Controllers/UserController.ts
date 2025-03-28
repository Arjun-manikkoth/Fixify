import IUserService from "../Interfaces/User/UserServiceInterface";
import { Request, Response } from "express";
import { HttpStatus } from "../Constants/StatusCodes";
import {
    AuthMessages,
    ProfileMessages,
    PasswordMessages,
    AddressMessages,
    SlotMessages,
    BookingMessages,
    PaymentMessages,
    ChatMessages,
    ReviewMessages,
    ReportMessages,
    NotificationMessages,
    GeneralMessages,
    tokenMessages,
} from "../Constants/Messages";

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

    async signUp(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.password || !req.body.userName || !req.body.mobileNo) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: AuthMessages.SIGN_UP_REQUIRED_FIELDS,
                    data: null,
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
                    message: user?.message || AuthMessages.SIGN_UP_FAILED,
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async signIn(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.password) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: AuthMessages.SIGN_IN_REQUIRED_FIELDS,
                    data: null,
                });
                return;
            }

            const response = await this.UserService.authenticateUser(req.body);

            if (response?.success && response?.accessToken && response?.refreshToken) {
                res.status(OK)
                    .cookie("accessToken", response.accessToken, {
                        httpOnly: true,
                        secure: false,
                        sameSite: true,
                        maxAge: process.env.MAX_AGE_ACCESS_COOKIE
                            ? parseInt(process.env.MAX_AGE_ACCESS_COOKIE)
                            : 15 * 60 * 1000, // 15 minutes
                    })
                    .cookie("refreshToken", response.refreshToken, {
                        httpOnly: true,
                        secure: false,
                        sameSite: true,
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
                            name: response.name,
                            phone: response.mobileNo,
                            url: response.url,
                        },
                    });
            } else {
                switch (response?.message) {
                    case AuthMessages.ACCOUNT_DOES_NOT_EXIST:
                        res.status(NOT_FOUND).json({
                            success: false,
                            message: response.message,
                            data: null,
                        });
                        break;
                    case AuthMessages.INVALID_CREDENTIALS:
                        res.status(UNAUTHORIZED).json({
                            success: false,
                            message: response.message,
                            data: null,
                        });
                        break;
                    case AuthMessages.OTP_NOT_VERIFIED:
                    case AuthMessages.SIGN_IN_WITH_GOOGLE:
                    case AuthMessages.ACCOUNT_BLOCKED:
                        res.status(FORBIDDEN).json({
                            success: false,
                            message: response.message,
                            data: null,
                        });
                        break;
                    default:
                        res.status(INTERNAL_SERVER_ERROR).json({
                            success: false,
                            message: GeneralMessages.INTERNAL_SERVER_ERROR,
                            data: null,
                        });
                        break;
                }
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async otpVerify(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.otp) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: AuthMessages.OTP_REQUIRED_FIELDS,
                    data: null,
                });
                return;
            }

            const otpStatus = await this.UserService.otpCheck(req.body.otp, req.body.email);

            if (otpStatus.success) {
                res.status(OK).json({ success: true, message: otpStatus.message, data: null });
            } else {
                switch (otpStatus.message) {
                    case AuthMessages.OTP_INVALID:
                        res.status(BAD_REQUEST).json({
                            success: false,
                            message: otpStatus.message,
                            data: null,
                        });
                        break;
                    case AuthMessages.OTP_EXPIRED:
                        res.status(GONE).json({ success: false, message: otpStatus.message });
                        break;
                    case AuthMessages.OTP_ERROR:
                        res.status(INTERNAL_SERVER_ERROR).json({
                            success: false,
                            message: otpStatus.message,
                            data: null,
                        });
                        break;
                    default:
                        res.status(NOT_FOUND).json({
                            success: false,
                            message: GeneralMessages.USER_NOT_FOUND,
                            data: null,
                        });
                        break;
                }
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async otpResend(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: AuthMessages.OTP_RESEND_REQUIRED,
                    data: null,
                });
                return;
            }

            const status = await this.UserService.otpResend(req.body.email);

            if (status) {
                res.status(OK).json({
                    success: true,
                    message: AuthMessages.OTP_RESEND_SUCCESS,
                    data: null,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: AuthMessages.OTP_RESEND_FAILED,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async signOut(req: Request, res: Response): Promise<void> {
        try {
            res.clearCookie("accessToken", { httpOnly: true, secure: false });
            res.clearCookie("refreshToken", { httpOnly: true, secure: false });

            res.status(OK).json({
                success: true,
                message: AuthMessages.SIGN_OUT_SUCCESS,
                data: null,
            });
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async googleAuth(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.code) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Google sign-in code is required",
                    data: null,
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
                        data: {
                            email: response.email,
                            id: response._id,
                            name: response.name,
                            phone: response.mobileNo,
                            url: response.url,
                            cookie: response.accessToken,
                            cookie2: response.refreshToken,
                        },
                    });
            } else {
                switch (response?.message) {
                    case AuthMessages.GOOGLE_SIGN_IN_FAILED:
                        res.status(BAD_REQUEST).json({
                            success: false,
                            message: response.message,
                            data: null,
                        });
                        break;
                    case AuthMessages.ACCOUNT_BLOCKED:
                        res.status(FORBIDDEN).json({
                            success: false,
                            message: response.message,
                            data: null,
                        });
                        break;
                    default:
                        res.status(INTERNAL_SERVER_ERROR).json({
                            success: false,
                            message: GeneralMessages.INTERNAL_SERVER_ERROR,
                            data: null,
                        });
                        break;
                }
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
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
                    message: tokenMessages.REFRESH_TOKEN_MISSING,
                    data: null,
                });
                return;
            }

            const response = await this.UserService.refreshTokenCheck(token);

            if (response.accessToken) {
                res.status(OK)
                    .cookie("accessToken", response.accessToken, {
                        httpOnly: true,
                        secure: false,
                        sameSite: true,
                        maxAge: process.env.MAX_AGE_ACCESS_COOKIE
                            ? parseInt(process.env.MAX_AGE_ACCESS_COOKIE)
                            : 15 * 60 * 1000, // 15 minutes
                    })
                    .json({
                        success: true,
                        message: tokenMessages.ACCESS_TOKEN_SUCCESS,
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
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.userName || !req.body.mobileNo || !req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: ProfileMessages.UPDATE_PROFILE_REQUIRED,
                    data: null,
                });
                return;
            }

            let image = null;
            if (req.file) {
                image = req.file;
            }

            const status = await this.UserService.editProfile(
                { id: req.params.id, ...req.body },
                image
            );

            if (status) {
                res.status(OK).json({
                    success: true,
                    message: ProfileMessages.UPDATE_PROFILE_SUCCESS,
                    data: status,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: ProfileMessages.UPDATE_PROFILE_FAILED,
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async getUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: ProfileMessages.GET_USER_REQUIRED,
                    data: null,
                });
                return;
            }

            const status = await this.UserService.getUserData(req.params.id as string);

            if (status) {
                res.status(OK).json({
                    success: true,
                    message: ProfileMessages.GET_USER_SUCCESS,
                    data: status,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: ProfileMessages.GET_USER_FAILED,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: PasswordMessages.FORGOT_PASSWORD_REQUIRED,
                    data: null,
                });
                return;
            }

            const status = await this.UserService.forgotPasswordVerify(req.body.email);

            if (status.message === "Mail sent successfully") {
                res.status(OK).json({
                    success: true,
                    message: PasswordMessages.FORGOT_PASSWORD_SUCCESS,
                    data: status.data,
                });
            } else if (status.message === "Mail not registered") {
                res.status(NOT_FOUND).json({
                    success: false,
                    message: PasswordMessages.FORGOT_PASSWORD_NOT_REGISTERED,
                    data: null,
                });
            } else if (status.message === PasswordMessages.FORGOT_PASSWORD_GOOGLE) {
                res.status(UNAUTHORIZED).json({
                    success: false,
                    message: PasswordMessages.FORGOT_PASSWORD_GOOGLE,
                    data: null,
                });
            } else {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: PasswordMessages.FORGOT_PASSWORD_FAILED,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Forgot Password Error:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async forgotPasswordOtpVerify(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.otp) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: AuthMessages.OTP_REQUIRED_FIELDS,
                    data: null,
                });
                return;
            }

            const otpStatus = await this.UserService.passworOtpCheck(req.body.otp, req.body.email);

            if (otpStatus.success) {
                res.status(OK).json({ success: true, message: otpStatus.message });
            } else {
                switch (otpStatus.message) {
                    case AuthMessages.OTP_INVALID:
                        res.status(BAD_REQUEST).json({
                            success: false,
                            message: otpStatus.message,
                            data: null,
                        });
                        break;
                    case AuthMessages.OTP_EXPIRED:
                        res.status(GONE).json({
                            success: false,
                            message: otpStatus.message,
                            data: null,
                        });
                        break;
                    case AuthMessages.OTP_ERROR:
                        res.status(INTERNAL_SERVER_ERROR).json({
                            success: false,
                            message: otpStatus.message,
                            data: null,
                        });
                        break;
                    default:
                        res.status(NOT_FOUND).json({
                            success: false,
                            message: GeneralMessages.ACCOUNT_NOT_FOUND,
                            data: null,
                        });
                        break;
                }
            }
        } catch (error: any) {
            console.error(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.password) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: PasswordMessages.RESET_PASSWORD_REQUIRED,
                    data: null,
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
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async confirmPassword(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.body.password) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: PasswordMessages.CONFIRM_PASSWORD_REQUIRED,
                    data: null,
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
            } else if (response.message === PasswordMessages.CONFIRM_PASSWORD_FAILED) {
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
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async createAddress(req: Request, res: Response): Promise<void> {
        try {
            const { address } = req.body;
            const { id } = req.params;

            if (!address) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: AddressMessages.CREATE_ADDRESS_REQUIRED,
                    data: null,
                });
                return;
            }

            const status = await this.UserService.createAddress({ id, ...address });

            if (status?.success) {
                res.status(CREATED).json({
                    success: true,
                    message: status.message,
                    data: null,
                });
            } else if (
                status?.message === AddressMessages.ADDRESS_ALREADY_ADDED ||
                status?.message === AddressMessages.ADDRESS_LIMIT_REACHED
            ) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: status.message,
                    data: null,
                });
            } else {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: status?.message || AddressMessages.CREATE_ADDRESS_FAILED,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in createAddress:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async getAddresses(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;

            if (!userId) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: AddressMessages.GET_ADDRESSES_REQUIRED,
                    data: null,
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
            } else if (status?.message === AddressMessages.GET_ADDRESSES_FAILED) {
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
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async deleteAddresses(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: AddressMessages.DELETE_ADDRESS_REQUIRED,
                    data: null,
                });
                return;
            }

            const response = await this.UserService.changeAddressStatus(req.params.id);

            if (response) {
                res.status(OK).json({
                    success: true,
                    message: AddressMessages.DELETE_ADDRESS_SUCCESS,
                    data: null,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: AddressMessages.DELETE_ADDRESS_FAILED,
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async getAddress(req: Request, res: Response): Promise<void> {
        try {
            const addressId = req.params.id;

            if (!addressId) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: AddressMessages.GET_ADDRESS_REQUIRED,
                    data: null,
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
            } else if (status?.message === AddressMessages.GET_ADDRESS_FAILED) {
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
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async updateAddress(req: Request, res: Response): Promise<void> {
        try {
            const { address } = req.body;
            const id = req.params.id;

            if (!address || !id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: AddressMessages.UPDATE_ADDRESS_REQUIRED,
                    data: null,
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
                    message: status?.message || AddressMessages.UPDATE_ADDRESS_FAILED,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in updateAddress:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

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
                    message: SlotMessages.FETCH_SLOTS_REQUIRED,
                    data: null,
                });
                return;
            }
            console.log(req.query, "req.query");

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
            } else if (response.message === SlotMessages.FETCH_SLOTS_FAILED) {
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
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async requestSlots(req: Request, res: Response): Promise<void> {
        try {
            if (
                !req.params.id ||
                !req.body.data.technician_id ||
                !req.body.data.slot_id ||
                !req.body.data.time ||
                !req.body.data.address ||
                !req.body.data.description
            ) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: SlotMessages.REQUEST_SLOTS_REQUIRED,
                    data: null,
                });
                return;
            }

            const response = await this.UserService.requestBooking({
                user_id: req.params.id,
                ...req.body.data,
            });

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
                return;
            }

            switch (response.message) {
                case SlotMessages.REQUEST_SLOTS_EXISTS:
                    res.status(CONFLICT).json({
                        success: false,
                        message: response.message,
                        data: null,
                    });
                    break;
                case SlotMessages.REQUEST_SLOTS_FAILED:
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
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async getBookings(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.query.page) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: BookingMessages.GET_BOOKINGS_REQUIRED,
                    data: null,
                });
                return;
            }

            const response = await this.UserService.fetchBookings(
                req.params.id as string,
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
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async getBookingDetails(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: BookingMessages.GET_BOOKING_DETAILS_REQUIRED,
                    data: null,
                });
                return;
            }

            const response = await this.UserService.fetchBookingDetail(req.params.id as string);

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
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async createStripePayment(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.id || !req.body.amount) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: PaymentMessages.CREATE_PAYMENT_REQUIRED,
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
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async cancelBooking(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: BookingMessages.CANCEL_BOOKING_REQUIRED,
                    data: null,
                });
                return;
            }

            const response = await this.UserService.cancelBooking(req.params.id);

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
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async fetchChat(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: ChatMessages.FETCH_CHAT_REQUIRED,
                    data: null,
                });
                return;
            }

            const response = await this.UserService.fetchChat(req.params.id as string);

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
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async addReview(req: Request, res: Response): Promise<void> {
        try {
            if (
                !req.body.rating ||
                !req.body.review ||
                !req.body.description ||
                !req.files ||
                !req.params.id ||
                !req.body.provider_id
            ) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: ReviewMessages.ADD_REVIEW_REQUIRED,
                    data: null,
                });
                return;
            }

            const response = await this.UserService.processReviewCreation(
                { ...req.body, booking_id: req.params.id },
                req.files as Express.Multer.File[]
            );

            if (response.message === ReviewMessages.REVIEW_ALREADY_ADDED) {
                res.status(CONFLICT).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            } else if (response.message === ReviewMessages.IMAGE_STORAGE_FAILED) {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            } else if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: ReviewMessages.ADD_REVIEW_SUCCESS,
                    data: response.data,
                });
            } else {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: ReviewMessages.ADD_REVIEW_FAILED,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in fetching booking details:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

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
                    message: ReportMessages.REPORT_REQUIRED,
                    data: null,
                });
                return;
            }

            const response = await this.UserService.report({
                ...req.body,
                bookingId: req.params.id,
            });

            if (response.message === ReportMessages.REPORT_FAILED) {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            } else if (response.message === ReportMessages.REPORT_ALREADY_EXISTS) {
                res.status(CONFLICT).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
            } else if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: ReportMessages.REPORT_SUCCESS,
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
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async fetchNotificationsCount(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: NotificationMessages.FETCH_COUNT_REQUIRED,
                    data: null,
                });
                return;
            }

            const response = await this.UserService.fetchUnreadNotificationsCount(req.params.id);

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: NotificationMessages.FETCH_COUNT_SUCCESS,
                    data: response.data,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in fetching count:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async fetchNotifications(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.query.page) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: NotificationMessages.FETCH_NOTIFICATIONS_REQUIRED,
                    data: null,
                });
                return;
            }

            const response = await this.UserService.fetchNotifications(
                req.params.id,
                Number(req.query.page)
            );

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: NotificationMessages.FETCH_NOTIFICATIONS_SUCCESS,
                    data: response.data,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in fetching notifications:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async markNotification(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: NotificationMessages.MARK_NOTIFICATION_REQUIRED,
                    data: null,
                });
                return;
            }

            const response = await this.UserService.markNotification(req.params.id);

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: response.message,
                    data: response.data,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: GeneralMessages.INTERNAL_SERVER_ERROR,
                    data: null,
                });
            }
        } catch (error: any) {
            console.error("Error in updating notification:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }
}

export default UserController;
