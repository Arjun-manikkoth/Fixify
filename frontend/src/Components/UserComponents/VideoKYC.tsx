import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

const VideoKYC: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [capturing, setCapturing] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user",
    };

    const handleDataAvailable = useCallback(({ data }: BlobEvent) => {
        console.log("handleDataAvailable called with data size:", data.size);
        if (data.size > 0) {
            setRecordedChunks((prev) => {
                const newChunks = prev.concat(data);
                const blob = new Blob(newChunks, { type: "video/webm" });
                const url = URL.createObjectURL(blob);
                setVideoUrl(url);
                return newChunks;
            });
        }
    }, []);

    const handleStartVideo = useCallback(() => {
        if (!webcamRef.current?.stream) {
            setError("Camera not accessible. Please allow camera permissions.");
            return;
        }
        setCapturing(true);
        setRecordedChunks([]);
        setVideoUrl(null);
        const stream = webcamRef.current.stream;
        mediaRecorderRef.current = new MediaRecorder(stream, {
            mimeType: "video/webm",
        });
        mediaRecorderRef.current.addEventListener("dataavailable", handleDataAvailable);
        mediaRecorderRef.current.start(); // No timeslice, record continuously
        console.log("Recording started");
    }, [handleDataAvailable]);

    const handleStopVideo = useCallback(() => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            // Wait for the 'stop' event to ensure all data is captured
            mediaRecorderRef.current.addEventListener(
                "stop",
                () => {
                    mediaRecorderRef.current?.removeEventListener(
                        "dataavailable",
                        handleDataAvailable
                    );
                    setCapturing(false);
                    console.log("Recording stopped");
                },
                { once: true } // Listener is removed after firing once
            );
        }
    }, [handleDataAvailable]);

    const handleSaveVideo = useCallback(() => {
        if (recordedChunks.length === 0) {
            setError("No video recorded yet.");
            return;
        }
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "kyc-video.webm";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setRecordedChunks([]);
        setVideoUrl(null);
    }, [recordedChunks]);

    console.log("recordedChunks:", recordedChunks);
    console.log("videoUrl:", videoUrl);

    return (
        <div className="pt-[4.5rem] min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
            <h2 className="text-2xl font-bold text-indigo-600 mb-6">Video KYC</h2>

            {!videoUrl ? (
                <Webcam
                    audio={true}
                    ref={webcamRef}
                    videoConstraints={videoConstraints}
                    className="w-full max-w-2xl rounded-lg shadow-md"
                />
            ) : (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Recorded Video</h3>
                    <video
                        src={videoUrl}
                        controls
                        className="w-full max-w-2xl rounded-lg shadow-md"
                    />
                </div>
            )}

            {error && <p className="text-red-500 mt-4">{error}</p>}

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                {!capturing ? (
                    <button
                        onClick={handleStartVideo}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                        Start Recording
                    </button>
                ) : (
                    <button
                        onClick={handleStopVideo}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                        Stop Recording
                    </button>
                )}
                {recordedChunks.length > 0 && (
                    <button
                        onClick={handleSaveVideo}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                        Save Video
                    </button>
                )}
            </div>
        </div>
    );
};

export default VideoKYC;
