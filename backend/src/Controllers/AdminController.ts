import IAdminService from "../Interfaces/Admin/AdminServiceInterface";
import { Request, Response } from "express";
import { HttpStatus } from "../Constants/StatusCodes";

const { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, CONFLICT, INTERNAL_SERVER_ERROR } = HttpStatus;

class AdminController {
    constructor(private AdminService: IAdminService) {}

    // Login and sends the corresponding status code
    async signIn(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.password) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Email and Password are required feilds",
                    data: null,
                });
                return;
            }

            const response = await this.AdminService.authenticateAdmin(req.body); // This function checks and verifies the credentials

            if (response?.success && response?.accessToken && response?.refreshToken) {
                // Sends admin data, access, and refresh token in cookie after a successful sign-in
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
                        data: { email: response.email, id: response._id },
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

    // Function which validates the refresh token and sends an access token if required
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
                const response = await this.AdminService.refreshTokenCheck(token);

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
                        .json({ success: true, message: "Access token sent successfully" });
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
                message: "Internal server error",
                data: null,
            });
        }
    }

    // List users in the admin side based on the selections
    async getUsers(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page || !req.query.filter) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Page,filter are required feilds",
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
                    message: "Users data fetched successully",
                    data: status,
                });
            } else {
                res.status(OK).json({
                    success: false,
                    message: "Users data fetching failed",
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

    // Block user
    async blockUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id is a required feild",
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.userBlock(req.params.id);

            if (status) {
                res.status(OK).json({
                    success: true,
                    message: "User blocked successully",
                    data: null,
                });
            } else {
                res.status(OK).json({
                    success: false,
                    message: "User blocking failed",
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

    // Unblock user
    async unBlockUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id is a required feild",
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.userUnBlock(req.params.id as string);

            if (status) {
                res.status(OK).json({
                    success: true,
                    message: "User Unblocked successully",
                    data: null,
                });
            } else {
                res.status(OK).json({
                    success: false,
                    message: "User Unblocking failed",
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

    // List providers in the admin side based on the selections
    async getProviders(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page || !req.query.filter) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "search,page,filter are required feilds",
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
                    message: "Providers data fetched successully",
                    data: status,
                });
            } else {
                res.status(OK).json({
                    success: false,
                    message: "Providers data fetching failed",
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

    // List approval request in the admin side based on the page no
    async getApprovals(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Page is a required feild",
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.getApprovalsList(req.query.page as string);
            if (status) {
                res.status(OK).json({
                    success: true,
                    message: "Approvals data fetched successully",
                    data: status,
                });
            } else {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Approvals data fetching failed",
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

    // Block provider
    async blockProvider(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id is a required feild",
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.providerBlock(req.params.id);

            if (status) {
                res.status(OK).json({
                    success: true,
                    message: "Provider blocked successfully",
                    data: null,
                });
            } else {
                res.status(OK).json({
                    success: false,
                    message: "Provider blocking failed",
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

    // Unblock provider
    async unBlockProvider(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id is a required feild",
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.providerUnBlock(req.params.id);

            if (status) {
                res.status(OK).json({
                    success: true,
                    message: "Provider Unblocked successully",
                    data: null,
                });
            } else {
                res.status(OK).json({
                    success: false,
                    message: "Provider Unblocking failed",
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

    // Get approval details with id
    async approvalDetails(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id is a required feild",
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.getApprovalDetails(req.params.id);
            if (status) {
                res.status(OK).json({
                    success: true,
                    message: "Provider approval details fetched successully",
                    data: status,
                });
            } else {
                res.status(OK).json({
                    success: false,
                    message: "Provider approval details fetched sucessfully",
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

    // Update approval detail status
    async approvalStatusUpdate(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.body.status) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id and status are required feilds",
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
                    message: "Provider approval status updated successully",
                    data: status,
                });
            } else {
                res.status(OK).json({
                    success: false,
                    message: "Provider approval status update failed",
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

    // Get all services
    async getAllServices(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page || !req.query.filter) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "search,page,filter are required feilds",
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

    // Update the service status to list or unlist
    async changeServiceStatus(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.body.status) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id and status are required feilds",
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
                    message: "Service status updated",
                    data: null,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "Failed to update service status",
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

    // Add new service
    async addService(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.data.serviceName || !req.body.data.description) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Service name and description are required feilds",
                    data: null,
                });
                return;
            }
            const response = await this.AdminService.createService(req.body.data);

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: "Service created successfully",
                    data: null,
                });
            } else if (response.message === "Service already exists") {
                res.status(CONFLICT).json({
                    success: false,
                    message: response.message,
                    data: null,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "Failed to create service",
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

    // Get service
    async getService(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Id is a required feild",
                    data: null,
                });
                return;
            }

            const response = await this.AdminService.getServiceDetails(req.params.id);

            if (response) {
                res.status(OK).json({
                    success: true,
                    message: "Service details fetched successfully",
                    data: response,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "Failed to fetch service detail",
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

    // Update service
    async updateService(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.data.serviceName || !req.body.data.description || !req.params.id) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Service name,description and id are required feilds",
                    data: null,
                });
                return;
            }

            const response = await this.AdminService.updateService(req.params.id, req.body.data);

            if (response.success) {
                res.status(OK).json({
                    success: true,
                    message: "Service updated successfully",
                    data: response,
                });
            } else if (response.message === "Service exists already") {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "Service already exists",
                    data: null,
                });
            } else {
                res.status(INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "Failed to update service",
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

    // Fetch all bookings for admin
    async getBookings(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Page number is a required feild",
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
                message: "Internal server error",
                data: null,
            });
        }
    }

    // get sales data based on the queries
    async getSales(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page || !req.query.fromDate || !req.query.toDate) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Page number,from date and to date are required feilds",
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
                message: "Internal server error",
                data: null,
            });
        }
    }

    // get dashboard data to display as tiles
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
                message: "Internal server error",
                data: null,
            });
        }
    }

    // get dashboard revemue data  to display as chart with filter
    async getRevenue(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.period) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Period is a required feild",
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
                message: "Internal server error",
                data: null,
            });
        }
    }

    //fetches list of all reports
    async fetchReportsList(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page) {
                res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Page is a required feild",
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
                message: "Internal server error",
                data: null,
            });
        }
    }
}

export default AdminController;
