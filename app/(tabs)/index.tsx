import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";
import { getColors } from "react-native-image-colors";
import * as Speech from "expo-speech";

export default function TabOneScreen() {
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [permission, requestPermission] = useCameraPermissions();

  const [colors, setColors] = useState<any>(null);

  const [image, setImage] = useState(null);

  const [detectedColor, setDetectedColor] = useState<any>(null);

  const [cameraRef, setCameraRef] = useState<any>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const detectColor = async () => {
    if (!cameraRef) return;
    setIsDetecting(true);
    const photo = await cameraRef.takePictureAsync({ quality: 1 });
    console.log({ photo });

    // Use image processing libraries like OpenCV or image manipulation APIs from Expo to analyze the photo and detect the color
    // Here you would implement your color detection algorithm

    // For example, you can use Expo's ImageManipulator to resize the image for processing
    const resizedPhoto = await manipulateAsync(
      photo.uri,
      [{ resize: { width: 100, height: 100 } }],
      { compress: 0.5, format: "jpeg" as any }
    );
    console.log({ resizedPhoto });

    const colorDetails = await getColors(resizedPhoto.uri, {
      // fallback: "#bb0606",
      cache: true,
      key: photo.uri,
      quality: "highest",
      pixelSpacing: 10,
    });
    setImage(photo.uri);
    console.log({ colorDetails });
    setColors(colorDetails);

    setIsDetecting(false);
    speak();
  };
  console.log({ colors });

  const speak = (thingToSay = "This is mahee") => {
    Speech.speak(thingToSay, { language: "english" });
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        {image === null ? (
          <CameraView
            ref={(ref) => setCameraRef(ref)}
            style={styles.camera}
            facing={facing}
          >
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={toggleCameraFacing}
              >
                <Text style={styles.text}>Flip Camera</Text>
                <Button
                  title={isDetecting ? "Detecting..." : "Detect Color"}
                  onPress={detectColor}
                  disabled={isDetecting}
                />
              </TouchableOpacity>
            </View>
          </CameraView>
        ) : (
          <View
            style={{
              flex: 1,
            }}
          >
            <Image
              resizeMode="contain"
              style={{
                width: "100%",
                height: 400,
              }}
              source={{ uri: image }}
            />
            <View
              style={{
                marginVertical: 6,
              }}
            >
              <Button
                title={"Reset"}
                onPress={() => {
                  setImage(null);
                  setColors(null);
                }}
              />
            </View>
            {colors &&
              Object.entries(colors).map((itm, idx) => {
                if (itm[1] !== "android") {
                  return (
                    <View
                      style={{
                        backgroundColor: itm[1] as string,
                        paddingHorizontal: 3,
                        paddingVertical: 10,
                      }}
                      key={idx}
                    >
                      <Text
                        style={{
                          color: "pink",
                          textAlign: "center",
                        }}
                      >
                        {itm[0]}({String(itm[1]) as string})
                      </Text>
                    </View>
                  );
                }
              })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    height: 500,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
