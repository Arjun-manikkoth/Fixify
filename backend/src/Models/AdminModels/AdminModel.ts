import mongoose, {ObjectId, Schema} from "mongoose";

export interface IAdmin extends Document {
     _id: ObjectId;
     email: string;
     password: string;
}

const adminSchema = new Schema(
     {
          email: {
               type: String,
          },
          password: {
               type: String,
          },
     },
     {timestamps: true}
);
const adminModel = mongoose.model<IAdmin>("admin", adminSchema);

export default adminModel;
