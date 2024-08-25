import { storage } from "./config"; // Ensure config is imported

export let buckets = [];

// Function to fetch all buckets from Appwrite
export const fetchAllBuckets = async () => {
  try {
    const result = await storage.listBuckets();
    buckets = result.buckets.map((bucket) => ({
      id: bucket.$id,
      name: bucket.name,
    }));
    console.log("All buckets fetched and formatted successfully:", buckets);
  } catch (error) {
    console.error("Error fetching buckets:", error);
    throw error;
  }
};

// Ensure buckets are fetched by returning a promise
export const initializeBuckets = async () => {
  await fetchAllBuckets();
};
