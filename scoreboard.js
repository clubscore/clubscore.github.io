import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js'

// // If you enabled Analytics in your project, add the Firebase SDK for Google Analytics
// import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js'

// // Add Firebase products that you want to use
// import { getAuth } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js'
import { getFirestore, getDoc, doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js'

const firebaseConfig = {
    apiKey: "AIzaSyCK12gxCeAc4RQDchWedaZGX5wMXRJKAuQ",
    authDomain: "club-scorer.firebaseapp.com",
    projectId: "club-scorer",
    storageBucket: "club-scorer.firebasestorage.app",
    messagingSenderId: "682053111618",
    appId: "1:682053111618:web:c9917f5d454c79deb682db",
    measurementId: "G-BJTG3WZMSC"
};

// debugger;
// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log(app.name);
const db = getFirestore(app);
console.log(db);

getDoc(doc(db, "scores", "GSh0R9fAcLdFKgPuYR0S")).then(testDoc=>{
    if(testDoc.exists())
    {
        console.log("document found");
        console.log(testDoc.data());
    }
    else
    {
        console.log("document missing");
    }
})


function getQueryStringParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
  
    const params = {};
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
  
    return params;
  }
  
  const queryParams = getQueryStringParams();
  console.log(queryParams.id);

function getDataFromDbs()
{
    console.log("method was called");
}

onSnapshot(doc(db, "scores", "GSh0R9fAcLdFKgPuYR0S"), 
    testDoc =>     {
        console.log("document updated");
        console.log(testDoc.data());
        console.log(testDoc.data()["gameScore"]["pointSide1"]);
        var pointCell = document.getElementById("pointSide1");
        pointCell.textContent=testDoc.data()["gameScore"]["pointSide1"];
        var pointCell = document.getElementById("pointSide2");
        pointCell.textContent=testDoc.data()["gameScore"]["pointSide2"];
    }
);


const message = () => {
    const name = "Jesse";
    const age = 40;
    return `${name} is ${age} years old.`;
  };
  
  export default message;
  export {
    getDataFromDbs
  }