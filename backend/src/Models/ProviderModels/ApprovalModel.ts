import mongoose, {Schema, Document, ObjectId} from "mongoose";

export interface IApprovals extends Document {
     _id: ObjectId;
     provider_id: ObjectId | null;
     provider_experience: String | null;
     service_id: String | null;
     proivder_work_images: String[] | null;
     aadhar_picture: String | null;
     status: String | null;
}

const approvalSchema: Schema = new Schema(
     {
          provider_id: {type: Schema.Types.ObjectId},
          provider_experience: {type: String},
          provider_work_images: [{type: String}],
          service_id: {type: Schema.Types.ObjectId},
          aadhar_picture: {type: String},
          status: {type: String},
     },
     {timestamps: true}
);

const approvalModel = mongoose.model<IApprovals>("Approvals", approvalSchema);

export default approvalModel;
