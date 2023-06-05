import { useNavigation } from "@react-navigation/native";
import { VStack, Text } from "native-base";

import { ScreenHeader } from "@components/ScreenHeader";
import { ListLine } from "@components/ListLine";
import { InputSearch } from "@components/InputSearch";

import { AppNavigatorRoutesProps } from "@routes/app.routes";

export function Line() {
  const navigation = useNavigation<AppNavigatorRoutesProps>();

  function handleOpenLineCard() {
    navigation.navigate("lineCard");
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Linhas" />

      <VStack p={8}>
        <InputSearch />
      
        <Text mt={4} mb={6} color="gray.300" fontSize="md" fontWeight="400">
          Linhas dinponíveis
        </Text>

        <ListLine onPress={handleOpenLineCard} />
        <ListLine onPress={handleOpenLineCard} />
        <ListLine onPress={handleOpenLineCard} />
        <ListLine onPress={handleOpenLineCard} />
        <ListLine onPress={handleOpenLineCard} />
      </VStack>
    </VStack>
  );
}
