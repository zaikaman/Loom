import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSession } from "@/lib/session";
import { getMe, updateUser } from "@/lib/forums";
import { configureCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate User
        const token = await getSession();
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let user;
        try {
            user = await getMe(token);
        } catch (error) {
            console.error("Failed to get user:", error);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse File
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, and GIF are allowed." }, { status: 400 });
        }

        // Validate file size (removed per user request to allow Cloudinary optimization)
        // if (file.size > 1 * 1024 * 1024) {
        //     return NextResponse.json({ error: "File size exceeds 1MB limit." }, { status: 400 });
        // }

        // 3. Upload to Cloudinary
        configureCloudinary();

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            folder: "loom/tavatars",
            public_id: user.id, // Use user ID as public ID to overwrite old avatar automatically
            overwrite: true,
            transformation: [
                { width: 400, height: 400, crop: "fill", gravity: "face" }, // Optimize for avatar
                { quality: "auto", fetch_format: "auto" }
            ]
        });

        // 4. Update User Profile
        const currentExtendedData = user.extendedData || {};
        await updateUser(user.id, {
            extendedData: {
                ...currentExtendedData,
                avatarUrl: uploadResult.secure_url,
            },
        }, token);

        return NextResponse.json({
            success: true,
            avatarUrl: uploadResult.secure_url
        });

    } catch (error) {
        console.error("Avatar upload error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
