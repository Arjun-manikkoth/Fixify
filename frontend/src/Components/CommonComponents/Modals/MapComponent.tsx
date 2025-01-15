import React, { useState, useMemo, useRef } from "react";
import { GoogleMap, Marker, useLoadScript, Autocomplete } from "@react-google-maps/api";
import { reverseGeocodingApi } from "../../../Api/UserApis";
import { Libraries } from "@react-google-maps/api";
import { toast, ToastContainer } from "react-toastify";

interface MapModalProps {
    onClose: React.Dispatch<React.SetStateAction<boolean>>;
    onLocationSelect: (
        lat: number,
        lng: number,
        city: string,
        state: string,
        country: string
    ) => void;
}

interface AddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
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
                (error) => console.error("Error fetching location:", error)
            );
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

    // Fetch address details using Google Geocoding API
    const fetchAddressDetails = async (latitude: number, longitude: number) => {
        const { success, message, data } = await reverseGeocodingApi(latitude, longitude);
        if (success && data) {
            const addressComponents = data.results[0]?.address_components || [];
            const city =
                addressComponents.find((c: any) => c.types.includes("locality"))?.long_name || "";
            const state =
                addressComponents.find((c: any) => c.types.includes("administrative_area_level_1"))
                    ?.long_name || "";
            const pincode =
                addressComponents.find((c: any) => c.types.includes("postal_code"))?.long_name ||
                "";
            return { city, state, pincode };
        } else {
            toast.error("Error fetching address details:", message);
            return { city: "", state: "", pincode: "" };
        }
    };

    // Confirm location and send details to parent
    const handleConfirmLocation = async () => {
        if (currentLocation) {
            const { lat, lng } = currentLocation;
            const { city, state, pincode } = await fetchAddressDetails(lat, lng);
            onLocationSelect(lat, lng, city, state, pincode);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-3/4 max-w-xl">
                {/* Close Button */}
                <button
                    onClick={() => onClose(false)}
                    className="absolute top-4 right-4 text-slate-100 hover:text-slate-100 text-2xl"
                    aria-label="Close Modal"
                >
                    &times;
                </button>
                <h2 className="text-lg font-semibold mb-4">Choose Your Location</h2>{" "}
                {isLoaded ? (
                    <>
                        <Autocomplete
                            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                            onPlaceChanged={handlePlaceChanged}
                        >
                            <input
                                type="text"
                                placeholder="Search location"
                                className="w-full mb-4 p-2 border rounded"
                            />
                        </Autocomplete>
                        <div className="h-96 w-full mb-4">
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
                        <button
                            onClick={fetchCurrentLocation}
                            className="px-4 py-2 bg-gray-300 rounded"
                        >
                            Use Current Location
                        </button>
                        <button
                            onClick={handleConfirmLocation}
                            className="px-4 py-2 bg-blue-500 text-white rounded ml-4"
                        >
                            Confirm Location
                        </button>
                    </>
                ) : (
                    <p>Loading map...</p>
                )}
            </div>
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default MapModal;
