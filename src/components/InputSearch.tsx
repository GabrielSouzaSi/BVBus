import {Input, Button, Icon, IInputProps } from "native-base";
import { Entypo } from "@expo/vector-icons";

export function InputSearch(){
    return (
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
              <Button h="full" bg="white" _pressed={{ bg: "white" }}>
                <Icon
                  as={Entypo}
                  name="magnifying-glass"
                  size="md"
                  color="green.500"
                />
              </Button>
            }
            size="md"
          />
    );
}