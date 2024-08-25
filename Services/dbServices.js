import { initializeCollections, collections } from "../collections";
import { databaseId, databases } from "../config";
import { ID, Permission, Role } from "appwrite";

// Initialize collections before using them
(async () => {
  await initializeCollections();
})();

const db = {};

// Function to create a new collection with full permissions and attributes, including array attributes
db.createCollection = async (collectionName, attributes = []) => {
  try {
    const collection = await databases.createCollection(
      databaseId,
      ID.unique(), // Unique ID for the collection
      collectionName,
      [
        Permission.read(Role.any()),      // Public read
        Permission.write(Role.any()),     // Public write
        Permission.update(Role.any()),    // Public update
        Permission.delete(Role.any())     // Public delete
      ]
    );
    console.log("Collection created successfully:", collection);

    for (const attr of attributes) {
      switch (attr.type) {
        case 'string':
          await databases.createStringAttribute(
            databaseId,
            collection.$id,
            attr.name,
            attr.size,
            attr.required,
            undefined,
            attr.array || false // Is it an array?
          );
          break;
        case 'integer':
          await databases.createIntegerAttribute(
            databaseId,
            collection.$id,
            attr.name,
            attr.min,        // Minimum value for integer
            attr.max,        // Maximum value for integer
            attr.required,
            attr.array || false // Is it an array?
          );
          break;
        case 'boolean':
          await databases.createBooleanAttribute(
            databaseId,
            collection.$id,
            attr.name,
            attr.required,
            attr.array || false // Is it an array?
          );
          break;
        case 'float':
          await databases.createFloatAttribute(
            databaseId,
            collection.$id,
            attr.name,
            attr.min,        // Minimum value for float
            attr.max,        // Maximum value for float
            attr.required,
            attr.array || false // Is it an array?
          );
          break;
        case 'enum':
          await databases.createEnumAttribute(
            databaseId,
            collection.$id,
            attr.name,
            attr.elements,   // List of possible enum values
            attr.required,
            attr.array || false // Is it an array?
          );
          break;
        case 'email':
          await databases.createEmailAttribute(
            databaseId,
            collection.$id,
            attr.name,
            attr.required,
            attr.array || false // Is it an array?
          );
          break;
        case 'url':
          await databases.createUrlAttribute(
            databaseId,
            collection.$id,
            attr.name,
            attr.required,
            attr.array || false // Is it an array?
          );
          break;
        default:
          console.error(`Unknown attribute type: ${attr.type}`);
      }
    }

    console.log("Attributes added successfully to collection:", collectionName);
    return collection;
  } catch (error) {
    console.error("Error creating collection or setting attributes:", error);
    throw error;
  }
};


// Function to create a company collection and insert a document
// db.createCompanyCollectionAndDocument = async (userId, companyData) => {
//   try {
//     const existingCollections = await databases.listCollections(databaseId);
//     const companyCollectionExists = existingCollections.collections.some(
//       (collection) => collection.name === "company"
//     );

//     if (!companyCollectionExists) {
//       const companyAttributes = [
//         { type: "string", name: "name", required: false, size: 500 },
//         { type: "string", name: "email", required: false, size: 500 },
//         { type: "string", name: "phone", required: false, size: 20 },
//         { type: "string", name: "website", required: false, size: 500 },
//         { type: "string", name: "since", required: false, size: 20 },
//         { type: "string", name: "companySize", required: false, size: 100 },
//         { type: "string", name: "allowListingVisibility", required: false, size: 10 },
//         { type: "string", name: "aboutCompany", required: false, size: 1000 },
//         { type: "string", name: "categoryTags", required: false, array: true, size: 500 },
//         { type: "string", name: "socials", required: false, array: true, size: 500 },
//         { type: "string", name: "city", required: false, size: 500 },
//         { type: "string", name: "address", required: false, size: 500 },
//         { type: "string", name: "country", required: false, size: 100 },
//         { type: "string", name: "userId", required: true, size: 500 },
//       ];

//       await db.createCollection("company", companyAttributes);

//       // Re-initialize collections so the new collection is available
//       await initializeCollections();
//       console.log("Company collection created and collections re-initialized.");
//     }

//     const companyCollection = collections.find((col) => col.name === "company");

//     // Initialize db.company if not done already
//     if (!db.company) {
//       db.company = {
//         create: async (payload, id = ID.unique()) =>
//           await databases.createDocument(databaseId, companyCollection.id, id, payload),
//       };
//     }

//     const companyDocumentPayload = { ...companyData, userId };
//     await db.company.create(companyDocumentPayload, ID.unique());
//     console.log("Company document created successfully.");
//   } catch (error) {
//     console.error("Error creating company collection or document:", error);
//     throw error;
//   }
// };

// Initialize db services for each collection in the collections array


collections.forEach((col) => {
  db[col.name] = {
    create: async (payload, id = ID.unique()) =>
      await databases.createDocument(databaseId, col.id, id, payload),

    update: async (id, payload) =>
      await databases.updateDocument(databaseId, col.id, id, payload),

    get: async (id) => await databases.getDocument(databaseId, col.id, id),

    list: async (queries) =>
      await databases.listDocuments(databaseId, col.id, queries),

    delete: async (id) =>
      await databases.deleteDocument(databaseId, col.id, id),
  };
});
export default db;
