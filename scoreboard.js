import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js'

// // If you enabled Analytics in your project, add the Firebase SDK for Google Analytics
// import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js'

// // Add Firebase products that you want to use
// import { getAuth } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js'
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js'

const firebaseConfig = {
    apiKey: "AIzaSyCK12gxCeAc4RQDchWedaZGX5wMXRJKAuQ",
    authDomain: "club-scorer.firebaseapp.com",
    projectId: "club-scorer",
    storageBucket: "club-scorer.firebasestorage.app",
    messagingSenderId: "682053111618",
    appId: "1:682053111618:web:c9917f5d454c79deb682db",
    measurementId: "G-BJTG3WZMSC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log(app.name);
const db = getFirestore(app);
console.log(db);

db.collection("scores").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.gameSide1} => ${doc.data()}`);
    });
});

const message = () => {
    const name = "Jesse";
    const age = 40;
    return `${name} is ${age} years old.`;
  };
  
  export default message;