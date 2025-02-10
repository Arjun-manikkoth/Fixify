import React from "react";

interface PaginationProps {
    page: number;
    totalPages: number;
    changePage: (type: "Increment" | "Decrement") => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, changePage }) => {
    return (
        <div className="flex justify-center items-center space-x-4 py-6">
            <button
                onClick={() => changePage("Decrement")}
                disabled={page === 1}
                className="px-6 py-2 text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Prev
            </button>
            <span className="text-lg font-semibold text-gray-800">
                Page {page} of {totalPages > 0 ? totalPages : 1}
            </span>
            <button
                onClick={() => changePage("Increment")}
                disabled={page === totalPages}
                className="px-6 py-2 text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
