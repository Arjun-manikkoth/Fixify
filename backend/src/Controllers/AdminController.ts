import IAdminService from "../Interfaces/Admin/AdminServiceInterface";
import { Request, Response } from "express";
import { HttpStatus } from "../Constants/StatusCodes";
import {
    AuthMessages,
    GeneralMessages,
    tokenMessages,
    UserMessages,
    ProviderMessages,
    ApprovalMessages,
    ServiceMessages,
    BookingMessages,
    DashboardMessages,
    ReportMessages,
} from "../Constants/Messages";

const { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, CONFLICT, INTERNAL_SERVER_ERROR } = HttpStatus;

class AdminController {
    constructor(private AdminService: IAdminService) {}

    async signIn(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.password) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: AuthMessages.SIGN_IN_PROVIDER_REQUIRED_FIELDS, // "Email and Password are required fields"
                    data: null,
                });
                return;
            }

            const response = await this.AdminService.authenticateAdmin(req.body);

            if (response?.success && response?.accessToken && response?.refreshToken) {
                res.status(OK)
                    .cookie("accessToken", response.accessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: true,
                        maxAge: process.env.MAX_AGE_ACCESS_COOKIE
                            ? parseInt(process.env.MAX_AGE_ACCESS_COOKIE)
                            : 15 * 60 * 1000, // 15 minutes
                    })
                    .cookie("refreshToken", response.refreshToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: true,
                        maxAge: process.env.MAX_AGE_REFRESH_COOKIE
                            ? parseInt(process.env.MAX_AGE_REFRESH_COOKIE)
                            : 7 * 24 * 60 * 60 * 1000, // 7 days
                    })
                    .json({
                        success: true,
                        message: response.message,
                        data: { email: response.email, id: response._id },
                    });
            } else {
                switch (response?.message) {
                    case AuthMessages.ACCOUNT_DOES_NOT_EXIST:
                        res.status(BAD_REQUEST).json({
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

    async signOut(req: Request, res: Response): Promise<void> {
        try {
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: true,
                sameSite: true,
            });

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true,
                sameSite: false,
            });

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

    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const token = req.cookies.refreshToken;

            if (!token) {
                res.status(UNAUTHORIZED).json({
                    success: false,
                    message: tokenMessages.REFRESH_TOKEN_MISSING,
                    data: null,
                });
            } else {
                const response = await this.AdminService.refreshTokenCheck(token);

                if (response.accessToken) {
                    res.status(OK)
                        .cookie("accessToken", response.accessToken, {
                            httpOnly: true,
                            secure: true,
                            sameSite: true,
                            maxAge: process.env.MAX_AGE_ACCESS_COOKIE
                                ? parseInt(process.env.MAX_AGE_ACCESS_COOKIE)
                                : 15 * 60 * 1000, // 15 minutes
                        })
                        .json({ success: true, message: tokenMessages.ACCESS_TOKEN_SUCCESS });
                } else {
                    res.status(UNAUTHORIZED).json({
                        success: true,
                        message: response.message,
                        data: null,
                    });
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

    async getUsers(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page || !req.query.filter) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: UserMessages.FETCH_USERS_REQUIRED,
                    data: null,
                });
                return;
            }

            const status = await this.AdminService.getUsersList(
                req.query.search as string,
                req.query.page as string,
                req.query.filter as string
            );
            if (status) {
                res.status(OK).json({
                    success: true,
                    message: UserMessages.FETCH_USERS_SUCCESS,
                    data: status,
                });
            } else {
                res.status(OK).json({
                    success: false,
                    message: UserMessages.FETCH_USERS_FAILED,
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

    async blockUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: GeneralMessages.INVALID_ID,
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.userBlock(req.params.id);

            if (status) {
                res.status(OK).json({
                    success: true,
                    message: UserMessages.BLOCK_USER_SUCCESS,
                    data: null,
                });
            } else {
                res.status(OK).json({
                    success: false,
                    message: UserMessages.BLOCK_USER_FAILED,
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

    async unBlockUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: GeneralMessages.INVALID_ID,
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.userUnBlock(req.params.id as string);

            if (status) {
                res.status(OK).json({
                    success: true,
                    message: UserMessages.UNBLOCK_USER_SUCCESS,
                    data: null,
                });
            } else {
                res.status(OK).json({
                    success: false,
                    message: UserMessages.UNBLOCK_USER_FAILED,
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

    async getProviders(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page || !req.query.filter) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: ProviderMessages.FETCH_PROVIDERS_REQUIRED,
                    data: null,
                });
                return;
            }

            const status = await this.AdminService.getProvidersList(
                req.query.search as string,
                req.query.page as string,
                req.query.filter as string
            );
            if (status) {
                res.status(OK).json({
                    success: true,
                    message: ProviderMessages.FETCH_PROVIDERS_SUCCESS,
                    data: status,
                });
            } else {
                res.status(OK).json({
                    success: false,
                    message: ProviderMessages.FETCH_PROVIDERS_FAILED,
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

    async getApprovals(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: ApprovalMessages.FETCH_APPROVALS_REQUIRED,
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.getApprovalsList(req.query.page as string);
            if (status) {
                res.status(OK).json({
                    success: true,
                    message: ApprovalMessages.FETCH_APPROVALS_SUCCESS,
                    data: status,
                });
            } else {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: ApprovalMessages.FETCH_APPROVALS_FAILED,
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

    async blockProvider(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: GeneralMessages.INVALID_ID,
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.providerBlock(req.params.id);

            if (status) {
                res.status(OK).json({
                    success: true,
                    message: ProviderMessages.BLOCK_PROVIDER_SUCCESS,
                    data: null,
                });
            } else {
                res.status(OK).json({
                    success: false,
                    message: ProviderMessages.BLOCK_PROVIDER_FAILED,
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

    async unBlockProvider(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: GeneralMessages.INVALID_ID,
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.providerUnBlock(req.params.id);

            if (status) {
                res.status(OK).json({
                    success: true,
                    message: ProviderMessages.UNBLOCK_PROVIDER_SUCCESS,
                    data: null,
                });
            } else {
                res.status(OK).json({
                    success: false,
                    message: ProviderMessages.UNBLOCK_PROVIDER_FAILED,
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

    async approvalDetails(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: GeneralMessages.INVALID_ID,
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.getApprovalDetails(req.params.id);
            if (status) {
                res.status(OK).json({
                    success: true,
                    message: ApprovalMessages.FETCH_APPROVAL_DETAILS_SUCCESS,
                    data: status,
                });
            } else {
                res.status(OK).json({
                    success: false,
                    message: ApprovalMessages.FETCH_APPROVAL_DETAILS_FAILED,
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

    async approvalStatusUpdate(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.body.status) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: ApprovalMessages.UPDATE_APPROVAL_STATUS_REQUIRED,
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.approvalStatusChange(
                req.params.id,
                req.body.status
            );
            if (status) {
                res.status(OK).json({
                    success: true,
                    message: ApprovalMessages.UPDATE_APPROVAL_STATUS_SUCCESS,
                    data: status,
                });
            } else {
                res.status(OK).json({
                    success: false,
                    message: ApprovalMessages.UPDATE_APPROVAL_STATUS_FAILED,
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

    async getAllServices(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page || !req.query.filter) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: ServiceMessages.FETCH_SERVICES_REQUIRED,
                    data: null,
                });
                return;
            }
            const services = await this.AdminService.getServices(
                req.query.search as string,
                req.query.page as string,
                req.query.filter as string
            );

            res.status(OK).json({
                success: true,
                message: ServiceMessages.FETCH_SERVICES_SUCCESS,
                data: services,
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async changeServiceStatus(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.body.status) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: ServiceMessages.UPDATE_SERVICE_STATUS_REQUIRED,
                    data: null,
                });
                return;
            }
            const response = await this.AdminService.changeServiceStatus(
                req.body.status,
                req.params.id
            );

            if (response) {
                res.status(OK).json({
                    success: true,
                    message: ServiceMessages.UPDATE_SERVICE_STATUS_SUCCESS,
                    data: null,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: ServiceMessages.UPDATE_SERVICE_STATUS_FAILED,
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
            });
        }
    }

    async addService(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.data.serviceName || !req.body.data.description) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: ServiceMessages.CREATE_SERVICE_REQUIRED,
                    data: null,
                });
                return;
            }
            const response = await this.AdminService.createService(req.body.data);

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: ServiceMessages.CREATE_SERVICE_SUCCESS,
                    data: null,
                });
            } else if (response.message === ServiceMessages.SERVICE_ALREADY_EXISTS) {
                res.status(CONFLICT).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: ServiceMessages.CREATE_SERVICE_FAILED,
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
            });
        }
    }

    async getService(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: GeneralMessages.INVALID_ID,
                    data: null,
                });
                return;
            }

            const response = await this.AdminService.getServiceDetails(req.params.id);

            if (response) {
                res.status(OK).json({
                    success: true,
                    message: ServiceMessages.FETCH_SERVICE_DETAILS_SUCCESS,
                    data: response,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: ServiceMessages.FETCH_SERVICE_DETAILS_FAILED,
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

    async updateService(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.data.serviceName || !req.body.data.description || !req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: ServiceMessages.UPDATE_SERVICE_REQUIRED,
                    data: null,
                });
                return;
            }

            const response = await this.AdminService.updateService(req.params.id, req.body.data);

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: ServiceMessages.UPDATE_SERVICE_SUCCESS,
                    data: response,
                });
            } else if (response.message === ServiceMessages.SERVICE_ALREADY_EXISTS) {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: ServiceMessages.SERVICE_ALREADY_EXISTS,
                    data: null,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: ServiceMessages.UPDATE_SERVICE_FAILED,
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

    async getBookings(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: BookingMessages.GET_BOOKINGS_REQUIRED,
                    data: null,
                });
                return;
            }

            const response = await this.AdminService.fetchBookings(Number(req.query.page));

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
            console.error("Error in fetching booking data:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async getSales(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page || !req.query.fromDate || !req.query.toDate) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: DashboardMessages.FETCH_SALES_REQUIRED,
                    data: null,
                });
                return;
            }

            const response = await this.AdminService.fetchSalesData({
                page: req.query.page as string,
                fromDate: req.query.fromDate as string,
                toDate: req.query.toDate as string,
            });

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
            console.error("Error in fetching booking data:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async getDashboard(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.AdminService.fetchDashboardData();

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
            console.error("Error in fetching booking data:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async getRevenue(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.period) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: DashboardMessages.FETCH_REVENUE_REQUIRED,
                    data: null,
                });
                return;
            }

            const response = await this.AdminService.fetchRevenueData(req.query.period as string);

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
            console.error("Error in fetching booking data:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }

    async fetchReportsList(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: ReportMessages.FETCH_REPORTS_REQUIRED,
                    data: null,
                });
                return;
            }

            const response = await this.AdminService.fetchReportsData(Number(req.query.page));

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
            console.error("Error in fetching reports data:", error.message);
            res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: GeneralMessages.INTERNAL_SERVER_ERROR,
                data: null,
            });
        }
    }
}

export default AdminController;
