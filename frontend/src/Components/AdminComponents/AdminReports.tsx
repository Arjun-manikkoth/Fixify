import React, { useState, useEffect } from "react";
import Pagination from "../CommonComponents/Pagination";
import { toast } from "react-toastify";
import { getReportsListApi, blockUser } from "../../Api/AdminApis";
import { blockProvider } from "../../Api/AdminApis";

interface Report {
    _id: string;
    booking_id: string;
    reporter_id: string;
    reporter_email: string;
    reporter_is_blocked: boolean; // Added
    reported_id: string;
    reported_email: string;
    reported_is_blocked: boolean; // Added
    reported_role: "user" | "provider";
    reason: string;
    createdAt: string;
    updatedAt: string;
}

const AdminReports: React.FC = () => {
    const [page, setPage] = useState<number>(1);
    const [reports, setReports] = useState<Report[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);

    useEffect(() => {
        getReportsListApi(page)
            .then((response) => {
                setReports(response.data.reports);
                setTotalPages(response.data.totalPages);
            })
            .catch((error) => {
                toast.error("Failed to fetch reports");
                console.error(error.message);
            });
    }, [page]);

    const getAggregatedReportDetails = (reportedId: string) => {
        const filteredReports = reports.filter((report) => report.reported_id === reportedId);
        const totalReports = filteredReports.length;
        const reasonCounts = filteredReports.reduce((acc, report) => {
            acc[report.reason] = (acc[report.reason] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalReports,
            reasons: Object.entries(reasonCounts).map(([reason, count]) => ({ reason, count })),
        };
    };

    const handleBlock = async (reportedId: string, reportedRole: string) => {
        try {
            const response =
                reportedRole === "user"
                    ? await blockUser(reportedId)
                    : await blockProvider(reportedId);
            if (response.success) {
                toast.success("Blocked successfully");
                // Update the reports state with the latest data
                const updatedReports = await getReportsListApi(page);
                setReports(updatedReports.data.reports);
            } else {
                toast.error("Failed to block");
            }
        } catch (error: any) {
            toast.error("Error blocking");
            console.error(error.message);
        }
    };

    const changePage = (type: "Increment" | "Decrement") => {
        if (type === "Increment" && page + 1 <= totalPages) {
            setPage(page + 1);
        } else if (type === "Decrement" && page - 1 > 0) {
            setPage(page - 1);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 pt-20 md:pt-24 min-h-screen">
            {/* Title Section */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-6 text-left">
                Admin Reports
            </h1>

            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[2fr_2fr_2fr_1.5fr_1fr_1fr] gap-4 bg-gray-100 p-4 rounded-t-lg text-black font-semibold shadow-sm text-center text-sm lg:text-base">
                <span>Reported By</span>
                <span>Reported User</span>
                <span>Reason</span>
                <span className="text-center">Report Details</span>
                <span className="text-center">Actions</span>
            </div>

            {/* Report Rows */}
            <div className="space-y-4">
                {reports?.length > 0 ? (
                    reports.map((report) => {
                        const aggregatedDetails = getAggregatedReportDetails(report.reported_id);

                        return (
                            <div
                                key={report._id}
                                className="flex flex-col md:grid md:grid-cols-[3fr_3fr_2fr_2fr_1fr_1fr] gap-4 bg-white p-4 rounded-lg shadow-md border items-start md:items-center"
                            >
                                {/* Reported By */}
                                <div className="flex flex-col w-full">
                                    <span className="md:hidden font-semibold text-gray-700 text-sm mb-1">
                                        Reported By:
                                    </span>
                                    <span className="text-sm md:text-base font-medium break-all">
                                        {report.reporter_email}{" "}
                                        {report.reporter_is_blocked && (
                                            <span className="text-red-500 text-xs">(Blocked)</span>
                                        )}
                                    </span>
                                </div>

                                {/* Reported User */}
                                <div className="flex flex-col w-full">
                                    <span className="md:hidden font-semibold text-gray-700 text-sm mb-1">
                                        Reported User:
                                    </span>
                                    <span className="text-sm md:text-base font-medium break-all">
                                        {report.reported_email}{" "}
                                        {report.reported_is_blocked && (
                                            <span className="text-red-500 text-xs">(Blocked)</span>
                                        )}
                                    </span>
                                </div>

                                {/* Reason */}
                                <div className="flex flex-col w-full">
                                    <span className="md:hidden font-semibold text-gray-700 text-sm mb-1">
                                        Reason:
                                    </span>
                                    <span className="text-sm md:text-base font-medium break-all">
                                        {report.reason}
                                    </span>
                                </div>

                                {/* Report Details */}
                                <div className="flex flex-col w-full">
                                    <span className="md:hidden font-semibold text-gray-700 text-sm mb-1">
                                        Report Details:
                                    </span>
                                    <div className="text-left w-full">
                                        <p className="text-sm md:text-base font-medium">
                                            Total: {aggregatedDetails.totalReports}
                                        </p>
                                        <div className="space-y-1 text-xs md:text-sm mt-1">
                                            {aggregatedDetails.reasons.map((detail, index) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between items-center"
                                                >
                                                    <span className="truncate flex-1 pr-2">
                                                        {detail.reason}
                                                    </span>
                                                    <span className="flex-shrink-0">
                                                        {detail.count}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col w-full md:flex-row md:justify-center">
                                    <span className="md:hidden font-semibold text-gray-700 text-sm mb-1">
                                        Actions:
                                    </span>
                                    <button
                                        className={`w-full md:w-auto px-4 py-2 text-white rounded-md text-sm md:text-base transition-colors duration-200 ${
                                            report.reported_is_blocked
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-red-500 hover:bg-red-600"
                                        }`}
                                        onClick={() =>
                                            !report.reported_is_blocked &&
                                            handleBlock(report.reported_id, report.reported_role)
                                        }
                                        disabled={report.reported_is_blocked}
                                    >
                                        {report.reported_is_blocked ? "Blocked" : "Block"}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-gray-500 py-8 text-sm sm:text-base bg-white rounded-lg shadow-md border">
                        No Reports Found
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-center">
                <Pagination page={page} totalPages={totalPages} changePage={changePage} />
            </div>
        </div>
    );
};

export default AdminReports;
