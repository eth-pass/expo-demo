import { FontAwesome } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Linking, Platform, ScrollView, StyleSheet } from "react-native";
import { Text, View } from "../components/Themed";
import { API_HOST, API_KEY, API_SCOPE } from "../constants/Api";
import * as Haptics from "expo-haptics";
import { chains } from "eth-chains";

export default function ModalScreen() {
  const route = useRoute();
  const params = route.params;
  const { data } = params;
  const [payload, setPayload] = useState({});
  const [pending, setPending] = useState(true);
  const {
    valid,
    lastScannedAt,
    lastSigned,
    message,
    contractAddress,
    tokenId,
    chainId,
    passOwner,
  } = payload;

  useEffect(() => {
    const checkBarcode = async () => {
      try {
        const response = await fetch(
          `${API_HOST}/api/v0/pass/barcode?data=${data}`,
          {
            method: "GET",
            headers: new Headers({
              "content-type": "application/json",
              "x-api-key": API_KEY,
              "x-api-scope": API_SCOPE,
            }),
          }
        );
        if (response.status === 200) {
          const json = await response.json();
          console.log("### json", json);
          setPayload(json);
          setPending(false);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          alert("Bad Request. Status code: " + response.status);
        }
      } catch (err) {
        throw err;
      } finally {
        setPending(false);
      }
    };
    checkBarcode();
  }, [data]);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {pending ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <Text style={styles.title}>
            <FontAwesome
              size={30}
              name={valid ? "check" : "close"}
              color={valid ? "green" : "red"}
            />
            {valid ? "Valid" : "Invalid"}
          </Text>
          <View style={styles.separator} />
          <Text style={styles.title}>Pass Owner:</Text>
          <Text>{passOwner}</Text>
          <View style={styles.separator} />

          <Text style={styles.title}>Contract Address:</Text>
          <Text>{contractAddress}</Text>
          <View style={styles.separator} />

          <Text style={styles.title}>Token ID:</Text>
          <Text>{tokenId}</Text>
          <View style={styles.separator} />

          <Text style={styles.title}>Network:</Text>
          <Text>{chains.getById(chainId)?.name}</Text>
          <View style={styles.separator} />

          <Text style={styles.title}>View on Explorer:</Text>
          <Text
            style={{ color: "blue" }}
            onPress={() =>
              Linking.openURL(
                `${
                  chains.getById(chainId)?.explorers[0].url
                }/token/${contractAddress}?a=${tokenId}`
              )
            }
          >
            {`${
              chains.getById(chainId)?.explorers[0].url
            }/token/${contractAddress}?a=${tokenId}`}
          </Text>
          <View style={styles.separator} />

          <Text style={styles.title}>Last Scanned:</Text>
          <Text>
            {new Date(lastScannedAt).toLocaleDateString()}{" "}
            {new Date(lastScannedAt).toLocaleTimeString()}
          </Text>
          <Text></Text>
          <View style={styles.separator} />

          <Text style={styles.title}>Last Signed:</Text>
          <Text>
            {new Date(lastSigned).toLocaleDateString()}{" "}
            {new Date(lastSigned).toLocaleTimeString()}
          </Text>
          <View style={styles.separator} />

          <Text style={styles.title}>Decoded Message:</Text>
          <Text>{message}</Text>
        </>
      )}
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 10,
    height: 1,
    width: "100%",
  },
});
