import React, { FC } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/User/LandingPage";
import HomePage from "./Components/UserComponents/HomePage";

const App: FC = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" Component={LandingPage} />
          <Route path="/users/home" Component={HomePage}/>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
