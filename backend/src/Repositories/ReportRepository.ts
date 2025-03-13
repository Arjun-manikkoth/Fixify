import IReportRepository from "../Interfaces/Report/IReportRepository";
import { IReportData } from "../Interfaces/Report/IReport";

import Report, { IReport } from "../Models/CommonModels/ReportModel";

class ReportRepository implements IReportRepository {
    //creates new report
    async addReport(data: IReportData): Promise<IReport | null> {
        try {
            const { reporterId, reportedId, reportedRole, reason, bookingId } = data;

            const report = new Report({
                reporter_id: reporterId,
                reported_id: reportedId,
                reported_role: reportedRole,
                reason: reason,
                booking_id: bookingId,
            });

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
                booking_id: data.bookingId,
                reporter_id: data.reporterId,
            });
            return exists ? true : false;
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }
}

export default ReportRepository;
