import React, {FC} from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import LandingPage from "./Pages/Common/LandingPage";
import UserHomePage from "./Pages/User/UserHomePage";
import ProviderHomePage from "./Pages/Provider/HomePage";
import UserProtected from "./Components/UserComponents/UserProtected";
import ProviderProtected from "./Components/ProviderComponents/ProviderProtected";
import AdminProtected from "./Components/AdminComponents/AdminProtected";
import AdminSignIn from "./Components/AdminComponents/AdminSignIn";
import AdminHomePage from "./Pages/Admin/AdminHome";

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
                              <Route path="/users/home" Component={UserHomePage} />
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
