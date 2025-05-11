
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define types for file uploads
export type UploadMediaOptions = {
  file: File;
  userId: string;
  onProgress?: (progress: number) => void;
};

// Maximum file sizes (in bytes)
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

// Valid file types
export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const VALID_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

/**
 * Check if a bucket exists rather than creating it
 */
export const checkBucketExists = async (bucketId: string): Promise<boolean> => {
  try {
    // Check if bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error(`Error checking if bucket ${bucketId} exists:`, error);
      return false;
    }
    
    const bucketExists = buckets?.find(b => b.name === bucketId);
    if (bucketExists) {
      console.log(`Bucket ${bucketId} exists`);
      return true;
    }
    
    console.log(`Bucket ${bucketId} does not exist`);
    return false;
  } catch (error) {
    console.error(`Error checking if bucket ${bucketId} exists:`, error);
    return false;
  }
};

/**
 * Upload media (image or video) to Supabase Storage
 */
export const uploadMedia = async ({ file, userId, onProgress }: UploadMediaOptions): Promise<string | null> => {
  try {
    // Determine if this is an image or video
    const isImage = VALID_IMAGE_TYPES.includes(file.type);
    const isVideo = VALID_VIDEO_TYPES.includes(file.type);
    
    if (!isImage && !isVideo) {
      throw new Error(`Invalid file type: ${file.type}. Please upload an image or video.`);
    }
    
    // Check file size
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      throw new Error(`Image too large. Maximum size is ${Math.round(MAX_IMAGE_SIZE / (1024 * 1024))}MB.`);
    }
    
    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      throw new Error(`Video too large. Maximum size is ${Math.round(MAX_VIDEO_SIZE / (1024 * 1024))}MB.`);
    }
    
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const mediaType = isImage ? 'images' : 'videos';
    const fileName = `${userId}/${mediaType}/${Date.now()}.${fileExt}`;
    
    // Update progress to show upload has started
    if (onProgress) {
      onProgress(10);
    }
    
    // Check if the post-media bucket exists
    const bucketExists = await checkBucketExists('post-media');
    if (!bucketExists) {
      throw new Error('Media storage bucket not available. Please contact support.');
    }
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('post-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
      
    if (error) {
      console.error("Upload error:", error);
      throw error;
    }
    
    // Update progress to show upload is complete
    if (onProgress) {
      onProgress(100);
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('post-media')
      .getPublicUrl(data.path);
      
    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error("Error uploading media:", error);
    toast.error(error.message || "Failed to upload media");
    return null;
  }
};

/**
 * Remove uploaded media from Supabase Storage
 */
export const removeMedia = async (url: string): Promise<boolean> => {
  try {
    // Extract the path from the URL
    const urlObj = new URL(url);
    const path = urlObj.pathname.split('/').slice(2).join('/');
    
    // Remove the file
    const { error } = await supabase.storage
      .from('post-media')
      .remove([path]);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error("Error removing media:", error);
    return false;
  }
};
