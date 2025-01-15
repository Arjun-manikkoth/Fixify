import React, { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useState } from "react";
import { editService, getService } from "../../../Api/AdminApis";

interface AddServiceProps {
    closeModal: (id: string) => void;
    refresh: React.Dispatch<React.SetStateAction<number>>;
    id: string;
}

interface IServiceForm {
    serviceName: string;
    description: string;
}

const EditServiceModal: React.FC<AddServiceProps> = ({ closeModal, id, refresh }) => {
    //form data state to store the service form data
    const [formData, setFormData] = useState<IServiceForm>({ serviceName: "", description: "" });

    //state to store error
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    //updates form data state with respect to input
    const handleFormInputChange = (
        e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const { id, value } = e.target;

        setFormData({ ...formData, [e.target.id]: e.target.value });
        setErrors({ ...errors, [id]: "" });
    };

    //useeffect to get update sevice
    useEffect(() => {
        getService(id)
            .then((response) => {
                setFormData({
                    serviceName: response.data.name,
                    description: response.data.description,
                });
            })
            .catch((error) => {
                toast.error(error.message);
            });
    }, []);

    //validate service input
    const validateService = async (e: React.FormEvent) => {
        try {
            e.preventDefault();

            let isValid = true;
            const newErrors: { [key: string]: string } = {};

            if (formData.serviceName.trim() === "") {
                newErrors.serviceName = "Service name is required.";
                isValid = false;
            }

            if (formData.description.trim().length < 10) {
                newErrors.description = "Description must be at least 10 characters.";
                isValid = false;
            }

            setErrors(newErrors);

            if (isValid) {
                const response = await editService(id, formData);
                if (response.success) {
                    toast.success("service updated successfully");

                    setTimeout(() => {
                        closeModal("");
                        refresh((prev) => prev + 1);
                    }, 2500);
                } else {
                    toast.error(response.message);
                }
            }
        } catch (error: any) {
            console.log(error.message);
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60"
            onClick={() => {
                closeModal("");
            }}
        >
            <div
                className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
                    Update Service
                </h2>

                <form className="space-y-6" onSubmit={validateService}>
                    {/* Input for Service Name */}
                    <div className="relative">
                        <input
                            type="text"
                            id="serviceName"
                            placeholder="Service Name"
                            maxLength={20}
                            value={formData.serviceName}
                            onChange={handleFormInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition ease-in-out"
                        />
                        {errors.serviceName && (
                            <p className="text-sm text-red-500 mt-1">{errors.serviceName}</p>
                        )}
                    </div>

                    {/* Input for Service Description */}
                    <div className="relative">
                        <textarea
                            id="description"
                            placeholder="Enter service description"
                            maxLength={80}
                            value={formData.description}
                            onChange={handleFormInputChange}
                            className="w-full px-4 py-4 h-28 leading-snug border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition ease-in-out resize-none"
                        ></textarea>
                        {errors.description && (
                            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-3 bg-brandBlue text-white text-lg font-medium rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
                    >
                        Update
                    </button>
                </form>
            </div>
            <ToastContainer position="bottom-right" />
        </div>
    );
};
export default EditServiceModal;
