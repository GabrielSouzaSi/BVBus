import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import {
  Heading,
  HStack,
  Image,
  Text,
  VStack,
  Icon,
  Center,
} from "native-base";
import { Entypo } from "@expo/vector-icons";

type Props = TouchableOpacityProps & {
  number: string;
  title: string;
};

export function ListLine({ number, title, ...rest }: Props) {
  return (
    <TouchableOpacity style={{paddingRight:2}}  {...rest}>
      <HStack
        bg="white"
        alignItems="center"
        pr={2}
        rounded="md"
        mb={4}
        shadow={2}
      >
        <Center w={14} h={14} rounded="sm" bg="green.500" mr={4}>
          <Text
            color="white"
            fontWeight="300"
            fontFamily="bold"
            fontStyle="normal"
            fontSize={["sm", "md", "lg"]}
          >
            {number}
          </Text>
        </Center>

        <VStack flex={1}>
          <Text
            fontSize={["xs", "sm", "md"]}
            color="gray.200"
            fontFamily="semibold"
            fontWeight="300"
          >
            {title}
          </Text>
        </VStack>

        <Icon as={Entypo} name="chevron-thin-right" color="green.500" />
      </HStack>
    </TouchableOpacity>
  );
}
