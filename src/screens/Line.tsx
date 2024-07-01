import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { VStack, FlatList, useToast } from "native-base";
import Spinner from "react-native-loading-spinner-overlay";

import { ScreenHeader } from "@components/ScreenHeader";
import { ListLine } from "@components/ListLine";

import { AppNavigatorRoutesProps } from "@routes/app.routes";

import { lines } from "@services/api";

import { RoutesDTO } from "@dtos/UserDTO";

export function Line() {
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const toast = useToast();

  const [result, setResult] = useState<RoutesDTO[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  function handleOpenLineCard(id: number) {    
    navigation.navigate("lineCard", { lineId: id });
  }

  // Requisição para listar todas as linhas
  async function getRoutes() {
    setIsLoading(true);
    try {
      const response = await lines.get("");
      setResult(response.data);
    } catch (error) {
      console.log(`Erro ao consultar todas as linhas, rota => http://appbus.conexo.solutions:8000/api/lines-mobile`);
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
    getRoutes();
  }, []);
  return (
    <>
      {!isLoading ? (
        <VStack flex={1}>
          <ScreenHeader title="Linhas disponíveis" />

          <VStack p={5}>
            <FlatList
              data={result} //dados
              keyExtractor={(item: any) => item.id} // chave: valor
              renderItem={({ item }) => (
                <ListLine
                  number={item.linha.slice(0,3)}
                  title={item.linha}
                  onPress={() => handleOpenLineCard(item.id)}
                />
              )}
              showsVerticalScrollIndicator={false} //nao exibe a barrinha
              _contentContainerStyle={{paddingBottom: 10}}
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
