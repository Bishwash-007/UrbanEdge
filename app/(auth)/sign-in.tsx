import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        // See https://clerk.com/docs/custom-flows/error-handling for more info on error handling
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    }
  }, [isLoaded, form]);
  return (
    <ScrollView className="flex-1 bg-white ">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]"/>
          <Text className="text-2xl text-black font-semibold absolute bottom-5 left-5">Welcome </Text>
        </View>
        <View className="p-4">
          <InputField
          label='Email'
          placeholder = 'Enter your Email'
          labelStyle='text-lg font-semibold mx-2'
          icon={icons.email}
          value={form.email}
          onChangeText={(value) => setForm({...form, email: value})}
          />
          <InputField
          label='Password'
          placeholder = 'Enter your Password'
          labelStyle='text-lg font-semibold mx-2'
          icon={icons.lock}
          value={form.password}
          onChangeText={(value) => setForm({...form, password: value})}
          secureTextEntry={true}
          />
          <CustomButton
          title="Sign In"
          onPress={onSignInPress}
          className="mt-6"
          />

          <OAuth/>

          <Link href='/sign-up' className="text-general-200 mt-10 text-center">
          <Text>Don't have an account? </Text>
          <Text className="text-primary-500 ">Sign Up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
