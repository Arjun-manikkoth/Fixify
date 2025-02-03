import React, { useEffect } from "react";
import { getServices, listUnlistService } from "../../Api/AdminApis";
import { toast } from "react-toastify";
import { useState } from "react";
import Pagination from "../CommonComponents/Pagination";
import { IService } from "../../Interfaces/AdminInterfaces/SignInInterface";
import AddServiceModal from "./Modals/AddServiceModal";
import EditServiceModal from "./Modals/EditServiceModal";

const AdminServicesList: React.FC = () => {
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string | number>("");
    const [filter, setFilter] = useState<string>("All");
    const [data, setData] = useState<IService[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [forceRender, setForceRender] = useState<number>(0);
    const [addServiceModal, setAddServiceModal] = useState(false);
    const [updateServiceModal, setUpdateServiceModal] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState<string>("");

    useEffect(() => {
        //debouncing
        const debounce = setTimeout(() => {
            //make an api call to get all services
            getServices(page, filter, search)
                .then((response) => {
                    if (response.success) {
                        setData(response.data.data.services);
                        setTotalPages(response.data.totalPages);
                    }
                })
                .catch((error) => {
                    console.log(error.message);
                    toast.error("Cannot fetch services at this moment");
                });
        }, 500);

        return () => {
            clearTimeout(debounce);
        };
    }, [search, filter, page, forceRender]);
    console.log("add service modal state", addServiceModal);
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
    //function to make an api call to change listing status of service
    const handleListUnList = async (status: "List" | "UnList", id: string) => {
        try {
            const response = await listUnlistService(id, status);
            console.log(response, "at handle list unlist");
            setForceRender((prev) => prev + 1);
        } catch (error: any) {
            console.log(error.message);
            toast.error("Error updating services");
        }
    };

    const toggleAddServiceModal = () => {
        setAddServiceModal((prev) => !prev);
    };
    const handleEditService = (id: string) => {
        setUpdateServiceModal((prev) => !prev);
        setSelectedServiceId((prev) => {
            if (prev === "") {
                return id;
            } else {
                return "";
            }
        });
    };

    return (
        <div className="p-6 pt-24 px-12">
            <div className="flex justify-between items-center mb-6">
                {/* Title Section */}
                <h1 className="text-2xl font-semibold mb-4 text-left">Services List</h1>
                {/* Service Add Button */}
                <button
                    className="bg-brandBlue px-4 py-2 rounded-md text-white font-semibold"
                    onClick={toggleAddServiceModal}
                >
                    + Service
                </button>
            </div>
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
                        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200">🔍</button>
                    </form>
                </div>
                <select
                    className="px-4 py-2 border rounded-md focus:outline-none shadow-sm"
                    onChange={handleFilterChange}
                >
                    <option>All</option>
                    <option>Listed</option>
                    <option>Unlisted</option>
                </select>
            </div>
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_3fr_2fr_1fr_1fr] gap-4 bg-gray-100 p-4 rounded-md text-black font-semibold mb-2 shadow-sm text-center">
                <span>Service Name</span>
                <span>Description</span>
                <span>Active</span>
                <span>Actions</span>
            </div>
            {/* Provider Rows */}
            <div className="space-y-4">
                {data?.length > 0 ? (
                    data.map((service) => (
                        <div
                            key={service._id}
                            className="grid grid-cols-[2fr_3fr_2fr_2fr] gap-4 items-center bg-white p-4 rounded-md shadow-md border text-center"
                        >
                            <span className="text-base font-medium">{service.name}</span>
                            <span className="text-base font-medium truncate">
                                {service.description}
                            </span>{" "}
                            <span className="text-base font-medium">
                                {service.is_active ? "Yes" : "No"}
                            </span>
                            <div className="flex justify-between">
                                <button
                                    className={`px-4 py-2 ${
                                        service.is_active ? "bg-red-500" : "bg-blue-500"
                                    } text-white rounded-md hover:bg-${
                                        service.is_active ? "red" : "blue"
                                    }-600`}
                                    onClick={() =>
                                        handleListUnList(
                                            service.is_active ? "UnList" : "List",
                                            service._id
                                        )
                                    }
                                >
                                    {service.is_active ? "List" : "Unlist"}
                                </button>
                                <button
                                    className="px-4 py-2 text-white rounded-md bg-orange-400"
                                    onClick={() => handleEditService(service._id)}
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500">No services found</div>
                )}
            </div>
            <div className="mt-4">
                <Pagination page={page} totalPages={totalPages} changePage={changePage} />
            </div>

            {addServiceModal && <AddServiceModal closeModal={toggleAddServiceModal} />}
            {updateServiceModal && (
                <EditServiceModal
                    closeModal={handleEditService}
                    refresh={setForceRender}
                    id={selectedServiceId}
                />
            )}
        </div>
    );
};
export default AdminServicesList;
