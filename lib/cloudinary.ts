import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// The JSON file path on Cloudinary
const USER_THREADS_PUBLIC_ID = 'loom/user-threads';

interface UserThreadEntry {
    indexThreadId: string;
    updatedAt: string;
}

interface UserThreadsMap {
    users: Record<string, UserThreadEntry>;
}

/**
 * Parse the CLOUDINARY_URL environment variable and configure the SDK
 */
function configureCloudinary(): void {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (!cloudinaryUrl) {
        throw new Error('CLOUDINARY_URL is not set in environment variables');
    }

    // CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
    const match = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
    if (!match) {
        throw new Error('Invalid CLOUDINARY_URL format');
    }

    const [, apiKey, apiSecret, cloudName] = match;

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });
}

/**
 * Get the current user-threads map from Cloudinary
 * Returns an empty map if the file doesn't exist yet
 */
export async function getUserThreadsMap(): Promise<UserThreadsMap> {
    configureCloudinary();

    try {
        // Try to fetch the existing JSON file
        const url = cloudinary.url(USER_THREADS_PUBLIC_ID, {
            resource_type: 'raw',
            secure: true,
        });

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                console.log('[getUserThreadsMap] File not found, returning empty map');
                return { users: {} };
            }
            throw new Error(`Failed to fetch user threads map: ${response.status}`);
        }

        const data = await response.json() as UserThreadsMap;
        console.log('[getUserThreadsMap] Fetched map with', Object.keys(data.users || {}).length, 'users');
        return data;
    } catch (error) {
        // If file doesn't exist or can't be parsed, return empty map
        console.log('[getUserThreadsMap] Error fetching, returning empty map:', error);
        return { users: {} };
    }
}

/**
 * Get the index thread ID for a specific user
 */
export async function getUserIndexThreadId(userId: string): Promise<string | null> {
    const map = await getUserThreadsMap();
    return map.users[userId]?.indexThreadId || null;
}

/**
 * Update the user-threads map with a new entry for a user
 * This reads the current map, updates it, and uploads the new version
 */
export async function updateUserThreadsMap(
    userId: string,
    indexThreadId: string
): Promise<void> {
    configureCloudinary();

    console.log('[updateUserThreadsMap] Updating user:', userId, 'with thread:', indexThreadId);

    // Get current map
    const map = await getUserThreadsMap();

    // Update the user's entry
    map.users[userId] = {
        indexThreadId,
        updatedAt: new Date().toISOString(),
    };

    // Convert to JSON string
    const jsonContent = JSON.stringify(map, null, 2);

    // Upload as a raw file (overwrite if exists)
    const result: UploadApiResponse = await cloudinary.uploader.upload(
        `data:application/json;base64,${Buffer.from(jsonContent).toString('base64')}`,
        {
            public_id: USER_THREADS_PUBLIC_ID,
            resource_type: 'raw',
            overwrite: true,
            invalidate: true, // Invalidate CDN cache
        }
    );

    console.log('[updateUserThreadsMap] Uploaded successfully:', result.secure_url);
}

/**
 * Remove a user's entry from the map (e.g., when their index thread is deleted)
 */
export async function removeUserFromThreadsMap(userId: string): Promise<void> {
    configureCloudinary();

    console.log('[removeUserFromThreadsMap] Removing user:', userId);

    const map = await getUserThreadsMap();

    if (map.users[userId]) {
        delete map.users[userId];

        const jsonContent = JSON.stringify(map, null, 2);

        await cloudinary.uploader.upload(
            `data:application/json;base64,${Buffer.from(jsonContent).toString('base64')}`,
            {
                public_id: USER_THREADS_PUBLIC_ID,
                resource_type: 'raw',
                overwrite: true,
                invalidate: true,
            }
        );

        console.log('[removeUserFromThreadsMap] Removed successfully');
    }
}
