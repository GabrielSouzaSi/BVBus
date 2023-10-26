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
  VStack,
  Modal,
  ScrollView,
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
import { Entypo } from "@expo/vector-icons";
import { styles } from "./styles";

import { api, lineBus, pointResult } from "@services/api";

import { InputSearch } from "@components/InputSearch";
import { Loading } from "@components/Loading";
import { MarkerBus } from "@components/BusLocation";

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

export function Home() {
  const mapRaf = useRef<MapView>(null);
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
  const [points, setPoints] = useState<PointData[]>([]);
  // tempo da requisição
  const [time, setTime] = useState<any>(0);

  const [lastPoint, setLastPoint] = useState(Number);

  // Ponto Selecionado
  const [pointSelected, setPointSelected] = useState<PointData>();

  // ID da linha selecionada
  const [lineIdSelected, setLineIdSelected] = useState(Number);

  // Lista de ônibus da linha
  const [bus, setBus] = useState([]);
  const [busListId, setBusListId] = useState<any>();

  const [statusRoute, setStatusRoute] = useState(false);

  // ID do ônibus atual selecionado
  const [beforebusId, setBeforeBusId] = useState(Number);

  // Ônibus selecionado pelo usuário
  const [busPosition, setBusPosition] = useState<LocationBus | null>(null);

  // Exibir as informações do ponto
  const [showDescPoint, setShowDescPoint] = useState(false);

  //Dados do tempo
  const [timePoint, setTimePoint] = useState(Object);

  const [location, setLocation] = useState<LocationObject | null>(null);
  const [nameLine, setNameLine] = useState<NameLine[] | null>([]);

  const mapRef = useRef<MapView>(null);

  //modal
  const [showModal, setShowModal] = useState(false);

  const [modalInfoRoute, setModalInfoRoute] = useState(false);
  const [modalInfoBus, setModalInfoBus] = useState(false);

  const [selectUserPoint, setSelectUserPoint] = useState(false);

  const toast = useToast();

  // Localização do usuário
  async function requestLocationPermission() {
    // pega o resultado da permissão fornecido pelo usuaáio
    const { granted } = await requestForegroundPermissionsAsync();

    // verifica se a permissão foi concedida
    if (granted) {
      //pega a localização do dispositivo
      const currentPosition = await getCurrentPositionAsync();

      setLocation(currentPosition);
      // console.log("Localização atual => ",currentPosition);
    }
  }

  // #1 Pesquisa linha
  async function pointBus() {
    Keyboard.dismiss();
    setIsLoading(true);
    clearState();
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
    setIsLoading(false);

    // Formata as coordenadas da linha
    let coord = await DataLinePoint[0][0].route.map((line: any) => ({
      latitude: line[0],
      longitude: line[1],
    }));
    
    setLine(coord); // Monta a linha no mapa
    
    setPoints(DataLinePoint[0][0].points); //Manta os dados dos abrigos da linha
    setNameLine([]); //fecha o resultado da pesquisa
    
    setSelectUserPoint(true); // Mostrar modal

  }

  // #4 Selecionar parada do onibus
  async function selectPoint(pointSelected: any) {
    // setIsLoading(true);
    
    setPointSelected(pointSelected);
  }

  async function reqPonitLine(req: string) {
    try {
      const response = await pointResult.get(req);

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
    clearState();
    setShowModal(false);
    setBeforeBusId(item.bus[0].vehicleId);
    setBusPosition({
      latitude: Number(item.bus[0].latitude),
      longitude: Number(item.bus[0].longitude),
    });

    setTimePoint({
      tempo: item.time,
      distancia: item.distance,
    });

    setStatusRoute(item.statusRoute);

    setShowDescPoint(true);

    if (item.newRoute.length == 2) {
      // setLinePoint1(item.newRoute[0]);
      // setLinePoint2(item.newRoute[1]);
      setModalInfoBus(true);
    } else {
      setLinePoint1(item.newRoute);
    }
  }

  async function positionBus(uri: any) {
    console.log(uri);
    try {
      const response = await pointResult.get(
        `/${lineIdSelected}/point/${pointSelected?.id}`
      );
      let result = response.data.map((item: any) => {
        return item.data.bus[0].vehicleId;
      });

      let r = result.filter((item: any) => item === beforebusId);
      console.log("Compare ", r.length);

      if (r.length) {
        try {
          const response = await pointResult.get(uri);

          setBusPosition({
            latitude: Number(response.data.data.bus[0].latitude),
            longitude: Number(response.data.data.bus[0].longitude),
          });

          setTimePoint({
            tempo: response.data.data.time,
            distancia: response.data.data.distance,
          });

          setStatusRoute(response.data.data.statusRoute);

          setShowDescPoint(true);

          if (response.data.data.newRoute.length == 2) {
            // setLinePoint1(response.data.data.newRoute[0]);
            // setLinePoint2(response.data.data.newRoute[1]);
            setBeforeBusId(0);
            clearState();
            setModalInfoBus(true)
          } else {
            setLinePoint1(response.data.data.newRoute);
          }
        } catch (error: any) {
          setBeforeBusId(0);
          const err = error.response.data.erro;
          toast.show({
            title: err,
            placement: "top",
            bgColor: "red.500",
          });
        }
      } else {
        clearState();
      }
    } catch (error: any) {
      setBeforeBusId(0);
      const err = error.response.data.erro;
      toast.show({
        title: err,
        placement: "top",
        bgColor: "red.500",
      });
    }
  }

  async function onMapLoaded() {
    if (points.length > 0) {
      console.log("OnloadMap!");
      mapRef.current?.fitToSuppliedMarkers(["first", "last"], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      });
    }
  }

  function clearState() {
    setShowDescPoint(false);
    
    setBeforeBusId(0);
    setBusPosition(null);
    setLinePoint1([]);
    setLinePoint2([]);
  }
  useEffect(() => {
    //chama a função para requisitar a permissão de localização do dispositivo
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (busPosition) {
      console.log(busPosition);
      mapRaf.current?.animateCamera({
        pitch: 0,
        center: busPosition,
      });
    }
  }, [busPosition]);

  useEffect(() => {
    if (points.length > 1) {
      console.log("OnloadMap!");
      let p = { latitude: points[0].lat, longitude: points[0].lgt };
      mapRaf.current?.animateCamera({
        pitch: 0,
        center: p,
      });
    }
  }, [points]);

  useEffect(() => {
    if (busListId) {
      console.log(busListId);
    }
  }, [busListId]);

  useEffect(() => {
    if (beforebusId) {
      clearTimeout(time);
      // setURL(`/${lineIdSelected}/point/${pointSelected?.id}/bus/${beforebusId}`);
      console.log("useEffect busId =>", beforebusId, time);
      let timereq = setInterval(() => {
        if (beforebusId == 0) {
          return;
        } else {
          positionBus(
            `${lineIdSelected}/point/${pointSelected?.id}/bus/${beforebusId}`
          );
        }
      }, 20000);
      setTime(timereq);
    }
    return () => clearTimeout(time);
  }, [beforebusId]);

  useEffect(() => {
    if (pointSelected) {
      console.log("useEffect pointId => ", pointSelected.id);

      reqPonitLine(`/${lineIdSelected}/point/${pointSelected.id}`);
    }
  }, [pointSelected]);
  useEffect(() => {
    if (statusRoute) {
      setModalInfoRoute(true);
    }
  }, [statusRoute]);

  // useEffect(() => {
  //   // Função para observar alteração na posição do usuário
  //   watchPositionAsync(
  //     {
  //       accuracy: LocationAccuracy.Highest,
  //       timeInterval: 1000,
  //       distanceInterval: 1,
  //     },
  //     (response) => {
  //       console.log("Nova Localização!", response.coords);

  //       setLocation(response);
  //       mapRaf.current?.animateCamera({
  //         pitch: 0,
  //         center: response.coords,
  //       });
  //     }
  //   );
  // }, []);

  return (
    <View flex={1}>
      {location && (
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={mapRaf}
          style={{ flex: 1, width: "100%" }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0922,
          }}
          minZoomLevel={13}
          rotateEnabled={false}
          showsUserLocation
          showsMyLocationButton={false}
          toolbarEnabled={false}
          onMapLoaded={onMapLoaded}
        >
          {busPosition && (
            <Marker
              image={ImageBus}
              title="Ônibus"
              coordinate={{
                latitude: busPosition.latitude,
                longitude: busPosition.longitude,
              }}
            />
          )}
          {linePoint1 && (
            <Polyline
              coordinates={linePoint1}
              strokeColor="#0d29a6"
              strokeWidth={8}
            />
          )}
          {linePoint2 && (
            <Polyline
              coordinates={linePoint2}
              strokeColor="#0d29a6"
              strokeWidth={8}
            />
          )}
          <Polyline coordinates={line} strokeColor="#0DA63E" strokeWidth={4} />
          {points ? (
            points.map((p, index) => {
              if (index == 0) {
                return (
                  <Marker
                    image={ImagePoint}
                    key={index}
                    coordinate={{
                      latitude: p.lat,
                      longitude: p.lgt,
                    }}
                    title={`Parada - N°${p.number}`}
                    onPress={() => selectPoint(p)}
                  />
                );
              } else if (index + 1 === points.length) {
                return (
                  <Marker
                    image={ImagePoint}
                    key={index}
                    coordinate={{
                      latitude: p.lat,
                      longitude: p.lgt,
                    }}
                    title={`Parada - N°${p.number}`}
                    onPress={() => selectPoint(p)}
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
                    title={`Parada - N°${p.number}`}
                    onPress={() => selectPoint(p)}
                  />
                );
              }
            })
          ) : (
            <></>
          )}
        </MapView>
      )}
      <View flex={1} w="100%" position="absolute">
        <View w="100%" position="relative">
          <View mx={20} my={10}>
            {/* Campo de pesquisa */}
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
            {/* Resultado da pesquisa */}
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
      </View>
      <View position="relative" alignItems="center" justifyItems="center">
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
                        {`${item.data.bus[0].plate}/Tempo de epera:${item.data.time}`}
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
      <Modal isOpen={modalInfoRoute} onClose={() => setModalInfoRoute(false)}>
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
                  source={ImageBus}
                  alt={"bus"}
                />

                <Text
                  mt={2}
                  mb={6}
                  color="gray.300"
                  fontSize="md"
                  fontWeight="400"
                >
                  Seu ônibus está próximo do ponto!
                </Text>
              </VStack>
            </ScrollView>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal isOpen={modalInfoBus} onClose={() => setModalInfoBus(false)}>
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
                  source={ImageBus}
                  alt={"bus"}
                />

                <Text
                  mt={2}
                  mb={6}
                  color="gray.300"
                  fontSize="md"
                  fontWeight="400"
                >
                  O ônibus já passou do ponto selecionado!
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
