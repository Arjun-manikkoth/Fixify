import {IServices, Provider} from "../ProviderInterfaces/SignInInterface";

export interface SignIn {
     email: string;
     password: string;
}

export interface IApprovalDetails {
     _id: string;
     provider_id: string;
     provider_experience: string;
     provider_work_images: string[] | [];
     service_id: string | null;
     aadhar_picture: string;
     providerDetails: {
          name: string;
          email: string;
          mobile_no: string;
          url: string;
          is_blocked: boolean;
     } | null;
     serviceDetails: {
          name: string;
          is_active: boolean;
     } | null;
}
