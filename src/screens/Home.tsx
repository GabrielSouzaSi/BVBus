import { useRef, useState, useEffect } from "react";
import { Dimensions, Keyboard, TouchableOpacity } from "react-native";
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
  Center,
  VStack,
  Box,
  Modal,
  ScrollView,
} from "native-base";
import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  LocationObject,
  watchPositionAsync,
  LocationAccuracy,
  Accuracy,
} from "expo-location";
import MapView, {
  Polyline,
  Marker,
  LatLng,
  AnimatedRegion,
  MapViewProps,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { Entypo } from "@expo/vector-icons";

import { api, lineBus, pointResult } from "@services/api";

import { InputSearch } from "@components/InputSearch";
import { Loading } from "@components/Loading";

import ImagePoint from "@assets/point/ponto.png";
import ImageBus from "@assets/bus/buss.png";
import Spinner from "react-native-loading-spinner-overlay/lib";

type PointData = {
  id: number;
  number: number;
  address: string;
  district: string;
  lat: number;
  lgt: number;
  "air-conditioning": boolean;
};

type MarkerData = {
  latitude: number;
  longitude: number;
};

type LocationBus = {
  latitude: number;
  longitude: number;
};

type NameLine = {
  id: number;
  number: number;
  description: string;
  sense: string;
};

type Props = MapViewProps & {
  coordinates: LatLng[];
};

export function Home() {
  // loading
  const [isLoading, setIsLoading] = useState(false);

  //Dados da pesquisa
  const [search, setSearch] = useState<string>("");

  // Array de posição para desenhar a linha
  const [line, setLine] = useState<MarkerData[]>([]);

  // Array de posição para desenhar a linha da parada selecionada
  const [linePoint1, setLinePoint1] = useState<MarkerData[]>([]);

  // Array de posição para desenhar a linha da parada selecionada
  const [linePoint2, setLinePoint2] = useState<MarkerData[]>([]);

  // Pontos
  const [points, setPoints] = useState([]);

  const [lastPoint, setLastPoint] = useState(Number);

  // Ponto Selecionado
  const [pointSelected, setPointSelected] = useState<PointData>();

  // ID da linha selecionada
  const [lineIdSelected, setLineIdSelected] = useState(Number);

  // Lista de ônibus da linha
  const [bus, setBus] = useState([]);

  // ID do ônibus atual
  const [busId, setBusId] = useState(Number);

  // Ônibus selecionado pelo usuário
  const [busPosition, setBusPosition] = useState<LocationBus | null>(null);

  // Exibir as informações do ponto
  const [showDescPoint, setShowDescPoint] = useState(false);

  //Dados do tempo
  const [timePoint, setTimePoint] = useState(Object);

  const [location, setLocation] = useState<LocationObject | null>(null);
  const [nameLine, setNameLine] = useState<NameLine[] | null>([]);
  const [origin, setOrigin] = useState({
    latitude: 2.8119873,
    longitude: -60.6765965,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0922,
  });

  const mapRef = useRef<MapView>(null);

  //modal
  const [showModal, setShowModal] = useState(false);

  const [selectUserPoint, setSelectUserPoint] = useState(false);

  const toast = useToast();

  const { width, height } = Dimensions.get("window");

  const ASPECT_RATIO = width / height;

  const LATITUDE_DELTA = 0.0922;

  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  // Localização do usuário
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

  // #1 Pesquisa linha
  async function pointBus() {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      const response = await lineBus.get(`/search2/?filter=${search}`);

      //monta um objeto - optimizar
      const info = await response.data.data.map((item: NameLine) => ({
        description: item.description,
        sense: item.sense,
        number: item.number,
        id: item.id,
      }));

      //manda o objeto para o componente FlatList
      setNameLine(info);
    } catch (error: any) {
      setIsLoading(false);
      const err = error.response.data.erro;
      toast.show({
        title: err,
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // #2 selecionar a linha com base na pesquisa do usuário
  async function LineSearch(lineSelectedUser: NameLine) {
    setIsLoading(true);
    setLineIdSelected(lineSelectedUser.id);
    // console.log(lineSelectedUser.number + " - " + lineSelectedUser.description + " - " + lineSelectedUser.sense);

    try {
      const response = await lineBus.get(`/search/${lineSelectedUser.id}`);

      lineRouteAndPoint(response.data.data);

      // setIdBus(response.data.data[1][0].vehicleId);
      // let busReq = response.data.data[1].map((item: any) => {
      //   return [item.vehicleId];
      // });

      // console.log(encodeURIComponent(JSON.stringify(busReq)));
    } catch (error: any) {
      setIsLoading(false);
      const err = error.response.data.erro;
      toast.show({
        title: err,
        placement: "top",
        bgColor: "red.500",
      });
    }
  }

  // #3 Função para preparar a rota da linha com os abrigos
  async function lineRouteAndPoint(DataLinePoint: any) {
    // console.log(DataLinePoint.data);

    // Formata as coordenadas da linha
    let coord = await DataLinePoint[0][0].route.map((line: any) => ({
      latitude: line[0],
      longitude: line[1],
    }));

    setLine(coord); // Monta a linha no mapa

    setPoints(DataLinePoint[0][0].points); //Manta os dados dos abrigos da linha

    setIsLoading(false);

    setLastPoint(DataLinePoint[0][0].points.length - 1);

    // setSelectUserPoint(true); // Mostrar modal

    setNameLine([]); //fecha o resultado da pesquisa
  }

  // #4 Selecionar parada do onibus
  async function selectPoint(pointSelected: any) {
    setIsLoading(true);
    setPointSelected(pointSelected);

    try {
      const response = await pointResult.get(
        `/${lineIdSelected}/point/${pointSelected?.id}`
      );

      setBus(response.data);
      setShowModal(true);
    } catch (error: any) {
      console.log(error.response.data);
      const err = error.response.data.erro;
      toast.show({
        title: err,
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // #5 ônibus selecionado
  function busSelectedUser(item: any) {
    setShowModal(false);
    setIsLoading(true);

    const uri = `/${lineIdSelected}/point/${pointSelected?.id}/bus/${item[4][0].vehicleId}`;
    positionBus(uri);
  }

  async function positionBus(uri: any) {
    try {
      const response = await pointResult.get(`${uri}`);
      setBusId(response.data.data[4][0].vehicleId);
      setTimePoint({
        tempo: response.data.data[0],
        distancia: response.data.data[1],
      });
      setShowDescPoint(true);

      if (response.data.data[3].length == 2) {
        setLinePoint1(response.data.data[3][0]);
        setLinePoint2(response.data.data[3][1]);
      } else {
        setLinePoint1(response.data.data[3]);
      }
      setBusPosition({
        latitude: Number(response.data.data[4][0].latitude),
        longitude: Number(response.data.data[4][0].longitude),
      });
      setIsLoading(false);
      
    } catch (error: any) {
      const err = error.response.data.erro;
      toast.show({
        title: err,
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function centerMapView() {
    if (points.length > 1) {
      console.log("deu certo");

      mapRef.current?.fitToSuppliedMarkers(["firstPoint", "lastPoint"], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      });
    }
  }

  function getTempo() {
    const agora = new Date();
    const hora = agora.getHours();
    const minutos = agora.getMinutes();
    return `${hora}:${minutos}:00`;
  }

  useEffect(() => {
    console.log(busPosition);
    if (busId) {
      setTimeout(() => {
        positionBus(
          `/${lineIdSelected}/point/${pointSelected?.id}/bus/${busId}`
        );
      }, 10000);
    } else {
      console.log("false");
    }
  }, [busPosition]);

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
            provider={PROVIDER_GOOGLE}
            ref={mapRef}
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
            <Polyline
              coordinates={line}
              strokeColor="#0DA63E"
              strokeWidth={4}
            />
            {points ? (
              points.map((p: any, index) => {
                if (index == 0) {
                  return (
                    <Marker
                      identifier="firstPoint"
                      image={ImagePoint}
                      key={index}
                      coordinate={{
                        latitude: p.lat,
                        longitude: p.lgt,
                      }}
                      onPress={() => {
                        selectPoint(p);
                      }}
                    />
                  );
                } else if (index == lastPoint) {
                  return (
                    <Marker
                      identifier="lastPoint"
                      image={ImagePoint}
                      key={index}
                      coordinate={{
                        latitude: p.lat,
                        longitude: p.lgt,
                      }}
                      onPress={() => {
                        selectPoint(p);
                      }}
                    />
                  );
                } else {
                  return (
                    <Marker
                      image={ImagePoint}
                      key={index}
                      coordinate={{
                        latitude: p.lat,
                        longitude: p.lgt,
                      }}
                      onPress={() => {
                        selectPoint(p);
                      }}
                    />
                  );
                }
              })
            ) : (
              <></>
            )}
            {linePoint1 ? (
              <Polyline
                coordinates={linePoint1}
                strokeColor="#0d29a6"
                strokeWidth={8}
              />
            ) : (
              <></>
            )}
            {linePoint2 ? (
              <Polyline
                coordinates={linePoint2}
                strokeColor="#0d29a6"
                strokeWidth={8}
              />
            ) : (
              <></>
            )}
            {busPosition ? (
              <Marker
                image={ImageBus}
                coordinate={{
                  latitude: busPosition.latitude,
                  longitude: busPosition.longitude,
                }}
              />
            ) : (
              <></>
            )}
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
                  onPress={() => pointBus()}
                  _pressed={{ bg: "white" }}
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
              onSubmitEditing={pointBus}
              size="md"
            />
            {nameLine?.length ? (
              <View bg="white" p={2} shadow={3} rounded="md" mt={2}>
                <FlatList
                  h="20"
                  data={nameLine} //dados
                  keyExtractor={(item: any) => item.id} // chave: valor
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => LineSearch(item)}>
                      <Text
                        mt={2}
                        mb={2}
                        color="gray.300"
                        fontSize="md"
                        fontWeight="300"
                      >
                        {item.number} - {item.description} - {item.sense}
                      </Text>
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
        <View flex={1} alignItems="center" justifyItems="center">
          {showDescPoint ? (
            <View
              position="absolute"
              w="80%"
              m={10}
              bottom={20}
              shadow={3}
              rounded="md"
              bg="green.500"
            >
              <View p={3}>
                <HStack>
                  <VStack flex={1}>
                    <Text
                      fontSize="sm"
                      color="white"
                      fontFamily="medium"
                      fontWeight="200"
                    >
                      Ponto de ônibus N°{pointSelected?.number}
                    </Text>
                  </VStack>
                  <TouchableOpacity onPress={() => setShowDescPoint(false)}>
                    <Icon as={Entypo} name="cross" size={6} color="white" />
                  </TouchableOpacity>
                </HStack>
                <HStack mt={2}>
                  <VStack flex={1}>
                    <Text
                      fontSize="md"
                      color="white"
                      fontFamily="bold"
                      fontWeight="300"
                    >
                      {pointSelected?.address}
                    </Text>
                  </VStack>
                </HStack>
              </View>
              {timePoint ? (
                <View bg="gray.200" rounded="md" m={2} p={1}>
                  <HStack mt={2}>
                    <VStack flex={1}>
                      <Text
                        fontSize="sm"
                        color="white"
                        fontFamily="medium"
                        fontWeight="200"
                      >
                        Distância
                      </Text>
                    </VStack>
                    <Text
                      fontSize="sm"
                      color="white"
                      fontFamily="medium"
                      fontWeight="200"
                    >
                      {timePoint.distancia}
                    </Text>
                  </HStack>
                  <HStack mt={2}>
                    <VStack flex={1}>
                      <Text
                        fontSize="sm"
                        color="white"
                        fontFamily="medium"
                        fontWeight="200"
                      >
                        Tempo de espera
                      </Text>
                    </VStack>
                    <Text
                      fontSize="sm"
                      color="white"
                      fontFamily="medium"
                      fontWeight="200"
                    >
                      {timePoint.tempo}
                    </Text>
                  </HStack>
                </View>
              ) : (
                <></>
              )}
            </View>
          ) : (
            <></>
          )}
        </View>
      </View>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Veículos Disponíveis!</Modal.Header>
          <Modal.Body>
            <ScrollView>
              {bus ? (
                bus.map((item: any, index) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        busSelectedUser(item.data);
                      }}
                      key={index}
                    >
                      <Text>
                        {item.data[4][0].plate}/Tempo de epera: {item.data[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text>Ônibus não encontrado no horário atual!</Text>
              )}
            </ScrollView>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal isOpen={selectUserPoint} onClose={() => setSelectUserPoint(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Aviso!</Modal.Header>
          <Modal.Body>
            <ScrollView>
              <VStack
                justifyContent="center"
                alignItems="center"
                safeAreaTop // my={6}
                mb={1}
              >
                <Image
                  size="xs"
                  resizeMode="cover"
                  source={ImagePoint}
                  alt={"Ponto de ônibus"}
                />

                <Text
                  mt={2}
                  mb={6}
                  color="gray.300"
                  fontSize="md"
                  fontWeight="400"
                >
                  Selecione um Ponto de ônibus!
                </Text>
              </VStack>
            </ScrollView>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Spinner
        //Valor booleano para tornar spinner visivel
        visible={isLoading}
        color="#0DA63E"
      />
    </View>
  );
}
