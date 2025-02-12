import { ObjectId } from "mongoose";
import axios from "axios";
import { messages } from "../Constants/Messages";
import { generateOtp, hashOtp, compareOtps } from "../Utils/GenerateOtp";
import { oAuth2Client } from "../Utils/GoogleConfig";
import { sentMail } from "../Utils/SendMail";
import { hashPassword, comparePasswords } from "../Utils/HashPassword";
import { generateTokens } from "../Utils/GenerateTokens";
import { verifyToken } from "../Utils/CheckToken";
import IProviderService from "../Interfaces/Provider/ProviderServiceInterface";
import { IProviderWithService, SignUp } from "../Interfaces/Provider/SignIn";
import { ISignIn } from "../Interfaces/Provider/SignIn";
import { IUpdateProfile } from "../Interfaces/Provider/SignIn";
import { IProviderRegistration } from "../Interfaces/Provider/SignIn";
import { IServices } from "../Models/ProviderModels/ServiceModel";
import { IProvider } from "../Models/ProviderModels/ProviderModel";
import IProviderRepository from "../Interfaces/Provider/ProviderRepositoryInterface";
import IServiceRepository from "../Interfaces/Service/IServiceRepository";
import IOtpRepository from "../Interfaces/Otp/OtpRepositoryInterface";
import IApprovalRepository from "../Interfaces/Approval/ApprovalRepositoryInterface";
import { IAddress } from "../Interfaces/Provider/SignIn";
import IScheduleRepository from "../Interfaces/Schedule/ScheduleRepositoryInterface";
import IBookingRepository from "../Interfaces/Booking/IBookingRepository";
import IPaymentRepository from "../Interfaces/Payment/PaymentRepositoryInterface";
import IChatRepository from "../Interfaces/Chat/IChatRepository";

interface IResponse {
    success: boolean;
    message: string;
    data: string | null;
}
//interface for signup response
export interface ISignUpResponse {
    success: boolean;
    message: string;
    email: string | null;
}

//interface for signin response
export interface ISignInResponse {
    success: boolean;
    message: string;
    email: string | null;
    _id: ObjectId | null;
    service_id: ObjectId | null;
    name: string;
    url: string;
    mobileNo: string;
    accessToken: string | null;
    refreshToken: string | null;
}

//interface for otp response
export interface IOtpResponse {
    success: boolean;
    message: string;
}

//interface for refresh token response
export interface IRefreshTokenResponse {
    accessToken: string | null;
    message: string;
}

class ProviderService implements IProviderService {
    //injecting respositories dependency to service
    constructor(
        private providerRepository: IProviderRepository,
        private otpRepository: IOtpRepository,
        private serviceRepository: IServiceRepository,
        private approvalRepository: IApprovalRepository,
        private scheduleRepository: IScheduleRepository,
        private bookingRepository: IBookingRepository,
        private paymentRepository: IPaymentRepository,
        private chatRepository: IChatRepository
    ) {}
    //get all services
    async getServices(): Promise<IServices[] | null> {
        try {
            const services = await this.serviceRepository.getAllServices();

            if (services.length > 0) {
                return services;
            } else {
                return null;
            }
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
    //create provider account to db
    async createProvider(data: SignUp): Promise<ISignUpResponse | null> {
        try {
            const exists = await this.providerRepository.findProviderByEmail(data.email); //checking the registration status of the provider

            if (!exists) {
                const hashedPassword = await hashPassword(data.password);
                data.password = hashedPassword;

                const status = await this.providerRepository.insertProvider({
                    userName: data.userName,
                    email: data.email,
                    mobileNo: data.mobileNo,
                    password: data.password,
                    url: "",
                    passwordConfirm: data.passwordConfirm,
                    service_id: data.service_id,
                    google_id: null,
                }); //inserts provider data to the database

                if (status) {
                    const otpStatus = await this.otpSend(status.email, status._id); //generate and sends otp via email

                    if (otpStatus) {
                        //returns this response if otp sent sucessfully

                        return {
                            success: true,
                            message: messages.authentication.signUpSucess,
                            email: status.email,
                        };
                    } else {
                        //returns this response if otp send failure

                        return {
                            success: false,
                            message: messages.authentication.emailOtpFailure,
                            email: status.email,
                        };
                    }
                } else {
                    //returns this reponse if the sign up to database failure

                    return {
                        success: false,
                        message: messages.authentication.signUpFailure,
                        email: null,
                    };
                }
            } else {
                //returns this if the email already exists

                return {
                    success: false,
                    message: messages.authentication.dupicateEmail,
                    email: null,
                };
            }
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    //generate and send otp via mail
    async otpSend(email: string, id: ObjectId): Promise<boolean> {
        try {
            const otp = generateOtp(); //utility function generates otp

            const mail = await sentMail(
                email,
                "Verification Mail",
                `<p>Enter this code <b>${otp}</b> to verify your Fixify account.</p><p>This code expires in <b>2 Minutes</b></p>`
            ); //this utility function sends otp through mail

            if (mail) {
                // works if mail is sucessfully sent

                const hashedOtp = await hashOtp(otp); // this utility function hash otp

                const otpStatus = await this.otpRepository.storeOtp(hashedOtp, id); //stores otp in the database

                return otpStatus ? true : false; //returns status if otp storing to db is success or failure
            }
            return mail;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }

    /**
     *
     * @param email email id of the provider
     * @returns true/false based on the otp resend status
     */

    async otpResend(email: string): Promise<boolean> {
        try {
            const data = await this.providerRepository.findProviderByEmail(email); //checks the provider exists and fetch the provider data

            if (data) {
                //works if the provider account exists

                const otp = generateOtp(); //generate otp

                const mail = await sentMail(
                    email,
                    "Verification Mail",
                    `<p>Enter this code <b>${otp}</b> to verify your Fixify account.</p><p>This code expires in <b>2 Minutes</b></p>`
                ); //utility function sends the otp via email to the provider

                if (mail) {
                    //executes if mail mail sending successfull

                    const hashedOtp = await hashOtp(otp); //this utility function hashes otp

                    const otpStatus = await this.otpRepository.storeOtp(hashedOtp, data._id); //stores otp to the database

                    return otpStatus ? true : false; //returns the otp storing status
                }
                return mail; //returns the mail sending status
            }

            return false; //returns this if the provider account is not found
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }

    //verifiying otp
    async otpCheck(otp: string, email: string): Promise<IOtpResponse> {
        {
            try {
                const provider = await this.providerRepository.findProviderByEmail(email); //gets provider account details

                if (provider) {
                    //executs if the provider exists

                    const data = await this.providerRepository.findOtpWithId(provider._id); //does look up between provider and otp collection and return the data

                    //checking whether otp exists in the aggregated result
                    if (data?.otp[0]?.value) {
                        const otpStatus = await compareOtps(otp, data.otp[0].value); //utility function compares the otps

                        if (otpStatus) {
                            // works if otp is verified

                            const verified = await this.providerRepository.verifyProvider(
                                provider._id
                            ); //change the verification status of provider to true

                            return { success: true, message: "Otp verified successfully" };
                        } else {
                            //return if the otp is invalid

                            return { success: false, message: "Invalid Otp" };
                        }
                    } else if (!data?.otp.length) {
                        //evaluates true if the otp is not found

                        return { success: false, message: "Otp is expired" };
                    }
                } //if provider account doesnot exists returns
                return {
                    success: false,
                    message: "Provider not found",
                };
            } catch (error: any) {
                console.log(error.message);
                return { success: false, message: "Otp error" };
            }
        }
    }

    //authenticates provider by checking the account , verifiying the credentials and sends the tokens or proceed to otp verifiction if not verified
    async authenticateProvider(data: ISignIn): Promise<ISignInResponse | null> {
        try {
            const exists = await this.providerRepository.findProviderByEmail(data.email); //gets provider data with given email

            if (exists) {
                //if provider exists

                if (exists.is_blocked) {
                    //if the provider is blocked by admin
                    return {
                        success: false,
                        message: "Account blocked by admin",
                        service_id: null,
                        email: "",
                        _id: null,
                        name: "",
                        url: "",
                        mobileNo: "",
                        accessToken: null,
                        refreshToken: null,
                    };
                }
                // if the providers signed up via google
                if (exists.google_id) {
                    return {
                        success: false,
                        message: "Please Sign in With Google",
                        email: "",
                        _id: null,
                        service_id: null,
                        name: "",
                        url: "",
                        mobileNo: "",
                        accessToken: null,
                        refreshToken: null,
                    };
                }

                const passwordStatus = await comparePasswords(data.password, exists.password); // utility function compares passwords

                if (passwordStatus) {
                    //executes if the passwords are matching

                    //checks the provider is verified or not
                    if (exists.is_verified) {
                        //token creation logic here

                        const tokens = generateTokens(
                            exists._id.toString(),
                            exists.email,
                            "provider"
                        ); //generates access and refresh tokens

                        return {
                            success: true,
                            message: "Signed in Sucessfully",
                            email: exists.email,
                            _id: exists._id,
                            name: exists.name,
                            url: exists.url,
                            service_id: exists.service_id,
                            mobileNo: exists.mobile_no,
                            accessToken: tokens.accessToken,
                            refreshToken: tokens.refreshToken,
                        };
                    } else {
                        // sends otp and waits for otp verification

                        const status = await this.otpResend(exists.email); //resends otp for verifiying the provider

                        //sends this reponse to indicate that the provider still needs to verify
                        return {
                            success: false,
                            message: "Didn't complete otp verification",
                            email: exists.email,
                            _id: exists._id,
                            name: exists.name,
                            url: exists.url,
                            service_id: exists.service_id,
                            mobileNo: exists.mobile_no,
                            accessToken: null,
                            refreshToken: null,
                        };
                    }
                } else {
                    //if the credentials are wrong returns this
                    return {
                        success: false,
                        message: "Invalid Credentials",
                        email: null,
                        _id: null,
                        name: "",
                        service_id: null,
                        url: "",
                        mobileNo: "",
                        accessToken: null,
                        refreshToken: null,
                    };
                }
            } else {
                //executes this if the provider account is not found
                return {
                    success: false,
                    message: "Account doesnot exist",
                    email: null,
                    name: "",
                    mobileNo: "",
                    _id: null,
                    url: "",
                    service_id: null,
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
    async googleAuth(code: string): Promise<ISignInResponse> {
        try {
            const googleRes = await oAuth2Client.getToken(code);

            oAuth2Client.setCredentials(googleRes.tokens);

            const userRes = await axios.get(
                `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
            );

            const { email, name, picture, id } = userRes.data;

            const provider = await this.providerRepository.findProviderByEmail(email);

            if (!provider) {
                const saveProvider = await this.providerRepository.insertProvider({
                    userName: name,
                    email: email,
                    password: "",
                    service_id: null,
                    passwordConfirm: "",
                    url: picture,
                    mobileNo: "",
                    google_id: id,
                });

                if (saveProvider) {
                    const tokens = generateTokens(saveProvider._id.toString(), email, "provider");
                    return {
                        success: true,
                        message: "Signed in sucessfully",
                        email: saveProvider.email,
                        _id: saveProvider._id,
                        name: saveProvider.name,
                        url: saveProvider.url,
                        service_id: saveProvider.service_id,
                        mobileNo: "",
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                    };
                }
                return {
                    success: false,
                    message: "Google Sign In failed",
                    email: null,
                    _id: null,
                    service_id: null,
                    name: "",
                    url: "",
                    mobileNo: "",
                    accessToken: null,
                    refreshToken: null,
                };
            } else {
                if (provider.is_blocked) {
                    return {
                        success: false,
                        message: "Account blocked by admin",
                        email: "",
                        _id: null,
                        name: "",
                        url: "",
                        service_id: null,
                        mobileNo: "",
                        accessToken: null,
                        refreshToken: null,
                    };
                }

                const tokens = generateTokens(provider._id.toString(), email, "provider");
                return {
                    success: true,
                    message: "Signed in sucessfully",
                    email: provider.email,
                    _id: provider._id,
                    name: provider.name,
                    url: provider.url,
                    service_id: provider.service_id,
                    mobileNo: provider.mobile_no,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                };
            }
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Sign In Failed",
                email: null,
                _id: null,
                name: "",
                service_id: null,
                url: "",
                mobileNo: "",
                accessToken: null,
                refreshToken: null,
            };
        }
    }
    //provider edit profile to db
    async editProfile(data: IUpdateProfile): Promise<Partial<IProvider | null>> {
        try {
            const status = await this.providerRepository.updateProviderWithId(data);
            if (!status) {
                return null;
            } else {
                return status;
            }
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    //provider get look up profile data with services and address in future
    async getProfileData(id: string): Promise<Partial<IProviderWithService> | null> {
        try {
            const status = await this.providerRepository.fetchProviderProfileData(id);
            return status;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
    //register provider for approval request
    async registerProvider(data: IProviderRegistration): Promise<IOtpResponse> {
        try {
            const exists = await this.approvalRepository.approvalExists(data._id);

            if (!exists) {
                let expertise = data.expertise;

                if (!data.expertise) {
                    const providerData = await this.providerRepository.getProviderDataWithId(
                        data._id
                    );
                    if (providerData?.service_id) {
                        expertise = providerData.service_id.toString();
                    }
                }
                const status = await this.approvalRepository.providerApprovalRegistration({
                    ...data,
                    expertise,
                });
                if (status) {
                    return {
                        success: true,
                        message: "Sucessfully registered request",
                    };
                } else {
                    return {
                        success: false,
                        message: "Cannot register at this moment",
                    };
                }
            } else {
                return {
                    success: false,
                    message: "Already requested for approval",
                };
            }
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Failed to register",
            };
        }
    }

    //verifies email for sending otp for forgot password
    async forgotPasswordVerify(email: string): Promise<IResponse> {
        try {
            const userData = await this.providerRepository.findProviderByEmail(email);
            if (!userData) {
                return {
                    success: false,
                    message: "Mail not registered",
                    data: null,
                };
            }
            if (userData?.google_id) {
                return {
                    success: false,
                    message: "Please Sign in with your google account",
                    data: null,
                };
            }
            const otp = generateOtp(); //utility function generates otp

            const mail = await sentMail(
                email,
                "Forgot Password Verification",
                `<p>Enter this code <b>${otp}</b> to verify your email for resetting the password.</p><p>This code expires in <b>2 Minutes</b></p>`
            ); //this utility function sends otp through mail

            if (mail) {
                // works if mail is sucessfully sent

                const hashedOtp = await hashOtp(otp); // this utility function hash otp

                const otpStatus = await this.otpRepository.storeOtp(hashedOtp, userData._id); //stores otp in the database

                return {
                    success: true,
                    message: "Mail sent successfully",
                    data: userData.email,
                };
            }
            return {
                success: false,
                message: "Failed to verify mail",
                data: null,
            };
        } catch (error: any) {
            console.log(error.message);
            return { success: false, message: "Couldnt verify mail", data: null };
        }
    }

    //verifiying otp for verifiying account
    async passworOtpCheck(otp: string, email: string): Promise<IOtpResponse> {
        {
            try {
                const provider = await this.providerRepository.findProviderByEmail(email); //gets provider account details

                if (provider) {
                    //executes if the account exists

                    const data = await this.providerRepository.findOtpWithId(provider._id); //does look up between provider and otp collection and return the data

                    //checking whether otp exists in the aggregated result
                    if (data?.otp[0]?.value) {
                        const otpStatus = await compareOtps(otp, data.otp[0].value); //utility function compares the otps

                        if (otpStatus) {
                            // works if otp is verified

                            return { success: true, message: "Otp verified successfully" };
                        } else {
                            //return if the otp is invalid

                            return { success: false, message: "Invalid Otp" };
                        }
                    } else if (!data?.otp.length) {
                        //evaluates true if the otp is not found

                        return { success: false, message: "Otp is expired" };
                    }
                } //if user account doesnot exists returns
                return {
                    success: false,
                    message: "Account not found",
                };
            } catch (error: any) {
                console.log(error.message);
                return { success: false, message: "Otp error" };
            }
        }
    }
    //find and resets with new password
    async changePassword(email: string, password: string): Promise<IResponse> {
        try {
            const hashedPassword = await hashPassword(password);

            const updateStatus = await this.providerRepository.updatePassword(
                email,
                hashedPassword
            );
            return updateStatus
                ? {
                      success: true,
                      message: "Password updated sucessfully",
                      data: null,
                  }
                : {
                      success: false,
                      message: "Failed to update password",
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Failed to update password",
                data: null,
            };
        }
    }

    // verifies the old password
    async verifyPassword(id: string, password: string): Promise<IResponse> {
        try {
            const data = await this.providerRepository.getProviderDataWithId(id);

            if (data?.password) {
                const status = await comparePasswords(password, data.password);
                return status
                    ? {
                          success: true,
                          message: "Password verified successfully",
                          data: null,
                      }
                    : {
                          success: false,
                          message: "Incorrect Password",
                          data: null,
                      };
            } else {
                return {
                    success: false,
                    message: "Invalid id",
                    data: null,
                };
            }
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Failed to verify password",
                data: null,
            };
        }
    }

    // creates a schedule for a day with a selected location with timely slots

    async addSchedule(id: string, date: string, address: IAddress): Promise<IResponse> {
        try {
            const status = await this.scheduleRepository.createSchedule(id, date, address);

            return status
                ? {
                      success: true,
                      message: "Schedule created successfully",
                      data: null,
                  }
                : {
                      success: false,
                      message: "Failed to create schedule",
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Failed to create schedule",
                data: null,
            };
        }
    }

    //fetches schedule from the db
    async getSchedule(id: string, date: string): Promise<IResponse> {
        try {
            //fetches schedule details from the database
            const scheduleResponse = await this.scheduleRepository.fetchSchedule(id, date);
            if (scheduleResponse.success) {
                return {
                    success: true,
                    message: "Fetched schedule successfully", //on success
                    data: scheduleResponse.data,
                };
            } else {
                return {
                    success: false, //return on errors
                    message: scheduleResponse.message,
                    data: null,
                };
            }
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Failed to fetch services",
                data: null,
            };
        }
    }

    //get all requests
    async getAllRequests(provider_id: string): Promise<IResponse> {
        try {
            const requests = await this.scheduleRepository.findAllRequests(provider_id);

            return requests.success
                ? {
                      success: true,
                      message: requests.message,
                      data: requests.data,
                  }
                : {
                      success: false,
                      message: requests.message,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Internal server error",
                data: null,
            };
        }
    }
    //confirms or cancels the booking requests
    async changeBookingRequestStatus(request_id: string, status: string): Promise<IResponse> {
        try {
            let updateStatus: boolean | null = null;

            if (status === "booked") {
                const requestData = await this.scheduleRepository.getBookingRequest(request_id);

                if (!requestData.success || !requestData.data || requestData.data.length === 0) {
                    return {
                        success: false,
                        message: "Booking request not found",
                        data: null,
                    };
                }

                const bookingStatus = await this.bookingRepository.createBooking(
                    requestData.data[0],
                    request_id
                );
                console.log(requestData.data[0].requests, "requestData");
                await this.scheduleRepository.changeTimeSlotStatus(request_id);
                if (!bookingStatus) {
                    return {
                        success: false,
                        message: "Failed to create booking",
                        data: null,
                    };
                }

                updateStatus = await this.scheduleRepository.updateBookingRequestStatus(
                    request_id,
                    "booked"
                );
            } else {
                updateStatus = await this.scheduleRepository.updateBookingRequestStatus(
                    request_id,
                    status
                );
            }

            if (!updateStatus) {
                return {
                    success: false,
                    message: "Failed to update booking status",
                    data: null,
                };
            }

            return {
                success: true,
                message: `Booking completed successfully`,
                data: null,
            };
        } catch (error: any) {
            console.error("Error in changeBookingRequestStatus:", error.message);
            return {
                success: false,
                message: "Internal server error",
                data: null,
            };
        }
    }

    //fetch all booking details
    async fetchBookings(id: string, page: number): Promise<IResponse> {
        try {
            const bookingStatus = await this.bookingRepository.getBookingsWithProviderId(id, page);

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

    //fetch booking details
    async fetchBookingDetail(id: string): Promise<IResponse> {
        try {
            const response = await this.bookingRepository.getBookingDetails(id);

            return response.success
                ? {
                      success: true,
                      message: response.message,
                      data: response.data,
                  }
                : {
                      success: false,
                      message: response.message,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Failed to fetch booking details",
                data: null,
            };
        }
    }
    // creates a payment document with amount and mode for payment from user side
    async intiatePaymentRequest(id: string, amount: number, method: string): Promise<IResponse> {
        try {
            const response = await this.paymentRepository.savePayment(amount, method);

            if (!response.data) {
                return {
                    success: true,
                    message: response.message,
                    data: null,
                };
            }
            const status = await this.bookingRepository.updateBookingWithPaymentId(
                id,
                response.data._id
            );

            return status
                ? {
                      success: true,
                      message: response.message,
                      data: response.data,
                  }
                : {
                      success: false,
                      message: "Failed to update booking with payment ID",
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Failed to initiate payment request",
                data: null,
            };
        }
    }

    //get all chat data
    async fetchChat(room_id: string): Promise<IResponse> {
        try {
            const chatResponse = await this.chatRepository.fetchChats(room_id);

            return chatResponse.success
                ? {
                      success: true,
                      message: chatResponse.message,
                      data: chatResponse.data,
                  }
                : {
                      success: false,
                      message: chatResponse.message,
                      data: null,
                  };
        } catch (error: any) {
            return {
                success: false,
                message: "Internal server error",
                data: null,
            };
        }
    }
}

export default ProviderService;
