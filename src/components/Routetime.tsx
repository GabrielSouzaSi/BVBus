import {
  VStack,
  Stack,
  HStack,
  Center,
  Text,
  Divider,
  Button,
  Box,
  View,
  Square,
} from "native-base";

export function RouteTime({ dia, programacao, ...rest }: any) {
  function formatHours(day: any) {
    if (programacao.weekdays[day].length) {
      let data = programacao.weekdays[day];
      return data.map((item: any, index: number) => {
        return (
          <Center key={index} m={1} w="70px" h="30px" bg="green.500">
            <Box
              _text={{
                fontWeight: "300",
                fontSize: "sm",
                color: "white",
              }}
            >
              {item.start.slice(0,5)}
            </Box>
          </Center>
        );
      });
    } else {
      return (
        <>
          <Text color="green.500" fontSize={["sm", "md", "lg"]} fontWeight="300">
            Horário indisponível no momento!
          </Text>
        </>
      );
    }
  }
  // function scheduleHours(day: any) {}

  return (
    <>
      <Box bg="white" mx={8} pb={4} mt={4} shadow={4} rounded="md">
        <Center>
          <Text color="gray.300" mt={4} fontSize={["sm", "md", "lg"]} fontWeight="400">
            Dias úteis
          </Text>
        </Center>
        <View
          flex={1}
          flexDirection="row"
          flexWrap="wrap"
          justifyContent="center"
        >
          {formatHours(1)}
        </View>
      </Box>
      <Box bg="white" mx={8} pb={4} mt={4} shadow={4} rounded="md">
        <Center>
          <Text color="gray.300" mt={4} fontSize={["sm", "md", "lg"]} fontWeight="400">
            Sábado
          </Text>
        </Center>
        <View
          flex={1}
          flexDirection="row"
          flexWrap="wrap"
          justifyContent="center"
        >
          {formatHours(6)}
        </View>
      </Box>
      <Box bg="white" mx={8} pb={4} my={4} shadow={4} rounded="md">
        <Center>
          <Text color="gray.300" mt={4} fontSize={["sm", "md", "lg"]} fontWeight="400">
            Domingo
          </Text>
        </Center>
        <View
          flex={1}
          flexDirection="row"
          flexWrap="wrap"
          justifyContent="center"
        >
          {formatHours(0)}
        </View>
      </Box>
    </>
  );
}
