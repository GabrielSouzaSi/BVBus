import { useRef } from "react";
import MapView, {
  MapViewProps,
  PROVIDER_GOOGLE,
  LatLng,
  Marker,
  Polyline,
} from "react-native-maps";
import { Icon } from "native-base";
import { View, Text } from "react-native";
import { Entypo } from "@expo/vector-icons";

type Props = MapViewProps & {
  coordinates: LatLng[];
};

export function Map({ coordinates, ...rest }: Props) {
  const mapRef = useRef<MapView>(null);

  const lastCoordinate = coordinates[coordinates.length - 1];

  async function onMapLoaded() {
    if (coordinates.length > 1) {
      mapRef.current?.fitToSuppliedMarkers(["departure", "arrival"], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      });
    }
  }

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={{ width: "100%", height: 200 }}
      region={{
        latitude: lastCoordinate.latitude,
        longitude: lastCoordinate.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }}
      rotateEnabled={false}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      onMapLoaded={onMapLoaded}
      {...rest}
    >
      <Marker identifier="departure" coordinate={coordinates[0]}>
        <View style={{width: 50, height:50, alignItems:"center"}}>
          <Text style={{fontSize:12, fontWeight:"bold",color:"#fff", paddingHorizontal:2, backgroundColor:"#1cb442"}}>
            Saída
          </Text>
          <Icon as={Entypo} size={8} name="location-pin" color="red.400" />
        </View>
      </Marker>

      {coordinates.length > 1 && (
        <>
          <Marker
            identifier="arrival"
            coordinate={lastCoordinate}
          >
            <View style={{width: 70, height:50, alignItems:"center"}}>
          <Text style={{fontSize:11, fontWeight:"bold",color:"#fff", paddingHorizontal:2, backgroundColor:"#1cb442"}}>
            Chegada
          </Text>
          <Icon as={Entypo} size={8} name="location-pin" color="blue.400" />
        </View>
          </Marker>

          <Polyline
            coordinates={coordinates}
            strokeColor="#0DA63E"
            strokeWidth={7}
          />
        </>
      )}
    </MapView>
  );
}
