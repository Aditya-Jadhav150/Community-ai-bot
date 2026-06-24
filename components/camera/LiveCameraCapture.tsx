"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, Zap, ZapOff } from "lucide-react";

export interface CapturedImage {
  blob: Blob;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  capturedAt: string;
  deviceInfo: string;
}

interface LiveCameraCaptureProps {
  onCapture: (data: CapturedImage) => void;
  onCancel: () => void;
}

export default function LiveCameraCapture({ onCapture, onCancel }: LiveCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [overlayData, setOverlayData] = useState<any>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setPermissionError("Camera API not supported on this device/browser.");
          return;
        }

        activeStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        setStream(activeStream);
        if (videoRef.current) videoRef.current.srcObject = activeStream;
      } catch (err) {
        setPermissionError("Camera permission denied or unavailable. Please enable it in browser settings.");
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    // Poll location every 3 seconds for the live HUD
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setLocation(pos),
          () => {} // silently fail live HUD updates, we'll try again hard on capture
        );
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!stream || !useAI) {
      setOverlayData(null);
      return;
    }
    const analyzeFrame = async () => {
      if (!videoRef.current || isAnalyzing) return;
      setIsAnalyzing(true);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 180;
        canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0, 320, 180);
        const base64Frame = canvas.toDataURL("image/jpeg", 0.6).split(",")[1];

        const res = await fetch("/api/camera/analyze-frame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64Frame }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setOverlayData(data);
        }
      } catch (err) {
        // silent fail for analysis
      } finally {
        setIsAnalyzing(false);
      }
    };

    const interval = setInterval(analyzeFrame, 3000);
    return () => clearInterval(interval);
  }, [stream, useAI, isAnalyzing]);

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    // Hard fetch GPS coords right at capture
    let captureLocation: GeolocationPosition | null = null;
    if (navigator.geolocation) {
      try {
        captureLocation = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
          })
        );
      } catch (err) {
        console.warn("Geolocation failed at capture");
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(videoRef.current, 0, 0);

    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    
    // Draw metadata bar
    ctx.font = "bold 16px monospace";
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(8, canvas.height - 56, 420, 48);
    ctx.fillStyle = "#00FFE0"; // neon-cyan
    
    if (captureLocation) {
      ctx.fillText(`📍 ${captureLocation.coords.latitude.toFixed(5)}, ${captureLocation.coords.longitude.toFixed(5)}`, 16, canvas.height - 36);
      ctx.fillText(`🕐 ${timestamp}  ±${Math.round(captureLocation.coords.accuracy)}m`, 16, canvas.height - 16);
    } else {
      ctx.fillText(`📍 Location unavailable`, 16, canvas.height - 36);
      ctx.fillText(`🕐 ${timestamp}`, 16, canvas.height - 16);
    }

    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.92));

    const capturedImage: CapturedImage = {
      blob,
      latitude: captureLocation ? captureLocation.coords.latitude : null,
      longitude: captureLocation ? captureLocation.coords.longitude : null,
      accuracy: captureLocation ? captureLocation.coords.accuracy : null,
      altitude: captureLocation ? captureLocation.coords.altitude : null,
      capturedAt: new Date().toISOString(),
      deviceInfo: navigator.userAgent,
    };

    onCapture(capturedImage);
  };

  const severityColors: any = {
    CRITICAL: "border-red-500 text-red-500",
    HIGH: "border-orange-500 text-orange-500",
    MEDIUM: "border-yellow-500 text-yellow-500",
    LOW: "border-green-500 text-green-500",
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 h-16 bg-black/40 backdrop-blur-md flex items-center justify-between px-4 z-20">
        <button onClick={onCancel} className="p-2 text-white bg-black/50 rounded-full hover:bg-black/70">
          <X className="w-6 h-6" />
        </button>
        <span className="font-bold text-white tracking-widest text-sm">LIVE CAMERA</span>
        <button onClick={() => setUseAI(!useAI)} className={`p-2 rounded-full ${useAI ? "text-[#00FFE0]" : "text-white/50"}`}>
          {useAI ? <Zap className="w-6 h-6" /> : <ZapOff className="w-6 h-6" />}
        </button>
      </div>

      {/* Camera Feed */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {permissionError ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-red-400">
            {permissionError}
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* AI Overlay Layer */}
        {useAI && overlayData && !permissionError && (
          <div className="absolute inset-0 pointer-events-none z-10 p-4 pt-20 pb-32">
            {overlayData.detected ? (
              <div className={`w-full h-full border-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] ${severityColors[overlayData.severity] || "border-white"}`}>
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                  {overlayData.category} • {Math.round(overlayData.confidence * 100)}%
                </div>
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur px-3 py-2 rounded-lg text-sm max-w-[80%] text-white">
                  {overlayData.hint}
                </div>
              </div>
            ) : (
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur px-3 py-2 rounded-lg text-sm max-w-[80%] text-white/80 border border-white/20">
                {overlayData.hint || "Scanning for civic issues..."}
              </div>
            )}
          </div>
        )}

        {/* Live Metadata Indicator */}
        <div className="absolute bottom-32 left-4 z-20 flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded text-[10px] text-[#00FFE0] font-mono">
            <span className={`w-2 h-2 rounded-full bg-[#00FFE0] ${isAnalyzing ? "animate-pulse" : ""}`}></span>
            {location ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}` : "Locating..."}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-black/40 backdrop-blur-md flex items-center justify-center z-20">
        <button
          onClick={capturePhoto}
          disabled={!!permissionError}
          className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50"
        >
          <div className="w-12 h-12 bg-white rounded-full active:scale-90 transition-transform"></div>
        </button>
      </div>
    </div>
  );
}
