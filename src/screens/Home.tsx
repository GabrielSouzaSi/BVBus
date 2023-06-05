import { useState } from "react";
import { Dimensions } from "react-native";
import {
  VStack,
  Center,
  Text,
  Input,
  Container,
  View,
  Button,
} from "native-base";
import MapView, { Polyline } from "react-native-maps";
import { InputSearch } from "@components/InputSearch";

export function Home() {
  const { width, height } = Dimensions.get("window");

  const ASPECT_RATIO = width / height;

  const LATITUDE_DELTA = 0.0922;

  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  const REGION = {
    latitude: 2.8119873,
    longitude: -60.6765965,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  };

  return (
    <View alignItems="center">
      <View position="relative">
        <MapView
          style={{
            width: Dimensions.get("window").width,
            height: Dimensions.get("window").height,
          }}
          region={REGION}
        >
          {/* <Polyline
          coordinates={[
            { latitude: 2.8119873, longitude: -60.6765965 },
            { latitude: 2.8199326, longitude: -60.6744063 },
            { latitude: 2.8199326, longitude: -60.6744063 },
            { latitude: 2.8185449, longitude: -60.6753773 },
          ]}
          strokeColor="#90D8A7"
          strokeWidth={4}
        /> */}
        </MapView>
        <View w="100%" position="absolute">
          <View m={10}>
          <InputSearch />
          </View>
        </View>
      </View>
    </View>
  );
}
