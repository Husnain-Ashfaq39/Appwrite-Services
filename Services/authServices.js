import { account, teams, jobSeekersTeamId, companiesTeamId } from "../config";
import { databases, databaseId } from "../config";
import db from "./dbServices";
import { initializeCollections } from "../collections";
import { ID } from "appwrite"; 
import { createCompanyCollectionAndDocument , createJobSeekerCollectionAndDocument } from "@/global-functions/functions";
import { collections } from "../collections";
// Function to register a new user and automatically assign to a team
export async function registerUser(email, password, isEmployer, profileData = {}) {
  try {
    // Step 1: Register the user
    const user = await account.create(ID.unique(), email, password);
    localStorage.setItem("authToken", user.$id);

    // Step 2: Authenticate the user (log in to create a session)
    await account.createEmailPasswordSession(email, password);

    // Step 3: Assign the user to a team
    await assignUserToTeam(user.$id, email, isEmployer);

      // Step 4: If the user is an employer, create the company collection and document, otherwise create JobSeeker collection
      if (isEmployer) {
        await createCompanyCollectionAndDocument(user.$id, profileData);
      } else {
        await createJobSeekerCollectionAndDocument(user.$id, profileData);
      }

    return user;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
}

// Function to sign in the user by email and password, return user details, and team membership
// Function to sign in the user by email and password, return user details, and team membership
export const signInUser = async (email, password) => {
  try {
    // Step 1: Authenticate the user (create session)
    const session = await account.createEmailPasswordSession(email, password);
    console.log("Session created successfully:", session);

    // Step 2: Fetch the user's details
    const user = await account.get();
    console.log("User details fetched:", user);

    // Step 3: Fetch the teams the user belongs to
    const userMemberships = await teams.listMemberships();
    console.log("User memberships fetched:", userMemberships);

    let userTeam = null;

    // Step 4: Determine if the user is part of "companies" or "jobSeekers"
    const isCompany = userMemberships.memberships.some(
      (membership) => membership.teamId === companiesTeamId
    );
    const isJobSeeker = userMemberships.memberships.some(
      (membership) => membership.teamId === jobSeekersTeamId
    );

    // Step 5: Assign team based on membership
    if (isCompany) {
      userTeam = "companies";
    } else if (isJobSeeker) {
      userTeam = "jobSeekers";
    } else {
      userTeam = "unknown";
      console.warn("User does not belong to companies or jobSeekers team.");
    }

    // Step 6: Return both the user details and the team
    return { user, team: userTeam };
  } catch (error) {
    console.error("Error during sign in:", error.message || error);
    throw new Error("Failed to sign in. Please check your credentials or contact support.");
  }
};


// Function to assign the authenticated user to a team (can be called separately)
export async function assignUserToTeam(userId, email, isEmployer) {
  try {
    // Determine which team to add the user to based on the selection
    const teamId = isEmployer ? companiesTeamId : jobSeekersTeamId;
    // Define roles (optional, based on your team setup)
    const roles = ["member"];

    // Define redirect URL after accepting the invite
    const redirectUrl = "http://localhost:3000/";

    // Add the authenticated user to the appropriate team
    await teams.createMembership(
      teamId, // The team ID
      roles, // Roles, e.g., ["member"]
      email, // The user's email (optional if using userId)
      userId, // The user's ID (optional if using email)
      undefined, // Phone number (not provided)
      redirectUrl // The URL for redirecting after invitation acceptance
    );
  } catch (error) {
    console.error("Error during team assignment:", error);
    throw error;
  }
}

// Function to log out the user
export const signOutUser = async () => {
  try {
    await account.deleteSession("current"); // End the current session
    localStorage.removeItem("authToken"); // Remove auth token
  } catch (error) {
    throw error;
  }
};

// Function to get the currently authenticated user
export const getCurrentUser = async () => {
  try {
    const user = await account.get(); // Get the current user
    return user;
  } catch (error) {
    throw error;
  }
};

// Function to check if the user is authenticated
export const checkAuth = async () => {
  try {
    await account.get(); // If no error is thrown, the user is authenticated
    return true;
  } catch (error) {
    return false; // User is not authenticated
  }
};

// Function to send a password recovery email
export const sendPasswordRecoveryEmail = async (email) => {
  const resetPasswordUrl = `${window.location.origin}/reset-password`; // Construct reset URL
  try {
    await account.createRecovery(email, resetPasswordUrl);
  } catch (error) {
    throw error;
  }
};
