import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { VStack, Text, Button, FlatList, useToast } from "native-base";

import { ScreenHeader } from "@components/ScreenHeader";
import { ListLine } from "@components/ListLine";
import { InputSearch } from "@components/InputSearch";

import { AppNavigatorRoutesProps } from "@routes/app.routes";

import { api } from "@services/api";

import { RoutesDTO } from "@dtos/UserDTO";

export function Line() {
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const toast = useToast();

  const [result, setResult] = useState<RoutesDTO[]>([]);

  function handleOpenLineCard() {
    navigation.navigate("lineCard");
  }

  // 
  async function getRoutes() {
    try {
      const response = await api.get("");
      setResult(response.data);
    } catch (error) {
      console.log(error);
      toast.show({
        title: "Error no carregamento!",
        placement: "top",
        bgColor: "red.500",
      });
    }
    console.log(result);
    
  }

  useEffect(() => {
    getRoutes();
  }, []);
  return (
    <VStack flex={1}>
      <ScreenHeader title="Linhas" />

      <VStack p={8}>
        {/* <InputSearch /> */}

        <Text mt={4} mb={6} color="gray.300" fontSize="md" fontWeight="400">
          Linhas dinponíveis
        </Text>

        {/* <ListLine onPress={handleOpenLineCard} /> */}
        <FlatList
          data={result} //dados
          keyExtractor={item => item.id} // chave: valor
          renderItem={({ item }) => (
            <ListLine number={item.number} title={item.description +" - "+ item.sense} onPress={handleOpenLineCard} />
          )}
          showsVerticalScrollIndicator={false} //nao exibe a barrinha
          _contentContainerStyle = {{ paddingBottom: 50 }}
        />
      </VStack>
    </VStack>
  );
}
