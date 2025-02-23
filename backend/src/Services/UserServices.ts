import IUserService from "../Interfaces/User/UserServiceInterface";
import { ISlotFetch, IUpdateProfile, SignUp } from "../Interfaces/User/SignUpInterface";
import { ISignIn } from "../Interfaces/User/SignUpInterface";
import IUserRepository from "../Interfaces/User/UserRepositoryInterface";
import { messages } from "../Constants/Messages";
import { generateOtp, hashOtp, compareOtps } from "../Utils/GenerateOtp";
import { sentMail } from "../Utils/SendMail";
import { ObjectId } from "mongoose";
import { hashPassword, comparePasswords } from "../Utils/HashPassword";
import { generateTokens } from "../Utils/GenerateTokens";
import { verifyToken } from "../Utils/CheckToken";
import { oAuth2Client } from "../Utils/GoogleConfig";
import axios from "axios";
import { IUser } from "../Models/UserModels/UserModel";
import { IAddAddress } from "../Interfaces/User/SignUpInterface";
import { IResponse } from "./AdminServices";
import IOtpRepository from "../Interfaces/Otp/OtpRepositoryInterface";
import { IBookingRequestData, IReviewData } from "../Interfaces/User/SignUpInterface";
import { IAddressRepository } from "../Interfaces/Address/IAddressRepository";
import IScheduleRepository from "../Interfaces/Schedule/ScheduleRepositoryInterface";
import IBookingRepository from "../Interfaces/Booking/IBookingRepository";
import IPaymentRepository from "../Interfaces/Payment/PaymentRepositoryInterface";
import { createPaymentIntent } from "../Utils/stripeService";
import IChatRepository from "../Interfaces/Chat/IChatRepository";
import IReviewRepository from "../Interfaces/Review/IReviewRepository";
import { uploadImages } from "../Utils/Cloudinary";

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

class UserService implements IUserService {
    //injecting respositories dependency to service
    constructor(
        private userRepository: IUserRepository,
        private otpRepository: IOtpRepository,
        private addressRepository: IAddressRepository,
        private scheduleRepository: IScheduleRepository,
        private bookingRepository: IBookingRepository,
        private paymentRepository: IPaymentRepository,
        private chatRepository: IChatRepository,
        private reviewRepository: IReviewRepository
    ) {}

    /**
     * Creates a user account by validating the user's email and password,
     * hashing the password, storing the data, and sending an OTP for verification.
     *
     * @param {SignUp} userData - User registration data
     * @returns {Promise<ISignUpResponse|null>} - Response indicating success or failure
     */

    async createUser(userData: SignUp): Promise<ISignUpResponse | null> {
        try {
            const exists = await this.userRepository.findUserByEmail(userData.email); //checking the registration status of the user

            if (!exists) {
                const hashedPassword = await hashPassword(userData.password);
                userData.password = hashedPassword;

                const status = await this.userRepository.insertUser({
                    ...userData,
                    google_id: null,
                    url: "",
                }); //inserts userdata to the database

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
     * @param email email id of the user
     * @returns true/false based on the otp resend status
     */

    async otpResend(email: string): Promise<boolean> {
        try {
            const data = await this.userRepository.findUserByEmail(email); //checks the user exists and fetch the user data

            if (data) {
                //works if the user account exists

                const otp = generateOtp(); //generate otp

                const mail = await sentMail(
                    email,
                    "Verification Mail",
                    `<p>Enter this code <b>${otp}</b> to verify your Fixify account.</p><p>This code expires in <b>2 Minutes</b></p>`
                ); //utility function sends the otp via email to the user

                if (mail) {
                    //executes if mail mail sending successfull

                    const hashedOtp = await hashOtp(otp); //this utility function hashes otp

                    const otpStatus = await this.otpRepository.storeOtp(hashedOtp, data._id); //stores otp to the database

                    return otpStatus ? true : false; //returns the otp storing status
                }
                return mail; //returns the mail sending status
            }

            return false; //returns this if the user account is not found
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }

    //verifiying otp for verifiying account
    async otpCheck(otp: string, email: string): Promise<IOtpResponse> {
        {
            try {
                const user = await this.userRepository.findUserByEmail(email); //gets user account details

                if (user) {
                    //executes if the user exists

                    const data = await this.userRepository.findOtpWithId(user._id); //does look up between user and otp collection and return the data

                    //checking whether otp exists in the aggregated result
                    if (data?.otp[0]?.value) {
                        const otpStatus = await compareOtps(otp, data.otp[0].value); //utility function compares the otps

                        if (otpStatus) {
                            // works if otp is verified

                            const verified = await this.userRepository.verifyUser(user._id); //change the verification status of user to true

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
                    message: "User not found",
                };
            } catch (error: any) {
                console.log(error.message);
                return { success: false, message: "Otp error" };
            }
        }
    }

    //authenticates uesr by checking the account , verifiying the credentials and sends the tokens or proceed to otp verifiction if not verified
    async authenticateUser(userData: ISignIn): Promise<ISignInResponse | null> {
        try {
            const exists = await this.userRepository.findUserByEmail(userData.email); //gets user data with given email

            if (exists) {
                //checks whether the user is blocked by admin
                if (exists.is_blocked) {
                    return {
                        success: false,
                        message: "Account blocked by admin",
                        email: "",
                        _id: null,
                        name: "",
                        url: "",
                        mobileNo: "",
                        accessToken: null,
                        refreshToken: null,
                    };
                }
                // if the user signed in via google
                if (exists.google_id) {
                    return {
                        success: false,
                        message: "Please Sign in With Google",
                        email: "",
                        _id: null,
                        name: "",
                        url: "",
                        mobileNo: "",
                        accessToken: null,
                        refreshToken: null,
                    };
                }

                const passwordStatus = await comparePasswords(userData.password, exists.password); // utility function compares passwords

                if (passwordStatus) {
                    //executes if the passwords are matching

                    //checks the user is verified or not
                    if (exists.is_verified) {
                        //token creation logic here

                        const tokens = generateTokens(exists._id.toString(), exists.email, "user"); //generates access and refresh tokens

                        return {
                            success: true,
                            message: "Signed in Sucessfully",
                            email: exists.email,
                            _id: exists._id,
                            name: exists.name,
                            url: exists.url,
                            mobileNo: exists.mobile_no,
                            accessToken: tokens.accessToken,
                            refreshToken: tokens.refreshToken,
                        };
                    } else {
                        // sends otp and waits for otp verification

                        const status = await this.otpResend(exists.email); //resends otp for verifiying the user

                        //sends this reponse to indicate that the user still needs to verify
                        return {
                            success: false,
                            message: "Didn't complete otp verification",
                            email: exists.email,
                            _id: exists._id,
                            name: exists.name,
                            url: exists.url,
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
                        email: exists.email,
                        _id: null,
                        name: "",
                        url: "",
                        mobileNo: "",
                        accessToken: null,
                        refreshToken: null,
                    };
                }
            } else {
                //executes this if the user account is not found
                return {
                    success: false,
                    message: "Account doesnot exist",
                    email: null,
                    name: "",
                    mobileNo: "",
                    url: "",
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

    //sign in or sign up via google
    async googleAuth(code: string): Promise<ISignInResponse> {
        try {
            const googleRes = await oAuth2Client.getToken(code);

            oAuth2Client.setCredentials(googleRes.tokens);

            const userRes = await axios.get(
                `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
            );

            const { email, name, picture, id } = userRes.data;

            const user = await this.userRepository.findUserByEmail(email);

            if (!user) {
                const saveUser = await this.userRepository.insertUser({
                    userName: name,
                    email: email,
                    password: "",
                    passwordConfirm: "",
                    mobileNo: "",
                    url: picture,
                    google_id: id,
                });
                if (saveUser) {
                    const tokens = generateTokens(saveUser._id.toString(), email, "user");
                    return {
                        success: true,
                        message: "Signed in sucessfully",
                        email: saveUser.email,
                        _id: saveUser._id,
                        name: saveUser.name,
                        mobileNo: "",
                        url: saveUser.url,
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                    };
                }
                return {
                    success: false,
                    message: "Google Sign In failed",
                    email: null,
                    _id: null,
                    name: "",
                    mobileNo: "",
                    url: "",
                    accessToken: null,
                    refreshToken: null,
                };
            } else {
                if (user.is_blocked) {
                    return {
                        success: false,
                        message: "Account blocked by admin",
                        email: null,
                        _id: null,
                        name: "",
                        mobileNo: "",
                        url: "",
                        accessToken: null,
                        refreshToken: null,
                    };
                }
                const tokens = generateTokens(user._id.toString(), email, "user");
                return {
                    success: true,
                    message: "Signed in sucessfully",
                    email: user.email,
                    _id: user._id,
                    name: user.name,
                    url: user.url,
                    mobileNo: user.mobile_no,
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
                url: "",
                mobileNo: "",
                accessToken: null,
                refreshToken: null,
            };
        }
    }

    //user edit profile to db
    async editProfile(data: IUpdateProfile): Promise<Partial<IUser | null>> {
        try {
            const status = await this.userRepository.updateUserWithId(data);
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

    //fetches user document from db
    async getUserData(id: string): Promise<Partial<IUser | null>> {
        try {
            const status = await this.userRepository.getUserDataWithId(id);
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

    //verifies email for sending otp for forgot password
    async forgotPasswordVerify(email: string): Promise<IResponse> {
        try {
            const userData = await this.userRepository.findUserByEmail(email);
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
                const user = await this.userRepository.findUserByEmail(email); //gets user account details

                if (user) {
                    //executes if the user exists

                    const data = await this.userRepository.findOtpWithId(user._id); //does look up between user and otp collection and return the data

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

            const updateStatus = await this.userRepository.updatePassword(email, hashedPassword);
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
            const data = await this.userRepository.getUserDataWithId(id);

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

    //limits and checks for duplicate addresses and creates one
    async createAddress(address: IAddAddress): Promise<IResponse> {
        try {
            //count the number of addresses user have
            const addressCount = await this.addressRepository.countAddresses(address.id);

            if (addressCount === null) {
                return {
                    success: false,
                    message: "Failed to create address",
                    data: null,
                };
            } else {
                if (addressCount < 3) {
                    const exists = await this.addressRepository.checkDuplicate(address);

                    if (exists === null) {
                        return {
                            success: false,
                            message: "Failed to create address",
                            data: null,
                        };
                    } else if (exists) {
                        return {
                            success: false,
                            message: "Address already added",
                            data: null,
                        };
                    } else {
                        //creates address
                        const response = await this.addressRepository.createAddress(address);

                        return response
                            ? {
                                  success: true,
                                  message: "Address added successfully",
                                  data: null,
                              }
                            : { success: false, message: "Failed to create address", data: null };
                    }
                } else {
                    return {
                        success: false,
                        message: "You can only add upto 3 addressess",
                        data: null,
                    };
                }
            }
        } catch (error: any) {
            console.log(error.message);

            return {
                success: false,
                message: "Failed to create address",
                data: null,
            };
        }
    }

    // fetch all addresses related to user
    async findAddresses(userId: string): Promise<IResponse> {
        try {
            const addresses = await this.addressRepository.fetchAllAddress(userId);
            if (addresses === null) {
                return {
                    success: false,
                    message: "Failed to fetch addresses",
                    data: null,
                };
            } else {
                return {
                    success: true,
                    message: "Successfully fetched addresses",
                    data: addresses,
                };
            }
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Failed to fetch addresses",
                data: null,
            };
        }
    }

    //deletes address
    async changeAddressStatus(id: string): Promise<IResponse> {
        try {
            const status = await this.addressRepository.deleteAddress(id);

            return status
                ? {
                      success: true,
                      message: "Address deleted successfully",
                      data: null,
                  }
                : {
                      success: false,
                      message: "Failed to delete address",
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Failed to delete address",
                data: null,
            };
        }
    }

    // get address associated with user
    async getAddress(addressId: string): Promise<IResponse> {
        try {
            const address = await this.addressRepository.fetchAddress(addressId);

            if (address === null) {
                return {
                    success: false,
                    message: "Failed to fetch address",
                    data: null,
                };
            } else {
                return {
                    success: true,
                    message: "Successfully fetched address",
                    data: address,
                };
            }
        } catch (error: any) {
            return {
                success: false,
                message: "Failed to fetch addresses",
                data: null,
            };
        }
    }

    //update address
    async editAddress(address: IAddAddress, id: string): Promise<IResponse> {
        try {
            const updatedStatus = await this.addressRepository.updateAddress(address, id);

            return updatedStatus
                ? {
                      success: true,
                      message: "Address updated successfully",
                      data: null,
                  }
                : {
                      success: false,
                      message: "Failed to update address",
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);

            return {
                success: false,
                message: "Failed to update address",
                data: null,
            };
        }
    }

    //get all slots based on time location date and service
    async getSlots(data: ISlotFetch): Promise<IResponse> {
        try {
            const slots = await this.scheduleRepository.findSlots(data);

            return slots.success
                ? {
                      success: true,
                      message: "Slots fetched successfully",
                      data: slots.data,
                  }
                : {
                      success: false,
                      message: "Failed to fetch slots",
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);

            return {
                success: false,
                message: "Error in fetching slots",
                data: null,
            };
        }
    }

    //add a booking request to a slot
    async requestBooking(bookingData: IBookingRequestData): Promise<IResponse> {
        try {
            console.log(bookingData, "bookingd data");
            const time = new Date();
            //checks for duplicate requests
            const exists = await this.scheduleRepository.findBookingRequest(
                bookingData.user_id,
                bookingData.slot_id,
                bookingData.time,
                bookingData.date
            );

            if (exists.success) {
                return { success: false, message: exists.message, data: null };
            }

            const slots = await this.scheduleRepository.bookingRequestAdd(bookingData);

            return slots.success
                ? {
                      success: true,
                      message: slots.message,
                      data: slots.data,
                  }
                : {
                      success: false,
                      message: slots.message,
                      data: null,
                  };
        } catch (error: any) {
            console.log(error.message);

            return {
                success: false,
                message: "Error in booking slots",
                data: null,
            };
        }
    }

    //fetch all booking
    async fetchBookings(id: string, page: number): Promise<IResponse> {
        try {
            const bookingStatus = await this.bookingRepository.getBookingsWithUserId(id, page);

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

    //updates payment status to complete and adds site fee
    async processOnlinePayment(payment_id: string, amount: number): Promise<IResponse> {
        try {
            const response = await createPaymentIntent(amount);

            if (!response.success || !response.clientSecret) {
                return {
                    success: false,
                    message: response.message || "Failed to create payment intent",
                    data: null,
                };
            }

            const site_fee = Math.floor((amount * 10) / 100);

            const status = await this.paymentRepository.updatePaymentStatus(payment_id, site_fee);

            if (!status) {
                return {
                    success: false,
                    message: "Failed to update payment status",
                    data: null,
                };
            }

            return {
                success: true,
                message: "Payment status updated successfully",
                data: response,
            };
        } catch (error: any) {
            console.log(error.message);
            return {
                success: false,
                message: "Failed to update payment status",
                data: null,
            };
        }
    }

    //checks the time is 3 hours before the slot time
    async cancelBooking(booking_id: string): Promise<IResponse> {
        try {
            const booking = await this.bookingRepository.getBookingById(booking_id);
            if (!booking.success) {
                return { success: false, message: "Booking not found", data: null };
            }

            const slotTime = new Date(booking.data.time);
            const currentTime = new Date();

            // Check if current time is at least 3 hours before the slot time
            const threeHoursBeforeSlot = new Date(slotTime.getTime() - 3 * 60 * 60 * 1000);

            if (currentTime > threeHoursBeforeSlot) {
                return {
                    success: false,
                    message: "Cannot cancel booking less than 3 hours before the slot time",
                    data: null,
                };
            }

            const updatedBooking = await this.bookingRepository.updateBookingStatus(
                booking_id,
                "cancelled"
            );
            return {
                success: true,
                message: "Booking cancelled successfully",
                data: updatedBooking,
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

    // checks and creates review for a completed booking
    async processReviewCreation(
        reviewData: IReviewData,
        reviewImages: Express.Multer.File[]
    ): Promise<IResponse> {
        try {
            const image_urls = await uploadImages(reviewImages);
            if (image_urls.length === 0) {
                return {
                    success: false,
                    message: "Failed to store image",
                    data: null,
                };
            }
            const duplicateExists = await this.reviewRepository.duplicateReviewExists(
                reviewData.booking_id
            );
            if (duplicateExists.success) {
                return {
                    success: false,
                    message: "Review added already",
                    data: null,
                };
            }

            const response = await this.reviewRepository.saveReview(reviewData, image_urls);

            if (response.success) {
                const updateStatus = await this.bookingRepository.updateReviewDetails(
                    response.data._id,
                    reviewData.booking_id
                );

                if (!updateStatus.success) {
                    return {
                        success: updateStatus.success,
                        message: updateStatus.message,
                        data: null,
                    };
                }
            }

            return {
                success: response.success,
                message: response.message,
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
}

export default UserService;
