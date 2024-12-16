import mongoose, {Schema, Document, ObjectId} from "mongoose";

export interface IProvider extends Document {
     _id: ObjectId;
     service_id: ObjectId;
     name: string;
     email: string;
     password: string;
     mobile_no: string;
     is_blocked: boolean;
     is_deleted: boolean;
     is_approved: boolean;
     is_verified: boolean;
}

const providerSchema: Schema = new Schema(
     {
          name: {type: String},
          service_id: {type: mongoose.Types.ObjectId},
          email: {type: String},
          password: {type: String},
          mobile_no: {type: String},
          is_blocked: {
               type: Boolean,
               default: false,
          },
          is_deleted: {
               type: Boolean,
               default: false,
          },
          is_approved: {
               type: Boolean,
               default: false,
          },
          is_verified: {
               type: Boolean,
               default: false,
          },
     },
     {timestamps: true}
);

const providerModel = mongoose.model<IProvider>("provider", providerSchema);

export default providerModel;
