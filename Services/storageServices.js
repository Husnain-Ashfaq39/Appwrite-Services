import { initializeBuckets, buckets } from "../buckets";
import { storage } from "../config"; // Ensure you have initialized Appwrite client and storage service
import { ID, Permission, Role } from "appwrite";

// Initialize buckets before using them
(async () => {
  await initializeBuckets();
})();

const storageServices = {};

// Function to create a new storage bucket with full permissions and various attributes
storageServices.createBucket = async (bucketName, attributes = {}) => {
  try {
    const {
      fileSizeLimit = null,       // Maximum file size (optional)
      allowedFileTypes = [],      // Allowed file types (optional, empty array allows all types)
      isPublic = true,            // Public visibility flag
      encryption = true,          // Encryption setting (default true)
      antivirus = true            // Antivirus setting (default true)
    } = attributes;

    // Create the bucket with all permissions (upload, download, update, delete)
    const bucket = await storage.createBucket(
      ID.unique(), // Unique ID for the bucket
      bucketName,
      [
        Permission.create(Role.any()),    // Public upload
        Permission.read(Role.any()),      // Public download
        Permission.update(Role.any()),    // Public update
        Permission.delete(Role.any())     // Public delete
      ],
      isPublic,
      fileSizeLimit,          // Optional file size limit
      allowedFileTypes        // Optional list of allowed file types (empty array allows all)
    );

    // Set additional attributes like encryption and antivirus
    await storage.updateBucket(bucket.$id, {
      encryption,   // Enable or disable encryption
      antivirus     // Enable or disable antivirus scanning
    });

    console.log("Bucket created successfully with attributes:", bucket);
    return bucket;
  } catch (error) {
    console.error("Error creating bucket or setting attributes:", error);
    throw error;
  }
};

// Initialize storage services for each bucket
buckets.forEach((bucket) => {
  storageServices[bucket.name] = {
    createFile: async (file, id = ID.unique()) =>
      await storage.createFile(bucket.id, id, file),

    deleteFile: async (id) => await storage.deleteFile(bucket.id, id),

    getFile: async (id) => await storage.getFile(bucket.id, id),

    getFileDownload: async (id) => await storage.getFileDownload(bucket.id, id),

    getFilePreview: async (id) => await storage.getFilePreview(bucket.id, id),

    getFileView: async (id) => await storage.getFileView(bucket.id, id),

    listFiles: async (queries) => await storage.listFiles(bucket.id, queries),

    updateFile: async (id, file) =>
      await storage.updateFile(bucket.id, id, file),
  };
});

export default storageServices;
