import firebase from 'firebase';
import firebaseConfig from 'firebaseConfig';
import { FirebaseConfig } from './types';

function getFirebase(options: FirebaseConfig) {
  const client = firebase.initializeApp(options);

  return () => client;
}

export default getFirebase(firebaseConfig);
