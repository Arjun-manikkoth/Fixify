import React, { FC } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/User/LandingPage";

const App: FC = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" Component={LandingPage} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
