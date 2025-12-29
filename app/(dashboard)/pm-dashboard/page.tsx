"use client";

import { useEffect, useState } from "react";
import { TriageCard } from "@/components/pm-dashboard/triage-card";
import { AIAnalysis, Feature } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Rocket01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface Roadmap {
    id: string;
    title: string;
    description: string;
    aiAnalysis?: AIAnalysis;
    createdAt: string;
}

interface FeatureWithRoadmap extends Feature {
    roadmapId: string;
    roadmapTitle: string;
    aiAnalysis?: AIAnalysis;
}

export default function PMDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<{ type: "Roadmap" | "Feature", data: Roadmap | FeatureWithRoadmap }[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Fetch Roadmaps
                const res = await fetch("/api/roadmaps");
                const { roadmaps } = await res.json();

                const allItems: { type: "Roadmap" | "Feature", data: Roadmap | FeatureWithRoadmap }[] = [];

                // Process Roadmaps
                for (const r of roadmaps) {
                    if (r.aiAnalysis) {
                        allItems.push({ type: "Roadmap", data: r });
                    }

                    // 2. Fetch Features for each Roadmap
                    // Note: In a real app we'd have a bulk endpoint or aggregation
                    const featuresRes = await fetch(`/api/roadmaps/${r.id}/features`);
                    if (featuresRes.ok) {
                        const { features } = await featuresRes.json();
                        features.forEach((f: any) => {
                            // We need to fetch the feature details which contains aiAnalysis
                            // Actually the LIST endpoint might not return aiAnalysis unless we update it too?
                            // Let's check api/roadmaps/[id]/features/route.ts
                            // If it returns features from extendedData, it should have it if we stored it there.
                            if (f.aiAnalysis) { // Wait, the current GET /features maps fields explicitly?
                                allItems.push({
                                    type: "Feature",
                                    data: { ...f, roadmapId: r.id, roadmapTitle: r.title }
                                });
                            }
                        });
                    }
                }

                // Sort by Impact (desc) then Effort (asc)
                allItems.sort((a, b) => {
                    const scoreA = (a.data.aiAnalysis?.impactScore || 0) * 2 - (a.data.aiAnalysis?.effortScore || 0);
                    const scoreB = (b.data.aiAnalysis?.impactScore || 0) * 2 - (b.data.aiAnalysis?.effortScore || 0);
                    return scoreB - scoreA;
                });

                setItems(allItems);
            } catch (err) {
                console.error("Failed to fetch PM data", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Helper to check if GET /features returns aiAnalysis.
    // Looking at route.ts: 
    // const formattedFeatures = features.map(f => ({ ... }));
    // It EXPLICITLY maps fields. I need to update GET /features too!

    if (loading) {
        return <div className="p-8 space-y-4">
            <h1 className="text-3xl font-bold mb-6">PM Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
            </div>
        </div>;
    }

    const wins = items.filter(i => (i.data.aiAnalysis?.impactScore || 0) >= 7 && (i.data.aiAnalysis?.effortScore || 0) <= 5);
    const others = items.filter(i => !wins.includes(i));

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    PM Dashboard
                </h1>
                <p className="text-muted-foreground">
                    AI-powered triage of your roadmaps and features.
                </p>
            </div>

            {wins.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <HugeiconsIcon icon={Rocket01Icon} className="text-green-500 w-5 h-5" /> Recommended Wins
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wins.map((item, idx) => (
                            <TriageCard
                                key={idx}
                                type={item.type}
                                title={item.data.title}
                                description={item.data.description}
                                analysis={item.data.aiAnalysis!}
                                createdAt={item.data.createdAt}
                                href={item.type === "Roadmap" ? `/roadmaps/${item.data.id}` : `/roadmaps/${(item.data as FeatureWithRoadmap).roadmapId}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">All Triaged Items</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {others.map((item, idx) => (
                        <TriageCard
                            key={idx}
                            type={item.type}
                            title={item.data.title}
                            description={item.data.description}
                            analysis={item.data.aiAnalysis!}
                            createdAt={item.data.createdAt}
                            href={item.type === "Roadmap" ? `/roadmaps/${item.data.id}` : `/roadmaps/${(item.data as FeatureWithRoadmap).roadmapId}`}
                        />
                    ))}
                    {others.length === 0 && wins.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            No items with AI analysis found yet. Create some roadmaps or features!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
