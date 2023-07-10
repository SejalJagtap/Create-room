import dbRef, { userName, connectedRef } from './server/firebase.js';
import React, { useEffect, useState } from "react";
import './App.css';

function App() {
  const [participants, setParticipants] = useState([]);
  const [locationAccess, setLocationAccess] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [centroidLatitude, setCentroidLatitude] = useState(null);
  const [centroidLongitude, setCentroidLongitude] = useState(null);
  const [allowAddParticipants, setAllowAddParticipants] = useState(true);
  const [showCentroid, setShowCentroid] = useState(false); // State to control the visibility of the centroid

  useEffect(() => {
    const handleConnectedChange = (snap) => {
      if (snap.val() && locationAccess && allowAddParticipants) {
        const defaultPreferences = {
          Audio: true,
          video: true
        };
        const userRef = dbRef.child("participants").push({
          userName,
          latitude,
          longitude,
          preferences: defaultPreferences
        });
        userRef.onDisconnect().cancel();
      }
    };

    connectedRef.on('value', handleConnectedChange);

    dbRef.child("participants").on("value", (snapshot) => {
      const participantList = [];
      snapshot.forEach((childSnapshot) => {
        const participant = childSnapshot.val();
        participantList.push(participant);
      });
      setParticipants(participantList);
      if (!allowAddParticipants) {
        calculateCentroid(participantList); // Calculate the centroid if adding participants is not allowed
      }
    });

    return () => {
      connectedRef.off('value', handleConnectedChange);
      dbRef.child("participants").off("value");
    };
  }, [locationAccess, latitude, longitude, allowAddParticipants]);

  useEffect(() => {
    const askForLocationAccess = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLatitude(latitude);
            setLongitude(longitude);
            setLocationAccess(true);
          },
          (error) => {
            console.error(error);
            setLocationAccess(false);
          }
        );
      } else {
        console.log("Geolocation is not supported by this browser.");
        setLocationAccess(false);
      }
    };

    askForLocationAccess();
  }, []);

  useEffect(() => {
    if (locationAccess && allowAddParticipants) {
      const defaultPreferences = {
        Audio: true,
        video: true
      };
      const creator = {
        userName,
        latitude,
        longitude,
        preferences: defaultPreferences,
        isCreator: true
      };
      setParticipants([creator]);
    }
  }, [locationAccess, latitude, longitude, allowAddParticipants]);

  // Function to calculate the centroid using latitude and longitude
  const calculateCentroid = (participantList) => {
    let sumLat = 0;
    let sumLng = 0;

    for (let i = 0; i < participantList.length; i++) {
      sumLat += participantList[i].latitude;
      sumLng += participantList[i].longitude;
    }

    const centroidLat = sumLat / participantList.length;
    const centroidLng = sumLng / participantList.length;

    setCentroidLatitude(centroidLat);
    setCentroidLongitude(centroidLng);
  };

  // Function to handle the button click event
  const handleMeetingPointClick = () => {
    if (participants.length > 0 && participants[0].userName === userName) {
      setAllowAddParticipants(false); // Prevent adding new participants
      calculateCentroid(participants); // Calculate the centroid
      setShowCentroid(true); // Show the centroid for all participants
    }
  };

  return (
    <div className="App">
      <h2 className="title">Welcome, {userName}!</h2>

      {locationAccess ? (
        <div>
          <h3>Location access granted. Adding user to participants.</h3>
          <p>Latitude: {latitude}</p>
          <p>Longitude: {longitude}</p>
        </div>
      ) : (
        <h3>Location access denied. User will not be added to participants.</h3>
      )}

      <h3>Participants:</h3>
      <ul className="participant-list">
        {participants.map((participant, index) => (
          <li key={index}>
            {participant.userName} - Latitude: {participant.latitude}, Longitude: {participant.longitude}
          </li>
        ))}
      </ul>

      {allowAddParticipants && participants.length > 0 && participants[0].userName === userName ? (
        <button className="btn-add" onClick={handleMeetingPointClick}>Find Meeting Point</button>
      ) : (
        showCentroid && centroidLatitude && centroidLongitude && (
          <div>
            <h3>Centroid:</h3>
            <p>Latitude: {centroidLatitude}</p>
            <p>Longitude: {centroidLongitude}</p>
            <p>All participants are at the centroid.</p>
          </div>
        )
      )}
    </div>
  );
}

export default App;
