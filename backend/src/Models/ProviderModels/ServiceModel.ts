import {timeStamp} from "console";
import mongoose, {Schema, Document, ObjectId} from "mongoose";

export interface IServices extends Document {
     _id: ObjectId;
     name: string;
     is_active: boolean;
     description: string;
}

const ServicesSchema: Schema = new Schema(
     {
          name: {type: String},
          is_active: {
               type: Boolean,
               default: true,
          },
          description: {type: String},
     },
     {timestamps: true}
);

const Services = mongoose.model<IServices>("Services", ServicesSchema);

export default Services;
