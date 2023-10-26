import { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { VStack, Text, Button, FlatList, useToast } from "native-base";
import Spinner from "react-native-loading-spinner-overlay";

import { ScreenHeader } from "@components/ScreenHeader";
import { ListLine } from "@components/ListLine";

import { AppNavigatorRoutesProps } from "@routes/app.routes";

import { api } from "@services/api";

import { RoutesDTO } from "@dtos/UserDTO";

export function Line() {
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const toast = useToast();

  const [result, setResult] = useState<RoutesDTO[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [line, setLine] = useState(Number);

  function handleOpenLineCard() {
    navigation.navigate("lineCard", {lineId: line});
  }

  // Requisição para listar todas as linhas
  async function getRoutes() {
    setIsLoading(true);
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
    }finally{
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if(line){
      handleOpenLineCard();
    }
  }, [line]);
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
          keyExtractor={(item : any) => item.id} // chave: valor
          renderItem={({ item }) => (
            <ListLine number={item.number} title={item.description +" - "+ item.sense} onPress={() => setLine(item.id)} />
          )}
          showsVerticalScrollIndicator={false} //nao exibe a barrinha
          _contentContainerStyle = {{ paddingBottom: 50 }}
        />
      </VStack>
      <Spinner
        //Valor booleano para tornar spinner visivel
        visible={isLoading}
        color="#0DA63E"
      />
    </VStack>
  );
}
