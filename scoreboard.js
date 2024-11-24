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

var gameId;

function getQueryStringParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
  
    const params = {};
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }

    return params;
}

function setGameId() {
    const queryParams = getQueryStringParams();

    if(queryParams?.id)
    {
        console.log("game id -"+queryParams.id);        
        console.log("saved game id to localStorage");        
        localStorage.setItem("gameId", queryParams.id);
        gameId = queryParams.id;
    }
    else
    {
        gameId = localStorage.getItem("gameId");
        console.log("game id not found in url. local-"+gameId);
    }
}

setGameId();
// debugger;
// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log(app.name);
const db = getFirestore(app);
console.log(db);

function getDataFromDbs()
{
    console.log("method was called");
}

onSnapshot(doc(db, "scores", gameId), 
    testDoc =>     {
        if(testDoc.exists())
        {
            console.log("document updated");
            // console.log(testDoc.data());
            // console.log(testDoc.data()["pointSide1"]);
            updateScore(testDoc);
        }
        else
        {
            console.log("game not found - "+gameId);
        }
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

function updateScore(testDoc) {
    var pointCell = document.getElementById("pointSide1");
    pointCell.textContent = testDoc.data()["pointSide1"];
    var pointCell = document.getElementById("pointSide2");
    pointCell.textContent = testDoc.data()["pointSide2"];
    clearPrevGameScores();
    var prevGameSide1 = testDoc.data()["prevGameSide1"];
    var prevGameSide2 = testDoc.data()["prevGameSide2"];
    
    var gameSide1 = testDoc.data()["gameSide1"];
    var gameSide2 = testDoc.data()["gameSide2"];

    updateGames(prevGameSide1, "playerNameSide1", gameSide1);

    updateGames(prevGameSide2, "playerNameSide2", gameSide2);
}

function updateGames(prevGames, identifier, gameCurr)
{
    insertCell(identifier, gameCurr);

    for (let i = prevGames.length-1; i>=0; i--) {
        insertCell(identifier, prevGames[i]);
    }
}

function clearPrevGameScores(){
    const elements = document.getElementsByName("prevGame");
    var length = elements.length;
    if(length>0)
    {
        for (let i = length-1; i >= 0; i--) {
            elements[i].parentNode.removeChild(elements[i]);
        }
    }
}

function insertCell(identifier, score) {
    var cell = document.createElement("td");
    cell.textContent = score;
    cell.setAttribute("name", "prevGame");
    document.getElementById(identifier).insertAdjacentElement('afterend', cell);
}

