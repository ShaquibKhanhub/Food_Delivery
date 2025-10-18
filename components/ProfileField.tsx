import { View, Text, Image, ImageSourcePropType, TouchableOpacity } from "react-native";
import React from "react";
import { ProfileFieldProps } from "@/type";

const ProfileField = ({ label, value, icon, onPress }: ProfileFieldProps) => {
  return (
    <View className="flex-row items-center  mb-4">
      <Image source={icon} className="w-6 h-6 mr-4" tintColor="#121212" />
      <View className="flex-1">
        <Text className="text-gray-500 text-xs font-qlight">{label}</Text>
        <Text className="text-black text-base font-qregular">{value}</Text>
      </View>
      <TouchableOpacity onPress={onPress}>
        <Image
          source={require("../assets/icons/pencil.png")}
          className="w-5 h-5"
          tintColor="#121212"
        />
      </TouchableOpacity>
    </View>
  );
};

export default ProfileField;
