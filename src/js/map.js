(function () {
  const lat = document.querySelector("#lat").value || 19.4267286;
  const lng = document.querySelector("#lng").value || -99.1684757;
  const map = L.map("map").setView([lat, lng], 12);
  let marker;

  //Use Provider and Geocoder
  const geocodeService = L.esri.Geocoding.geocodeService();

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  //The pointer
  marker = new L.marker([lat, lng], {
    draggable: true,
    autoPan: true,
  }).addTo(map);

  //Detect the pointer movement
  marker.on("moveend", function (e) {
    marker = e.target;

    const position = marker.getLatLng();

    map.panTo(new L.LatLng(position.lat, position.lng));

    //Get street info when you release the pointer
    geocodeService
      .reverse()
      .latlng(position, 12)
      .run(function (error, result) {
        marker.bindPopup(result.address.LongLabel);

        //Fill out the fields
        document.querySelector(".street").textContent =
          result?.address?.Address ?? "";
        document.querySelector("#street").value =
          result?.address?.Address ?? "";
        document.querySelector("#lat").value = result?.latlng?.lat ?? "";
        document.querySelector("#lng").value = result?.latlng?.lng ?? "";
      });
  });
})();
