import { useState } from "react";
import { Marker, LatLng } from "react-native-maps";
import ImageBus from "@assets/bus/buss.png";


export function MarkerBus({ latitude, longitude, ...rest }: LatLng) {
    return (
      <Marker
        image={ImageBus}
        coordinate={{
          latitude: latitude,
          longitude: longitude,
        }}
        {...rest}
      />
    );
}
