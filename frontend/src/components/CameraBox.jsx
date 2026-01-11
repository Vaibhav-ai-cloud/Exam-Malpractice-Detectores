import { useEffect, useRef, useState } from "react";
import { sendFrame, resetScore } from "../services/api";

export default function CameraBox() {
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("connecting");
  const [proctorData, setProctorData] = useState({
    score: 0,
    status: "NORMAL",
    head_direction: "center",
    phone_detected: false
  });

  // ✅ Stable student ID (one per session)
  const studentIdRef = useRef(
    "student_" + Math.floor(Math.random() * 100000)
  );

  useEffect(() => {
    // Reset backend score once
    resetScore(studentIdRef.current);

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStatus("active");
          startProctoring();
        }
      })
      .catch(() => setStatus("error"));

    return () => cleanup();
  }, []);

  const cleanup = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  const startProctoring = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 420;
    canvas.height = 300;

    const sendFrameToBackend = async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const image = canvas.toDataURL("image/jpeg").split(",")[1];

      try {
        const data = await sendFrame(image, studentIdRef.current);
        setProctorData(data);
      } catch (err) {
        console.error("Proctoring error:", err);
      }
    };

    intervalRef.current = setInterval(sendFrameToBackend, 3000);
  };

  return (
    <div className="glass-card floating">
      <div className="glass-card-inner">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📹</span>
            <h3 className="text-white font-medium">Camera Feed</h3>
          </div>

          <div
            className={`flex items-center gap-2 text-sm ${
              status === "active"
                ? "text-green-400"
                : status === "error"
                ? "text-red-400"
                : "text-yellow-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                status === "active"
                  ? "bg-green-400"
                  : status === "error"
                  ? "bg-red-400"
                  : "bg-yellow-400"
              }`}
            />
            {status === "active"
              ? "Live"
              : status === "error"
              ? "Error"
              : "Connecting"}
          </div>
        </div>

        {/* Video */}
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-48 object-cover rounded-xl bg-black"
          />

          {status !== "active" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
              <p className="text-gray-400 text-sm">
                {status === "error"
                  ? "Camera access denied"
                  : "Initializing camera..."}
              </p>
            </div>
          )}

          {/* Status overlay */}
          {status === "active" && (
            <div className="absolute top-2 left-2 bg-gray-900 rounded-lg px-2 py-1">
              <div className="flex items-center gap-1 text-xs">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    proctorData.status === "CHEATING"
                      ? "bg-red-400"
                      : proctorData.status === "SUSPICIOUS"
                      ? "bg-yellow-400"
                      : "bg-green-400"
                  }`}
                />
                <span
                  className={`font-medium ${
                    proctorData.status === "CHEATING"
                      ? "text-red-400"
                      : proctorData.status === "SUSPICIOUS"
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {proctorData.status}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Score:</span>
            <span className="text-white">{proctorData.score}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Head:</span>
            <span className="text-white">{proctorData.head_direction}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Phone:</span>
            <span
              className={
                proctorData.phone_detected
                  ? "text-red-400"
                  : "text-green-400"
              }
            >
              {proctorData.phone_detected ? "Detected" : "Clear"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
