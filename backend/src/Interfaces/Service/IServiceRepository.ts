import {ObjectId} from "mongoose";
import {IServices} from "../../Models/ProviderModels/ServiceModel";
import {IPaginatedServices} from "./IServices";
import {IAddService} from "../Admin/SignInInterface";

//interface for service repository
interface IServiceRepository {
     getAllServices(): Promise<IServices[]>;
     getServicesByFilter(
          search: string,
          page: string,
          filter: string
     ): Promise<IPaginatedServices | null>;
     updateServiceStatus(id: string, status: string): Promise<boolean>;
     createService(data: IAddService): Promise<IServices | null>;
     getServiceByName(name: string): Promise<boolean | null>;
     getServiceById(id: string): Promise<IServices | null>;
     getServiceByFilter(id: string, serviceName: string): Promise<boolean>;
     updateServiceData(id: string, data: IAddService): Promise<boolean>;
}

export default IServiceRepository;
