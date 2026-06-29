"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UploadCloud, CheckCircle, MapPin, Zap, Camera } from "lucide-react";
import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";
import LiveCameraCapture, { CapturedImage } from "@/components/camera/LiveCameraCapture";
import { useDemoData } from "@/context/DemoDataContext";
import { useDemoUser } from "@/hooks/useDemoUser";

export default function ReportWizard() {
  const router = useRouter();
  const { submitReport } = useDemoData();
  const { user } = useDemoUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [base64Image, setBase64Image] = useState<string>("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState({ lat: 18.5204, lng: 73.8567 }); // Default Pune
  
  const [showCamera, setShowCamera] = useState(false);
  const [captureMethod, setCaptureMethod] = useState<"CAMERA" | "UPLOAD">("UPLOAD");
  const [capturedMetadata, setCapturedMetadata] = useState<any>(null);

  const [aiData, setAiData] = useState<any>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setCaptureMethod("UPLOAD");
      setCapturedMetadata(null); // Reset metadata
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCameraCapture = (data: CapturedImage) => {
    setShowCamera(false);
    setCaptureMethod("CAMERA");
    setCapturedMetadata({
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      capturedAt: data.capturedAt,
    });
    
    // Auto-fill location if available
    if (data.latitude && data.longitude) {
      setLocation({ lat: data.latitude, lng: data.longitude });
    }

    // Convert blob to file and base64
    const newFile = new File([data.blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
    setFile(newFile);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64Image(reader.result as string);
    };
    reader.readAsDataURL(data.blob);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const secureUrl = file ? URL.createObjectURL(file) : "";

      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Image, text: description }),
      });
      const data = await res.json();
      if (data.error) {
        alert("AI Analysis failed: " + data.error);
        return;
      }
      setAiData({ ...data, secureUrl });
      
      // If camera capture already has GPS, we can skip step 3
      if (captureMethod === "CAMERA" && capturedMetadata?.latitude) {
        setStep(4);
      } else {
        setStep(2);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!user) {
        alert("Must be logged in");
        return;
      }
      
      const issue = submitReport({
        title: aiData?.title || "Community Issue",
        description: description || aiData?.description || "",
        category: aiData?.issueType || "OTHER",
        severity: aiData?.severity || "MEDIUM",
        status: "OPEN",
        priorityScore: (aiData?.confidenceScore || 0.9) * 100,
        latitude: location.lat,
        longitude: location.lng,
        address: address || "Community Location",
        imageUrl: aiData?.secureUrl || "",
        submittedBy: {
          id: user.id,
          name: user.name,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },
        captureMethod: captureMethod,
        capturedAt: capturedMetadata?.capturedAt,
        aiConfidence: aiData?.confidenceScore || 0.9,
        aiSummary: aiData?.description || "",
      });
      
      if (issue.id) {
        router.push(`/issues/${issue.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const slideVariants: any = {
    initial: { x: "100%", opacity: 0 },
    enter: { x: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { x: "-100%", opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Sticky Progress Bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10 px-4 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 w-full h-[1px] bg-white/10 -z-10" />
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= i ? "bg-[#00AEFF] text-white" : "bg-[#111111] text-[#ABABAB] border border-white/10"
              }`}
            >
              {step > i ? <CheckCircle className="w-5 h-5" /> : i}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:px-6 lg:px-8 overflow-hidden relative flex flex-col">
        {showCamera && (
          <LiveCameraCapture 
            onCapture={handleCameraCapture} 
            onCancel={() => setShowCamera(false)} 
          />
        )}

        <AnimatePresence mode="wait">
          {!showCamera && step === 1 && (
            <motion.div key="step1" variants={slideVariants} initial="initial" animate="enter" exit="exit" className="flex-1 flex flex-col">
              <h2 className="text-2xl font-bold mb-6">Step 1: Upload Media</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Button 
                  onClick={() => setShowCamera(true)}
                  className="h-24 flex flex-col gap-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-white/10"
                >
                  <Camera className="w-6 h-6 text-[#00FFE0]" />
                  <span>Use Live Camera</span>
                </Button>
                
                <div className="relative h-24 bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-white/10 rounded-md flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
                  <UploadCloud className="w-6 h-6 text-[#00AEFF]" />
                  <span className="text-sm font-medium">Upload from Gallery</span>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>

              {file && (
                <div className="mb-6 p-4 border border-[#00FFE0]/30 rounded-xl bg-[#00FFE0]/5 flex items-center justify-between">
                  <div className="text-sm">
                    <p className="font-bold text-white">{captureMethod === "CAMERA" ? "Camera Capture Ready" : file.name}</p>
                    {capturedMetadata?.latitude && (
                      <p className="text-xs text-[#00FFE0]">📍 Location locked</p>
                    )}
                  </div>
                  <CheckCircle className="w-5 h-5 text-[#00FFE0]" />
                </div>
              )}

              <div className="mb-6">
                <Label htmlFor="desc" className="text-base mb-2 block">Additional Description (Optional)</Label>
                <Textarea 
                  id="desc" 
                  placeholder="What exactly is the problem?" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 bg-[#1A1A1A] border-white/10 text-base py-3 min-h-[120px]"
                />
              </div>

              <div className="mt-auto pt-6 sticky bottom-0 bg-background pb-6">
                <Button 
                  className="w-full h-12 text-base bg-[#00AEFF] hover:bg-[#00AEFF]/80 text-white"
                  onClick={handleAnalyze}
                  disabled={loading || !file}
                >
                  {loading ? "Analyzing..." : "Analyze with AI"} <Zap className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && aiData && (
            <motion.div key="step2" variants={slideVariants} initial="initial" animate="enter" exit="exit" className="flex-1 flex flex-col">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Zap className="text-[#00FFE0] w-6 h-6" /> AI Analysis Complete
              </h2>
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-white/5 border border-[#00FFE0]/30 rounded-xl">
                  <p className="text-sm text-muted-foreground uppercase mb-1">Detected Issue</p>
                  <p className="text-xl font-bold text-[#00FFE0]">{aiData.issueType}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-sm text-muted-foreground uppercase mb-1">Severity</p>
                    <p className="font-bold text-[#FF9500]">{aiData.severity}</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-sm text-muted-foreground uppercase mb-1">Confidence</p>
                    <p className="font-bold text-white">{(aiData.confidenceScore * 100).toFixed(0)}%</p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-sm text-muted-foreground uppercase mb-1">Explanation</p>
                  <p className="text-sm">{aiData.explanation}</p>
                </div>
              </div>

              <div className="mt-auto pt-6 sticky bottom-0 bg-background pb-6 flex gap-4">
                <Button variant="outline" className="flex-1 h-12 text-base" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1 h-12 text-base bg-[#00AEFF] hover:bg-[#00AEFF]/80 text-white" onClick={() => setStep(3)}>Continue</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={slideVariants} initial="initial" animate="enter" exit="exit" className="flex-1 flex flex-col">
              <h2 className="text-2xl font-bold mb-6">Step 3: Location Details</h2>
              <div className="mb-6">
                <Label className="text-base block mb-2">Address</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="e.g. 123 Main St"
                    className="bg-[#1A1A1A] border-white/10 text-base h-12"
                  />
                  <Button variant="outline" size="icon" className="h-12 w-12"><MapPin className="w-5 h-5" /></Button>
                </div>
              </div>
              <div className="w-full h-[40vh] sm:h-[300px] bg-[#1A1A1A] border border-white/10 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={location}
                    zoom={15}
                    onClick={(e) => {
                      if (e.latLng) {
                        setLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                      }
                    }}
                    options={{ disableDefaultUI: true, zoomControl: true }}
                  >
                    <Marker position={location} />
                  </GoogleMap>
                ) : (
                  "Loading map..."
                )}
              </div>

              <div className="mt-auto pt-6 sticky bottom-0 bg-background pb-6 flex gap-4">
                <Button variant="outline" className="flex-1 h-12 text-base" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1 h-12 text-base bg-[#00AEFF] hover:bg-[#00AEFF]/80 text-white" onClick={() => setStep(4)}>Review</Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={slideVariants} initial="initial" animate="enter" exit="exit" className="flex-1 flex flex-col">
              <h2 className="text-2xl font-bold mb-6">Step 4: Review & Submit</h2>
              <Card className="glass-card p-6 mb-6 text-base">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between border-b border-white/10 pb-4 gap-1">
                    <span className="text-muted-foreground">Issue Type</span>
                    <span className="font-semibold text-[#00FFE0]">{aiData?.issueType}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between border-b border-white/10 pb-4 gap-1">
                    <span className="text-muted-foreground">Severity</span>
                    <span className="font-semibold text-[#FF9500]">{aiData?.severity}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between border-b border-white/10 pb-4 gap-1">
                    <span className="text-muted-foreground">Capture Method</span>
                    <span className="font-semibold text-white">{captureMethod}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between pb-2 gap-1">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-semibold text-white text-right max-w-xs">{address || "Coordinates recorded"}</span>
                  </div>
                </div>
              </Card>

              <div className="mt-auto pt-6 sticky bottom-0 bg-background pb-6 flex gap-4">
                <Button variant="outline" className="flex-1 h-12 text-base" onClick={() => setStep(capturedMetadata?.latitude ? 1 : 3)}>Back</Button>
                <Button 
                  className="flex-1 h-12 text-base bg-[#30D158] hover:bg-[#30D158]/80 text-white" 
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
