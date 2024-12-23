import React from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../Redux/Store";

const ProviderHeader: React.FC = () => {
     const provider = useSelector((state: RootState) => state.provider);

     return (
          <header className="flex items-center px-12 py-4 bg-white mb-6">
               <div className="ml-auto flex items-center space-x-2">
                    {provider.url ? (
                         <img
                              src={provider.url}
                              alt="Provider"
                              className="w-9 h-9 rounded-full border border-black"
                         />
                    ) : (
                         <img
                              src="https://firebasestorage.googleapis.com/v0/b/user-management-mern-5bc5a.appspot.com/o/profile_images%2F66fd0a2fd73f7295eaca123c?alt=media&token=00d21b9d-4a72-459d-841e-42bca581a6c8"
                              alt="Provider"
                              className="w-9 h-9 rounded-full border border-black"
                         />
                    )}

                    <h1 className="text-lg font-semibold text-black">Hello, {provider.name}</h1>
               </div>
          </header>
     );
};

export default ProviderHeader;
