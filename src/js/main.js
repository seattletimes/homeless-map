var $ = require("./lib/qsa");
var debounce = require("./lib/debounce");

// Expand topojson into geojson and put into geodata
var topojson = require("topojson-client");
var expandedData = topojson.feature(topoData, topoData.objects.pit_final);
$.one("geo-data").innerHTML = JSON.stringify(expandedData);

//load our custom elements
require("component-leaflet-map");
require("component-responsive-frame");

// helpers
var commafy = function commafy(num) {
  return num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// dumb global
var focusedFromPopup = false;

//get access to Leaflet and the map
var elem = $.one("leaflet-map");
var map = elem.map;
var mainLayer = elem.lookup.mainlayer;

var flyToLookup = {};
mainLayer.eachLayer((tractLayer) => {
  var { pit_2018, pit_2017, pit_percent, total_pop, tract_num } = tractLayer.feature.properties;
  var storyDetail = "";

  if (window.stories[tract_num]) {
    tractLayer.setStyle({ weight: 3, opacity: 1 });
    var story = window.stories[tract_num];
    storyDetail = `<a href="${story.url}">Related story: ${story.headline}</a>`;
    flyToLookup[tract_num] = tractLayer.getBounds().getCenter();
    tractLayer.on("click", () => {
      focusedFromPopup = true;
      $.one(`[data-tract="${tract_num}"]`).focus();
    });
  }

  tractLayer.bindPopup(`<h1 class="bigheader">Census tract ${tract_num}</h1>
  <ul>
    <li class="header block">All Home's count of homeless people</li>
    <li>
      <span class="left">Jan. 2018: </span>
      <span class="right">${pit_2018 === 25 ? '25 or fewer' : commafy(pit_2018)} people</span></li>
    <li>
      <span class="left">Jan. 2017: </span>
      <span class="right">${pit_2017 === 25 ? '25 or fewer' : commafy(pit_2017)} people</span>
    </li>
    <li>
      <span class="left">Change, 2017-2018: </span>
      <span class="right">${pit_percent > 0 ? '+' : ''}${commafy(pit_percent * 100)}%</span>
    </li>
    <li>&nbsp;</li>
    <li class="block">
      Tract's total population (2017 estimate):<br>
      ${commafy(total_pop)} people
    </li>
  </ul>
  ${storyDetail}
  `, { maxWidth: 200 });
});

map.scrollWheelZoom.disable();
// Add city/neighborhood labels above tracts
var topLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
  opacity: 0.6,
  pane: "markerPane",
}).addTo(map);


var flyTo = debounce((ev) => {
  if (focusedFromPopup) {
    focusedFromPopup = false;
    return;
  }
  var tractNum = ev.target.getAttribute("data-tract");
  if (map.getCenter() === flyToLookup[tractNum]) return;
  map.closePopup();
  map.flyTo(flyToLookup[tractNum], 12.5, { duration: 1 });
});

$(".story").forEach((storyDiv) => {
  storyDiv.addEventListener("click", flyTo);
  storyDiv.addEventListener("focus", flyTo);
});