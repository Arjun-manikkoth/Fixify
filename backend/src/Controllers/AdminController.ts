import IAdminService from "../Interfaces/Admin/AdminServiceInterface";
import { Request, Response } from "express";

class AdminController {
    constructor(private AdminService: IAdminService) {}

    // login and sends the corresponding status code
    async signIn(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.email || !req.body.password) {
                res.status(400).json({
                    success: false,
                    message: "Email and Password are required feilds",
                });
                return;
            }

            const response = await this.AdminService.authenticateAdmin(req.body); //this function checks and verify the credentials

            if (response?.success && response?.accessToken && response?.refreshToken) {
                //sends admin data ,access and refresh token in cookie after a sucessfull signin

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
                        res.status(400).json({ success: false, message: response.message });
                        break;

                    case "Invalid Credentials":
                        res.status(401).json({ success: false, message: response.message });
                        break;

                    case "Didn't complete otp verification":
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

    //list users in the admin side based on the selections
    async getUsers(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page || !req.query.filter) {
                res.status(400).json({
                    success: false,
                    message: "Page,filter are required feilds",
                });
                return;
            }

            const status = await this.AdminService.getUsersList(
                req.query.search as string,
                req.query.page as string,
                req.query.filter as string
            );
            if (status) {
                res.status(200).json({
                    success: true,
                    message: "Users data fetched successully",
                    data: status,
                });
            } else {
                res.status(200).json({
                    success: false,
                    message: "Users data fetching failed",
                    data: null,
                });
            }
        } catch (error: any) {
            console.error(error.message);

            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    //block user
    async blockUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.id) {
                res.status(400).json({
                    success: false,
                    message: "Id is a required feild",
                });
                return;
            }
            const status = await this.AdminService.userBlock(req.query.id as string);
            if (status) {
                res.status(200).json({
                    success: true,
                    message: "User blocked successully",
                });
            } else {
                res.status(200).json({
                    success: false,
                    message: "User blocking failed",
                });
            }
        } catch (error: any) {
            console.error(error.message);

            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    //block user
    async unBlockUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.id) {
                res.status(400).json({
                    success: false,
                    message: "Id is a required feild",
                });
                return;
            }
            const status = await this.AdminService.userUnBlock(req.query.id as string);
            if (status) {
                res.status(200).json({
                    success: true,
                    message: "User Unblocked successully",
                });
            } else {
                res.status(200).json({
                    success: false,
                    message: "User Unblocking failed",
                });
            }
        } catch (error: any) {
            console.error(error.message);

            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    //list providers in the admin side based on the selections
    async getProviders(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page || !req.query.filter) {
                res.status(400).json({
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
                res.status(200).json({
                    success: true,
                    message: "Providers data fetched successully",
                    data: status,
                });
            } else {
                res.status(200).json({
                    success: false,
                    message: "Providers data fetching failed",
                    data: null,
                });
            }
        } catch (error: any) {
            console.error(error.message);

            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    //list approval request in the admin side based on the page no
    async getApprovals(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page) {
                res.status(400).json({
                    success: false,
                    message: "Page is a required feild",
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.getApprovalsList(req.query.page as string);
            if (status) {
                res.status(200).json({
                    success: true,
                    message: "Approvals data fetched successully",
                    data: status,
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Approvals data fetching failed",
                    data: null,
                });
            }
        } catch (error: any) {
            console.error(error.message);

            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    //block provider
    async blockProvider(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.id) {
                res.status(400).json({
                    success: false,
                    message: "Id is a required feild",
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.providerBlock(req.query.id as string);
            if (status) {
                res.status(200).json({
                    success: true,
                    message: "Provider blocked successfully",
                });
            } else {
                res.status(200).json({
                    success: false,
                    message: "Provider blocking failed",
                });
            }
        } catch (error: any) {
            console.error(error.message);

            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    //unblock provider
    async unBlockProvider(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.id) {
                res.status(400).json({
                    success: false,
                    message: "Id is a required feild",
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.providerUnBlock(req.query.id as string);
            if (status) {
                res.status(200).json({
                    success: true,
                    message: "Provider Unblocked successully",
                });
            } else {
                res.status(200).json({
                    success: false,
                    message: "Provider Unblocking failed",
                });
            }
        } catch (error: any) {
            console.error(error.message);

            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    //get approval details with id
    async approvalDetails(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({
                    success: false,
                    message: "Id is a required feild",
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.getApprovalDetails(req.params.id as string);
            if (status) {
                res.status(200).json({
                    success: true,
                    message: "Provider approval details fetched successully",
                    data: status,
                });
            } else {
                res.status(200).json({
                    success: false,
                    message: "Provider approval details fetched sucessfully",
                    data: null,
                });
            }
        } catch (error: any) {
            console.error(error.message);

            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    //update approval detail status
    async approvalStatusUpdate(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.params.status) {
                res.status(400).json({
                    success: false,
                    message: "Id and status are required feilds",
                    data: null,
                });
                return;
            }
            const status = await this.AdminService.approvalStatusChange(
                req.params.id as string,
                req.params.status as string
            );
            if (status) {
                res.status(200).json({
                    success: true,
                    message: "Provider approval status updated successully",
                    data: status,
                });
            } else {
                res.status(200).json({
                    success: false,
                    message: "Provider approval status update failed",
                    data: null,
                });
            }
        } catch (error: any) {
            console.error(error.message);

            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    //get all services
    async getAllServices(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page || !req.query.filter) {
                res.status(400).json({
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

            res.status(200).json({
                success: true,
                message: "services fetched sucessfully",
                data: services,
            });
        } catch (error: any) {
            console.log(error.message);

            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    // update the service status to list or unlist
    async changeServiceStatus(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id || !req.body.status) {
                res.status(400).json({
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
                res.status(200).json({
                    success: true,
                    message: "Service status updated",
                    data: null,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Failed to update service status",
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    // add new service
    async addService(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.data.serviceName || !req.body.data.description) {
                res.status(400).json({
                    success: false,
                    message: "Service name and description are required feilds",
                    data: null,
                });
                return;
            }
            const response = await this.AdminService.createService(req.body.data);

            if (response.success) {
                res.status(200).json({
                    success: true,
                    message: "Service created successfully",
                    data: null,
                });
            } else if (response.message === "Service already exists") {
                res.status(409).json({ success: false, message: response.message, data: null });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Failed to create service",
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    // get service
    async getService(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({
                    success: false,
                    message: "Id is a required feild",
                    data: null,
                });
                return;
            }

            const response = await this.AdminService.getServiceDetails(req.params.id);

            if (response) {
                res.status(200).json({
                    success: true,
                    message: "Service details fetched successfully",
                    data: response,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch service detail",
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    // update  service
    async updateService(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body.data.serviceName || !req.body.data.description || !req.params.id) {
                res.status(400).json({
                    success: false,
                    message: "Service name,description and id are required feilds",
                    data: null,
                });
                return;
            }

            const response = await this.AdminService.updateService(
                req.params.id as string,
                req.body.data
            );

            if (response.success) {
                res.status(200).json({
                    success: true,
                    message: "Service updated successfully",
                    data: response,
                });
            } else if (response.message === "Service exists already") {
                res.status(500).json({
                    success: false,
                    message: "Service already exists",
                    data: null,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Failed to update service",
                    data: null,
                });
            }
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    //fetch all bookings for admin
    async getBookings(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.page) {
                res.status(400).json({
                    success: false,
                    message: "Page number is a required feild",
                    data: null,
                });
                return;
            }

            const response = await this.AdminService.fetchBookings(Number(req.query.page));

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
            console.error("Error in fetching booking data:", error.message);
            res.status(500).json({
                success: false,
                message: "Internal server error.",
                data: null,
            });
        }
    }
}
export default AdminController;
