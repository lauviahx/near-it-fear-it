// global variables

var crimeLevelResults;
var closestCrimeResults;
var closestCrimeDistance;
var firstCrime;
var secondCrime;
var thirdCrime;
var firstCrimeTotal;
var secondCrimeTotal;
var thirdCrimeTotal;
var modal;
var crimes = [
  // array of crimes categories that we want to fetch from API (we're ignoring "other crime" category)
  "bicycle-theft",
  "other-theft",
  "theft-from-the-person", // personal theft
  "criminal-damage-arson",
  "vehicle-crime",
  "anti-social-behaviour", // antisocial behaviour
  "possession-of-weapons",
  "public-order", // weapons etc
  "violent-crime", // violence and sexual assults
  "drugs", // drugs
  "burglary",
  "robbery",
  "shoplifting" // property theft
];
var crimeCounter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var loaded = false;

getCurrentLocation(); // call the function to get user's location
function getCurrentLocation() {
  // geolocation function from web3school example
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {
      const lat = position.coords.latitude; // assign users position into variables
      const long = position.coords.longitude;

      // check different areas
      // const lat = 51.507947; // london
      // const long = -0.13148;

      // const lat = 51.454151; // bristol centre
      // const long = -2.589799;

      // const lat = 51.459851; // bristol clifton
      // const long = -2.615417;

      console.log(lat, long);
      // get crime returns a promise so we can add a .then
      getCrime(lat, long).then(function() {
        // run get crime
        console.log("got the crime data");
      });
    });
  }
}
function buttontrigger() {
  modal = document.querySelector("ons-modal");
  if (!loaded) {
    modal.show();
  } else {
    console.log(typeof modal);
    modal.hide();
    document.querySelector("#myNavigator").pushPage("page2.html");
  }
}
function showModal() {
  modal.show();
}

async function getCrime(lat, long) {
  let nwLat = lat - 0.005; // setting up polygon variabls to put in url and fetch crimes within the area
  let nwLong = long + 0.005;
  let neLat = lat + 0.005;
  let neLong = long + 0.005;
  let swLat = lat - 0.005;
  let swLong = long - 0.005;
  let seLat = lat + 0.005;
  let seLong = long - 0.005;

  let url =
    `https://data.police.uk/api/crimes-street/all-crime?poly=` +
    swLat +
    "," +
    swLong +
    ":" +
    nwLat +
    "," +
    nwLong +
    ":" +
    neLat +
    "," +
    neLong +
    ":" +
    seLat +
    "," +
    seLong; // returns all crimes at user's location / set polygon from last past month (February atm)

  // let url = `https://data.police.uk/api/crimes-street/all-crime?lat=${lat}&lng=${long}`; // returns all crimes at user's location from last past month (February atm)
  const response = await fetch(url);
  const crimeData = await response.json();

  crimeLevel(crimeData);
  nearCrime(crimeData, lat, long);
  topCrimes(crimeData);

  if (typeof crimeData === "object") {
    if (typeof modal === "object") {
      modal.hide();
      document.querySelector("#myNavigator").pushPage("page2.html");
    }
    loaded = true;
  }
  return crimeData;
}

function nearCrime(crimeData, lat, long) {
  let distance = [];
  let obj = {};

  for (let j = 0; j < crimeData.length; j++) {
    // loop through every crime
    let unit = "K";
    let lat2 = crimeData[j].location.latitude;
    let lon2 = crimeData[j].location.longitude;

    if (lat === lat2 && long === lon2) {
      // calculate distance between two pints and return distance in kilometers
      // https://www.geodatasource.com/developers/javascript
      return 0;
    } else {
      var radlat1 = (Math.PI * lat) / 180;
      var radlat2 = (Math.PI * lat2) / 180;
      var theta = long - lon2;
      var radtheta = (Math.PI * theta) / 180;
      var dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit === "K") {
        dist = dist * 1.609344;
      }
    }
    obj = {};
    obj["distance"] = dist; // add distance to the object
    obj["crime"] = crimeData[j].category; // add category to each objects
    distance.push(obj); // push object into array (all within loop function)
  }
  distance.sort(compareValues("distance", "asc")); // sorting the array in ascending order

  if (
    // grouping crimes into categories
    distance[0].crime === "bicycle-theft" ||
    distance[0].crime === "other-theft" ||
    distance[0].crime === "theft-from-the-person"
  ) {
    distance[0].crime = "Theft of personal belongings";
  } else if (
    distance[0].crime === "criminal-damage-arson" ||
    distance[0].crime === "vehicle-crime" ||
    distance[0].crime === "anti-social-behaviour"
  ) {
    distance[0].crime = "Anti social behaviour offence";
  } else if (
    distance[0].crime === "possession-of-weapons" ||
    distance[0].crime === "public-order"
  ) {
    distance[0].crime = "Usage and possession of weapons";
  } else if (distance[0].crime === "violent-crime") {
    distance[0].crime = "Violence and sexual assult";
  } else if (distance[0].crime === "drugs") {
    distance[0].crime = "Drug offence";
  } else if (
    distance[0].crime === "shoplifting" ||
    distance[0].crime === "burglary" ||
    distance[0].crime === "robbery"
  ) {
    distance[0].crime = "Property theft";
  }

  let categ = distance[0].crime;
  let distan = distance[0].distance;
  let hh = distan * 1000;

  let roundx = Math.round(hh);

  closestCrimeResults = categ; // assign closest crime category

  closestCrimeDistance = roundx + " meters away"; // assign closest crime distance
  console.log(closestCrimeDistance);
}

function crimeLevel(crimeData) {
  let averageLevel = (crimeData.length / 10394) * 100; // calculate crimes level in % from total number of crimes in area
  //10394 is an average number of crimes in UK in the past year accoding to data https://www.adt.co.uk/crime-in-my-area?fbclid=IwAR02hqWdJBANrNoFmlCjB7yBPtvI3SSA5BskdcgztIXMvvgrtPhfmzCa_Vg which use data from crime stats that are paid
  let round = averageLevel;
  round = round.toFixed(2); // round average to 2 decimal places

  let level, message;
  if (round < 3) {
    level = "LOW";
    message = "STAY ALARMED!";
  } else if (3 < round && round < 5) {
    level = "MEDIUM";
    message = "STAY SAFE!";
  } else {
    level = "HIGH";
    message = "BE CAREFUL!";
  } // calculate the crimes level range and assign message to each

  crimeLevelResults = level + " LEVEL OF CRIMES! <br>" + message; // assign message to variable
}

function topCrimes(crimeData) {
  for (let i = 0; i < crimeData.length; i++) {
    let checkIndex = crimes.indexOf(crimeData[i].category);
    if (checkIndex >= 0) {
      crimeCounter[checkIndex] += 1;
    }
  } // filter API output by categories that we are interested in and put in array
  // grouping crimes into bigger categories
  let t1 = crimeCounter[0];
  let t2 = crimeCounter[1];
  let t3 = crimeCounter[2];
  let sumtheft = t1 + t2 + t3; // all personal theft related crimes in the area

  let a1 = crimeCounter[3];
  let a2 = crimeCounter[4];
  let a3 = crimeCounter[5];
  let sumantisocial = a1 + a2 + a3; // all anti social related crimes in the area

  let w1 = crimeCounter[6];
  let w2 = crimeCounter[7];
  let sumweapons = w1 + w2; // all weapons possession related crimes in the area

  let v1 = crimeCounter[8]; // voilent crimes including sexual offences in the area

  let drugs = crimeCounter[9]; // drugs crimes in the area

  let p1 = crimeCounter[10];
  let p2 = crimeCounter[11];
  let p3 = crimeCounter[12];
  let sumprop = p1 + p2 + p3; // all property theft crimes in the area

  const crimesInArea = [
    { category: "THEFTS OF PERSONAL BELONGINGS", total: sumtheft },
    { category: "ANTI SOCIAL BEHAVIOUR OFFENSES", total: sumantisocial },
    { category: "USAGES AND POSSESSIONS OF WEAPONS", total: sumweapons },
    { category: "VIOLENCE AND SEXUAL ASSULTS", total: v1 },
    { category: "DRUG OFFENCES", total: drugs },
    { category: "PROPERTY THEFTS", total: sumprop }
  ]; // create an array of crimes in grouped categories

  crimesInArea.sort(compareValues("total", "desc")); // sorting the array in descending order

  firstCrime = crimesInArea[0].category; // assign top 3 crime categories
  secondCrime = crimesInArea[1].category;
  thirdCrime = crimesInArea[2].category;

  firstCrimeTotal = firstCrime + "<br>Total: " + crimesInArea[0].total; // categories with total number
  secondCrimeTotal = secondCrime + "<br>Total: " + crimesInArea[1].total;
  thirdCrimeTotal = thirdCrime + "<br>Total: " + crimesInArea[2].total;
}
function compareValues(key, order = "asc") {
  // filter function from https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = typeof a[key] === "string" ? a[key].toUpperCase() : a[key];
    const varB = typeof b[key] === "string" ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return order === "desc" ? comparison * -1 : comparison;
  };
}

// onsen code

var closestVideo;
let distanceDiv;
let progressBar;
let loading;
let completed;
let headerLogo;
let message;
let myVideo;
let firstCrimeVideo;
let secondCrimeVideo;
let thirdCrimeVideo;

//       let i = 0;
// function bar(){
// if (i === 0) {
//   i = 1;
//   var elem = document.getElementById("myBar");
//   let width = 1;
//   let id = setInterval(frame, 100);
//   function frame() {
//     if (width >= 100) {
//       clearInterval(id);
//       i = 0;
//     } else {
//       width++;
//       elem.style.width = width + "%";
//     }
//   }
// }}

document.addEventListener("init", function(event) {
  let page = event.target;

  if (page.id === "page1") {
    // page.querySelector("#push-button").onclick = function() {
    //   document.querySelector("#myNavigator").pushPage("page2.html"); // delete data unless passing data between pages
    // };

    page.querySelector("#push-button2").onclick = function() {
      document.querySelector("#myNavigator").pushPage("page8.html"); // delete data unless passing data between pages
    };
  } else if (page.id === "page2") {
    let crimeCategory = closestCrimeResults;

    page.querySelector(
      "#closest-crime-distance"
    ).innerHTML = closestCrimeDistance;

    distanceDiv = page.querySelector("#distancediv");
    let undefinedDiv = page.querySelector("#undefineddiv");
    progressBar = page.querySelector("#progress-bar");
    loading = page.querySelector("#loading");
    completed = page.querySelector("#completed");

    headerLogo = page.querySelector("#header-logo");
    message = page.querySelector("#message");
    myVideo = page.querySelector("#my-video");

    setTimeout(function() {
      if (
        closestCrimeDistance === undefined || // if undefined should show message and return to home page
        closestCrimeDistance === null // but for some reason is not working, interface just displays undefined
      ) {
        // works only if i don'y assign any data to this wariable in the code
        console.log("undefined");
        loading.style.display = "none";
        undefinedDiv.style.display = "block"; // display error message
        setTimeout(function() {
          window.location.reload(); // return to page 1
        }, 3000);
      } else {
        loading.style.display = "none"; // if works fine, display distance
        distanceDiv.style.display = "block";
      }
    }, 5000);

    setTimeout(function() {
      headerLogo.style.display = "none"; // hide all other divs
      progressBar.style.display = "none";
      message.style.display = "none";
      completed.style.display = "none";
      let videos = {
        "Drug offence": "videos/drugs.mp4",
        "Property theft": "videos/property-theft.mp4",
        "Theft of personal belongings": "videos/personal-theft.mp4",
        "Anti social behaviour offence": "videos/anti-social.mp4",
        "Usage and possession of weapons": "videos/weapons.mp4",
        "Violence and sexual assult": "videos/sexual-assult.mp4"
      };
      let selectedVideo = videos[crimeCategory];
      myVideo.src = selectedVideo; // assign video category to play
      myVideo.style.display = "block"; // display video
      myVideo.play();
      myVideo.addEventListener("ended", function() {
        // if video ended go to page 3
        document.querySelector("#myNavigator").pushPage("page3.html");
      });
    }, 10200);
  } else if (page.id === "page3") {
    page.querySelector("#closest-crime").innerHTML = closestCrimeResults;
    page.querySelector(
      "#closest-crime-distance2"
    ).innerHTML = closestCrimeDistance;

    page.querySelector("#trigger-replay").onclick = function() {
      document.querySelector("#myNavigator").pushPage("page4.html");
    };

    page.querySelector("#crime-level-results").innerHTML = crimeLevelResults;
    page.querySelector("#first").innerHTML = firstCrimeTotal;
    page.querySelector("#second").innerHTML = secondCrimeTotal;
    page.querySelector("#third").innerHTML = thirdCrimeTotal;

    page.querySelector("#trigger-crime-page").onclick = function() {
      document.querySelector("#myNavigator").pushPage("page5.html");
    };
    page.querySelector("#trigger-crime-page2").onclick = function() {
      document.querySelector("#myNavigator").pushPage("page6.html");
    };
    page.querySelector("#trigger-crime-page3").onclick = function() {
      document.querySelector("#myNavigator").pushPage("page7.html");
    };
    page.querySelector("#start-again").onclick = function() {
      document.querySelector("#myNavigator").pushPage("page1.html");
    };
    page.querySelector("#push-button3").onclick = function() {
      document.querySelector("#myNavigator").pushPage("page8.html");
    };
  } else if (page.id === "page4") {
    let crimeCategory = closestCrimeResults;

    closestVideo = page.querySelector("#closest-video");
    let videos = {
      "Drug offence": "videos/drugs.mp4",
      "Property theft": "videos/property-theft.mp4",
      "Theft of personal belongings": "videos/personal-theft.mp4",
      "Anti social behaviour offence": "videos/anti-social.mp4",
      "Usage and possession of weapons": "videos/weapons.mp4",
      "Violence and sexual assult": "videos/sexual-assult.mp4"
    };

    let selectedVideo = videos[crimeCategory];
    closestVideo.src = selectedVideo;
    closestVideo.play();
    closestVideo.addEventListener("ended", function() {
      document.querySelector("#myNavigator").pushPage("page3.html");
    });
  } else if (page.id === "page5") {
    let crimeCategory = firstCrime;
    firstCrimeVideo = page.querySelector("#first-video");
    let videos = {
      "DRUG OFFENCES": "videos/drugs.mp4",
      "PROPERTY THEFTS": "videos/property-theft.mp4",
      "THEFTS OF PERSONAL BELONGINGS": "videos/personal-theft.mp4",
      "ANTI SOCIAL BEHAVIOUR OFFENSES": "videos/anti-social.mp4",
      "USAGES AND POSSESSIONS OF WEAPONS": "videos/weapons.mp4",
      "VIOLENCE AND SEXUAL ASSULTS": "videos/sexual-assult.mp4"
    };
    let selectedVideo = videos[crimeCategory];
    firstCrimeVideo.src = selectedVideo;

    firstCrimeVideo.play();

    firstCrimeVideo.addEventListener("ended", function() {
      document.querySelector("#myNavigator").pushPage("page3.html");
    });
  } else if (page.id === "page6") {
    let crimeCategory = secondCrime;
    secondCrimeVideo = page.querySelector("#second-video");
    let videos = {
      "DRUG OFFENCES": "videos/drugs.mp4",
      "PROPERTY THEFTS": "videos/property-theft.mp4",
      "THEFTS OF PERSONAL BELONGINGS": "videos/personal-theft.mp4",
      "ANTI SOCIAL BEHAVIOUR OFFENSES": "videos/anti-social.mp4",
      "USAGES AND POSSESSIONS OF WEAPONS": "videos/weapons.mp4",
      "VIOLENCE AND SEXUAL ASSULTS": "videos/sexual-assult.mp4"
    };
    let selectedVideo = videos[crimeCategory];
    secondCrimeVideo.src = selectedVideo;

    secondCrimeVideo.play();

    secondCrimeVideo.addEventListener("ended", function() {
      document.querySelector("#myNavigator").pushPage("page3.html");
    });
  } else if (page.id === "page7") {
    let crimeCategory = thirdCrime;
    thirdCrimeVideo = page.querySelector("#third-video");
    let videos = {
      "DRUG OFFENCES": "videos/drugs.mp4",
      "PROPERTY THEFTS": "videos/property-theft.mp4",
      "THEFTS OF PERSONAL BELONGINGS": "videos/personal-theft.mp4",
      "ANTI SOCIAL BEHAVIOUR OFFENSES": "videos/anti-social.mp4",
      "USAGES AND POSSESSIONS OF WEAPONS": "videos/weapons.mp4",
      "VIOLENCE AND SEXUAL ASSULTS": "videos/sexual-assult.mp4"
    };
    let selectedVideo = videos[crimeCategory];
    thirdCrimeVideo.src = selectedVideo;

    thirdCrimeVideo.play();

    thirdCrimeVideo.addEventListener("ended", function() {
      document.querySelector("#myNavigator").pushPage("page3.html");
    });
  } else if (page.id === "page8") {
    page.querySelector("#view-all").onclick = function() {
      document.querySelector("#myNavigator").pushPage("page9.html");
    };
  } else if (page.id === "page9") {
    //       document.querySelector('#goback').onClick = function (event) {
    //   document.querySelector('ons-navigator').resetToPage('page1.html');
    // };
    let buttons = page.querySelector("#buttons");
    let title = page.querySelector(".center");
    let logoHeader = page.querySelector("#logoheader");
    let backbutton = page.querySelector("#goback");
    let video1 = page.querySelector("#video1");
    let video2 = page.querySelector("#video2");
    let video3 = page.querySelector("#video3");
    let video4 = page.querySelector("#video4");
    let video5 = page.querySelector("#video5");
    let video6 = page.querySelector("#video6");

    page.querySelector("#trigger-video1").onclick = function() {
      buttons.style.display = "none";
      title.style.display = "none";
      logoHeader.style.display = "none";
      backbutton.style.display = "none";
      video1.style.display = "block";
      video1.play();

      video1.addEventListener("ended", function() {
        buttons.style.display = "block";
        title.style.display = "block";
        logoHeader.style.display = "block";
        backbutton.style.display = "block";

        video1.style.display = "none";
      });
    };
    page.querySelector("#trigger-video2").onclick = function() {
      buttons.style.display = "none";
      title.style.display = "none";
      logoHeader.style.display = "none";
      backbutton.style.display = "none";
      video2.style.display = "block";
      video2.play();

      video2.addEventListener("ended", function() {
        buttons.style.display = "block";
        title.style.display = "block";
        logoHeader.style.display = "block";
        backbutton.style.display = "block";
        video2.style.display = "none";
      });
    };
    page.querySelector("#trigger-video3").onclick = function() {
      buttons.style.display = "none";
      title.style.display = "none";
      logoHeader.style.display = "none";
      backbutton.style.display = "none";
      video3.style.display = "block";
      video3.play();

      video3.addEventListener("ended", function() {
        buttons.style.display = "block";
        title.style.display = "block";
        logoHeader.style.display = "block";
        backbutton.style.display = "block";
        video3.style.display = "none";
      });
    };
    page.querySelector("#trigger-video4").onclick = function() {
      buttons.style.display = "none";
      title.style.display = "none";
      logoHeader.style.display = "none";
      backbutton.style.display = "none";
      video4.style.display = "block";
      video4.play();

      video4.addEventListener("ended", function() {
        buttons.style.display = "block";
        title.style.display = "block";
        logoHeader.style.display = "block";
        backbutton.style.display = "block";
        video4.style.display = "none";
      });
    };
    page.querySelector("#trigger-video5").onclick = function() {
      buttons.style.display = "none";
      title.style.display = "none";
      logoHeader.style.display = "none";
      backbutton.style.display = "none";
      video5.style.display = "block";
      video5.play();

      video5.addEventListener("ended", function() {
        buttons.style.display = "block";
        title.style.display = "block";
        logoHeader.style.display = "block";
        backbutton.style.display = "block";
        video5.style.display = "none";
      });
    };
    page.querySelector("#trigger-video6").onclick = function() {
      buttons.style.display = "none";
      title.style.display = "none";
      logoHeader.style.display = "none";
      backbutton.style.display = "none";
      video6.style.display = "block";
      video6.play();

      video6.addEventListener("ended", function() {
        buttons.style.display = "block";
        title.style.display = "block";
        logoHeader.style.display = "block";
        backbutton.style.display = "block";
        video6.style.display = "none";
      });
    };
  }
});
