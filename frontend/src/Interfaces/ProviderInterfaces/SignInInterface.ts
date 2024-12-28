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

export interface IServices {
     _id: string;
     name: string;
     is_active: boolean | null;
     description: string;
}

export interface IProviderProfile {
     provider: {
          _id: string;
          name: string;
          email: string;
          mobile_no: string;
          url: string;
          google_id: string | null;
          is_blocked: boolean;
          is_approved: boolean;
          is_verified: boolean;
     };
     service: {
          name: string;
          is_active: boolean;
          description: string;
     } | null; // Service can be null
}

export interface IApprovals {
     _id: string;
     provider_id: string | null;
     provider_experience: string | null;
     service_id: string | null;
     proivder_work_images: string[] | null;
     aadhar_picture: string | null;
     status: string | null;
}
