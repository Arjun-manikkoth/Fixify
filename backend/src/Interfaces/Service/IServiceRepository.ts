import {ObjectId} from "mongoose";
import {IServices} from "../../Models/ProviderModels/ServiceModel";

//interface for service repository
interface IServiceRepository {
     getAllServices(): Promise<IServices[]>;
}

export default IServiceRepository;
