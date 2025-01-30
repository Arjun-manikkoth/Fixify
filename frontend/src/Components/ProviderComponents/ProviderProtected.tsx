import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/Store";

const ProviderProtected: React.FC = () => {
    const provider = useSelector((state: RootState) => state.provider);

    return provider.id ? <Outlet /> : <Navigate to={"/"} />;
};

export default ProviderProtected;
