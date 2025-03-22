import { IReport } from "../../Models/CommonModels/ReportModel";
import { IResponse } from "../../Services/AdminServices";
import { IReportData } from "./IReport";

interface IReportRepository {
    addReport(data: IReportData): Promise<IReport | null>;
    duplicateReport(data: IReportData): Promise<boolean | null>;
    getAllReports(page: number): Promise<IResponse>;
}

export default IReportRepository;
