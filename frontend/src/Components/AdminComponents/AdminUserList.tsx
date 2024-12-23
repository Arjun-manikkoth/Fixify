import React, {useState} from "react";
import {ToastContainer} from "react-toastify";
import {useEffect} from "react";
import Pagination from "../CommonComponents/Pagination";
import {getUsers} from "../../Api/AdminApis";
import {toast} from "react-toastify";
import {User} from "../../Interfaces/UserInterfaces/SignInInterface";
import {blockUser, unBlockUser} from "../../Api/AdminApis";

const AdminUserList: React.FC = () => {
     const [page, setPage] = useState<number>(1);
     const [search, setSearch] = useState<string | number>("");
     const [filter, setFilter] = useState<string>("All");
     const [data, setData] = useState<User[]>([]);
     const [totalPages, setTotalPages] = useState<number>(1);
     const [forceRender, setForceRender] = useState<number>(0);

     //calls useeffect for change in search filter and page number
     useEffect(() => {
          //debouncing
          const debounce = setTimeout(() => {
               getUsers(page, filter, search)
                    .then((response) => {
                         setData(response.data.data.users);
                         setTotalPages(response.data.data.totalPages);
                    })
                    .catch((error) => {
                         toast.error("Failed to get details");
                         console.log(error.message);
                    });
          }, 500);

          return () => {
               clearTimeout(debounce);
          };
     }, [search, filter, page, forceRender]);

     //sets search input to state
     const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          e.preventDefault();
          const data = e.target.value.trim().toLowerCase();
          setSearch(data);
     };

     //function to change the filter
     const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
          e.preventDefault();

          setFilter(e.target.value);
     };

     //function to change the page
     const changePage = (type: "Increment" | "Decrement") => {
          if (type === "Increment" && page + 1 <= totalPages) {
               setPage(page + 1);
          } else if (type === "Decrement" && page - 1 > 0) {
               setPage(page - 1);
          }
     };
     // Handle Block/Unblock
     const handleBlockUnblock = (userId: string, isBlocked: boolean | null) => {
          const action = isBlocked ? unBlockUser : blockUser;

          action(userId)
               .then((response) => {
                    setForceRender((prevState) => prevState + 1);
               })
               .catch((error) => {
                    toast.error("Failed to update user status");
                    console.error(error.message);
               });
     };
     return (
          <div className="p-6 pt-24 px-12">
               {/* Title Section */}
               <h1 className="text-2xl font-semibold mb-4 text-left">Users List</h1>

               {/* Search and Filter Section */}
               <div className="flex justify-center items-center mb-6 space-x-4">
                    <div className="flex items-center border rounded-md overflow-hidden shadow-sm">
                         <form>
                              <input
                                   type="text"
                                   placeholder="Search by name"
                                   className="px-4 py-2 outline-none border-0 focus:ring-0 w-64"
                                   onChange={handleSearchInputChange}
                              />
                              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200">
                                   🔍
                              </button>
                         </form>
                    </div>
                    <select
                         className="px-4 py-2 border rounded-md focus:outline-none shadow-sm"
                         onChange={handleFilterChange}
                    >
                         <option>All</option>
                         <option>Verified</option>
                         <option>Blocked</option>
                    </select>
               </div>

               {/* Table Header */}
               <div className="grid grid-cols-[2fr_3fr_2fr_1fr_1fr] gap-4 bg-gray-100 p-4 rounded-md text-black font-semibold mb-2 shadow-sm text-center">
                    <span>Name</span>
                    <span>Email</span>
                    <span>Mobile No</span>
                    <span>Verified</span>
                    <span>Actions</span>
               </div>

               {/* User Rows */}
               <div className="space-y-4">
                    {data.length > 0 ? (
                         data.map((user) => (
                              <div
                                   key={user._id}
                                   className="grid grid-cols-[2fr_3fr_2fr_1fr_1fr] gap-4 items-center bg-white p-4 rounded-md shadow-md border text-center"
                              >
                                   <span className="text-base font-medium">{user.name}</span>
                                   <span className="text-base font-medium truncate">
                                        {user.email}
                                   </span>
                                   <span className="text-base font-medium">{user.mobile_no}</span>
                                   <span className="text-base font-medium">
                                        {user.is_verified ? "Yes" : "No"}
                                   </span>
                                   <div>
                                        <button
                                             className={`px-4 py-2 ${
                                                  user.is_blocked ? "bg-red-500" : "bg-blue-500"
                                             } text-white rounded-md hover:bg-${
                                                  user.is_blocked ? "red" : "blue"
                                             }-600`}
                                             onClick={() =>
                                                  handleBlockUnblock(user._id, user.is_blocked)
                                             }
                                        >
                                             {user.is_blocked ? "Unblock" : "Block"}
                                        </button>
                                   </div>
                              </div>
                         ))
                    ) : (
                         <div className="text-center text-gray-500">No users found</div>
                    )}
               </div>
               <div className="mt-4">
                    <Pagination page={page} totalPages={totalPages} changePage={changePage} />
               </div>

               <ToastContainer position="top-center" />
          </div>
     );
};

export default AdminUserList;
