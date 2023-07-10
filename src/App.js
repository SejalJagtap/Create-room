import dbRef, { userName, connectedRef } from './server/firebase.js';
import './App.css';
import { useEffect, useState } from "react";

function App() {
  const [participants, setParticipants] = useState([]);
  const [locationAccess, setLocationAccess] = useState(false);

  useEffect(() => {
    const handleConnectedChange = (snap) => {
      if (snap.val() && locationAccess) {
        const defaultPreferences = {
          Audio: true,
          video: true
        };
        const userRef = dbRef.child("participants").push({
          userName,
          preferences: defaultPreferences
        });
        userRef.onDisconnect().remove();
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
    });

    return () => {
      connectedRef.off('value', handleConnectedChange);
      dbRef.child("participants").off("value");
    };
  }, [locationAccess]);

  useEffect(() => {
    const askForLocationAccess = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
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

  return (
    <div className="App">
      <h2>Welcome, {userName}!</h2>

      {locationAccess ? (
        <h3>Location access granted. Adding user to participants.</h3>
      ) : (
        <h3>Location access denied. User will not be added to participants.</h3>
      )}

      <h3>Participants:</h3>
      <ul>
        {participants.map((participant, index) => (
          <li key={index}>{participant.userName}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
