import React from "react";
import Header from "../../Components/CommonComponents/Header";
import Footer from "../../Components/CommonComponents/Footer";
import Carousal from "../../Components/CommonComponents/Carousal";
import Services from "../../Components/CommonComponents/Services";
import BookService from "../../Components/CommonComponents/BookService";
import About from "../../Components/CommonComponents/About";

const LandingPage: React.FC = () => {
  return (
    <div>
      <Header />
      <Carousal />
      <Services />
      <BookService />
      <About />
      <Footer />
    </div>
  );
};

export default LandingPage;
