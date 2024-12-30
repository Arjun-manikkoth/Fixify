import {IServices} from "../Models/ProviderModels/ServiceModel";
import Service from "../Models/ProviderModels/ServiceModel";
import IServiceRepository from "../Interfaces/Service/IServiceRepository";

class ServiceRepository implements IServiceRepository {
     // // get all services
     async getAllServices(): Promise<IServices[]> {
          try {
               return await Service.find({is_active: true});
          } catch (error: any) {
               console.log(error.message);
               throw new Error("Failed to fetch services"); // Propagate error
          }
     }
}
export default ServiceRepository;
