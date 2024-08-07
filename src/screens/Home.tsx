import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  Keyboard,
  TouchableOpacity
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
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

type ListLine = {
  id: number;
  linha: string;
};

const { width, height } = Dimensions.get("window");

const ASPECT_RATIO = width / height;
const LATITUDE = 2.812508;
const LONGITUDE = -60.707372;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;

const markerIDs = ["Marker0", "Marker1"];
const timeout = 4000;
let animationTimeout: any;

export function Home() {

  const mapRaf = useRef<MapView>(null);

  const isFocused = useIsFocused();

  const [keyboardStatus, setKeyboardStatus] = useState(false);
  // loading
  const [isLoading, setIsLoading] = useState(false);

  //Dados da pesquisa
  const [search, setSearch] = useState<string>("");

  // Array de posição para desenhar a linha
  const [line, setLine] = useState<MarkerData[]>([]);

  // Array de posição para desenhar a linha da parada selecionada
  const [linePoint1, setLinePoint1] = useState<MarkerData[]>([]);

  // Pontos
  const [points, setPoints] = useState<PointData[]>([]);
  // tempo da requisição
  const [time, setTime] = useState<any>(0);

  // Ponto Selecionado
  const [pointSelected, setPointSelected] = useState<PointData | null >(null);

  // ID da linha selecionada
  const [lineIdSelected, setLineIdSelected] = useState(Number);

  // Lista de ônibus da linha
  const [bus, setBus] = useState([]);

  const [statusRoute, setStatusRoute] = useState(false);

  // ID do ônibus atual selecionado
  const [beforebusId, setBeforeBusId] = useState(Number);

  // Ônibus selecionado pelo usuário
  const [busPosition, setBusPosition] = useState<LocationBus | null>(null);

  // Exibir as informações do ponto
  const [showDescPoint, setShowDescPoint] = useState(false);

  //Dados do tempo
  const [timePoint, setTimePoint] = useState(Object);

  const [location, setLocation] = useState<LatLng>({
    latitude: 2.812508,
    longitude: -60.707372,
  });
  const [locationUser, setLocationUser] = useState<LocationObject | null>(null);
  const [nameLine, setNameLine] = useState<ListLine[]>([]);
  const [selecTextLine, setSelecTextLine] = useState<ListLine[]>([]);

  const mapRef = useRef<MapView>(null);

  //modal

  const [showListLine, setShowListLine] = useState(false);
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
      setLocation(currentPosition.coords);
      userPositionMap();
    }
  }
  // #1 Pesquisa linha
  async function pointBus() {
    // Keyboard.dismiss();

    clearState();
    try {
      const response = await lines.get("");

      //manda o objeto para o componente FlatList
      setNameLine(response.data);
      setSelecTextLine(response.data);
    } catch (error: any) {
      errorMessage(
        `Erro ao pesquisar lina, rota => /search2/?filter=${search}`
      );
      const err = error.response.data.erro;
      toast.show({
        title: err,
        placement: "top",
        bgColor: "red.500",
      });
    }
  }
  // filtra a pesquisa do usuário
  function filterLine(text: string) {
    if (text) {
      let filteredLine = nameLine?.filter((line: ListLine) =>
        line.linha.includes(text.toLocaleUpperCase())
      );
      if (filteredLine.length == 0) {
        console.log("entrou");

        setSelecTextLine([{ id: 1000, linha: "Linha não encontrada!" }]);
        return;
      }

      setSelecTextLine(filteredLine); // valor filtrado
    } else {
      setSelecTextLine(nameLine); // Valor original
    }
  }

  // #2 seleciona a linha com base na pesquisa do usuário
  async function LineSearch(lineSelectedUser: number) {
    setLine([]);
    setPoints([]);
    clearState();
    setIsLoading(true);
    setLineIdSelected(lineSelectedUser);
    // console.log(lineSelectedUser.number + " - " + lineSelectedUser.description + " - " + lineSelectedUser.sense);
    try {
      const response = await lineBus.get(`/${lineSelectedUser}`);
      lineRouteAndPoint(response.data);
    } catch (error: any) {
      const err = error.response.data.erro;
      console.log(err);
    }
  }

  // #3 Função para preparar a rota da linha com os abrigos
  async function lineRouteAndPoint(DataLinePoint: any) {
    // console.log(DataLinrePoint.data);
    setIsLoading(false);

    // Formata as coordenadas da linha
    let coord = await DataLinePoint.route.map((line: any) => ({
      latitude: line[0],
      longitude: line[1],
    }));

    setLine(coord); // Monta a linha no mapa

    setPoints(DataLinePoint.points); //Manta os dados dos abrigos da linha
    setShowListLine(false); //fecha o resultado da pesquisa
  }

  // #4 Selecionar parada do onibus
  async function selectPoint(p: any) {
    setIsLoading(true);
    if (pointSelected?.id) {
      clearState();
      setPointSelected(p);
      console.log("Selecionou outro ponto!");
    } else {
      console.log("Primeiro ponto selecionado!");
      setPointSelected(p);
    }
  }
  async function listBus() {
    console.log(
      `https://appbus.conexo.solutions/api/line/${lineIdSelected}/point/${pointSelected?.id}`
    );
    try {
      const response = await pointResult.get(
        `/${lineIdSelected}/point/${pointSelected?.id}`
      );
      console.log(response.data);
      setBus(response.data);
    } catch (error: any) {
      errorMessage(
        `Erro ao selcionar o ponto, rota => https://appbus.conexo.solutions/api/line/${lineIdSelected}/point/${pointSelected?.id} => ${error.response.data.erro}`
      );
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

    positionBus(lineIdSelected, pointSelected?.id, item.bus[0].vehicleId);
  }
  // Função para obter dados dos onibus
  async function positionBus(idLine: any, idPoint: any, idBus: any) {
    console.log(
      `https://appbus.conexo.solutions/api/line/${idLine}/point/${idPoint}`
    );
    try {
      const response = await pointResult.get(`/${idLine}/point/${idPoint}`);
      let result = response.data.map((item: any) => {
        return item.data.bus[0].vehicleId;
      });

      let r = result.filter((item: any) => item === idBus);
      // console.log("Compare ", r.length);

      if (r.length) {
        console.log(
          `https://appbus.conexo.solutions/api/line/${idLine}/point/${idPoint}/bus/${idBus}`
        );
        try {
          const response = await pointResult.get(
            `/${idLine}/point/${idPoint}/bus/${idBus}`
          );

          if (response.data.data.newRoute.length == 2) {
            // setLinePoint1(response.data.data.newRoute[0]);
            // setLinePoint2(response.data.data.newRoute[1]);
            console.log("entrou");
            
            setModalInfoBus(true);
            clearState();
          } else {
            setBusPosition({
              latitude: Number(response.data.data.bus[0].latitude),
              longitude: Number(response.data.data.bus[0].longitude),
            });

            setTimePoint({
              tempo: response.data.data.time,
              distancia: response.data.data.distance,
            });

            setStatusRoute(response.data.data.statusRoute);

            setLinePoint1(response.data.data.newRoute);
            setShowDescPoint(true);
            setBeforeBusId(idBus);
          }
        } catch (error: any) {
          setBeforeBusId(0);
          errorMessage(
            `Erro ao consultar os dados do onibus selecionado, rota => /${idLine}/point/${idPoint}/bus/${idBus}`
          );
          const err = error.response.data.erro;
          toast.show({
            title: err,
            placement: "top",
            bgColor: "red.500",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        clearState();
      }
    } catch (error: any) {
      setBeforeBusId(0);
      errorMessage(
        `Erro ao consultar o ponto selecionado, rota => /${idLine}/point/${idPoint}`
      );
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
  async function userPositionMap() {
    const currentPosition = await getCurrentPositionAsync();

    mapRaf.current?.animateCamera({
      pitch: 0,
      zoom: 14,
      center: {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      },
    });
  }

  function clearState() {
    setShowDescPoint(false); // para de exibir as informações do ponto
    setBeforeBusId(0); // define em zero para parar as requisições a cada 10 segundos
    setBusPosition(null); // anula a posição do onibus
    setLinePoint1([]); // define como vazio para não mostrar a rota no mapa 
  }

  function errorMessage(message: string) {
    console.log(message);
  }
  useEffect(() => {
    if (isFocused) {
      userPositionMap();
      
    } 
  },[isFocused])
  useEffect(() => {
    if (linePoint1) {
      mapRaf.current?.fitToCoordinates(linePoint1, { animated: true, edgePadding: { top: 50, right: 50, bottom: 50, left: 50 } });
      
    } 
  },[linePoint1])
  // Monitora a posição do usuário
  useEffect(() => {
    // Função para observar alteração na posição do usuário
    watchPositionAsync(
      {
        accuracy: LocationAccuracy.Highest,
        timeInterval: 3000,
        distanceInterval: 3,
      },
      (response) => {
        setLocation(response.coords);
      }
    );
  }, []);
  // Requisita a permissão de localização ao entror no app e prepara a lista das linhas
  useEffect(() => {
    requestLocationPermission();
    pointBus();
  }, []);
  // Ajustar rota da tela quando a linha for selecionada
  useEffect(() => {
    if (points.length > 0) {
      setTimeout(() => {
        mapRaf.current?.fitToCoordinates(line, { animated: true });
      }, 2000);
      setTimeout(() => {
        setSelectUserPoint(true); // Mostrar modal
      }, 4000);
    }
  }, [points]);
  // Verifica teclado quando ativado/desativado
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardStatus(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardStatus(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
  useEffect(() => {
    console.log(pointSelected);
    if (pointSelected?.id) {
      console.log(pointSelected);
      listBus();
    } else {
      setIsLoading(false);
    }
  }, [pointSelected]);
  // Exibe o modal com a listagem dos onibus
  useEffect(() => {
    //chama a função para requisitar a permissão de localização do dispositivo
    if (bus.length > 0) {
      setShowModal(true);
    }
  }, [bus]);
  // Requisita a rota e posição do onibus a cada 10 segundos
  useEffect(() => {
    clearTimeout(time);
    if (beforebusId) {
      // setURL(`/${lineIdSelected}/point/${pointSelected?.id}/bus/${beforebusId}`);
      // console.log("useEffect busId =>", beforebusId, time);
      let timereq = setInterval(() => {
        if (beforebusId == 0) {
          console.log("busId => ", beforebusId);
          return;
        } else {
          positionBus(lineIdSelected, pointSelected?.id, beforebusId);
        }
      }, 10000);
      setTime(timereq);
    }
    return () => clearTimeout(time);
  }, [beforebusId]);

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
        minZoomLevel={12}
        rotateEnabled={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        <Marker
          title="Sua Posição"
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
        />
        {line && (
          <MapPolylines
            coordinates={line}
            colorLine="#0DA63E"
            strokeWidth={4}
          />
        )}
        {points.length > 0 &&
          points.map((p, index) => {
            if (index == 0) {
              return (
                <Marker
                  identifier={"Marker0"}
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
            } else if (index + 1 == points.length) {
              return (
                <Marker
                  identifier={"Marker1"}
                  image={ImagePoint}
                  key={index}
                  coordinate={{
                    latitude: p.lat,
                    longitude: p.lgt,
                  }}
                  title={`Parada - N°${p.number}`}
                  onPress={() => selectPoint(p)}
                ></Marker>
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
          })}
        {busPosition ? (
          <Marker
            image={ImageBus}
            title="Ônibus"
            coordinate={{
              latitude: busPosition.latitude,
              longitude: busPosition.longitude,
            }}
          />
        ) : (
          <></>
        )}
        {linePoint1 ? (
          <MapPolylines
            coordinates={linePoint1}
            colorLine="#0d29a6"
            strokeWidth={4}
          />
        ) : (
          <></>
        )}
      </MapView>
      <View w="100%" top={1} position="absolute">
        <View flex={1} ml={10} mt={10} flexDirection="row">
          <View w="80%">
            {/* Campo de pesquisa */}
            <Input
              bg="white"
              py={2}
              h={12}
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
                <Icon
                  as={Entypo}
                  name="magnifying-glass"
                  size="md"
                  color="green.500"
                  mr={2}
                />
              }
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                filterLine(text);
              }}
              onPressIn={() => setShowListLine(true)}
              size={["xs", "sm", "md"]}
              style={{ fontWeight: "300" }}
            />
            {/* Resultado da pesquisa */}
            {showListLine ? (
              <View bg="white" p={2} shadow={3} rounded="md" mt={2}>
                <FlatList
                  maxHeight={250}
                  data={selecTextLine} //dados
                  keyExtractor={(item: any) => item.id} // chave: valor
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => LineSearch(item.id)}>
                      <Text
                        mt={2}
                        mb={2}
                        color="gray.300"
                        fontSize={["xs", "sm", "md"]}
                        fontWeight="300"
                      >
                        {item.linha}
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
          <View w="20%" h={12} alignItems="center">
            <Button
              w={12}
              h={12}
              bg="white"
              borderRadius="full"
              shadow={1}
              _pressed={{ bg: "gray.100" }}
              onPress={userPositionMap}
            >
              <Icon as={Entypo} name="location" size="md" color="green.500" />
            </Button>
          </View>
        </View>
      </View>
      {showDescPoint && !keyboardStatus ? (
        <View
          position="absolute"
          w="80%"
          m={10}
          bottom={0}
          shadow={3}
          rounded="md"
          bg="muted.100"
        >
          <View p={3}>
            <HStack>
              <VStack flex={1}>
                <Text
                  fontSize={["sm", "md", "lg"]}
                  color="green.500"
                  fontFamily="medium"
                  fontWeight="300"
                >
                  Ponto N°{pointSelected?.number}
                </Text>
              </VStack>
              <TouchableOpacity onPress={() => setShowDescPoint(false)}>
                <Icon as={Entypo} name="cross" size={6} color="green.500" />
              </TouchableOpacity>
            </HStack>
            <HStack mt={2}>
              <VStack flex={1}>
                <Text
                  fontSize={["xs", "sm", "md"]}
                  color="green.500"
                  fontFamily="bold"
                  fontWeight="300"
                >
                  End.:{pointSelected?.address}
                </Text>
              </VStack>
            </HStack>
          </View>

          {timePoint ? (
            <View bg="success.500" rounded="md" mx={4} mb={4} p={1} shadow={3}>
              <HStack mt={2}>
                <VStack flex={1}>
                  <Text
                    fontSize={["xs", "sm", "md"]}
                    color="white"
                    fontFamily="medium"
                    fontWeight="200"
                  >
                    Distância
                  </Text>
                </VStack>
                <Text
                  fontSize={["sm", "md", "lg"]}
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
                    fontSize={["xs", "sm", "md"]}
                    color="white"
                    fontFamily="medium"
                    fontWeight="200"
                  >
                    Tempo de espera
                  </Text>
                </VStack>
                <Text
                  fontSize={["sm", "md", "lg"]}
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
      <Modal isOpen={selectUserPoint} onClose={() => setSelectUserPoint(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Aviso!</Modal.Header>
          <Modal.Body justifyContent="center" alignItems="center">
            <Image
              size="sm"
              resizeMode="cover"
              source={ImagePoint}
              alt={"Ponto de ônibus"}
            />
            <Text
              my={2}
              color="gray.300"
              fontSize={["sm", "md", "lg"]}
              fontWeight="300"
            >
              Selecione um Ponto de ônibus!
            </Text>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Veículos na rota!</Modal.Header>
          <Modal.Body>
            <ScrollView>
              {bus.length > 0 ? (
                bus.map((item: any, index) => {
                  if (item.data) {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          busSelectedUser(item.data);
                        }}
                        key={index}
                      >
                        <Text
                          my={2}
                          color="gray.300"
                          fontSize={["xs", "sm", "md"]}
                          fontWeight="300"
                        >
                          {`${item.data.bus[0].plate}/Tempo de espera:${item.data.time}`}
                        </Text>
                      </TouchableOpacity>
                    );
                  } else if (item.proximo) {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          busSelectedUser(item.data);
                        }}
                        key={index}
                      >
                        <Text
                          my={2}
                          color="gray.300"
                          fontSize={["xs", "sm", "md"]}
                          fontWeight="300"
                        >
                          {`${item.proximo.plate}/:${item.proximo.time}`}
                        </Text>
                      </TouchableOpacity>
                    );
                  } else {
                    return (
                      <Text
                        color="gray.300"
                        fontSize={["sm", "md", "lg"]}
                        fontWeight="300"
                      >
                        Programação insdisponível no momento!
                      </Text>
                    );
                  }
                })
              ) : (
                <Text
                  color="gray.300"
                  fontSize={["sm", "md", "lg"]}
                  fontWeight="300"
                >
                  Programação insdisponível no momento!
                </Text>
              )}
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
                  size="sm"
                  resizeMode="cover"
                  source={ImageBus}
                  alt={"bus"}
                />

                <Text
                  mt={2}
                  mb={6}
                  color="gray.300"
                  fontSize={["sm", "md", "lg"]}
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
                  size="sm"
                  resizeMode="cover"
                  source={ImageBus}
                  alt={"bus"}
                />

                <Text
                  mt={2}
                  mb={6}
                  color="gray.300"
                  fontSize={["sm", "md", "lg"]}
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
