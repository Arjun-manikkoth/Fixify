import mongoose, {Schema, Document, ObjectId} from "mongoose";

export interface IOtp extends Document {
     account_id: ObjectId;
     value: string;
     created_on: Date;
}

const otpSchema: Schema = new Schema(
     {
          account_id: {type: Schema.Types.ObjectId},
          value: {type: String},
          created_on: {type: Date, default: () => Date.now()},
     },
     {timestamps: true}
);

otpSchema.index({created_on: 1}, {expireAfterSeconds: 120});

const otp = mongoose.model<IOtp>("otp", otpSchema);

export default otp;
