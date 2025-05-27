import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

// Check required environment variables
const SUPABASE_URL = 'https://mvhtoqekgoajurkshrek.supabase.co';
// Use the service role key provided by the user
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12aHRvcWVrZ29hanVya3NocmVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzE1OTYyOSwiZXhwIjoyMDYyNzM1NjI5fQ.DivpD5s7QBqVGdequZ6yVXvaMg1KfsY_lbkhNPG4oek';

// Create Supabase client with service role key to bypass RLS policies
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false, // Don't persist the session in the browser
      autoRefreshToken: false, // Don't automatically refresh the token
    },
    // Set header to bypass RLS policies
    global: {
      headers: {
        // Add the service role header to bypass RLS
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    },
  }
);

// Bucket name where certificates will be stored
const CERTIFICATES_BUCKET = 'certificates';

/**
 * Upload a certificate file to Supabase Storage
 * @param file The file buffer to upload
 * @param fileName The name to save the file as
 * @param contentType The MIME type of the file
 * @returns The URL and path of the uploaded file
 */
export async function uploadCertificate(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<{ url: string; path: string }> {
  try {
    // Log Supabase URL and authentication status
    console.log('--- SUPABASE STORAGE UPLOAD START ---');
    console.log(`Supabase URL: ${SUPABASE_URL}`);
    console.log(`Using service role key to bypass RLS`);
    console.log(`Bucket target: ${CERTIFICATES_BUCKET}`);
    
    // Log file details
    console.log('File details:', {
      fileName,
      contentType,
      size: file.length,
      bufferIsValid: Buffer.isBuffer(file)
    });
    
    // Generate a unique file path to avoid collisions
    const timestamp = Date.now();
    const hash = crypto.createHash('md5').update(file).digest('hex').substring(0, 8);
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '-');
    const uniqueFileName = `${timestamp}-${hash}-${safeFileName}`;
    
    console.log(`Generated unique filename: ${uniqueFileName}`);
    console.log('Initiating upload to Supabase storage...');
    
    // Upload to Supabase with service role key
    const { data, error } = await supabase.storage
      .from(CERTIFICATES_BUCKET)
      .upload(uniqueFileName, file, {
        contentType,
        cacheControl: '3600',
        upsert: true, // Use upsert to overwrite if file exists
      });
    
    if (error) {
      console.error('Error uploading certificate to Supabase:', error);
      console.error('Error details:', error);
      throw error;
    }
    
    console.log('Upload successful!', data);
    console.log('Getting public URL for the uploaded file');
    
    // Get the public URL for the file
    const { data: publicUrlData } = supabase.storage
      .from(CERTIFICATES_BUCKET)
      .getPublicUrl(uniqueFileName);
    
    console.log('Public URL generated:', publicUrlData.publicUrl);
    console.log('--- SUPABASE STORAGE UPLOAD COMPLETE ---');
    
    return {
      url: publicUrlData.publicUrl,
      path: uniqueFileName,
    };
  } catch (error: any) {
    console.error('--- SUPABASE STORAGE UPLOAD ERROR ---');
    console.error('Certificate upload failed with error:', error);
    console.error('Error details:', error);
    console.error('--- END ERROR DETAILS ---');
    throw error;
  }
}

/**
 * Get a certificate file from Supabase Storage
 * @param filePath The path of the file in the bucket
 * @returns The file data
 */
export async function getCertificate(filePath: string): Promise<{ data: Blob | null; error: Error | null }> {
  try {
    console.log(`Downloading certificate: ${filePath}`);
    
    const { data, error } = await supabase.storage
      .from(CERTIFICATES_BUCKET)
      .download(filePath);
    
    if (error) {
      console.error('Error downloading certificate:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting certificate:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Delete a certificate file from Supabase Storage
 * @param filePath The path of the file in the bucket
 * @returns Success status
 */
export async function deleteCertificate(filePath: string): Promise<{ error: Error | null }> {
  try {
    console.log(`Deleting certificate: ${filePath}`);
    
    const { error } = await supabase.storage
      .from(CERTIFICATES_BUCKET)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting certificate:', error);
    }
    
    return { error };
  } catch (error) {
    console.error('Error deleting certificate:', error);
    return { error: error as Error };
  }
}

/**
 * Tests connection to the Supabase bucket
 * @returns Promise<boolean> True if connection successful
 */
export async function testBucketConnection(): Promise<boolean> {
  try {
    console.log("Testing connection to Supabase bucket...");
    
    // First test if we can list buckets
    console.log("1. Testing bucket listing...");
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      return false;
    }
    
    console.log("Buckets listed successfully:", buckets);
    
    // Now test if we can list objects in our bucket
    console.log(`2. Testing file listing in '${CERTIFICATES_BUCKET}' bucket...`);
    const { data: files, error: filesError } = await supabase.storage
      .from(CERTIFICATES_BUCKET)
      .list('');
      
    if (filesError) {
      console.error("Error listing files:", filesError);
      return false;
    }
    
    console.log("Files listed successfully:", files.length > 0 ? files.map(f => f.name) : "No files found");
    
    // Create small test file
    const testContent = "test";
    const testBuffer = Buffer.from(testContent);
    const testFileName = `test-${Date.now()}.txt`;
    
    console.log(`3. Testing file upload to '${CERTIFICATES_BUCKET}' bucket...`);
    // Test upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(CERTIFICATES_BUCKET)
      .upload(testFileName, testBuffer, {
        contentType: 'text/plain',
        upsert: true
      });
      
    if (uploadError) {
      console.error("Error uploading test file:", uploadError);
      return false;
    }
    
    console.log("Test file uploaded successfully");
    
    // Test public URL
    console.log("4. Testing public URL generation...");
    const { data: urlData } = supabase.storage
      .from(CERTIFICATES_BUCKET)
      .getPublicUrl(testFileName);
      
    console.log("Public URL generated:", urlData.publicUrl);
    
    // Test deletion
    console.log("5. Testing file deletion...");
    const { error: deleteError } = await supabase.storage
      .from(CERTIFICATES_BUCKET)
      .remove([testFileName]);
      
    if (deleteError) {
      console.error("Error deleting test file:", deleteError);
      return false;
    }
    
    console.log("File deleted successfully");
    
    console.log("All connection tests passed successfully!");
    return true;
  } catch (error) {
    console.error("Unexpected error in connection test:", error);
    return false;
  }
}

/**
 * Get the public URL for a certificate
 * @param filePath The path of the file in the bucket
 * @returns The public URL
 */
export function getCertificateUrl(filePath: string): string {
  if (!filePath) {
    console.warn('getCertificateUrl called with empty filePath');
    return '';
  }
  
  try {
    console.log(`Getting public URL for file: ${filePath}`);
    const { data } = supabase.storage
      .from(CERTIFICATES_BUCKET)
      .getPublicUrl(filePath);
    
    console.log(`Generated public URL: ${data.publicUrl}`);
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting certificate URL:', error);
    return '';
  }
}