import React, { FC } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/User/LandingPage";
import HomePage from "./Components/UserComponents/HomePage";
import Protected from "./Components/UserComponents/Protected";

const App: FC = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" Component={LandingPage} />
         <Route  element={<Protected/>}>
         <Route path="/users/home" Component={HomePage}/>
         </Route>    
        </Routes>
      </Router>
    </div>
  );
};

export default App;
