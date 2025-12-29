// Shared types for the roadmap team collaboration feature

export interface TeamMember {
    userId: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    role: "owner" | "editor" | "viewer";
    invitedAt: string;
    status: "pending" | "accepted";
}

export interface Feature {
    id: string;
    title: string;
    description: string;
    status: "planned" | "in-progress" | "shipped";
    votes: number;
    upvotedBy: string[];
    createdAt: string;
    createdBy?: {
        userId: string;
        username: string;
    };
    comments?: { id: string; body: string; userId: string; username: string; createdAt: string }[];
}

export interface RoadmapLinks {
    github?: string;
    liveDemo?: string;
    documentation?: string;
    website?: string;
}

export interface RoadmapExtendedData {
    type: "roadmap";
    status: "planned" | "in-progress" | "shipped";
    visibility: "public" | "private";
    description?: string;
    ownerId?: string;
    followers?: string[];
    team?: TeamMember[];
    features?: Feature[];
    links?: RoadmapLinks;
}
