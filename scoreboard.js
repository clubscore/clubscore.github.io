import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js'

// // If you enabled Analytics in your project, add the Firebase SDK for Google Analytics
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js'
import { getRemoteConfig, fetchAndActivate, getNumber } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-remote-config.js";
// // Add Firebase products that you want to use
// import { getAuth } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js'
import { getFirestore, getDoc, doc, onSnapshot, updateDoc, arrayUnion } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js'

class TennisScoreKeys{
    static pointSide1="p1";
    static pointSide2="p2";
    static gameSide1="g1";
    static gameSide2="g2";
    static setOverallSide1="s1";
    static setOverallSide2="s2";
    static gamesHistory="gh";
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

const tennisPointsMap = new Map([
  [0, '00'],
  [1, '15'],
  [2, '30'],
  [3, '40'],
  [4, 'AD'],
]);

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

function updateScore(score) {
    var pointCell = document.getElementById("pointSide1");
    var point1 = score[TennisScoreKeys.pointSide1];
    pointCell.textContent = tennisPointsMap.get(point1);
    
    var pointCell = document.getElementById("pointSide2");
    var point2 = score[TennisScoreKeys.pointSide2];
    pointCell.textContent = tennisPointsMap.get(point2);

    clearPrevGameScores();
    var prevGames = score[TennisScoreKeys.gamesHistory];
    console.log("length of prevGames - "+prevGames.length);
    var gameSide1 = score[TennisScoreKeys.gameSide1];
    var gameSide2 = score[TennisScoreKeys.gameSide2];

    updateGames(prevGames, "playerNameSide1", gameSide1, true);
    updateGames(prevGames, "playerNameSide2", gameSide2, false);

    logAnalyticsEvent("web_view_score_update");
    setScoreUpdateTime();
}

function setScoreUpdateTime()
{
    scoreUpdateTime = new Date();
    console.log("score update time -"+scoreUpdateTime);
    document.getElementById("scoreUpdateTimeIndicator").textContent = "last update - just now";
}

function updateScoreUpdateTimeIndicator()
{
    var timeDiff = new Date() - scoreUpdateTime;
    var seconds = Math.floor(timeDiff / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);
    var timeText = "just now";
    if(days>0)
    {
        timeText = days + " days ago";
    }
    else if(hours>0)
    {
        timeText = hours + " hours ago";
    }
    else if(minutes>0)
    {
        timeText = minutes + " minutes ago";
    }
    else if(seconds>0)
    {
        timeText = seconds + " seconds ago";
    }

    timeText = "last update - " + timeText;

    document.getElementById("scoreUpdateTimeIndicator").textContent = timeText;
}

function updateGames(prevGames, identifier, gameCurr, isSide1)
{
    insertCell(identifier, gameCurr);

    for (let i = Object.keys(prevGames).length-1; i>=0; i--) {
        var prevGame = prevGames[i];
        var gameKey = isSide1 ? TennisScoreKeys.gameSide1 : TennisScoreKeys.gameSide2;
        var gameScore = prevGame[gameKey];
        insertCell(identifier, gameScore);
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

function connectDatabase() {
    const db = getFirestore(firebaseApp);
    console.log(db);
    return db;
}

function initFirebaseApp() {
    const app = initializeApp(firebaseConfig);
    console.log(app.name);
    return app;
}

async function remoteConfig() {
    const remoteConfig = getRemoteConfig(firebaseApp);
    remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
    remoteConfig.defaultConfig = {
        countOfGamesToBeShown: 10,
    };
    await fetchAndActivate(remoteConfig);
    console.log("Remote config fetched successfully!");

    // Accessing fetched parameters
    const welcomeMessage = getNumber(remoteConfig, 'countOfGamesToBeShown');
    console.log("count value -" + welcomeMessage);
}

function setScoreUpdates() {
    console.log("inside score update");
    unsubscribeHandler = onSnapshot(doc(db, "tennis_score", scoreId),
        scoreDoc => {
            if (scoreDoc.exists()) {
                console.log("document updated");
                var score = scoreDoc.data();
                console.log("tennis score document -", score);
                updateScore(score);
            }
            else {
                console.log("game not found - " + gameId);
            }
        }
    );
}

function updatePlayerNames(gameData)
{
    var team1Player1 = gameData[TennisGameKeys.side1Player1Name];
    var team1Player2 = gameData[TennisGameKeys.side1Player2Name];
    var team2Player1 = gameData[TennisGameKeys.side2Player1Name];
    var team2Player2 = gameData[TennisGameKeys.side2Player2Name];

    var team1PlayerNames=team1Player1;
    if(!isEmptyString(team1Player2))
    {
        team1PlayerNames=team1Player1+"+"+team1Player2;
    }

    var team2PlayerNames=team2Player1;
    if(!isEmptyString(team2Player2))
    {
        team2PlayerNames=team2Player1+"+"+team2Player2;
    }

    var playerNameSide1 = document.getElementById("playerNameSide1");
    var pollOption1 = document.getElementById("livePollOption1");
    playerNameSide1.textContent = team1PlayerNames;
    pollOption1.textContent = team1PlayerNames;

    var playerNameSide2 = document.getElementById("playerNameSide2");
    var pollOption2 = document.getElementById("livePollOption2");
    playerNameSide2.textContent = team2PlayerNames;
    pollOption2.textContent = team2PlayerNames;

    var pageTitle = `${team1PlayerNames} vs ${team2PlayerNames} Tennis Match Scores`;
    document.title = pageTitle; 
}

async function retrieveGame()
{
    // Create a reference to the specific document you want to retrieve
    const docRef = doc(db, "tennis_games", gameId); // Replace with your collection and document ID

    try {
        // Fetch the document snapshot
        const docSnap = await getDoc(docRef);

        // Check if the document exists
        if (docSnap.exists()) {
            var doc1=docSnap.data();
            // Log the document data
            console.log("Document data:", doc1);
            updatePlayerNames(doc1);
            scoreId = doc1["si"];
            console.log("score id -"+scoreId);
            console.log("maxViewersReached-" + maxViewersReached);
            if (maxViewersReached==0) {
                console.log("calling score update");
                setScoreUpdates();
            }
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching document:", error);
    }
}

function isEmptyString(str) {
    return !str;
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function setViewerId()
{
    audienceId = localStorage.getItem("audienceIdentifier");
    if(isEmptyString(audienceId))
    {
        var guid = uuidv4();
        localStorage.setItem("audienceIdentifier", guid);
        audienceId = localStorage.getItem("audienceIdentifier");
    }

    console.log("viewer id -"+audienceId);
}

async function getNumberOfViewers()
{
    const viewerOfGame = sessionStorage.getItem("viewerCheckForGame");
    const viewerCountReached = sessionStorage.getItem("viewerCountReached");
    if(viewerOfGame==gameId)
    {
        console.log("skipping viewer count check");
        logAnalyticsEvent("web_viewers_check_skipped");
        maxViewersReached = viewerCountReached;
        return;
    }

    console.log("proceeding to check viewer count");
    const docRef = doc(db, "tennis_game_viewers", gameId);

    try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            var doc1=docSnap.data();
            console.log("Document data:", doc1);
            var viewers = doc1.viewers;

            const count = Array.isArray(viewers) ? viewers.length : 0;

            var isExistingViewer = viewers.includes(audienceId);
            var totalViewers = 0;
            if (isExistingViewer) {
                totalViewers = count;
            }
            else
            {
                totalViewers = count+1;
                
                updateDoc(docRef, {
                    viewers: arrayUnion(audienceId) // Assuming 'users' is the array field
                });
                logAnalyticsEvent("web_viewers_new_added");
            }
            console.log('number of viewers-'+totalViewers);
            console.log('current viewer-'+viewers.includes(audienceId));
            if(totalViewers>viewerCountMax)
            {
                maxViewersReached = 1;
                var warning = document.getElementById("warningText");
                warning.textContent="Max viewers for free plan reached";
                logAnalyticsEvent("web_viewers_max_reached");
            }

            sessionStorage.setItem("viewerCheckForGame", gameId);
            sessionStorage.setItem("viewerCountReached", maxViewersReached);

        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching document:", error);
    }
}

function logAnalyticsEvent(event_name)
{
    if (analyticsDebugMode==1) {
        logEvent(analytics, event_name, {
            'debug_mode': true
        });
    }
    else
    {
        logEvent(analytics, event_name);
    }
}

// Function to handle visibility change
function handleVisibilityChange() {
    let now = new Date();
    let localTime = now.toLocaleTimeString();
    // const statusElement = document.getElementById('status');
    if (document.hidden) {
        // The page is now in the background
        // statusElement.textContent = "Page is hidden (background)";
        console.log(localTime+"-Page has gone to background");
    } else {
        // The page is now in the foreground
        // statusElement.textContent = "Page is visible (foreground)";
        console.log(localTime+"-Page has come back to foreground");
    }
}

function updateLookForDeviceType() {
    if (isMobile()) {
        console.log("Running on mobile device");
        document.getElementById("BrowserIdentifier").textContent = "Running on mobile device";
        document.getElementById("scoreUpdateTimeIndicator").className = "updateTimeMobile";
    } else {
        console.log("Running on desktop/laptop");
        document.getElementById("BrowserIdentifier").textContent = "Running on laptop device";
        document.getElementById("tennisScoreboard").className = "scoreboard";
    }
}


function isMobile() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isAndroid || isiOS;
}

function setCommentUpdates() {
    console.log("inside score update");
    unsubscribeHandler = onSnapshot(doc(db, "tennis_game_comments", gameId),
        testDoc => {
            if (testDoc.exists()) {
                console.log("comment doc found");
                console.log(testDoc.data());
                addComment(testDoc.data());
            }
            else {
                console.log("game not found - " + gameId);
            }
        }
    );
}

function addComment(comments) {
    const commentsDisplay = document.getElementById('commentsDisplay');
    while (commentsDisplay.firstChild) {
        commentsDisplay.removeChild(commentsDisplay.firstChild);
    }

    for (let index = 0; index < comments.comments.length; index++) {
        const element = comments.comments[index];
        const newComment = document.createElement('p');
        newComment.textContent = element.text;
        commentsDisplay.appendChild(newComment);
    }
}

function submitPollOption1()
{
    submitPoll(true);
}

function submitPollOption2()
{
    submitPoll(false);
}

function submitPoll(val)
{
    const docRef = doc(db, "tennis_live_votes", gameId);
    const voteData = {
        userid: audienceId,
        voteTeam1: val
    };

    updateDoc(docRef, {
        poll: arrayUnion(voteData)
    });
    console.log("submit polled - "+val);
}

async function submitCommentFromUser() {
    console.log("going to update comment");
    const docRef = doc(db, "tennis_game_comments", gameId);
    var textField = document.getElementById("commentInput");
    updateDoc(docRef, {
        comments: arrayUnion({
            text: textField.value,
            time: new Date()
        }) // Assuming 'users' is the array field
    });

    textField.value = '';
}

function registerEventListeners()
{
    var comButn = document.getElementById('commentButton1');
    comButn.addEventListener('click', submitCommentFromUser);
    document.getElementById('livePollOption1').addEventListener('click', submitPollOption1);
    document.getElementById('livePollOption2').addEventListener('click', submitPollOption2);

    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

function updateProgressBar()
{
    // Example: Update progress bar every 1 second
    const progressBar = document.getElementById('progressBarFill1');
    const progressBar2 = document.getElementById('progressBarFill2');
    let progress = 0;

    const intervalId = setInterval(() => {
        if (progress >= 100) {
            clearInterval(intervalId); 
        } else {
            progress += 10; // Increase progress by 10% each second
            progressBar.style.width = `${progress}%`;
            progressBar2.style.width = `${progress}%`;
        }
    }, 1000); // Update every 1 second
}

setInterval(updateScoreUpdateTimeIndicator, 6000);

var gameId;
var scoreId;
var audienceId;
var analytics;
var analyticsDebugMode=1;
var viewerCountMax=6;
var maxViewersReached=0;
var unsubscribeHandler;
var scoreUpdateTime = new Date(2020, 1, 1);
const firebaseApp = initFirebaseApp(firebaseConfig);
  
updateLookForDeviceType();
setGameId();
setViewerId();
// Initialize Firebase
const db = connectDatabase();
analytics = getAnalytics(firebaseApp);

// Initialize Remote Config
await remoteConfig();

getNumberOfViewers();
retrieveGame();
logAnalyticsEvent("test_web_event");
setCommentUpdates();
updateProgressBar();
registerEventListeners();