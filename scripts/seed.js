require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Databases, Storage, ID } = require('node-appwrite');
const { InputFile } = require('node-appwrite/file');
const axios = require('axios');

const dataTs = fs.readFileSync(path.join(__dirname, '../lib/data.ts'), 'utf-8');
const dummyData = eval(dataTs.replace('export default dummyData;', 'dummyData;'));

const client = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const appwriteConfig = {
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID,
  categoriesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CATEGORY_COLLECTION_ID,
  menuCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MENU_COLLECTION_ID,
  customizationsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CUSTOMIZATIONS_ID,
  menuCustomizationsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MENU_CUSTOMIZATIONS_ID,
};

async function clearAll(collectionId) {
    const list = await databases.listDocuments(appwriteConfig.databaseId, collectionId);
    await Promise.all(
        list.documents.map((doc) =>
            databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
        )
    );
}

async function clearStorage() {
    const list = await storage.listFiles(appwriteConfig.bucketId);
    await Promise.all(
        list.files.map((file) =>
            storage.deleteFile(appwriteConfig.bucketId, file.$id)
        )
    );
}

async function uploadImageToStorage(imageUrl) {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const fileBuffer = Buffer.from(response.data);
    const fileName = imageUrl.split('/').pop();
    const mimeType = response.headers['content-type'] || 'application/octet-stream';

    const inputFile = InputFile.fromBuffer(fileBuffer, fileName, mimeType);

    const file = await storage.createFile(
        appwriteConfig.bucketId,
        ID.unique(),
        inputFile
    );

    return storage.getFileView(appwriteConfig.bucketId, file.$id);
}

async function seed() {
    try {
        console.log('Starting to seed the database...');

        // 1. Clear all
        await clearAll(appwriteConfig.categoriesCollectionId);
        await clearAll(appwriteConfig.customizationsCollectionId);
        await clearAll(appwriteConfig.menuCollectionId);
        await clearAll(appwriteConfig.menuCustomizationsCollectionId);
        await clearStorage();
        console.log('Cleared all data.');

        // 2. Create Categories
        const categoryMap = {};
        for (const cat of dummyData.categories) {
            const doc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.categoriesCollectionId,
                ID.unique(),
                cat
            );
            categoryMap[cat.name] = doc.$id;
        }
        console.log('Seeded categories.');

        // 3. Create Customizations
        const customizationMap = {};
        for (const cus of dummyData.customizations) {
            const doc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.customizationsCollectionId,
                ID.unique(),
                {
                    name: cus.name,
                    price: cus.price,
                    type: cus.type,
                }
            );
            customizationMap[cus.name] = doc.$id;
        }
        console.log('Seeded customizations.');

        // 4. Create Menu Items
        const menuMap = {};
        for (const item of dummyData.menu) {
            const uploadedImage = await uploadImageToStorage(item.image_url);
            const doc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.menuCollectionId,
                ID.unique(),
                {
                    name: item.name,
                    description: item.description,
                    image_url: uploadedImage.href,
                    price: item.price,
                    rating: item.rating,
                    calories: item.calories,
                    protein: item.protein,
                    categoryId: categoryMap[item.category_name],
                }
            );
            menuMap[item.name] = doc.$id;

            // 5. Create menu_customizations
            for (const cusName of item.customizations) {
                await databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.menuCustomizationsCollectionId,
                    ID.unique(),
                    {
                        menuId: doc.$id,
                        customizationId: customizationMap[cusName],
                    }
                );
            }
        }
        console.log('Seeded menu items.');

        console.log('✅ Seeding complete.');
    } catch (error) {
        console.error('Failed to seed the database.', error);
    }
}

seed();
