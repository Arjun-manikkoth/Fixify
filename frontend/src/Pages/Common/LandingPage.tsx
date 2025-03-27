import React, { useRef } from "react";
import Header from "../../Components/CommonComponents/Header";
import Footer from "../../Components/CommonComponents/Footer";
import Carousal from "../../Components/CommonComponents/Carousal";
import Services from "../../Components/CommonComponents/Services";
import BookService from "../../Components/CommonComponents/BookService";
import About from "../../Components/CommonComponents/About";

const LandingPage: React.FC = () => {
    // Create refs for each section
    const carousalRef = useRef<HTMLDivElement>(null);
    const servicesRef = useRef<HTMLDivElement>(null);
    const aboutRef = useRef<HTMLDivElement>(null);
    const bookServiceRef = useRef<HTMLDivElement>(null);

    // Scroll functions
    const scrollToCarousal = () => {
        carousalRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    const scrollToServices = () => {
        servicesRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    const scrollToAbout = () => {
        aboutRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div>
            <Header
                scrollToHome={scrollToCarousal} // Home scrolls to Carousal
                scrollToServices={scrollToServices}
                scrollToAbout={scrollToAbout}
            />
            <div ref={carousalRef}>
                <Carousal />
            </div>
            <div ref={servicesRef}>
                <Services />
            </div>
            <div ref={bookServiceRef}>
                <BookService />
            </div>
            <div ref={aboutRef}>
                <About />
            </div>
            <Footer />
        </div>
    );
};

export default LandingPage;
