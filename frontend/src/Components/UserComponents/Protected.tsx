import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/Store';

const Protected:React.FC = () => {
   
 const user = useSelector((state:RootState)=>state.user)
console.log(user.id)
 return  user.id?<Outlet/>:<Navigate to={"/"}/>


};
export default Protected;