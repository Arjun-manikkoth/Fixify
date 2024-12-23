import React from "react";

interface PaginationProps {
     page: number;
     totalPages: number;
     changePage: (type: "Increment" | "Decrement") => void;
}
const Pagination: React.FC<PaginationProps> = (props) => {
     return (
          <div className="flex justify-center items-center space-x-4 py-4">
               <button
                    onClick={() => {
                         props.changePage("Decrement");
                    }}
                    disabled={props.page === 1}
                    className="px-4 py-2 bg-gray-200 border border-gray-300 rounded-lg hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
               >
                    Prev
               </button>
               <span className="text-sm md:text-base">
                    Page {props.page} of {props.totalPages}
               </span>
               <button
                    onClick={() => {
                         props.changePage("Increment");
                    }}
                    disabled={props.page === props.totalPages}
                    className="px-4 py-2 bg-gray-200 border border-gray-300 rounded-lg hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
               >
                    Next
               </button>
          </div>
     );
};
export default Pagination;
