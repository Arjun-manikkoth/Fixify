import mongoose, { Schema, Document, ObjectId } from "mongoose";

interface IUser {
  name: String;
  email: String;
  password: String;
  mobile_no: String;
  image_url: String;
  address_id: ObjectId;
  chosen_address_id: ObjectId;
  is_blocked: Boolean;
  is_deleted: Boolean;
}

const userSchema: Schema = new Schema(
  {
    name: String,
    email: String,
    password: String,
    mobile_no: String,
    image_url: String,
    address_id: mongoose.Types.ObjectId,
    chosen_address_id: mongoose.Types.ObjectId,
    is_blocked: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const userModel = mongoose.model<IUser>("user", userSchema);

export default userModel;
export { IUser };
