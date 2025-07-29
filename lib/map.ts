import { Driver, MarkerData } from "@/types/type";

const directionsAPI = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

if (!directionsAPI) {
  console.error("Google Maps API key is missing. Make sure it's set in .env.");
}

export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  return data.map((driver) => {
    const latOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
    const lngOffset = (Math.random() - 0.5) * 0.01;

    return {
      id: driver.driver_id, // Add missing 'id' property
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${driver.first_name} ${driver.last_name}`,
      ...driver,
    };
  });
};

export const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  if (!userLatitude || !userLongitude) {
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  const latitudeDelta = (maxLat - minLat) * 1.3; // Adding padding
  const longitudeDelta = (maxLng - minLng) * 1.3;

  return {
    latitude: (userLatitude + destinationLatitude) / 2,
    longitude: (userLongitude + destinationLongitude) / 2,
    latitudeDelta,
    longitudeDelta,
  };
};

export const calculateDriverTimes = async ({
  markers,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude
  ) {
    console.warn("Missing user or destination coordinates.");
    return [];
  }

  if (!directionsAPI) {
    console.error("Missing Google Maps API key.");
    return [];
  }

  try {
    const timesPromises = markers.map(async (marker) => {
      const fetchDirections = async (origin: string, destination: string) => {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${directionsAPI}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.routes?.[0]?.legs?.[0]?.duration?.value) {
          throw new Error(`No valid route found from ${origin} to ${destination}`);
        }

        return data.routes[0].legs[0].duration.value; // Time in seconds
      };

      const originToUser = `${marker.latitude},${marker.longitude}`;
      const userToDestination = `${userLatitude},${userLongitude}`;
      const destinationCoords = `${destinationLatitude},${destinationLongitude}`;

      const timeToUser = await fetchDirections(originToUser, userToDestination);
      const timeToDestination = await fetchDirections(userToDestination, destinationCoords);

      const totalTime = (timeToUser + timeToDestination) / 60; // Convert to minutes
      const price = (totalTime * 0.5).toFixed(2); // Price estimate

      return { ...marker, time: totalTime, price };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    console.error("Error calculating driver times:", error);
    return [];
  }
};