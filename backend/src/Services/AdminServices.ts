import IAdminService from "../Interfaces/Admin/AdminServiceInterface";
import {
    IApprovalDetails,
    IPaginatedApprovals,
    IPaginatedProviders,
    IPaginatedUsers,
    ISignIn,
} from "../Interfaces/Admin/SignInInterface";
import { IServices } from "../Models/ProviderModels/ServiceModel";
import { ObjectId } from "mongoose";
import { comparePasswords } from "../Utils/HashPassword";
import { generateTokens } from "../Utils/GenerateTokens";
import { verifyToken } from "../Utils/CheckToken";
import { sentMail } from "../Utils/SendMail";
import IAdminRepository from "../Interfaces/Admin/AdminRepositoryInterface";
import IUserRepository from "../Interfaces/User/UserRepositoryInterface";
import IProviderRepository from "../Interfaces/Provider/ProviderRepositoryInterface";
import IApprovalRepository from "../Interfaces/Approval/ApprovalRepositoryInterface";
import IServiceRepository from "../Interfaces/Service/IServiceRepository";
import { IPaginatedServices } from "../Interfaces/Service/IServices";
import { IAddService } from "../Interfaces/Admin/SignInInterface";
import IBookingRepository from "../Interfaces/Booking/IBookingRepository";
import IPaymentRepository from "../Interfaces/Payment/PaymentRepositoryInterface";
import { sendNotfication } from "../Utils/Socket";

//interface for signin response
export interface ISignInResponse {
    success: boolean;
    message: string;
    _id: ObjectId | null;
    email: string | null;
    accessToken: string | null;
    refreshToken: string | null;
}

//interface for refresh token response
export interface IRefreshTokenResponse {
    accessToken: string | null;
    message: string;
}

//interface for general response
export interface IResponse {
    success: boolean;
    message: string;
    data: null | any;
}
class AdminService implements IAdminService {
    //injecting respositories dependency to service
    constructor(
        private adminRepository: IAdminRepository,
        private userRepository: IUserRepository,
        private providerRepository: IProviderRepository,
        private approvalRepository: IApprovalRepository,
        private serviceRepository: IServiceRepository,
        private bookingRepository: IBookingRepository,
        private paymentRepository: IPaymentRepository
    ) {}

    //authenticates admin by checking the account , verifiying the credentials and sends the tokens or proceed to otp verifiction if not verified
    async authenticateAdmin(data: ISignIn): Promise<ISignInResponse | null> {
        try {
            const exists = await this.adminRepository.findAdminByEmail(data.email); //gets admin data with given email

            if (exists) {
                // if the admin exists

                const passwordStatus = await comparePasswords(data.password, exists.password); // utility function compares passwords

                if (passwordStatus) {
                    //executes if the passwords are matching

                    const tokens = generateTokens(exists._id.toString(), exists.email, "admin"); //generates access and refresh tokens

                    return {
                        success: true,
                        message: "Signed in Sucessfully",
                        email: exists.email,
                        _id: exists._id,
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                    };
                } else {
                    //if the credentials are wrong returns this
                    return {
                        success: false,
                        message: "Invalid Credentials",
                        email: null,
                        _id: null,
                        accessToken: null,
                        refreshToken: null,
                    };
                }
            } else {
                //executes this if the admin account is not found
                return {
                    success: false,
                    message: "Account does not exist",
                    email: null,
                    _id: null,
                    accessToken: null,
                    refreshToken: null,
                };
            }
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    // checks the refresh token and generates access token
    async refreshTokenCheck(token: string): Promise<IRefreshTokenResponse> {
        try {
            //Verifiying and decoding the token details
            const tokenStatus = await verifyToken(token);

            //checking for verified token and generate new refresh token
            if (tokenStatus.id && tokenStatus.email && tokenStatus.role) {
                const tokens = generateTokens(tokenStatus.id, tokenStatus.email, tokenStatus.role); //generates refresh token

                return {
                    accessToken: tokens.accessToken,
                    message: tokenStatus.message,
                };
            }

            //returns for unverified token
            return {
                accessToken: null,
                message: tokenStatus.message,
            };
        } catch (error: any) {
            console.log(error.message);

            return {
                accessToken: null,
                message: "Token error",
            };
        }
    }

    //gets user list
    async getUsersList(
        search: string,
        page: string,
        filter: string
    ): Promise<IPaginatedUsers | null> {
        try {
            const data = await this.userRepository.getAllUsers(search, page, filter);
            if (data?.users) {
                return data;
            }
            return null;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    //gets approvals list
    async getApprovalsList(page: string): Promise<IPaginatedApprovals | null> {
        try {
            const data = await this.approvalRepository.getAllApprovals(page);

            if (data?.approvals) {
                return data;
            }
            return null;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    //change user block status to block
    async userBlock(id: string): Promise<Boolean> {
        try {
            const status = await this.userRepository.changeUserBlockStatus(id);
            return status ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }
    //change user block status to unblock
    async userUnBlock(id: string): Promise<Boolean> {
        try {
            const status = await this.userRepository.changeUserUnBlockStatus(id);
            return status ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }

    //gets providers list
    async getProvidersList(
        search: string,
        page: string,
        filter: string
    ): Promise<IPaginatedProviders | null> {
        try {
            const data = await this.providerRepository.getAllProviders(search, page, filter);
            if (data?.providers) {
                return data;
            }
            return null;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    //change provider block status to block
    async providerBlock(id: string): Promise<Boolean> {
        try {
            const status = await this.providerRepository.changeProviderBlockStatus(id);
            return status ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }
    //change provider block status to unblock
    async providerUnBlock(id: string): Promise<Boolean> {
        try {
            const status = await this.providerRepository.changeProviderUnBlockStatus(id);
            return status ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }

    //gets approvals detail
    async getApprovalDetails(id: string): Promise<IApprovalDetails[] | null> {
        try {
            const approvalData = await this.approvalRepository.findApprovalDetail(id);
            return approvalData;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    //updates approval detail status to approved or rejected
    async approvalStatusChange(id: string, status: string): Promise<Boolean> {
        try {
            const updatedData = await this.approvalRepository.updateApprovalStatus(id, status);
            if (updatedData?.provider_id) {
                const providerData = await this.providerRepository.getProviderDataWithId(
                    updatedData.provider_id.toString()
                );

                if (updatedData?.status === "Approved") {
                    if (providerData) {
                        if (updatedData?.service_id) {
                            await this.providerRepository.updateProviderServiceApproval(
                                providerData._id,
                                updatedData.service_id
                            );
                        }
                        await sentMail(
                            providerData.email,
                            "Fixify - Approval Confirmation",
                            `<!DOCTYPE html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Fixify - Approval Confirmation</title>
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        background-color: #f4f4f4;
                                        margin: 0;
                                        padding: 0;
                                    }
                                    .email-container {
                                        max-width: 600px;
                                        margin: 20px auto;
                                        background-color: #ffffff;
                                        border-radius: 8px;
                                        overflow: hidden;
                                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                    }
                                    .header {
                                        background-color: #007bff;
                                        color: #ffffff;
                                        text-align: center;
                                        padding: 20px;
                                    }
                                    .header h1 {
                                        margin: 0;
                                        font-size: 24px;
                                    }
                                    .content {
                                        padding: 20px;
                                        color: #333333;
                                    }
                                    .content h2 {
                                        font-size: 20px;
                                        margin-bottom: 10px;
                                    }
                                    .content p {
                                        font-size: 16px;
                                        line-height: 1.6;
                                    }
                                    .footer {
                                        background-color: #f4f4f4;
                                        text-align: center;
                                        padding: 10px;
                                        font-size: 14px;
                                        color: #666666;
                                    }
                                    .footer a {
                                        color: #007bff;
                                        text-decoration: none;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="email-container">
                                    <div class="header">
                                        <h1>Fixify</h1>
                                    </div>
                                    <div class="content">
                                        <h2>Your Request Has Been Approved!</h2>
                                        <p>Dear Provider,</p>
                                        <p>We are excited to inform you that your request to join <strong>Fixify</strong> has been successfully approved! 🎉</p>
                                        <p>You can now start working with Fixify and providing your services to our valued customers. Log in to your account to get started and explore the opportunities waiting for you.</p>
                                        <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:support@fixify.com">support@fixify.com</a>.</p>
                                        <p>Welcome to the Fixify family! We look forward to working with you.</p>
                                        <p>Best regards,<br>The Fixify Team</p>
                                    </div>
                                    <div class="footer">
                                        <p>© 2025 Fixify. All rights reserved.</p>
                                        <p><a href="https://fixify.com">Visit our website</a></p>
                                    </div>
                                </div>
                            </body>
                            </html>`
                        );
                        sendNotfication(
                            providerData._id.toString(),
                            "Your request has been approved successfully.You can now work as a fixify technician",
                            "Approval"
                        );
                    }
                } else if (providerData) {
                    await sentMail(
                        providerData.email,
                        "Fixify - Request Rejection",
                        `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Fixify - Request Rejection</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    background-color: #f4f4f4;
                                    margin: 0;
                                    padding: 0;
                                }
                                .email-container {
                                    max-width: 600px;
                                    margin: 20px auto;
                                    background-color: #ffffff;
                                    border-radius: 8px;
                                    overflow: hidden;
                                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                }
                                .header {
                                    background-color: #007bff;
                                    color: #ffffff;
                                    text-align: center;
                                    padding: 20px;
                                }
                                .header h1 {
                                    margin: 0;
                                    font-size: 24px;
                                }
                                .content {
                                    padding: 20px;
                                    color: #333333;
                                }
                                .content h2 {
                                    font-size: 20px;
                                    margin-bottom: 10px;
                                }
                                .content p {
                                    font-size: 16px;
                                    line-height: 1.6;
                                }
                                .footer {
                                    background-color: #f4f4f4;
                                    text-align: center;
                                    padding: 10px;
                                    font-size: 14px;
                                    color: #666666;
                                }
                                .footer a {
                                    color: #007bff;
                                    text-decoration: none;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="email-container">
                                <div class="header">
                                    <h1>Fixify</h1>
                                </div>
                                <div class="content">
                                    <h2>Your Request Has Been Rejected</h2>
                                    <p>Dear Provider,</p>
                                    <p>We regret to inform you that your request to join <strong>Fixify</strong> has been rejected. After careful consideration, we found that your application did not meet our current requirements due to <strong>lack of experience</strong> or <strong>work perfection</strong>.</p>
                                    <p>We understand that this news may be disappointing, and we encourage you to continue improving your skills and gaining experience. You are welcome to reapply in the future when you feel more confident in meeting our standards.</p>
                                    <p>If you have any questions or would like further details about the decision, please feel free to contact our support team at <a href="mailto:support@fixify.com">support@fixify.com</a>.</p>
                                    <p>Thank you for your interest in Fixify, and we wish you the best in your future endeavors.</p>
                                    <p>Best regards,<br>The Fixify Team</p>
                                </div>
                                <div class="footer">
                                    <p>© 2025 Fixify. All rights reserved.</p>
                                    <p><a href="https://fixify.com">Visit our website</a></p>
                                </div>
                            </div>
                        </body>
                        </html>`
                    );
                }
            }

            return updatedData ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }

    //get all services
    async getServices(
        search: string,
        page: string,
        filter: string
    ): Promise<IPaginatedServices | null> {
        try {
            const services = await this.serviceRepository.getServicesByFilter(search, page, filter);

            return services;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
    //update service status
    async changeServiceStatus(status: string, id: string): Promise<Boolean> {
        try {
            const statusChange = await this.serviceRepository.updateServiceStatus(id, status);
            return statusChange ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }
    // create new service
    async createService(data: IAddService): Promise<IResponse> {
        try {
            const exists = await this.serviceRepository.getServiceByName(data.serviceName);
            if (!exists) {
                const status = await this.serviceRepository.createService(data);
                return {
                    success: true,
                    message: "Service created Successfully",
                    data: null,
                };
            } else {
                return {
                    success: false,
                    message: "Service already exists",
                    data: null,
                };
            }
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Error in creating service",
                data: null,
            };
        }
    }
    // get service details with id
    async getServiceDetails(id: string): Promise<IServices | null> {
        try {
            return await this.serviceRepository.getServiceById(id);
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
    //update service
    async updateService(id: string, data: IAddService): Promise<IResponse> {
        try {
            const serviceStatus = await this.serviceRepository.getServiceByFilter(
                id,
                data.serviceName
            );
            if (serviceStatus) {
                return {
                    success: false,
                    message: "Service exists already",
                    data: null,
                };
            } else {
                const updated = await this.serviceRepository.updateServiceData(id, data);

                return updated
                    ? { success: true, message: "Service updated Successfully", data: null }
                    : { success: false, message: "Failed to update Service", data: null };
            }
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Failed to update service",
                data: null,
            };
        }
    }

    //fetches all bookings
    async fetchBookings(page: number): Promise<IResponse> {
        try {
            const bookingStatus = await this.bookingRepository.getAllBookings(page);

            return bookingStatus.success
                ? {
                      success: true,
                      message: bookingStatus.message,
                      data: bookingStatus.data,
                  }
                : {
                      success: false,
                      message: bookingStatus.message,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.messaege);
            return {
                success: false,
                message: "Failed to fetch bookings",
                data: null,
            };
        }
    }
    //fetch sales data for sales report
    async fetchSalesData(queries: {
        page: string;
        fromDate: string;
        toDate: string;
    }): Promise<IResponse> {
        try {
            const fetchingStatus = await this.bookingRepository.getSalesData(queries);

            return fetchingStatus.success
                ? {
                      success: true,
                      message: fetchingStatus.message,
                      data: fetchingStatus.data,
                  }
                : {
                      success: false,
                      message: fetchingStatus.message,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Failed to fetch sales data",
                data: null,
            };
        }
    }
    //fetch admin dashboard title data,booking status chart and top 5 booked services
    async fetchDashboardData(): Promise<IResponse> {
        try {
            const totalUserData = await this.userRepository.getActiveUsersCount();
            if (!totalUserData.success) {
                return {
                    success: false,
                    message: "Failed to fetch dashboard data",
                    data: null,
                };
            }
            const totalProviderData = await this.providerRepository.getActiveProvidersCount();
            if (!totalProviderData.success) {
                return {
                    success: false,
                    message: "Failed to fetch dashboard data",
                    data: null,
                };
            }

            const totalBookingData = await this.bookingRepository.getTotalBookingData();

            if (!totalBookingData.success) {
                return {
                    success: false,
                    message: "Failed to fetch dashboard data",
                    data: null,
                };
            }

            return {
                success: true,
                message: "Fetched dashboard tiles",
                data: {
                    ...totalBookingData.data,
                    totalProviders: totalProviderData.data,
                    totalUsers: totalUserData.data,
                },
            };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Failed to fetch dashboard data",
                data: null,
            };
        }
    }

    async fetchRevenueData(period: string): Promise<IResponse> {
        try {
            const revenueData = await this.paymentRepository.getRevenueData(period);

            if (!revenueData.success) {
                return {
                    success: false,
                    message: "Failed to fetch dashboard revenue data",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Fetched dashboard revenue data",
                data: revenueData.data,
            };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Failed to fetch dashboard revenue data",
                data: null,
            };
        }
    }
}
export default AdminService;
