import { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import {
  VStack,
  HStack,
  Icon,
  Text,
  Center,
  useToast,
  ScrollView,
  Divider,
} from "native-base";
import { Entypo } from "@expo/vector-icons";
import Spinner from "react-native-loading-spinner-overlay";
import { LatLng } from "react-native-maps";
import { api } from "@services/api";
import { Map } from "@components/Map";
import { RouteTime } from "@components/Routetime";

import { AppNavigatorRoutesProps } from "@routes/app.routes";

type ParamsPros = {
  lineId: number;
};

interface Point {
  id: number;
  number: number;
  address: string;
  district: string;
  lat: number;
  lgt: number;
}

type Line = {
  id: number;
  number: number;
  description: string;
  sense: string;
  route: number[];
  points: Point[];
};

type schedule = {
  dia: string;
  programacao: object;
};

export function LineCard() {
  const navigation = useNavigation<AppNavigatorRoutesProps>();

  const route = useRoute();

  const toast = useToast();

  // Recebendo a informação por parametro
  const { lineId } = route.params as ParamsPros;
  // Informações da linha
  const [line, setLine] = useState<Line | null>(null);
  // Programação dos horários
  const [hours, setHours] = useState<schedule | null>(null);
  // Dados de localiação da rota
  const [routeLatLgt, setRouteLatLgt] = useState<LatLng[] | null>(null);
  // Carregamento
  const [isLoading, setIsLoading] = useState(false);

  function handleGoBack() {
    setLine(null);
    navigation.navigate("line");
  }

  // Requisição para linha selecionada
  async function getRouteId() {
    setIsLoading(true);
    try {
      const response = await api.get(`/${lineId}/hours`);

      let lineLatLgt = response.data.data.linha.route.map((line: any) => ({
        latitude: line[0],
        longitude: line[1],
      }));

      setHours(response.data.data);

      setRouteLatLgt(lineLatLgt);

      setLine(response.data.data.linha);
    } catch (error) {
      console.log(`Erro ao consultar horários, rota => http://appbus.conexo.solutions:8000/api/lines/${lineId}/hours`);
      toast.show({
        title: "Error no carregamento!",
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (lineId) {
      getRouteId();
    }
  }, [lineId]);

  return (
    <VStack flex={1}>
      {line && (
        <>
          <HStack
            bg="white"
            px={4}
            pb={4}
            pt={10}
            shadow={3}
            justifyContent="space-between"
          >
            <TouchableOpacity onPress={handleGoBack} activeOpacity={0.7}>
              <HStack alignItems="center">
                <Icon as={Entypo} name="chevron-thin-left" color="gray.300" />
                <Text color="gray.300" fontSize={["xs","sm", "md"]} fontWeight="200" ml={1}>
                  Voltar
                </Text>
              </HStack>
            </TouchableOpacity>

            <Center>
              <Text color="green.500" fontSize={["xs","sm", "md"]} fontWeight="300">
                {`${line.number} - ${line.description} - ${line.sense}`}
              </Text>
            </Center>
          </HStack>
          {routeLatLgt && <Map coordinates={routeLatLgt} />}
          <VStack px={8} mt={5} space={5}>
            <Center>
              <Text color="gray.300" fontSize={["sm", "md", "lg"]} fontWeight="400">
                Horários disponíveis
              </Text>
            </Center>
            <Divider />
          </VStack>
          <ScrollView>
            {hours && (
              <RouteTime dia={hours.dia} programacao={hours.programacao} />
            )}
          </ScrollView>
        </>
      )}
      <Spinner
        //Valor booleano para tornar spinner visivel
        visible={isLoading}
        color="#0DA63E"
      />
    </VStack>
  );
}
