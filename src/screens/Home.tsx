import { useState, useEffect } from "react";
import { Dimensions, Keyboard, TouchableOpacity } from "react-native";
import {
  Input,
  View,
  Button,
  Icon,
  useToast,
  FlatList,
  Text,
} from "native-base";
import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  LocationObject,
  watchPositionAsync,
  LocationAccuracy,
  Accuracy,
} from "expo-location";
import MapView, { Polyline, Marker } from "react-native-maps";
import { Entypo } from "@expo/vector-icons";

import { api, restDB } from "@services/api";

import { InputSearch } from "@components/InputSearch";

type PointData = {
  Bairro: string;
  Endereco: string;
  Latitude: number;
  Longitude: number;
  Numero: number;
  _id: string;
};

export function Home() {
  const [search, setSearch] = useState<string>("");
  const [line, setLine] = useState([]);
  const [points, setPoints] = useState<PointData[]>([]);
  const [marker, setMarker] = useState<PointData>();
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [mapRef, setMapRef] = useState<MapView | null>(null);
  const [origin, setOrigin] = useState({
    latitude: 2.8119873,
    longitude: -60.6765965,
    latitudeDelta: 0.0005,
    longitudeDelta: 0.0005,
  });

  const toast = useToast();

  const { width, height } = Dimensions.get("window");

  const ASPECT_RATIO = width / height;

  const LATITUDE_DELTA = 0.0922;

  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  async function userLocation() {
    const { granted } = await requestForegroundPermissionsAsync();

    if (granted) {
      const currentPosition = await getCurrentPositionAsync();
      setLocation(currentPosition);
      setOrigin({
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    } 
  }

  // async function searchData() {
  //   try {
  //     const response = await api.get("/line");
  //     const coord = response.data.map((item: any) =>
  //       item.route.map((line: any) => ({
  //         latitude: line[0],
  //         longitude: line[1],
  //       }))
  //     );
  //     const points = response.data.map((data: any) =>
  //       data.points.map((item: any) => item)
  //     );
  //     setLine(coord[0]);
  //     setPoints(points[0]);
  //     // const data = response.data;
  //     console.log(points[0]);
  //     // setPoints(response.data.data);
  //   } catch (error) {
  //     console.log(error);
  //     toast.show({
  //       title: "Falha na consulta",
  //       placement: "top",
  //       bgColor: "red.500",
  //     });
  //   }
  // }
  // async function searchBus() {
  //   try {
  //   const response = await restDB.get("/TODOS-OS-ABRIGOS");
  //   setPoints(response.data);
  //   console.log(response.data);
  //   } catch (error) {
  //     console.log(error);
  //     toast.show({
  //       title: "Falha na consulta",
  //       placement: "top",
  //       bgColor: "red.500",
  //     });
  //   }
  // }
  function selectMarker(v: any) {
    console.log(v);
    
    setMarker(v);
  }

  async function pointsData() {
    const data = `https://mapdata-8cfb.restdb.io/rest/TODOS-OS-ABRIGOS?q={"Bairro":"${search.toUpperCase()}"}`;
    Keyboard.dismiss();

    if (search.length >= 3) {
      try {
        const response = await restDB.get(data);
        setPoints(response.data);
      } catch (error) {
        console.log(error);
        toast.show({
          title: "Falha na consulta",
          placement: "top",
          bgColor: "red.500",
        });
      }
    }
    return 0;
  }

  useEffect(() => {
    userLocation();
  }, []);
  // useEffect(() => {
  //   watchPositionAsync(
  //     {
  //       accuracy: LocationAccuracy.Highest,
  //       timeInterval: 1000,
  //       distanceInterval: 1,
  //     },
  //     (response) => {
  //       console.log("Nova localização =>", response);
  //       setOrigin({
  //         latitude: response.coords.latitude,
  //         longitude: response.coords.longitude,
  //         latitudeDelta: LATITUDE_DELTA,
  //         longitudeDelta: LONGITUDE_DELTA,
  //       });
  //       console.log(origin);

  //     }
  //   );
  // }, []);

  return (
    <View alignItems="center">
      <View position="relative">
        {origin ? (
          <MapView
            style={{
              width: Dimensions.get("window").width,
              height: Dimensions.get("window").height,
            }}
            region={origin}
            minZoomLevel={13}
            rotateEnabled={false}
            toolbarEnabled={false}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            {/* <Polyline coordinates={line} strokeColor="#90D8A7" strokeWidth={4} /> */}

            {marker ? (
              <Marker
                coordinate={{
                  latitude: marker.Latitude,
                  longitude: marker.Longitude,
                }}
              />
            ) : (
              <></>
            )}
            {/* {points ? (
            points.map((marker: any, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: marker.Latitude,
                  longitude: marker.Longitude,
                }}
              />
            ))
          ) : (
            <></>
          )} */}
          </MapView>
        ) : (
          <></>
        )}
        <View w="100%" position="absolute">
          <View m={10}>
            <Input
              bg="white"
              py={5}
              borderWidth={0}
              fontWeight="200"
              shadow={3}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Qual é a sua linha?"
              placeholderTextColor="gray.200"
              rounded="md"
              _focus={{
                borderColor: "white",
                borderWidth: 1,
                bg: "white",
              }}
              InputRightElement={
                <Button
                  h="full"
                  bg="white"
                  _pressed={{ bg: "white" }}
                  onPress={pointsData}
                >
                  <Icon
                    as={Entypo}
                    name="magnifying-glass"
                    size="md"
                    color="green.500"
                  />
                </Button>
              }
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={pointsData}
              size="md"
            />
            {points.length ? (
              <View bg="white" p={2} shadow={3} rounded="md" mt={2}>
                <FlatList
                  h="20"
                  data={points} //dados
                  keyExtractor={(item) => item._id} // chave: valor
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => selectMarker(item)}>
                      <Text>{item.Endereco}</Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false} //nao exibe a barrinha
                />
              </View>
            ) : (
              <></>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
