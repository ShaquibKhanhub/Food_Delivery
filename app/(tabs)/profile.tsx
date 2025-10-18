import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import useAuthStore from "@/store/auth.store";
import ProfileField from "@/components/ProfileField";
import { router } from "expo-router";
import CustomHeader from "@/components/CustomHeader";
import { signOut, updateUser, uploadFile, getFilePreview } from "@/lib/appwrite";
import EditProfileModal from "@/components/EditProfileModal";

const profileFields = [
  {
    label: "Full Name",
    icon: require("../../assets/icons/user.png"),
    key: "name",
  },
  {
    label: "Email Address",
    icon: require("../../assets/icons/envelope.png"),
    key: "email",
  },
  {
    label: "Phone Number",
    icon: require("../../assets/icons/phone.png"),
    key: "phone",
  },
];

export default function Profile() {
  const { user, setUser, setIsAuthenticated } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState("");
  const [editingValue, setEditingValue] = useState("");

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setIsAuthenticated(false);
    router.replace("/sign-in");
  };

  const handleEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditingValue(value);
    setModalVisible(true);
  };

  const handleSave = async (newValue: string) => {
    if (!user) return;

    try {
      const updatedUser = await updateUser(user.$id, { [editingField]: newValue });
      setUser(updatedUser as any);
      setModalVisible(false);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
        const { uri, fileName, mimeType, fileSize } = result.assets[0];

        try {
            let file;
            if (Platform.OS === 'web') {
                const response = await fetch(uri);
                const blob = await response.blob();
                file = {
                    name: fileName || 'photo.png',
                    type: blob.type,
                    size: blob.size,
                    uri: uri,
                };
            } else {
                file = {
                    uri: uri,
                    name: fileName,
                    type: mimeType,
                    size: fileSize
                }
            }

            const uploadedFile = await uploadFile(file);
            if(!uploadedFile) throw new Error("Failed to upload file");

            const fileUrl = getFilePreview(uploadedFile.$id);
            if(!fileUrl) throw new Error("Failed to get file preview");

            const updatedUser = await updateUser(user!.$id, { avatar: fileUrl.toString() });
            setUser(updatedUser as any);

        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    }
  };

  const renderHeader = () => (
    <View className="items-center mt-8">
        <TouchableOpacity onPress={pickImage}>
            <Image
                source={{ uri: user?.avatar }}
                className="w-24 h-24 rounded-full"
            />
      </TouchableOpacity>
      <Text className="text-2xl font-qbold mt-4">{user?.name}</Text>
      <Text className="text-gray-500 font-qregular">{user?.email}</Text>
    </View>
  );

  const renderFooter = () => (
    <View className="px-6 mt-8">
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-primary p-4 rounded-full flex-row items-center justify-center"
      >
        <Image
          source={require("../../assets/icons/logout.png")}
          className="w-6 h-6 mr-2"
          tintColor="white"
        />
        <Text className="text-white text-base font-qbold">Log Out</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="bg-white flex-1">
      <CustomHeader title="My Profile" />
      <FlatList
        data={profileFields}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View className="mt-8 px-6">
            <ProfileField
              label={item.label}
              value={(user as any)?.[item.key] ?? "Not set"}
              icon={item.icon}
              onPress={() => handleEdit(item.key, (user as any)?.[item.key] ?? "")}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingBottom: 150 }}
      />
      <EditProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        label={editingField}
        value={editingValue}
      />
    </View>
  );
}