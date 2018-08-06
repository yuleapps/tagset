
import config from './config';
import Firebase from 'firebase';

let firebaseApp;
if (!Firebase.apps.length) {
  firebaseApp = Firebase.initializeApp(config);
} else {
  firebaseApp = Firebase.app();
}

let db = firebaseApp.database();


export default db;