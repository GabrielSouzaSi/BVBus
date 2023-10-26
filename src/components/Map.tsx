import { useRef } from "react";
import MapView, { MapViewProps, PROVIDER_GOOGLE, LatLng, Marker, Polyline } from "react-native-maps";

type Props = MapViewProps & {
  coordinates: LatLng[];
}

export function Map({ coordinates, ...rest }: Props) {
  
  const mapRef = useRef<MapView>(null);

  const lastCoordinate = coordinates[coordinates.length - 1];

  async function onMapLoaded() {
    if(coordinates.length > 1) {
      mapRef.current?.fitToSuppliedMarkers(['departure', 'arrival'], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }
      })
    }
  }

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={{ width: '100%', height: 200 }}
      region={{
        latitude: lastCoordinate.latitude,
        longitude: lastCoordinate.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      }}
      onMapLoaded={onMapLoaded}
      {...rest}
    >
      <Marker identifier="departure" coordinate={coordinates[0]}>
      </Marker>

      {
        coordinates.length > 1 && (
          <>
            <Marker identifier="arrival" coordinate={lastCoordinate}>
            </Marker>

            <Polyline 
              coordinates={coordinates}
              strokeColor="#0DA63E"
              strokeWidth={7}
            />
          </>
          
        )
      }
    </MapView>
  );
}