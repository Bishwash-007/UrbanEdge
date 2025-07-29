import { View, Image } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import { icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";

const GoogleTextInput = ({
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  let googlePlacesApiKey = process.env.EXPO_PUBLIC_PLACES_API_KEY;
  console.log(googlePlacesApiKey);
  return (
    <View className={`relative z-50 ${containerStyle} px-4`}>
      <GooglePlacesAutocomplete
        fetchDetails={true}
        placeholder={initialLocation ?? "Where do you want to go?"}
        debounce={200}
        styles={{
          textInputContainer: {
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
          },
          textInput: {
            backgroundColor: textInputBackgroundColor || "white",
            fontSize: 16,
            fontWeight: "600",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 50,
            width: "100%",
          },
          listView: {
            backgroundColor: textInputBackgroundColor || "white",
            borderRadius: 10,
            elevation: 3,
            shadowColor: "#d4d4d4",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            position: "absolute",
            top: 50, // Prevents overlap with input
            left: 0,
            right: 0,
            zIndex: 99,
          },
        }}
        onPress={(data, details = null) => {
          if (details) {
            handlePress({
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              address: data.description,
            });
          }
        }}
        query={{
          key: googlePlacesApiKey,
          language: "en",
        }}
        renderLeftButton={() => (
          <View className="pl-4 pr-2 justify-center items-center">
            <Image
              source={icons.search}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </View>
        )}
        textInputProps={{
          placeholderTextColor: "gray",
        }}
      />
    </View>
  );
};

export default GoogleTextInput;
