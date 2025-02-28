import { FC } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import LandingPage from "./Pages/Common/LandingPage";
import ProviderHomePage from "./Pages/Provider/ProviderHomePage";
import UserProfilePage from "./Pages/User/UserHomePage";
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
import ProviderSlotsPage from "./Pages/Provider/ProviderSlots";
import UserSlotPage from "./Pages/User/UserSlots";
import ProviderBookingRequestPage from "./Pages/Provider/ProviderRequest";
import UserBookingsPage from "./Pages/User/UserBookingsPage";
import UserBookingDetailsPage from "./Pages/User/UserBooingDetailsPage";
import ProviderBookingsPage from "./Pages/Provider/ProviderBookings";
import ProviderBookingDetailPage from "./Pages/Provider/ProviderBookingDetails";
import AdminBookingsPage from "./Pages/Admin/AdminBookingsPage";
import ProviderDashboardPage from "./Pages/Provider/ProviderDashboard";
import AdminSalesListingPage from "./Pages/Admin/AdminSalesListingPage";
import AdminDashboardPage from "./Pages/Admin/AdminDashboardPage";

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

                        {/*user slots listing*/}
                        <Route path="/users/slots" Component={UserSlotPage} />

                        {/*user bookings listing*/}
                        <Route path="/users/bookings" Component={UserBookingsPage} />

                        {/*user booking details page*/}
                        <Route path="/users/bookings/:id" Component={UserBookingDetailsPage} />
                    </Route>

                    {/*provider protected component wrapper*/}
                    <Route Component={ProviderProtected}>
                        {/*provider home*/}
                        <Route path="/providers/profile" Component={ProviderHomePage} />
                        {/*provider slots*/}
                        <Route path="/providers/slots" Component={ProviderSlotsPage} />
                        {/*provider slot booking request page*/}
                        <Route
                            path="/providers/slots_requests"
                            Component={ProviderBookingRequestPage}
                        />
                        {/*provider bookings listing*/}
                        <Route path="/providers/bookings" Component={ProviderBookingsPage} />
                        {/*provider bookings details*/}
                        <Route
                            path="/providers/bookings/:id"
                            Component={ProviderBookingDetailPage}
                        />
                        {/*provider dashboard */}
                        <Route path="/providers/dashboard" Component={ProviderDashboardPage} />
                    </Route>

                    {/*admin sign in page*/}
                    <Route path="/admins/sign_in" Component={AdminSignIn} />
                    <Route Component={AdminProtected}>
                        <Route path="/admins/sales" Component={AdminSalesListingPage} />
                        <Route path="/admins/dashboard" Component={AdminDashboardPage} />
                        <Route path="/admins/users" Component={AdminUsersPage} />
                        <Route path="/admins/providers" Component={AdminProvidersPage} />
                        <Route path="/admins/approvals" Component={AdminApprovalsPage} />
                        <Route path="/admins/bookings" Component={AdminBookingsPage} />
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
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default App;
