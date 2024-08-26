import React from "react";
import {
  View,
  Text,
  TextInput,
  Linking,
  Pressable,
  Platform,
} from "react-native";
import { useState, useRef } from "react";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export const GeoLocations = ({ styles, setFocusedInput }) => {
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState("");
  const mapRef = useRef(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const findCoordinates = async () => {
    try {
      let geocode = await Location.geocodeAsync(address);
      if (geocode.length > 0) {
        const { latitude, longitude } = geocode[0];
        const newRegion = {
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        mapRef.current?.animateToRegion(newRegion, 1000);
        setRegion(newRegion);
        setMarker({ latitude: latitude, longitude: longitude });
        console.log("Geocode:", { latitude, longitude });
      }
    } catch (error) {
      console.error("Error getting geolocation:", error);
    }
  };

  return (
    <>
      <View style={styles.sectionContainer}>
        <Text style={styles.detailsSectionTitle}>Something to pin</Text>
      </View>

      <View style={styles.geolocContainer}>
        <View style={styles.geolocSerachContainer}>
          <TextInput
            onFocus={() => setFocusedInput("map")}
            placeholder="Enter a location or address..."
            placeholderTextColor={"gray"}
            onChangeText={(text) => setAddress(text)}
            value={address}
            style={styles.geolocInput}
          />
          <Pressable onPress={findCoordinates} style={styles.geolocButton}>
            <Text style={styles.geolocButtonText}>Find Location</Text>
          </Pressable>
        </View>

        <MapView
          region={region}
          onRegionChangeComplete={(region) => setRegion(region)}
          mapType="standard"
          zoomControlEnabled={true}
          ref={mapRef}
          style={styles.geolocMap}
        >
          {marker && (
            <Marker
              coordinate={marker}
              title="📍 Selected Location"
              description={address}
            />
          )}
        </MapView>

        {marker && (
          <Pressable
            style={styles.geolocLinkContainer}
            onPress={() => {
              const latitude = region.latitude;
              const longitude = region.longitude;
              const mapUrl = Platform.select({
                ios: `http://maps.apple.com/?q=${latitude},${longitude}`,
                android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
              });
              console.log("mapUrl:", mapUrl);
              Linking.openURL(mapUrl);
            }}
          >
            <Text style={styles.geolocLinkText}>Open in Maps</Text>
          </Pressable>
        )}
      </View>
    </>
  );
};
