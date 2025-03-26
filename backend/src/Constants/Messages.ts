// src/Constants/Messages.ts

export const AuthMessages = {
    SIGN_UP_REQUIRED_FIELDS: "Email, password, username, and mobile number are required fields",
    SIGN_UP_PROVIDER_REQUIRED_FIELDS:
        "Email, password, username, mobile no and service id are required fields",
    SIGN_UP_FAILED: "Sign up failed",
    SIGN_UP_FAILURE: "Failed to sign up",
    DUPLICATE_EMAIL: "Email already exists",
    EMAIL_OTP_FAILURE: "Failed to send OTP email",
    SIGN_UP_SUCCESS: "Signed up successfully",
    SIGN_IN_REQUIRED_FIELDS: "Email and password are required fields",
    SIGN_IN_PROVIDER_REQUIRED_FIELDS: "Email, password are required fields",
    ACCOUNT_DOES_NOT_EXIST: "Account does not exist",
    INVALID_CREDENTIALS: "Invalid Credentials",
    OTP_NOT_VERIFIED: "Didn't complete OTP verification",
    SIGN_IN_WITH_GOOGLE: "Please Sign in With Google",
    ACCOUNT_BLOCKED: "Account blocked by admin",
    SIGN_OUT_SUCCESS: "Signed Out Successfully",
    GOOGLE_SIGN_IN_FAILED: "Google Sign In failed",
    GOOGLE_SIGN_IN_CODE_REQUIRED: "Google signin code is required field",
    SIGN_IN_SUCCESS: "Signed in successfully",
    SIGN_IN_FAILED: "Sign In Failed",
    OTP_REQUIRED_FIELDS: "Email and OTP are required fields",
    OTP_PROVIDER_REQUIRED_FIELDS: "Email, otp are required fields",
    OTP_INVALID: "Invalid OTP",
    OTP_EXPIRED: "OTP is expired",
    OTP_ERROR: "OTP error",
    OTP_RESEND_REQUIRED: "Email is a required field",
    OTP_RESEND_SUCCESS: "OTP sent successfully",
    OTP_RESEND_FAILED: "OTP cannot be sent at this moment",
    OTP_VERIFIED_SUCCESS: "OTP verified successfully",
    TOKEN_ERROR: "Token error",
    REFRESH_TOKEN_MISSING: "Refresh Token missing",
    ACCESS_TOKEN_SENT_SUCCESS: "Access token sent successfully",
};

export const ProfileMessages = {
    UPDATE_PROFILE_REQUIRED: "Name, mobile number, and ID are required fields",
    UPDATE_PROFILE_SUCCESS: "Profile updated successfully",
    UPDATE_PROFILE_FAILED: "Profile update failed",
    GET_USER_REQUIRED: "ID is a required field",
    GET_USER_SUCCESS: "Profile data fetched successfully",
    GET_USER_FAILED: "Profile fetching failed",
    FETCH_PROFILE_SUCCESS: "Profile fetched successfully",
    REGISTER_PROFILE_REQUIRED:
        "provider ID, description, expertise ID, aadhar Image and workImages are a required field",
    REGISTER_PROFILE_SUCCESS: "Provider registration successfully",
    ALREADY_REQUESTED_APPROVAL: "Already requested for approval",
    REGISTER_PROFILE_FAILED: "Cannot register at this moment",
};

export const PasswordMessages = {
    FORGOT_PASSWORD_REQUIRED: "Email is a required field",
    FORGOT_PASSWORD_SUCCESS: "OTP email sent successfully",
    FORGOT_PASSWORD_NOT_REGISTERED: "Email is not registered",
    FORGOT_PASSWORD_GOOGLE: "Please Sign in with your Google account",
    FORGOT_PASSWORD_FAILED: "Failed to verify email",
    MAIL_SENT_SUCCESS: "Mail sent successfully",
    MAIL_VERIFY_FAILED: "Failed to verify mail",
    COULDNT_VERIFY_MAIL: "Couldn't verify mail",
    RESET_PASSWORD_REQUIRED: "Email and password are required fields",
    RESET_PASSWORD_SUCCESS: "Password updated successfully",
    RESET_PASSWORD_FAILED: "Failed to update password",
    CONFIRM_PASSWORD_REQUIRED: "ID and password are required fields",
    CONFIRM_PASSWORD_FAILED: "Failed to verify password",
    CONFIRM_PASSWORD_SUCCESS: "Password verified successfully",
    INCORRECT_PASSWORD: "Incorrect Password",
    INVALID_ID: "Invalid id",
    FORGOT_PASSWORD_OTP_REQUIRED: "Email and otp are required fields",
};

export const AddressMessages = {
    CREATE_ADDRESS_REQUIRED: "Address is required",
    CREATE_ADDRESS_SUCCESS: "Address added successfully",
    ADDRESS_ALREADY_ADDED: "Address already added",
    ADDRESS_LIMIT_REACHED: "You can only add up to 3 addresses",
    CREATE_ADDRESS_FAILED: "Failed to create address",
    GET_ADDRESSES_REQUIRED: "User ID is required",
    GET_ADDRESSES_SUCCESS: "Successfully fetched addresses",
    GET_ADDRESSES_FAILED: "Failed to fetch addresses",
    DELETE_ADDRESS_REQUIRED: "Address ID is required",
    DELETE_ADDRESS_SUCCESS: "Address deleted successfully",
    DELETE_ADDRESS_FAILED: "Failed to delete address",
    GET_ADDRESS_REQUIRED: "Address ID is required",
    GET_ADDRESS_SUCCESS: "Successfully fetched address",
    GET_ADDRESS_FAILED: "Failed to fetch address",
    UPDATE_ADDRESS_REQUIRED: "Address and ID are required",
    UPDATE_ADDRESS_SUCCESS: "Address updated successfully",
    UPDATE_ADDRESS_FAILED: "Failed to update address",
};

export const SlotMessages = {
    FETCH_SLOTS_REQUIRED: "Service ID, location, date, and time are required fields",
    FETCH_SLOTS_SUCCESS: "Slots fetched successfully",
    FETCH_SLOTS_FAILED: "Failed to fetch slots",
    FETCH_SLOTS_ERROR: "Error in fetching slots",
    REQUEST_SLOTS_REQUIRED:
        "User ID, slot ID, technician ID, time, address, and description are required fields",
    REQUEST_SLOTS_SUCCESS: "Booking request added successfully",
    REQUEST_SLOTS_EXISTS: "Booking request exists",
    REQUEST_SLOTS_FAILED: "Failed to add booking request",
    REQUEST_SLOTS_ERROR: "Error in booking slots",
};

export const PaymentMessages = {
    CREATE_PAYMENT_REQUIRED: "ID and amount are required fields",
    CREATE_PAYMENT_PROVIDER_REQUIRED: "Id, amount and payment method are required fields",
    CREATE_PAYMENT_SUCCESS: "Payment status updated successfully",
    CREATE_PAYMENT_FAILED: "Failed to update payment status",
    PAYMENT_INTENT_FAILED: "Failed to create payment intent",
    INITIATE_PAYMENT_FAILED: "Failed to initiate payment request",
};

export const ChatMessages = {
    FETCH_CHAT_REQUIRED: "Room ID is a required field",
    FETCH_CHAT_SUCCESS: "Chat fetched successfully",
    FETCH_CHAT_FAILED: "Failed to fetch chat",
};

export const ReviewMessages = {
    ADD_REVIEW_REQUIRED: "Rating, review, description, and images are required fields",
    ADD_REVIEW_SUCCESS: "Review added successfully",
    REVIEW_ALREADY_ADDED: "Review added already",
    IMAGE_STORAGE_FAILED: "Failed to store image",
    ADD_REVIEW_FAILED: "Failed to add review",
};

export const NotificationMessages = {
    FETCH_COUNT_REQUIRED: "User id is a required field",
    FETCH_COUNT_SUCCESS: "Fetched unread count successfully",
    FETCH_COUNT_FAILED: "Failed to fetch unread count",
    FETCH_NOTIFICATIONS_REQUIRED: "User id, page no are required fields",
    FETCH_NOTIFICATIONS_SUCCESS: "Fetched notifications successfully",
    FETCH_NOTIFICATIONS_FAILED: "Failed to fetch notifications",
    MARK_NOTIFICATION_REQUIRED: "Notification id is a required field",
    MARK_NOTIFICATION_SUCCESS: "Updated notification successfully",
    MARK_NOTIFICATION_FAILED: "Failed to update notification",
    UPDATE_NOTIFICATION_SUCCESS: "Updated notification successfully",
    UPDATE_NOTIFICATION_FAILED: "Failed to update notification",
    FETCH_UNREAD_COUNT_SUCCESS: "Fetched unread count successfully",
    FETCH_UNREAD_COUNT_FAILED: "Failed to fetch unread count",
};

export const GeneralMessages = {
    INTERNAL_SERVER_ERROR: "Internal server error",
    USER_NOT_FOUND: "User not found",
    PROVIDER_NOT_FOUND: "Provider not found",
    ACCOUNT_NOT_FOUND: "Account not found",
    RESOURCE_NOT_FOUND: "Resource not found",
    INTERNAL_SERVER_ERROR_ALT: "An internal server error occurred",
    INVALID_ID: "Invalid id",
};

export const ScheduleMessages = {
    CREATE_SCHEDULE_REQUIRED: "Id, address and date are required fields",
    CREATE_SCHEDULE_SUCCESS: "Schedule created successfully",
    CREATE_SCHEDULE_FAILED: "Failed to create schedule",
    FETCH_SCHEDULE_SUCCESS: "Schedule fetched successfully",
    FETCH_SCHEDULE_FAILED: "Failed to fetch schedule", // Updated to match "Failed to fetch schedule"
    COMPLETE_VERIFICATION: "Complete verification to create schedules",
    FETCH_ALL_REQUESTS_SUCCESS: "Requests fetched successfully", // Added for getAllRequests
    FETCH_ALL_REQUESTS_FAILED: "Failed to fetch requests", // Added for getAllRequests
};

export const tokenMessages = {
    REFRESH_TOKEN_MISSING: "Refresh token missing",
    ACCESS_TOKEN_SUCCESS: "Access token sent successfully",
    TOKEN_ERROR: "Token error",
};

export const UserMessages = {
    FETCH_USERS_REQUIRED: "Page and filter are required fields",
    FETCH_USERS_SUCCESS: "Users data fetched successfully",
    FETCH_USERS_FAILED: "Users data fetching failed",
    BLOCK_USER_SUCCESS: "User blocked successfully",
    BLOCK_USER_FAILED: "User blocking failed",
    UNBLOCK_USER_SUCCESS: "User unblocked successfully",
    UNBLOCK_USER_FAILED: "User unblocking failed",
};

export const ProviderMessages = {
    FETCH_PROVIDERS_REQUIRED: "Search, page, and filter are required fields",
    FETCH_PROVIDERS_SUCCESS: "Providers data fetched successfully",
    FETCH_PROVIDERS_FAILED: "Providers data fetching failed",
    BLOCK_PROVIDER_SUCCESS: "Provider blocked successfully",
    BLOCK_PROVIDER_FAILED: "Provider blocking failed",
    UNBLOCK_PROVIDER_SUCCESS: "Provider unblocked successfully",
    UNBLOCK_PROVIDER_FAILED: "Provider unblocking failed",
};

export const ReportMessages = {
    REPORT_REQUIRED: "Reason, reportedId, reporterId, and reportedRole are required fields",
    REPORT_SUCCESS: "Reported successfully",
    REPORT_ALREADY_EXISTS: "Already reported",
    REPORT_FAILED: "Failed to report",
    REPORT_PROVIDER_FAILED: "Failed report account",
    FETCH_REPORTS_REQUIRED: "Page is a required field",
    FETCH_REPORTS_SUCCESS: "Reports data fetched successfully",
    FETCH_REPORTS_FAILED: "Failed to fetch reports data",
};

export const ApprovalMessages = {
    FETCH_APPROVALS_REQUIRED: "Page is a required field",
    FETCH_APPROVALS_SUCCESS: "Approvals data fetched successfully",
    FETCH_APPROVALS_FAILED: "Approvals data fetching failed",
    FETCH_APPROVAL_DETAILS_SUCCESS: "Provider approval details fetched successfully",
    FETCH_APPROVAL_DETAILS_FAILED: "Provider approval details fetching failed",
    UPDATE_APPROVAL_STATUS_REQUIRED: "Id and status are required fields",
    UPDATE_APPROVAL_STATUS_SUCCESS: "Provider approval status updated successfully",
    UPDATE_APPROVAL_STATUS_FAILED: "Provider approval status update failed",
    APPROVAL_CONFIRMED:
        "Your request has been approved successfully. You can now work as a Fixify technician", // Added for notification
};

export const ServiceMessages = {
    FETCH_SERVICES_SUCCESS: "Services fetched successfully",
    FETCH_SERVICES_FAILED: "Failed to fetch services",
    FETCH_SERVICES_REQUIRED: "Search, page, and filter are required fields",
    UPDATE_SERVICE_STATUS_REQUIRED: "Id and status are required fields",
    UPDATE_SERVICE_STATUS_SUCCESS: "Service status updated",
    UPDATE_SERVICE_STATUS_FAILED: "Failed to update service status",
    CREATE_SERVICE_REQUIRED: "Service name and description are required fields",
    CREATE_SERVICE_SUCCESS: "Service created successfully",
    CREATE_SERVICE_FAILED: "Failed to create service",
    SERVICE_ALREADY_EXISTS: "Service already exists",
    FETCH_SERVICE_DETAILS_SUCCESS: "Service details fetched successfully",
    FETCH_SERVICE_DETAILS_FAILED: "Failed to fetch service detail",
    UPDATE_SERVICE_REQUIRED: "Service name, description, and id are required fields",
    UPDATE_SERVICE_SUCCESS: "Service updated successfully",
    UPDATE_SERVICE_FAILED: "Failed to update service",
    CREATE_SERVICE_ERROR: "Error in creating service", // Added for createService catch block
};

export const BookingMessages = {
    GET_BOOKINGS_REQUIRED: "ID and page number are required fields",
    GET_BOOKINGS_SUCCESS: "Bookings fetched successfully",
    GET_BOOKING_DETAILS_REQUIRED: "ID is a required field",
    GET_BOOKING_DETAILS_SUCCESS: "Booking details fetched successfully",
    CANCEL_BOOKING_REQUIRED: "ID is a required field",
    CANCEL_BOOKING_SUCCESS: "Booking cancelled successfully",
    CANCEL_BOOKING_TIME_ERROR: "Cannot cancel booking less than 3 hours before the slot time",
    BOOKING_NOT_FOUND: "Booking not found",
    BOOKING_REQUEST_ID_STATUS_REQUIRED: "Booking request ID and status are required",
    BOOKING_REQUEST_NOT_FOUND: "Booking request not found",
    CREATE_BOOKING_FAILED: "Failed to create booking",
    UPDATE_BOOKING_STATUS_FAILED: "Failed to update booking status",
    BOOKING_COMPLETED_SUCCESS: "Booking completed successfully",
    FETCH_BOOKINGS_FAILED: "Failed to fetch bookings",
    FETCH_BOOKING_DETAILS_FAILED: "Failed to fetch booking details",
    UPDATE_BOOKING_PAYMENT_FAILED: "Failed to update booking with payment ID",
    BOOKING_CONFIRMED: "Your booking has been confirmed",
};

export const DashboardMessages = {
    FETCH_DASHBOARD_REQUIRED: "Id, revenue filter and working hours filters are required fields",
    FETCH_DASHBOARD_SUCCESS: "Dashboard details fetched successfully",
    FETCH_DASHBOARD_FAILED: "Failed to fetch dashboard details",
    FETCH_SALES_REQUIRED: "Page number, from date, and to date are required fields",
    FETCH_SALES_SUCCESS: "Sales data fetched successfully",
    FETCH_SALES_FAILED: "Failed to fetch sales data",
    FETCH_REVENUE_REQUIRED: "Period is a required field",
    FETCH_REVENUE_SUCCESS: "Revenue data fetched successfully",
    FETCH_REVENUE_FAILED: "Failed to fetch revenue data",
    FETCH_DASHBOARD_TILES_SUCCESS: "Fetched dashboard tiles",
};
