import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import {
  VStack,
  HStack,
  Center,
  Text,
  Button,
  Icon,
} from "native-base";
import { Entypo } from '@expo/vector-icons';

import { RouteTime } from "@components/Routetime";

import { AppNavigatorRoutesProps } from "@routes/app.routes";

export function Hours() {
  const navigation = useNavigation<AppNavigatorRoutesProps>();

  function handleGoBack() {
    navigation.navigate("line");
  }
  return (
    <VStack flex={1}>
      <HStack bg="white" px={4} pb={4} pt={10}  shadow={3} justifyContent="space-between" >
        <TouchableOpacity  onPress={handleGoBack}>
          <HStack alignItems="center">
          <Icon as={ Entypo } name="chevron-thin-left" color="gray.300"/>
          <Text color="gray.300" fontSize="md" fontWeight="400">
            Voltar
          </Text>
          </HStack>
        </TouchableOpacity>

        <Center>
          <Text color="green.500" fontSize="lg" fontWeight="400">
            104 - Bairro União
          </Text>
        </Center>
      </HStack>
      <RouteTime /> 
      {/* Mostra os horários da linha */}
      <Button mx={8} py={4} bg="green.500" _pressed={{ bg: "green.600" }}>
        Ver rota no mapa
      </Button>
    </VStack>
  );
}
