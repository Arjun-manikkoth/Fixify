export interface SignIn {
     email: string;
     password: string;
}

//profile edit form data interface
export interface profileData {
     userName: string;
     mobileNo: string;
     image: File | null;
}

export interface Provider {
     _id: string;
     name: string;
     email: string;
     mobile_no: string;
     url: string;
     service_id: string;
     address_id?: string;
     chosen_address_id?: string;
     is_verified: boolean | null;
     is_blocked: boolean | null;
     is_deleted: boolean | null;
     is_approved: boolean | null;
     google_id: string | null;
}
