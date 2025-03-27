// src/components/CommonComponents/Modals/MapComponent.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { GoogleMap, Marker, useLoadScript, Autocomplete } from "@react-google-maps/api";
import { reverseGeocodingApi } from "../../../Api/UserApis";
import { Libraries } from "@react-google-maps/api";
import { toast } from "react-toastify";

interface MapModalProps {
    onClose: React.Dispatch<React.SetStateAction<boolean>>;
    onLocationSelect: (
        lat: number,
        lng: number,
        city: string,
        state: string,
        pincode: string,
        street?: string
    ) => void;
}

const MapModal: React.FC<MapModalProps> = ({ onClose, onLocationSelect }) => {
    const [libraries] = useState<Libraries>(["places"]);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
        libraries: libraries,
    });

    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(
        null
    );

    const mapRef = useRef<google.maps.Map | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const center = useMemo(
        () => currentLocation || { lat: 9.939093, lng: 76.270523 },
        [currentLocation]
    );

    // Fetch user's current location
    const fetchCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    mapRef.current?.panTo({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error fetching location:", error);
                    toast.error("Unable to fetch current location.");
                }
            );
        } else {
            toast.error("Geolocation is not supported by this browser.");
        }
    };

    // Handle place selection from autocomplete
    const handlePlaceChanged = () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setCurrentLocation({ lat, lng });
            mapRef.current?.panTo({ lat, lng });
        }
    };

    // Fetch address details using reverse geocoding API
    const fetchAddressDetails = async (latitude: number, longitude: number) => {
        try {
            const { success, message, data } = await reverseGeocodingApi(latitude, longitude);
            if (success && data) {
                const addressComponents = data.results[0]?.address_components || [];
                const city =
                    addressComponents.find((c: any) => c.types.includes("locality"))?.long_name ||
                    "";
                const state =
                    addressComponents.find((c: any) =>
                        c.types.includes("administrative_area_level_1")
                    )?.long_name || "";
                const pincode =
                    addressComponents.find((c: any) => c.types.includes("postal_code"))
                        ?.long_name || "";
                const street =
                    addressComponents.find((c: any) => c.types.includes("route"))?.long_name || "";
                return { city, state, pincode, street };
            } else {
                toast.error(message || "Error fetching address details.");
                return { city: "", state: "", pincode: "", street: "" };
            }
        } catch (error) {
            toast.error("Failed to fetch address details.");
            return { city: "", state: "", pincode: "", street: "" };
        }
    };

    // Confirm location and send details to parent
    const handleConfirmLocation = async () => {
        if (currentLocation) {
            const { lat, lng } = currentLocation;
            const { city, state, pincode, street } = await fetchAddressDetails(lat, lng);
            onLocationSelect(lat, lng, city, state, pincode, street);
        } else {
            toast.error("Please select a location first.");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md sm:max-w-xl max-h-[90vh] overflow-y-auto relative">
                {/* Close Button */}
                <button
                    onClick={() => onClose(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl sm:text-2xl"
                    aria-label="Close Modal"
                >
                    ×
                </button>

                <h2 className="text-base sm:text-lg font-semibold mb-4">Choose Your Location</h2>

                {isLoaded ? (
                    <>
                        <Autocomplete
                            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                            onPlaceChanged={handlePlaceChanged}
                        >
                            <input
                                type="text"
                                placeholder="Search location"
                                className="w-full mb-4 p-2 border rounded text-sm sm:text-base"
                            />
                        </Autocomplete>
                        <div className="h-64 sm:h-96 w-full mb-4">
                            <GoogleMap
                                center={center}
                                zoom={14}
                                mapContainerClassName="h-full w-full"
                                onClick={(e) =>
                                    e.latLng &&
                                    setCurrentLocation({
                                        lat: e.latLng.lat(),
                                        lng: e.latLng.lng(),
                                    })
                                }
                                onLoad={(map) => {
                                    mapRef.current = map;
                                }}
                            >
                                {currentLocation && <Marker position={currentLocation} />}
                            </GoogleMap>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <button
                                onClick={fetchCurrentLocation}
                                className="px-4 py-2 bg-gray-300 rounded text-sm sm:text-base hover:bg-gray-400"
                            >
                                Use Current Location
                            </button>
                            <button
                                onClick={handleConfirmLocation}
                                className="px-4 py-2 bg-blue-500 text-white rounded text-sm sm:text-base hover:bg-blue-600"
                            >
                                Confirm Location
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-sm sm:text-base">Loading map...</p>
                )}
            </div>
        </div>
    );
};

export default React.memo(MapModal);
