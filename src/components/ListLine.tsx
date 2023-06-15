import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Heading, HStack, Image, Text, VStack, Icon, Center,  } from "native-base";
import { Entypo } from '@expo/vector-icons';

type Props = TouchableOpacityProps & {
    number: string;
    title: string;
}

export function ListLine({ number, title, ...rest }:Props) {
    return (
        <TouchableOpacity {...rest}>
            
            <HStack bg="white" alignItems="center" pr={2} rounded="md" mb={4} shadow={3}>
            <Center w={16} h={16} rounded="md" bg="green.500" mr={4}>
            <Text color="white" fontWeight="400" fontFamily="bold" fontStyle="normal" fontSize="lg">{number}</Text>
            </Center>

                <VStack flex={1}>

                    <Text fontSize="sm" color="gray.200" fontFamily="semibold" fontWeight="300">
                        {title}
                    </Text>

                </VStack>

                <Icon as={ Entypo } name="chevron-thin-right" color="green.500"/>

            </HStack>
            

        </TouchableOpacity>

    );
    
}