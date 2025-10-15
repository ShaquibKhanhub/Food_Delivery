import { View, Text,Button } from 'react-native'
import React from 'react'
import seed from "@/lib/seed";

import {SafeAreaView} from 'react-native-safe-area-context'

const Cart = () => {
  return (
    <SafeAreaView>
      <Text>Cart</Text>
 {/* <Button
  title="Seed Database"
  onPress={async () => {
    try {
      await seed();
      Alert.alert("✅ Success", "Seeding complete!");
    } catch (e) {
      console.error(e);
     
    }
  }}
/> */}



    </SafeAreaView>
  )
}

export default Cart