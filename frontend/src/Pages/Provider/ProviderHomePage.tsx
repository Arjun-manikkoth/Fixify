import React from "react";
import {useDispatch} from "react-redux";
import {clearProvider} from "../../Redux/ProviderSlice";
import {logoutProvider, testApi} from "../../Api/ProviderApis";
import {useSelector} from "react-redux";
import {RootState} from "../../Redux/Store";

const HomePage: React.FC = () => {
     const dispatch = useDispatch();

     const provider = useSelector((state: RootState) => state.provider);

     const handleLogout = async () => {
          const response = await logoutProvider();
          if (response.success) {
               dispatch(clearProvider());
          }
     };
     const handleapicall = async () => {
          await testApi();
     };

     return (
          <div>
               {/* Navigation Bar */}
               <nav className="bg-white shadow-sm px-12 py-4 flex justify-between items-center border-b border-gray-200">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                         <div>
                              <img src="/FixifyLogo.png" alt="Fixify Logo" className="h-10" />
                         </div>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center space-x-2">
                         <img
                              src="/profile.jpg" // Replace with the user's profile image URL
                              alt="User"
                              className="w-8 h-8 rounded-full border border-gray-300"
                         />
                         <span className="text-gray-800 text-lg font-normal">
                              Hi, {provider.name}
                         </span>
                         <span className="text-gray-800 text-xs cursor-pointer">▼</span>
                    </div>
               </nav>

               {/* Main Content */}
               <main className="p-8 text-center">
                    <h1 className="text-2xl font-semibold text-gray-700">Welcome to Fixify</h1>
                    <p className="text-gray-600">This is the home page after login.</p>
                    <button onClick={handleLogout}>Click here to logout</button>
                    <p onClick={handleapicall}>Click here to make an api call </p>
               </main>
          </div>
     );
};

export default HomePage;
