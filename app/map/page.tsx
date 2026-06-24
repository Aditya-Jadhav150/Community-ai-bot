"use client";

import { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Filter, PlusCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 18.5204,
  lng: 73.8567,
};

const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "water", stylers: [{ color: "#17263c" }] }
];

export default function MapPage() {
  const router = useRouter();
  const [issues, setIssues] = useState<any[]>([]);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    fetch("/api/issues")
      .then((res) => res.json())
      .then((data) => setIssues(data))
      .catch((err) => console.error("Error fetching map issues:", err));
  }, []);

  const getMarkerColor = (severity: string) => {
    switch(severity) {
      case "CRITICAL": return "#FF3B30";
      case "HIGH": return "#FF9500";
      case "MEDIUM": return "#FFD60A";
      case "LOW": return "#30D158";
      default: return "#00AEFF";
    }
  };

  const FiltersContent = () => (
    <>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground uppercase">Filters</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="h-11 px-4 cursor-pointer bg-[#FF3B30]/20 text-[#FF3B30] hover:bg-[#FF3B30]/30 border-[#FF3B30]/50">Critical</Badge>
          <Badge variant="outline" className="h-11 px-4 cursor-pointer bg-[#FF9500]/20 text-[#FF9500] hover:bg-[#FF9500]/30 border-[#FF9500]/50">High</Badge>
          <Badge variant="outline" className="h-11 px-4 cursor-pointer bg-[#FFD60A]/20 text-[#FFD60A] hover:bg-[#FFD60A]/30 border-[#FFD60A]/50">Medium</Badge>
        </div>
        
        <div className="mt-8">
          <p className="text-sm text-muted-foreground uppercase mb-4">Recent Reports</p>
          <div className="space-y-3">
            {issues.slice(0, 5).map((issue) => (
              <Card 
                key={issue.id} 
                className="glass-card p-4 min-h-[44px] cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => router.push(`/issues/${issue.id}`)}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-base truncate">{issue.title}</p>
                  <div 
                    className="w-3 h-3 rounded-full mt-1.5 shrink-0" 
                    style={{ backgroundColor: getMarkerColor(issue.severity) }} 
                  />
                </div>
                <p className="text-sm text-muted-foreground truncate">{issue.address}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-background relative pb-16 md:pb-0">
      
      {/* Mobile Top Bar with Filter Trigger */}
      <div className="md:hidden absolute top-16 left-4 right-4 z-10 flex justify-between pointer-events-none">
        <Sheet>
          <SheetTrigger className="h-12 w-12 flex items-center justify-center rounded-full bg-black/80 backdrop-blur border border-white/20 pointer-events-auto text-white hover:bg-black/60 transition-colors">
            <Filter className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto rounded-t-2xl">
            <SheetHeader className="mb-4">
              <SheetTitle>Filters & Recent</SheetTitle>
            </SheetHeader>
            <FiltersContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-24 right-6 z-50">
        <Button 
          onClick={() => router.push("/report")}
          className="w-14 h-14 rounded-full bg-[#00AEFF] hover:bg-[#00AEFF]/80 shadow-[0_0_20px_rgba(0,174,255,0.5)] p-0"
        >
          <PlusCircle className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="w-80 border-r border-white/10 bg-[#0D0D0D] p-4 overflow-y-auto hidden md:block z-10 shadow-xl h-[calc(100vh-4rem)]">
        <h2 className="text-xl font-bold mb-6 mt-16">Live Map</h2>
        <FiltersContent />
      </div>

      {/* Map Area */}
      <div className="flex-1 relative h-full">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={issues.length > 0 ? { lat: issues[0].latitude, lng: issues[0].longitude } : defaultCenter}
            zoom={13}
            options={{
              styles: mapStyle,
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            {issues.map((issue) => (
              <Marker
                key={issue.id}
                position={{ lat: issue.latitude, lng: issue.longitude }}
                onClick={() => router.push(`/issues/${issue.id}`)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 12, // Ensure min 44px tap target size by increasing scale
                  fillColor: getMarkerColor(issue.severity),
                  fillOpacity: 0.9,
                  strokeWeight: 3,
                  strokeColor: "#ffffff",
                }}
              />
            ))}
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Loading Map...
          </div>
        )}
      </div>
    </div>
  );
}
