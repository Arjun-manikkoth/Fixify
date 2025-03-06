import { IReport } from "../../Models/CommonModels/ReportModel";
import { IReportData } from "./IReport";

interface IReportRepository {
    addReport(data: IReportData): Promise<IReport | null>;
    duplicateReport(data: IReportData): Promise<boolean | null>;
}

export default IReportRepository;
