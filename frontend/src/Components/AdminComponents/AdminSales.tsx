import React, { useState } from "react";
import * as XLSX from "xlsx";
import Pagination from "../CommonComponents/Pagination";
import { adminSalesApi } from "../../Api/AdminApis";
import { toast } from "react-toastify";
import LoadingSpinner from "../CommonComponents/LoadingSpinner";

const AdminSalesListing: React.FC = () => {
    const [page, setPage] = useState<number>(1);
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [salesData, setSalesData] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);

    //checks the dates are valid
    const validateDate = (): boolean => {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const today = new Date();

        if (!fromDate || !toDate) {
            toast.error("Please select both From Date and To Date.");
            return false;
        }

        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            toast.error("Invalid date format.");
            return false;
        }

        if (to < from) {
            toast.error("To Date cannot be earlier than From Date.");
            return false;
        }

        if (to > today) {
            toast.error("To Date cannot be greater than today.");
            return false;
        }

        return true;
    };

    // Fetch sales data based on the selected date range
    const fetchSalesData = async () => {
        try {
            if (!validateDate()) {
                return;
            }
            setLoading(true);
            const response = await adminSalesApi(fromDate, toDate, page);
            if (response.success) {
                setSalesData(response.data.sales);
                setTotalPages(response.data.totalPages);
            } else {
                toast.error("Failed to fetch sales data");
            }
        } catch (error) {
            console.error("Error fetching sales data:", error);
            toast.error("An error occurred while fetching sales data");
        } finally {
            setLoading(false);
        }
    };

    // Function to change the page
    const changePage = (type: "Increment" | "Decrement") => {
        if (type === "Increment" && page + 1 <= totalPages) {
            setPage(page + 1);
        } else if (type === "Decrement" && page - 1 > 0) {
            setPage(page - 1);
        }
    };

    // Download Excel report
    const downloadExcel = () => {
        if (salesData.length === 0) {
            toast.warning("No data available to download");
            return;
        }

        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Convert sales data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(salesData);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, "sales_report.xlsx");
    };

    return (
        <div className="p-6 pt-24 px-4 sm:px-12">
            {/* Header Section with Download Button */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h1 className="text-2xl font-bold mb-4 sm:mb-0">Sales Report</h1>
                <button
                    onClick={downloadExcel}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Download Excel
                </button>
            </div>

            {/* Date Filters */}
            <div className="flex flex-col sm:flex-row items-center mb-4">
                <div className="flex flex-col sm:flex-row items-center mb-2 sm:mb-0">
                    <label className="mr-2">From:</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border p-2 rounded mb-2 sm:mb-0 sm:mr-4"
                    />
                </div>
                <div className="flex flex-col sm:flex-row items-center mb-2 sm:mb-0">
                    <label className="mr-2">To:</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border p-2 rounded mb-2 sm:mb-0 sm:mr-4"
                    />
                </div>
                <button
                    onClick={fetchSalesData}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Filter
                </button>
            </div>

            {/* Loading Spinner */}
            {loading && <LoadingSpinner />}

            {/* Sales Data Table */}
            {salesData.length > 0 ? (
                <div className="overflow-x-auto mb-4">
                    <table className="w-full border-collapse border">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border p-2">ID</th>
                                <th className="border p-2">Date</th>
                                <th className="border p-2">Amount</th>
                                <th className="border p-2">Service</th>
                                <th className="border p-2">Profit</th>
                                <th className="border p-2">Customer</th>
                                <th className="border p-2">Provider</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesData.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-100">
                                    <td className="border p-2">{sale.id}</td>
                                    <td className="border p-2">{sale.date}</td>
                                    <td className="border p-2">{sale.amount}</td>
                                    <td className="border p-2">{sale.service}</td>
                                    <td className="border p-2">{sale.profit}</td>
                                    <td className="border p-2">{sale.customer}</td>
                                    <td className="border p-2">{sale.provider}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center text-gray-500">
                    {loading
                        ? "Fetching data..."
                        : "No sales data available for the selected date range."}
                </div>
            )}

            {/* Pagination */}
            {salesData.length > 0 && (
                <div className="mt-4">
                    <Pagination page={page} totalPages={totalPages} changePage={changePage} />
                </div>
            )}
        </div>
    );
};

export default AdminSalesListing;
