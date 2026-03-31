import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 27.7172, // Default Kathmandu coordinates
  lng: 85.3240
};

const DeliveryAgentDashboard = () => {
  const [activeOrder, setActiveOrder] = useState('order_123'); // Stub payload
  const [location, setLocation] = useState(center);
  const [socket, setSocket] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY_HERE" // Expect user to replace this
  });

  useEffect(() => {
    // Connect to logistics service
    const newSocket = io('http://localhost:4004');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const handleStartTracking = () => {
    if (!socket) return;
    
    socket.emit('join_tracking', activeOrder);
    
    // Simulate real-time tracking (e.g. using GPS geolocation API)
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(newLocation);
        
        socket.emit('update_location', {
          orderId: activeOrder,
          latitude: newLocation.lat,
          longitude: newLocation.lng
        });
      }, (error) => console.error(error), { enableHighAccuracy: true });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Delivery Agent Dashboard</h1>
      <p>Active Order ID: {activeOrder}</p>
      
      <button 
        onClick={handleStartTracking}
        style={{
          padding: '10px 20px', 
          backgroundColor: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Start Broadcasting Location
      </button>

      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={location}
          zoom={15}
        >
          {location && <Marker position={location} />}
        </GoogleMap>
      ) : (
        <p>Loading Map...</p>
      )}
    </div>
  );
};

export default DeliveryAgentDashboard;
