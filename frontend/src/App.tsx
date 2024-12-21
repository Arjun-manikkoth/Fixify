import React, {FC} from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import LandingPage from "./Pages/Common/LandingPage";
import ProviderHomePage from "./Pages/Provider/ProviderHomePage";
import UserProfilePage from "./Pages/User/UserHomePage";
import AdminHomePage from "./Pages/Admin/AdminHomePage";
import UserProtected from "./Components/UserComponents/UserProtected";
import ProviderProtected from "./Components/ProviderComponents/ProviderProtected";
import AdminProtected from "./Components/AdminComponents/AdminProtected";
import AdminSignIn from "./Components/AdminComponents/AdminSignIn";

const App: FC = () => {
     return (
          <div>
               <Router>
                    <Routes>
                         {/*user and provider landing page */}
                         <Route path="/" Component={LandingPage} />

                         {/*user protected component wrapper*/}
                         <Route Component={UserProtected}>
                              {/*user home*/}
                              <Route path="/users/profile" Component={UserProfilePage} />
                         </Route>

                         {/*provider protected component wrapper*/}
                         <Route Component={ProviderProtected}>
                              {/*provider home*/}
                              <Route path="/providers/home" Component={ProviderHomePage} />
                         </Route>

                         {/*admin sign in page*/}
                         <Route path="/admins/sign_in" Component={AdminSignIn} />
                         <Route Component={AdminProtected}>
                              <Route path="/admins/home" Component={AdminHomePage} />
                         </Route>
                    </Routes>
               </Router>
          </div>
     );
};

export default App;
