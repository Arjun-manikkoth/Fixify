import { IBookingRequestData, ISlotFetch, IUpdateProfile, SignUp } from "./SignUpInterface";
import { ISignIn } from "./SignUpInterface";
import { ISignUpResponse } from "../../Services/UserServices";
import { IOtpResponse } from "../../Services/UserServices";
import { ObjectId } from "mongoose";
import { ISignInResponse, IRefreshTokenResponse } from "../../Services/UserServices";
import { IUser } from "../../Models/UserModels/UserModel";
import { IResponse } from "../../Services/AdminServices";
import { IAddAddress, IReviewData } from "./SignUpInterface";
import { IReportData } from "../Report/IReport";

interface IUserService {
    createUser(userData: SignUp): Promise<ISignUpResponse | null>;
    otpSend(email: string, id: ObjectId): Promise<boolean>;
    otpCheck(otp: string, email: string): Promise<IOtpResponse>;
    otpResend(email: string): Promise<boolean>;
    authenticateUser(userData: ISignIn): Promise<ISignInResponse | null>;
    refreshTokenCheck(token: string): Promise<IRefreshTokenResponse>;
    googleAuth(code: string): Promise<ISignInResponse>;
    editProfile(
        data: IUpdateProfile,
        image: Express.Multer.File | null
    ): Promise<Partial<IUser> | null>;
    getUserData(id: string): Promise<Partial<IUser> | null>;
    forgotPasswordVerify(id: string): Promise<IResponse>;
    passworOtpCheck(otp: string, email: string): Promise<IOtpResponse>;
    changePassword(email: string, password: string): Promise<IResponse>;
    verifyPassword(id: string, password: string): Promise<IResponse>;
    createAddress(address: IAddAddress): Promise<IResponse>;
    findAddresses(userId: string): Promise<IResponse>;
    changeAddressStatus(id: string): Promise<IResponse>;
    getAddress(addressId: string): Promise<IResponse>;
    editAddress(address: IAddAddress, id: string): Promise<IResponse>;
    getSlots(data: ISlotFetch): Promise<IResponse>;
    requestBooking(bookingData: IBookingRequestData): Promise<IResponse>;
    fetchBookings(id: string, page: number): Promise<IResponse>;
    fetchBookingDetail(id: string): Promise<IResponse>;
    processOnlinePayment(payment_id: string, amount: number): Promise<IResponse>;
    cancelBooking(booking_id: string): Promise<IResponse>;
    fetchChat(room_id: string): Promise<IResponse>;
    processReviewCreation(
        reviewData: IReviewData,
        reviewImages: Express.Multer.File[]
    ): Promise<IResponse>;
    report(data: IReportData): Promise<IResponse>;
}
export default IUserService;
