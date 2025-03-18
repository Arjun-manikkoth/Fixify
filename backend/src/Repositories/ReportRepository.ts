import IReportRepository from "../Interfaces/Report/IReportRepository";
import { IReportData } from "../Interfaces/Report/IReport";

import Report, { IReport } from "../Models/CommonModels/ReportModel";

class ReportRepository implements IReportRepository {
    //creates new report
    async addReport(data: IReportData): Promise<IReport | null> {
        try {
            const report = new Report(data);

            return await report.save();
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
    //checks duplicate report exists
    async duplicateReport(data: IReportData): Promise<boolean | null> {
        try {
            const exists = await Report.findOne({
                booking_id: data.booking_id,
                reporter_id: data.reporter_id,
            });
            return exists ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
}

export default ReportRepository;
