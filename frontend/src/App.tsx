import {FC} from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import LandingPage from "./Pages/Common/LandingPage";
import ProviderHomePage from "./Pages/Provider/ProviderHomePage";
import UserProfilePage from "./Pages/User/UserHomePage";
import AdminHomePage from "./Pages/Admin/AdminHomePage";
import UserProtected from "./Components/UserComponents/UserProtected";
import ProviderProtected from "./Components/ProviderComponents/ProviderProtected";
import AdminProtected from "./Components/AdminComponents/AdminProtected";
import AdminSignIn from "./Components/AdminComponents/AdminSignIn";
import AdminUsersPage from "./Pages/Admin/AdminUsersPage";
import AdminProvidersPage from "./Pages/Admin/AdminProvidersPage";
import AdminApprovalsPage from "./Pages/Admin/AdminApprovalsPage";
import AdminApprovalDetailsPage from "./Pages/Admin/AdminApprovalDetailsPage";
import AdminServicesPage from "./Pages/Admin/AdminServicesPage";
import UserAddressPage from "./Pages/User/UserAddressPage";
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

                               {/*user addresses*/}
                               <Route path="/users/addresses" Component={UserAddressPage} />
                         </Route>

                         {/*provider protected component wrapper*/}
                         <Route Component={ProviderProtected}>
                              {/*provider home*/}
                              <Route path="/providers/profile" Component={ProviderHomePage} />
                         </Route>

                         {/*admin sign in page*/}
                         <Route path="/admins/sign_in" Component={AdminSignIn} />
                         <Route Component={AdminProtected}>
                              <Route path="/admins/dashboard" Component={AdminHomePage} />
                              <Route path="/admins/users" Component={AdminUsersPage} />
                              <Route path="/admins/providers" Component={AdminProvidersPage} />
                              <Route path="/admins/approvals" Component={AdminApprovalsPage} />
                              <Route
                                   path="/admins/approval_details/:id"
                                   Component={AdminApprovalDetailsPage}
                              />
                              <Route path="/admins/services" Component={AdminServicesPage} />
                              <Route
                                   path="/admins/approval_details/:id"
                                   Component={AdminApprovalDetailsPage}
                              />
                         </Route>
                    </Routes>
               </Router>
          </div>
     );
};

export default App;
