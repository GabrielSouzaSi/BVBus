import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import {
  Input,
  View,
  Button,
  Icon,
  Image,
  useToast,
  FlatList,
  Text,
  HStack,
  VStack,
  Modal,
  ScrollView,
  Select,
  Box,
  CheckIcon,
  Center,
} from "native-base";
import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  LocationObject,
  watchPositionAsync,
  LocationAccuracy,
} from "expo-location";
import MapView, {
  PROVIDER_GOOGLE,
  Polyline,
  Marker,
  LatLng,
} from "react-native-maps";
import { Entypo, Ionicons } from "@expo/vector-icons";

import { api, lineBus, pointResult, lines } from "@services/api";

import { InputSearch } from "@components/InputSearch";
import { Loading } from "@components/Loading";
import { MarkerBus } from "@components/BusLocation";
import { MapPolylines } from "@components/MapPolyline";

import ImagePoint from "@assets/point/ponto.png";
import ImageBus from "@assets/bus/buss.png";
import Spinner from "react-native-loading-spinner-overlay/lib";

const { width, height } = Dimensions.get("window");

const ASPECT_RATIO = width / height;
const LATITUDE = 2.812508;
const LONGITUDE = -60.707372;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;

const markerIDs = ["Marker1", "Marker5"];
const timeout = 4000;
let animationTimeout: any;

export function Home() {
  const mapRaf = useRef<MapView>(null);

  const [makersData, setMarkersData] = useState<any>({
    a: {
      latitude: LATITUDE + SPACE,
      longitude: LONGITUDE + SPACE,
    },
    e: {
      latitude: LATITUDE - SPACE * 4,
      longitude: LONGITUDE - SPACE * 4,
    },
  });

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        ref={mapRaf}
        style={styles.map}
        initialRegion={{
          latitude: LATITUDE,
          longitude: LONGITUDE,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
      >
        <Marker identifier="Marker1" coordinate={makersData[0]} />
        <Marker identifier="Marker5" coordinate={makersData[1]} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
