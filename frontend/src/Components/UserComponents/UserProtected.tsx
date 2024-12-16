import {Navigate, Outlet} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "../../Redux/Store";

const UserProtected: React.FC = () => {
     const user = useSelector((state: RootState) => state.user);

     return user.id ? <Outlet /> : <Navigate to={"/"} />;
};
export default UserProtected;
