import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { VStack, FlatList, useToast } from "native-base";
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
    navigation.navigate("lineCard", { lineId: line });
  }

  // Requisição para listar todas as linhas
  async function getRoutes() {
    setIsLoading(true);
    try {
      const response = await api.get("");
      setResult(response.data);
    } catch (error) {
      console.log(`Erro ao consultar todas as linhas, rota => http://appbus.conexo.solutions:8000/api/lines`);
      toast.show({
        title: "Error no carregamento!",
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (line) {
      handleOpenLineCard();
    }
  }, [line]);
  useEffect(() => {
    getRoutes();
  }, []);
  return (
    <>
      {!isLoading ? (
        <VStack flex={1}>
          <ScreenHeader title="Linhas dinponíveis" />

          <VStack pb={10}>
            <FlatList
              data={result} //dados
              keyExtractor={(item: any) => item.id} // chave: valor
              renderItem={({ item }) => (
                <ListLine
                  number={item.number}
                  title={item.description + " - " + item.sense}
                  onPress={() => setLine(item.id)}
                />
              )}
              showsVerticalScrollIndicator={false} //nao exibe a barrinha
              _contentContainerStyle={{ padding:8 }}
            />
          </VStack>
        </VStack>
      ) : (
        <></>
      )}
      <Spinner
        //Valor booleano para tornar spinner visivel
        visible={isLoading}
        color="#0DA63E"
      />
    </>
  );
}
