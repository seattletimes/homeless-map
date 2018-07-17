// Expand topojson into geojson and put into geodata
var topojson = require("topojson-client");
var expandedData = topojson.feature(topoData, topoData.objects.pit_final);
document.querySelector("geo-data").innerHTML = JSON.stringify(expandedData);

//load our custom elements
require("component-leaflet-map");
require("component-responsive-frame");

// helpers
var commafy = function commafy(num) {
  return num.toLocaleString("en-US");
};

//get access to Leaflet and the map
var elem = document.querySelector("leaflet-map");
var map = elem.map;
var mainLayer = elem.lookup.mainlayer;

var flyToLookup = {};
mainLayer.eachLayer((tractLayer) => {
  var { pit_2018, pit_2017, pit_percent, total_pop, tract_num } = tractLayer.feature.properties;
  var storyDetail = "";

  if (window.stories[tract_num]) {
    tractLayer.setStyle({ weight: 2, opacity: 1 });
    var story = window.stories[tract_num];
    storyDetail = `<div class="story=detail">
      <h2><a href="${story.url}">${story.headline}</a></h2>
      <img src="${story.image}" alt="${story.alt}">
    </div>`;
    flyToLookup[tract_num] = tractLayer.getBounds().getCenter();
  }

  tractLayer.bindPopup(`<h1 class="bigheader">Census tract ${tract_num}</h1>
  ${storyDetail}
  <ul>
    <li>PIT 2018: ${pit_2018 === 25 ? '25 or fewer' : commafy(pit_2018)}
    <li>PIT 2017: ${pit_2017 === 25 ? '25 or fewer' : commafy(pit_2017)}
    <li>Percent increase: ${(pit_percent * 100).toFixed(0)}%
    <li>Tract's total population: ${commafy(total_pop)}
  `);
});

map.scrollWheelZoom.disable();
// Add city/neighborhood labels above tracts
var topLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
  opacity: 0.8,
  pane: "markerPane",
}).addTo(map);


document.querySelectorAll(".story").forEach((storyDiv) => {
  var tractNum = storyDiv.getAttribute("data-tract");
  var flyTo = () => {
    map.flyTo(flyToLookup[tractNum], 12, { duration: 1 });
  }
  storyDiv.addEventListener("mouseover", flyTo);
  storyDiv.addEventListener("focus", flyTo);
});