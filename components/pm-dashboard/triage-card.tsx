import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIAnalysis, Feature } from "@/lib/types";
import { SparklesIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import Link from "next/link";

interface TriageCardProps {
    type: "Roadmap" | "Feature";
    title: string;
    description: string;
    analysis: AIAnalysis;
    createdAt: string;
    href: string; // New prop for navigation
}

export function TriageCard({ type, title, description, analysis, href }: TriageCardProps) {
    const isWin = analysis.impactScore >= 7 && analysis.effortScore <= 5;

    return (
        <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${isWin ? "border-green-500/50 bg-green-50/10 dark:bg-green-900/10" : ""}`}>
            {isWin && (
                <div className="absolute top-0 right-0 p-2 bg-green-500 text-white text-xs font-bold rounded-bl-lg flex items-center gap-1">
                    <HugeiconsIcon icon={SparklesIcon} className="w-3 h-3" /> Quick Win
                </div>
            )}

            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <Badge variant="outline" className={`${type === "Roadmap" ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" : "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
                            } mb-2`}>
                            {type}
                        </Badge>
                        <CardTitle className="line-clamp-1 text-lg">{title}</CardTitle>
                    </div>
                </div>
                <CardDescription className="line-clamp-2 text-xs">
                    {description || "No description provided."}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant={analysis.type === "Bug" ? "destructive" : "secondary"}>
                            {analysis.type}
                        </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Sentiment</span>
                        <span>{analysis.sentiment}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="text-center p-2 bg-background rounded border">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Impact</div>
                            <div className={`text-xl font-bold ${analysis.impactScore >= 8 ? "text-green-500" : ""}`}>
                                {analysis.impactScore}<span className="text-xs text-muted-foreground">/10</span>
                            </div>
                        </div>
                        <div className="text-center p-2 bg-background rounded border">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Effort</div>
                            <div className={`text-xl font-bold ${analysis.effortScore <= 3 ? "text-green-500" : analysis.effortScore >= 8 ? "text-red-500" : ""}`}>
                                {analysis.effortScore}<span className="text-xs text-muted-foreground">/10</span>
                            </div>
                        </div>
                    </div>
                </div>

                {analysis.reasoning && (
                    <div className="text-xs text-muted-foreground italic">
                        "{analysis.reasoning}"
                    </div>
                )}
            </CardContent>

            <CardFooter>
                <Button asChild className="w-full group" variant={isWin ? "default" : "secondary"}>
                    <Link href={href}>
                        View Details →
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
