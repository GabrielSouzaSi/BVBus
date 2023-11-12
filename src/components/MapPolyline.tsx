import { Polyline, LatLng } from "react-native-maps";

type Props = {
  coordinates: LatLng[];
  colorLine: string;
  strokeWidth: number;
};

export function MapPolylines({ coordinates, colorLine, strokeWidth, ...rest }: Props) {
  return (
    <Polyline coordinates={coordinates} strokeColor={colorLine} strokeWidth={strokeWidth} {...rest} />
  );
}
