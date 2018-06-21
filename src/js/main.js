//load our custom elements
require("component-leaflet-map");
require("component-responsive-frame");

//get access to Leaflet and the map

var elements = document.querySelectorAll("leaflet-map");
elements.forEach((elem) => {
  var map = elem.map;

  var mainLayer = elem.lookup.mainlayer;
  mainLayer.eachLayer((tractLayer)=> {
    var { pit_2018, pit_2017, pit_percent, total_pop, pit_vs_pop, tract_num } = tractLayer.feature.properties;
    tractLayer.bindPopup(`<h1 class="bigheader">Census tract ${tract_num}</h1>
    <ul>
      <li>PIT 2018: ${pit_2018 === 25 ? '25 or less' : pit_2018}
      <li>PIT 2017: ${pit_2017 === 25 ? '25 or less' : pit_2017}
      <li>Percent increase: ${(pit_percent * 100).toFixed(0)}%
      <li>Tract's total population: ${total_pop}
      <li>PIT 2018 / total population: ${(pit_vs_pop * 100).toFixed(0)}%
    `);
  });

  map.scrollWheelZoom.disable();
  // Add city/neighborhood labels above tracts
  var topLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
    opacity: 0.8,
    pane: "markerPane",
  }).addTo(map);
});
