import { Text, Button, Box, Center } from "native-base";

import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { useNavigation } from "@react-navigation/native";

type Props = {
  number?: string;
}

export function Card() {

    const navigation = useNavigation<AppNavigatorRoutesProps>();

    function handleOpenHoursRoute(){
        navigation.navigate("hours");
    }
  return (
    <Box bg="white" mx={8} mt={4} shadow={4} rounded="md">
      <Center>
        <Text color="gray.300" mt={4}>
          Linha 104 - Centro
        </Text>
        <Button m={3} px={16} py={4} bg="green.500" _pressed={{ bg:"green.600"}}>
          Ver rota no mapa
        </Button>
        <Button size="sm" mb={4} variant="link" _text={{ color: "green.500" }} onPress={handleOpenHoursRoute}>
          Ver horários
        </Button>
      </Center>
    </Box>
  );
}
