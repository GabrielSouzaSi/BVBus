import { HStack, Center, Heading, Text, VStack, Icon } from "native-base";

type Props = {
  title: string;
};

export function ScreenHeader({ title }: Props) {
  return (
    <Center bg="white" pb={1} pt={8} shadow={3}>
      <Text color="green.500" fontSize={["sm", "md", "lg"]} fontWeight="400">
        {title}
      </Text>
    </Center>
  );
}
