import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import CustomButton from "./CustomButton";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newValue: string) => void;
  label: string;
  value: string;
}

const EditProfileModal = ({
  visible,
  onClose,
  onSave,
  label,
  value,
}: EditProfileModalProps) => {
  const [text, setText] = useState(value);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        {/* Modal Container */}
        <View className="bg-white w-full max-w-md rounded-2xl p-6 shadow-lg">
          {/* Title */}
          <Text className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Edit {label}
          </Text>

          {/* Input */}
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-700 mb-6"
            placeholder={`Enter new ${label}`}
            value={text}
            onChangeText={setText}
          />

          {/* Buttons Row */}
          <View className="flex-row justify-between mt-2">
            <View className="flex-1 mr-3">
              <CustomButton title="Cancel" onPress={onClose} style="bg-white border border-gray-300" textStyle="text-gray-700" />
            </View>

            <View className="flex-1">
              <CustomButton title="Save" onPress={() => onSave(text)} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditProfileModal;
