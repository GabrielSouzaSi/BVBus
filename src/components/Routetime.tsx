import { VStack, HStack, Center, Text, Divider, Button, Box } from "native-base";

export function RouteTime() {
  return (
    <Box bg="white" mx={8} mt={4} shadow={4} rounded="md">
      <VStack px={8} mt={5} space={5}>
        <Center>
          <Text color="gray.300" fontSize="lg" fontWeight="400">
            Horários disponíveis
          </Text>
        </Center>
        <Divider />
      </VStack>

      <HStack mt={5} px={8} justifyContent="space-between">
        <VStack>
          <Button
            variant="outline"
            bg="green.500"
            _text={{ color: "white", fontWeight: "300" }}
            _pressed={{ bg: "green.600" }}
          >
            Dias úteis
          </Button>
          <Center>
            <Text mt={5} color="gray.300" fontSize="md" fontWeight="400">
              Manhã
            </Text>
            <Divider bg="green.500" />
            <Text mt={5} color="gray.300" fontSize="sm" fontWeight="300">
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
            </Text>
          </Center>
        </VStack>
        <VStack>
          <Button
            variant="outline"
            _text={{ color: "gray.300", fontWeight: "300" }}
            _pressed={{ bg: "green.600" }}
          >
            Sábado
          </Button>
          <Center>
            <Text mt={5} color="gray.300" fontSize="md" fontWeight="400">
              Tarde
            </Text>
            <Divider />
            <Text mt={5} color="gray.50" fontSize="sm" fontWeight="300">
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
            </Text>
          </Center>
        </VStack>
        <VStack>
          <Button
            variant="outline"
            _text={{ color: "gray.300", fontWeight: "300" }}
            _pressed={{ bg: "green.600" }}
          >
            Domingo
          </Button>
          <Center>
            <Text mt={5} color="gray.300" fontSize="md" fontWeight="400">
              Noite
            </Text>
            <Divider />
            <Text mt={5} color="gray.50" fontSize="sm" fontWeight="300">
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
              06:45 - 07-35{"\n"}
            </Text>
          </Center>
        </VStack>
      </HStack>
    </Box>
  );
}
