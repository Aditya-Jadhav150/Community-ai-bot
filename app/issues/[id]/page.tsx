"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, MapPin, Calendar, ThumbsUp, CheckCircle2, User } from "lucide-react";
import { useDemoData } from "@/context/DemoDataContext";
import { useDemoUser } from "@/hooks/useDemoUser";
import { DemoReport } from "@/lib/demoData/reports";

export default function IssueDetailPage() {
  const params = useParams();
  const { user } = useDemoUser();
  const { reports, upvoteReport } = useDemoData();
  const [issue, setIssue] = useState<DemoReport | null>(null);

  useEffect(() => {
    const found = reports.find((r) => r.id === params.id);
    if (found) {
      setIssue(found);
    }
  }, [params.id, reports]);

  const handleVote = (type: "UPVOTE" | "VERIFY") => {
    if (!user) {
      alert("Please sign in to vote");
      return;
    }
    
    if (type === "UPVOTE" && issue && !issue.hasUserUpvoted) {
      upvoteReport(issue.id);
    }
  };

  if (!issue) {
    return <div className="min-h-screen pt-24 px-4 text-center">Issue not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          <Card className="glass-card overflow-hidden">
            <div className="w-full h-[400px] bg-[#1A1A1A] flex items-center justify-center text-muted-foreground relative">
              {issue.imageUrl ? (
                <img src={issue.imageUrl} alt="Issue" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <User className="w-16 h-16 opacity-20 mx-auto mb-2" />
                  <p>Media Placeholder</p>
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                 <Badge className="bg-black/50 backdrop-blur-md text-white border-white/20">
                  Priority Score: {Math.round(issue.priorityScore)}
                 </Badge>
              </div>
            </div>
          </Card>

          {issue.aiSummary && (
            <Card className="glass-card p-6 border-[#00FFE0]/30 shadow-[0_0_20px_rgba(0,255,224,0.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-32 h-32 text-[#00FFE0]" />
              </div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#00FFE0]" /> AI Analysis
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {issue.aiSummary}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Confidence</p>
                  <p className="font-semibold">{Math.round((issue.aiConfidence || 0) * 100)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Suggested Department</p>
                  <p className="font-semibold">{issue.assignedTo?.name || "Pending Assignment"}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="w-full md:w-[400px] space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{issue.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="text-[#00AEFF] border-[#00AEFF]/50 bg-[#00AEFF]/10">{issue.category}</Badge>
              <Badge variant="outline" className="text-[#FF9500] border-[#FF9500]/50 bg-[#FF9500]/10">{issue.severity} Severity</Badge>
              <Badge variant="outline" className="text-white border-white/20 bg-white/5">{issue.status.replace("_", " ")}</Badge>
            </div>
            <p className="text-muted-foreground">{issue.description}</p>
          </div>

          <div className="space-y-4 py-6 border-y border-white/10">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#00AEFF] mt-0.5" />
              <div>
                <p className="font-medium text-sm">Location</p>
                <p className="text-muted-foreground text-sm">{issue.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#00AEFF] mt-0.5" />
              <div>
                <p className="font-medium text-sm">Reported On</p>
                <p className="text-muted-foreground text-sm">{new Date(issue.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-[#00AEFF] mt-0.5" />
              <div>
                <p className="font-medium text-sm">Reported By</p>
                <div className="flex items-center gap-2 mt-1">
                  <img src={issue.submittedBy.avatarUrl} alt={issue.submittedBy.name} className="w-6 h-6 rounded-full bg-white/10" />
                  <p className="text-muted-foreground text-sm">{issue.submittedBy.name}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              className={`flex-1 ${issue.hasUserUpvoted ? 'bg-[#00AEFF] text-white hover:bg-[#00AEFF]/90' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
              onClick={() => handleVote("UPVOTE")}
            >
              <ThumbsUp className={`w-4 h-4 mr-2 ${issue.hasUserUpvoted ? 'text-white' : 'text-[#00AEFF]'}`} /> 
              {issue.hasUserUpvoted ? 'Upvoted' : 'Upvote'} ({issue.upvotes})
            </Button>
            <Button 
              className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10"
              onClick={() => handleVote("VERIFY")}
            >
              <CheckCircle2 className="w-4 h-4 mr-2 text-[#30D158]" /> 
              Verify ({issue.verifications})
            </Button>
          </div>

          <Card className="glass-card p-6">
            <h3 className="font-bold mb-4">Timeline</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {issue.statusHistory.map((history, index) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border border-[#00AEFF]/50 bg-[#00AEFF] text-white shadow shrink-0 z-10" />
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] px-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="font-semibold text-sm">{history.status.replace("_", " ")}</p>
                      <p className="text-xs text-muted-foreground mb-1">{new Date(history.changedAt).toLocaleString()}</p>
                      {history.note && <p className="text-sm text-white/80 mt-2">{history.note}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
