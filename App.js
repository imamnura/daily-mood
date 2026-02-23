import { SafeAreaView, StyleSheet, StatusBar } from "react-native";
import HomeScreen from "./screens/HomeScreen";

export default function App() {
  return (
    // SafeAreaView memastikan konten tidak tertutup notch atau status bar
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"dark-content"} backgroundColor={"#F8F9FA"} />
      <HomeScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
});
