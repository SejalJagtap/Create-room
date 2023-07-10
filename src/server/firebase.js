import firebase from 'firebase/compat/app';
import 'firebase/compat/database';


var firebaseConfig = {
    apiKey:'AIzaSyCnJH76w3pe5VzuZ_lGSr_a0_6RostqZdA',
    databaseURL: "https://meet-c6480-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

firebase.initializeApp(firebaseConfig);

export const db = firebase;

let dbRef = firebase.database().ref();



export const userName = prompt("What's your name?");
  


export let connectedRef=firebase.database().ref(".info/connected")


const urlparams = new URLSearchParams(window.location.search);
const roomId = urlparams.get("id");

if (roomId) {
  dbRef = dbRef.child(roomId);
} else {
  dbRef = dbRef.push();
  window.history.replaceState(null, "Meet", "?id=" + dbRef.key);
}

export default dbRef;

