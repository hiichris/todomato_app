import Constants from "expo-constants";
import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Linking,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useState, useRef } from "react";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { getGeolocation, updateGeolocation } from "../services/db_service";
import Geocoder from "react-native-geocoding";

const googleMapsApiKey = Constants.expoConfig?.extra.googleMapsApiKey;

// Init the Geocoder
Geocoder.init(googleMapsApiKey);

export const GeoLocations = ({
  styles,
  setFocusedInput,
  todoId,
  setGeoInputYpos,
}) => {
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState("");
  const mapRef = useRef(null);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [savedAddress, setSavedAddress] = useState("");
  const defaultLatDelta = 0.0002;
  const defaultLongDelta = 0.0021;
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: defaultLatDelta,
    longitudeDelta: defaultLongDelta,
  });

  useEffect(() => {
    // Get the geolocation from the database
    getGeolocationFromDB(todoId);
  }, [todoId]);

  // Update the region and marker
  const updateRegionAndMarker = (latitude: number, longitude: number) => {
    setMarker({
      latitude: latitude,
      longitude: longitude,
    });
    const newRegion = {
      latitude: latitude,
      longitude: longitude,
      latitudeDelta: defaultLatDelta,
      longitudeDelta: defaultLongDelta,
    };
    // Animate the map to the new region
    mapRef.current?.animateToRegion(newRegion, 1000);
    setRegion(newRegion);
  };

  // Get the geolocation from the database
  const getGeolocationFromDB = async (todoId: number) => {
    console.log("todoId: ", todoId);
    const location = await getGeolocation(todoId);
    const locationArray = location["geolocation"].split("|");
    const parsedAddress = locationArray[0];
    const latitude = parseFloat(locationArray[1]);
    const longitude = parseFloat(locationArray[2]);
    // If the latitude and longitude are valid, update the region and marker
    if (latitude && longitude) {
      updateRegionAndMarker(latitude, longitude);
    }
    // Set the address
    console.log("Addres: ", parsedAddress);
    setSavedAddress(parsedAddress);
  };

  // Update the geolocation to the database
  const updateGeolocationToDB = async (todoId: number, geolocation: string) => {
    // Update the geolocation
    console.log("updating geolocation: ", geolocation);
    await updateGeolocation(todoId, geolocation)
      .then(() => {
        console.log("Geolocation updated");
      })
      .catch((error) => {
        console.log("Error updating geolocation: ", error);
      });
  };

  // Get the address info from the database
  const getLocation = async () => {
    try {
      const location = await getLocation(todoId);
      console.log("location:", location);
      // If the location is valid, update the address, region, and marker
      if (location) {
        setAddress(location.address);
        updateRegionAndMarker(location.latitude, location.longitude);
      }
    } catch (error) {
      console.log("Error getting geolocation:", error);
    }
  };

  // Disable searching effect
  const disableSearching = () => {
    setTimeout(() => {
      setSearchingLocation(false);
    }, 200);

    setAddress("");
  };

  // Find the coordinates of the address
  const findCoordinates = async () => {
    // Set the searching effect to true so the loading spinner appears
    setSearchingLocation(true);
    try {
      // Get the geocode of the address
      let geocode = await Location.geocodeAsync(address);

      // If the geocode is valid, update the region
      if (geocode.length > 0) {
        const { latitude, longitude } = geocode[0];
        const newRegion = {
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: defaultLatDelta,
          longitudeDelta: defaultLongDelta,
        };
        // Animate the map to the new region and update the marker
        mapRef.current?.animateToRegion(newRegion, 1000);
        setRegion(newRegion);
        setMarker({ latitude: latitude, longitude: longitude });
        console.log("Geocode:", { latitude, longitude });

        // Save the geolocation to the database
        const geolocation = `${address}|${latitude}|${longitude}`;
        console.log("geolocation:", geolocation);
        await updateGeolocationToDB(todoId, geolocation);
        setSavedAddress(address);

        // Disable the searching effect
        disableSearching();
      } else {
        // Otherwise, no geocode was found, alert the user and disable the searching effect
        console.log("No geocode found");
        disableSearching();
        Alert.alert(
          "⚠️ Not Found",
          "The location or address you entered was not found. Please try again.",
          [
            {
              text: "OK",
              onPress: () => {
                console.log("OK Pressed");
              },
            },
          ]
        );
      }
    } catch (error) {
      // Handle a special edge case where the user denies location permissions
      // or the location services are disabled
      console.log("error code:", error.code);
      if (error.code === "ERR_LOCATION_UNAUTHORIZED") {
        Alert.alert(
          "⚠️ Permission Denied",
          "Please enable location services in your device settings.",
          [
            {
              text: "OK",
              onPress: () => {
                console.log("OK Pressed");
              },
            },
          ]
        );
      }
      disableSearching();
    }
  };

  // Handle the enter key press
  const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === "Enter") {
      findCoordinates();
    }
  };

  // Function to handle the marker drag end event
  const markerDragEndHandler = async (event) => {
    // Get the new coordinates from the marker
    const newCoords = event.nativeEvent.coordinate;
    setMarker(newCoords);

    // Reverse geocode to get the address by calling the Google Maps API
    try {
      const response = await Geocoder.from(
        newCoords.latitude,
        newCoords.longitude
      );
      // Save the formatted address
      const newAddress = response.results[0].formatted_address;
      setAddress(newAddress);
      setSavedAddress(newAddress);

      // Save the geolocation to the database
      // Format: address|latitude|longitude
      const geolocation = `${newAddress}|${newCoords.latitude}|${newCoords.longitude}`;
      console.log("Pinned geolocation updated:", geolocation);
      await updateGeolocationToDB(todoId, geolocation);
    } catch (error) {
      console.log("Error reverse geocoding:", error);
    }
  };

  return (
    <>
      <View style={styles.sectionContainer}>
        <Text style={styles.detailsSectionTitle}>Somewhere to pin</Text>
      </View>

      <View style={styles.geolocContainer}>
        {marker || savedAddress != "" ? (
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
        ) : (
          <></>
        )}
        {/* if savedAddress != "" then display the following */}
        {savedAddress != "" && (
          <View style={styles.savedGeolocationContainer}>
            <Text
              style={styles.savedGeoLocationText}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              Last Pinned: {savedAddress}
            </Text>
          </View>
        )}
        <View style={styles.geolocSerachContainer}>
          <TextInput
            onFocus={() => setFocusedInput("map")}
            placeholder="Enter a location & drag the pin..."
            placeholderTextColor={"gray"}
            onChangeText={(text) => setAddress(text)}
            onKeyPress={handleKeyPress}
            onSubmitEditing={findCoordinates}
            returnKeyType="search"
            value={address}
            style={styles.geolocInput}
          />
          <Pressable onPress={findCoordinates} style={styles.geolocButton}>
            <Text style={styles.geolocButtonText}>
              {searchingLocation ? "Searching..." : " 🔍 "}
            </Text>
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
              title="📍 Pinned Location"
              description={address}
              draggable
              onDragEnd={markerDragEndHandler}
            />
          )}
        </MapView>
      </View>
    </>
  );
};
