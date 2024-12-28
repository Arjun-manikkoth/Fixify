import React, {useState, useEffect} from "react";
import Pagination from "../CommonComponents/Pagination";
import {toast} from "react-toastify";
import {ToastContainer} from "react-toastify";
import {getProvidersForApproval} from "../../Api/AdminApis";
import {useNavigate} from "react-router-dom";

const AdminApprovals: React.FC = () => {
     const [page, setPage] = useState<number>(1);
     const [data, setData] = useState<any[]>([]);
     const [totalPages, setTotalPages] = useState<number>(1);

     //
     const navigate = useNavigate();

     // Fetch providers for approval

     useEffect(() => {
          getProvidersForApproval(page)
               .then((response) => {
                    setData(response.data.data.approvals);
                    setTotalPages(response.data.data.totalPages);
               })
               .catch((error) => {
                    toast.error("Failed to fetch approvals data");
                    console.error(error.message);
               });
     }, [page]);

     // Change page function
     const changePage = (type: "Increment" | "Decrement") => {
          if (type === "Increment" && page + 1 <= totalPages) {
               setPage(page + 1);
          } else if (type === "Decrement" && page - 1 > 0) {
               setPage(page - 1);
          }
     };

     return (
          <div className="p-6 pt-24 px-12">
               {/* Title Section */}
               <h1 className="text-2xl font-semibold mb-4 text-left">Admin Approvals</h1>

               {/* Table Header */}
               <div className="grid grid-cols-[2fr_2fr_1fr] gap-4 bg-gray-100 p-4 rounded-md text-black font-semibold mb-2 shadow-sm text-center">
                    <span>Name</span>
                    <span>Expertise</span>
                    <span>Actions</span>
               </div>

               {/* Provider Rows */}
               <div className="space-y-4">
                    {data?.length > 0 ? (
                         data.map((approval) => (
                              <div
                                   key={approval.provider_id}
                                   className="grid grid-cols-[2fr_2fr_1fr] gap-4 items-center bg-white p-4 rounded-md shadow-md border text-center"
                              >
                                   <span className="text-base font-medium">
                                        {approval.providerDetails.name}
                                   </span>
                                   <span className="text-base font-medium">
                                        {approval.serviceDetails.name}
                                   </span>
                                   <div>
                                        <button
                                             className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                             onClick={() => {
                                                  navigate(
                                                       `/admins/approval_details/${approval._id}`
                                                  );
                                             }}
                                        >
                                             View Details
                                        </button>
                                   </div>
                              </div>
                         ))
                    ) : (
                         <div className="text-center text-gray-500">No providers found</div>
                    )}
               </div>

               {/* Pagination */}
               <div className="mt-4">
                    <Pagination page={page} totalPages={totalPages} changePage={changePage} />
               </div>

               <ToastContainer position="top-center" />
          </div>
     );
};

export default AdminApprovals;
