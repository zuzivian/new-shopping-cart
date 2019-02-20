import * as firebase from 'firebase';

var config = { /* COPY THE ACTUAL CONFIG FROM FIREBASE CONSOLE */
  apiKey: "AIzaSyCDPaMsr1SP7qMooyw5PQPckMF4TCF_Fkg",
  authDomain: "nwy-shopping-cart.firebaseapp.com",
  databaseURL: "https://nwy-shopping-cart.firebaseio.com",
  messagingSenderId: "680119995844"
};

firebase.initializeApp(config);
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
export default firebase;
