import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { VStack, HStack, Icon, Text, Center} from "native-base";
import { Entypo } from '@expo/vector-icons';
import { ScreenHeader } from "../components/ScreenHeader";
import { Card } from "@components/Card";

import { AppNavigatorRoutesProps } from "@routes/app.routes";

export function LineCard() {
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
      <Card />
      <Card />
      <Card />
    </VStack>
  );
}
