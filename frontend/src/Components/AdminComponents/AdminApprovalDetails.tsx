import React from "react";
import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {approvalsDetails, approvalStatusChange} from "../../Api/AdminApis";
import {IApprovalDetails} from "../../Interfaces/AdminInterfaces/SignInInterface";

const AdminApprovalDetails: React.FC = () => {
     const [approvals, setApprovals] = useState<IApprovalDetails>({
          _id: "",
          provider_id: "",
          provider_experience: "",
          provider_work_images: [],
          aadhar_picture: "",
          service_id: "",
          providerDetails: null,
          serviceDetails: null,
     });

     const {id} = useParams();
     const navigate = useNavigate();

     useEffect(() => {
          approvalsDetails(id as string)
               .then((response) => {
                    setApprovals(response.data.data[0]);
               })
               .catch((error: any) => {
                    console.log(error.messge);
               });
     }, []);

     const handleStatusChange = async (status: string) => {
          try {
               const data = await approvalStatusChange(approvals._id as string, status);
               if (data.success) {
                    navigate("/admins/approvals");
               }
          } catch (error: any) {
               console.log(error.message);
          }
     };

     return (
          <div className="pt-20 p-6 bg-gray-100 min-h-screen">
               <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
                    {/* Header Section */}
                    <div className="flex items-center space-x-4 mb-12 mt-4 ">
                         <img
                              src="https://via.placeholder.com/60"
                              alt="Profile"
                              className="w-20 h-20 rounded-full border border-gray-300 object-cover"
                         />
                         <div>
                              <h2 className="text-2xl font-semibold text-gray-800">
                                   {approvals?.providerDetails?.name}
                              </h2>
                              <p className="text-base text-gray-600">
                                   {approvals?.serviceDetails?.name}
                              </p>
                              <p className="text-base text-gray-600">
                                   Experience: {approvals.provider_experience}
                              </p>
                         </div>
                    </div>

                    {/* Aadhaar Card Section */}
                    <div className="mb-12">
                         <h3 className="text-lg font-semibold text-gray-800 mb-3">
                              Aadhaar Card Front Side Image
                         </h3>
                         <img
                              src={approvals.aadhar_picture}
                              alt="Aadhaar Card"
                              className="w-full h-96 object-cover border border-gray-300 rounded-lg"
                         />
                    </div>

                    {/* Work Images Section */}
                    <div className="mb-12">
                         <h3 className="text-lg font-semibold text-gray-800 mb-3">
                              Work Images (2)
                         </h3>
                         <div className="grid grid-cols-2 gap-4">
                              {approvals.provider_work_images?.[0] ? (
                                   <img
                                        src={approvals.provider_work_images[0]}
                                        alt="Work-image-1"
                                        className="w-full h-64 object-cover border border-gray-300 rounded-lg"
                                   />
                              ) : (
                                   <img
                                        src="https://via.placeholder.com/200"
                                        alt="Work-image-1-placeholder"
                                        className="w-full h-64 object-cover border border-gray-300 rounded-lg"
                                   />
                              )}
                              {approvals.provider_work_images?.[1] ? (
                                   <img
                                        src={approvals.provider_work_images[1]}
                                        alt="Work-image-2"
                                        className="w-full h-64 object-cover border border-gray-300 rounded-lg"
                                   />
                              ) : (
                                   <img
                                        src="https://via.placeholder.com/200"
                                        alt="Work-image-2-placeholder"
                                        className="w-full h-64 object-cover border border-gray-300 rounded-lg"
                                   />
                              )}
                         </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 mr-6">
                         <button
                              className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600"
                              onClick={() => {
                                   handleStatusChange("Approved");
                              }}
                         >
                              Verify
                         </button>
                         <button
                              className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600"
                              onClick={() => {
                                   handleStatusChange("Rejected");
                              }}
                         >
                              Reject
                         </button>
                    </div>
               </div>
          </div>
     );
};

export default AdminApprovalDetails;
