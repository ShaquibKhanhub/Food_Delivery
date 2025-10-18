import { CreateUserPrams, GetMenuParams, SignInParams, User, MenuItem, Category } from "@/type";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage
} from "react-native-appwrite";

import AsyncStorage from "@react-native-async-storage/async-storage";
export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT?.trim() || "",
  platform: "com.khan.foodordering",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID?.trim() || "",
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID?.trim() || "",
  bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID?.trim() || "",
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID?.trim() || "",
  categoriesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CATEGORY_COLLECTION_ID?.trim() || "",
  menuCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MENU_COLLECTION_ID?.trim() || "",
  customizationsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CUSTOMIZATIONS_ID?.trim() || "",
  menuCustomizationsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MENU_CUSTOMIZATIONS_ID?.trim() || "",
};

console.log(appwriteConfig);
export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);

export const databases = new Databases(client);

export const storage = new Storage(client)

const avatars = new Avatars(client);

export const createUser = async ({
  email,
  password,
  name,
}: CreateUserPrams) => {
  try {
    // 1️⃣ Create account in Auth
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw new Error("Failed to create account");

    // 2️⃣ Sign in immediately to create session
    await account.createEmailPasswordSession(email, password);

    // 3️⃣ Generate avatar URL
    const avatarUrl = avatars.getInitialsURL(name);

    // 4️⃣ Save user in database with explicit permission
    const userDoc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      newAccount.$id,
      {
        email,
        name,
        accountId: newAccount.$id,
        avatar: avatarUrl,
      }
    );
console.log(userDoc);
    return userDoc;
  } catch (e: any) {
    console.error("Create user error:", e);
    throw new Error(e.message || "Failed to create user");
  }
};

export const signIn = async ({ email, password }: { email: string; password: string }) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session; // ✅ return the session so caller can use it
  } catch (e: any) {
    console.error("Sign-in error:", e);
    throw new Error(e.message || "Failed to sign in");
  }
};
export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;
console.log(currentUser.documents[0]);
    return currentUser.documents[0] as unknown as User;
  } catch (e) {
    console.log(e);
    throw new Error(e as string);
  }
};

export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries: string[] = [];

    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));

    const menus = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      queries
    );
 return menus.documents as MenuItem[];
    return menus.documents as MenuItem[];
  } catch (e) {
    throw new Error(e as string);
  }
};


export const getCategories = async () => {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId
    );
return categories.documents as Category[];
  } catch (e) {
    throw new Error(e as string);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (e) {
    throw new Error(e as string);
  }
}

export const updateUser = async (userId: string, data: Partial<User>) => {
  try {
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      data
    );
    return updatedUser;
  } catch (e: any) {
    console.error("Update user error:", e);
    throw new Error(e.message || "Failed to update user");
  }
};

export const uploadFile = async (file: any) => {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      file
    );
    return uploadedFile;
  } catch (e: any) {
    console.error("File upload error:", e);
    throw new Error(e.message || "Failed to upload file");
  }
};

export const getFilePreview = (fileId: string) => {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.bucketId,
      fileId,
      2000,
      2000,
      "top",
      100
    );
    if (!fileUrl) throw new Error("Failed to get file preview");
    return fileUrl;
  } catch (e: any) {
    console.error("Get file preview error:", e);
    throw new Error(e.message || "Failed to get file preview");
  }
};
