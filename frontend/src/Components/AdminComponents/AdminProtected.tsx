import {Navigate, Outlet} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "../../Redux/Store";

const AdminProtected: React.FC = () => {
     const admin = useSelector((state: RootState) => state.admin);

     return admin.id ? <Outlet /> : <Navigate to={"/admins/sign_in"} />;
};
export default AdminProtected;
