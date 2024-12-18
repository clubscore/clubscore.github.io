import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js'

// // If you enabled Analytics in your project, add the Firebase SDK for Google Analytics
// import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js'

// // Add Firebase products that you want to use
// import { getAuth } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js'
import { getFirestore, getDoc, doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js'

class TennisScoreKeys{
    static pointSide1="p1";
    static pointSide2="p2";
    static gameSide1="g1";
    static gameSide2="g2";
    static setOverallSide1="s1";
    static setOverallSide2="s2";
    static prevGameSide1="pg1";
    static prevGameSide2="pg2";
    static tieBreakSide1="t1";
    static tieBreakSide2="t2";
    static isTieBreak="itb";
}

class TennisGameKeys {
    static side1Player1Name = "1p1";
    static side1Player2Name = "1p2";
    static side2Player1Name = "2p1";
    static side2Player2Name = "2p2";
    static scoreId = "si";
    static tennisGameType = "gt";
}

const firebaseConfig = {
    apiKey: "AIzaSyDrzI_OoGe92fYQEFLZhXFlKXcrP_yIoeU",
    authDomain: "game-scorer-skj.firebaseapp.com",
    databaseURL: "https://game-scorer-skj-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "game-scorer-skj",
    storageBucket: "game-scorer-skj.firebasestorage.app",
    messagingSenderId: "720596141343",
    appId: "1:720596141343:web:1ebc9f062c3577ddcc9c2a",
    measurementId: "G-49863K56BS"
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

onSnapshot(doc(db, "tennis_score", gameId), 
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
    pointCell.textContent = testDoc.data()[TennisScoreKeys.pointSide1];
    var pointCell = document.getElementById("pointSide2");
    pointCell.textContent = testDoc.data()[TennisScoreKeys.pointSide2];
    clearPrevGameScores();
    var prevGameSide1 = testDoc.data()[TennisScoreKeys.prevGameSide1];
    var prevGameSide2 = testDoc.data()[TennisScoreKeys.prevGameSide1];
    
    var gameSide1 = testDoc.data()[TennisScoreKeys.gameSide1];
    var gameSide2 = testDoc.data()[TennisScoreKeys.gameSide2];

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

