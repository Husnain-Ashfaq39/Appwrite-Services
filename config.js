import * as sdk from "node-appwrite";

// Access environment variables
const Endpoint = process.env.NEXT_PUBLIC_ENDPOINT;
const projectID = process.env.NEXT_PUBLIC_PROJECT_ID;
const databaseId = process.env.NEXT_PUBLIC_DATABASE_ID;
const talentFinderApi = process.env.NEXT_PUBLIC_TALENT_FINDER_API;
const jobSeekersTeamId = process.env.NEXT_PUBLIC_JOB_SEEKERS_TEAM_ID;
const companiesTeamId = process.env.NEXT_PUBLIC_COMPANIES_TEAM_ID;
// Create a new Appwrite client
const client = new sdk.Client();
client.setEndpoint(Endpoint).setProject(projectID).setKey(talentFinderApi);

export const account = new sdk.Account(client);
export const databases = new sdk.Databases(client);
export const storage = new sdk.Storage(client);
export const teams = new sdk.Teams(client); // Add the Teams service
export { databaseId, projectID, jobSeekersTeamId, companiesTeamId };

