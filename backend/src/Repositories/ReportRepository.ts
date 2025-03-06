import IReportRepository from "../Interfaces/Report/IReportRepository";
import { IReportData } from "../Interfaces/Report/IReport";

import Report, { IReport } from "../Models/CommonModels/ReportModel";

class ReportRepository implements IReportRepository {
    //
    async addReport(data: IReportData): Promise<IReport | null> {
        try {
            const { reporterId, reportedId, reportedRole, reason } = data;

            const report = new Report({
                reporterId: reporterId,
                reportedId: reportedId,
                reportedRole: reportedRole,
                reason: reason,
            });

            return await report.save();
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
    //
    async duplicateReport(data: IReportData): Promise<boolean | null> {
        try {
            const exists = await Report.findOne({
                booking_id: data.bookingId,
                reporterId: data.reporterId,
            });
            return exists ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
}

export default ReportRepository;
