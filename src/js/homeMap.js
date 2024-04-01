(function () {
  const lat = 19.4267286;
  const lng = -99.1684757;
  const map = L.map("home-map").setView([lat, lng], 11);

  let markers = new L.FeatureGroup().addTo(map);

  let properties = [];

  //Filters
  const filters = {
    category: "",
    price: "",
  };

  const categoriesSelect = document.querySelector("#categories");
  const pricesSelect = document.querySelector("#prices");

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  //Filtering categories and prices
  categoriesSelect.addEventListener("change", (e) => {
    filters.category = +e.target.value;
    filterProperties();
  });

  pricesSelect.addEventListener("change", (e) => {
    filters.price = +e.target.value;
    filterProperties();
  });

  const getProperties = async () => {
    try {
      const url = "/api/properties";
      const response = await fetch(url);
      properties = await response.json();

      showProperties(properties);
    } catch (error) {
      console.error(error);
    }
  };

  const showProperties = (properties) => {
    //Clear the previous markers
    markers.clearLayers();

    properties.forEach((property) => {
      // console.log(property);
      //Add the pines
      const marker = new L.marker([property?.lat, property?.lng], {
        autoPan: true,
      }).addTo(map).bindPopup(`
          <p class="text-teal-500 font-bold">${property.category.name}</p>
          <h1 class="text-xl font-extrabold uppercase my-2">${property?.title}</h1>
          <img src="/uploads/${property?.image}" alt="Imagen de la propiedad ${property.title}">
          <p class="text-neutral-600 font-bold">${property.price.name}</p>
          <a href="/property/${property.id}" class="bg-teal-600 block p-2 text-center font-bold uppercase text-neutral-100">Ver propiedad</a>
        `);
      markers.addLayer(marker);
    });
  };

  const filterProperties = () => {
    const result = properties.filter(filterCategory).filter(filterPrice);

    showProperties(result);
  };

  const filterCategory = (property) =>
    filters.category ? property.categoryId === filters.category : property;

  const filterPrice = (property) =>
    filters.price ? property.priceId === filters.price : property;

  getProperties();
})();
