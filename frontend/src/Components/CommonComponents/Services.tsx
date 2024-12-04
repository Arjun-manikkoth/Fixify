import React from "react";

const Services: React.FC = () => {
  return (
    <div className="py-32 px-12 mb-16">
      {" "}
      <h2 className="text-4xl font-bold text-center mb-20">Our Services</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <img
            src="/AcRepair.jpg"
            alt="Air Conditioner Repair"
            className="w-full h-56 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold text-center">
              Air Conditioner Repair
            </h3>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Installs, services, and repairs air conditioning systems for
              comfortable, efficient cooling solutions.
            </p>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <img
            src="/Electrical.jpg"
            alt="Electrical Maintenance & Repair"
            className="w-full h-56 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold text-center">
              Electrical Maintenance & Repair
            </h3>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Ensures safe, reliable electrical systems through expert
              troubleshooting, repairs, and preventive maintenance.
            </p>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <img
            src="/Flooring.jpg"
            alt="Flooring Works"
            className="w-full h-56 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold text-center">
              Flooring Works
            </h3>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Cleans, repairs, and restores various floor types, ensuring
              durability and aesthetic appeal.
            </p>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <img
            src="/Carpenter.jpg"
            alt="General Carpentry"
            className="w-full h-56 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold text-center">
              General Carpentry
            </h3>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Designs, builds, and repairs wooden furniture and structures with
              precision and craftsmanship.
            </p>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <img
            src="/Painting.jpg"
            alt="Painting Services"
            className="w-full h-56 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold text-center">
              Painting Services
            </h3>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Refreshes interiors and exteriors with professional painting,
              color consultation, and flawless finishes.
            </p>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <img
            src="/Plumber.jpg"
            alt="Residential Plumbing"
            className="w-full h-56 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold text-center">
              Residential Plumbing
            </h3>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Fixes leaks, installs fixtures, and maintains water systems for
              homes and businesses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
