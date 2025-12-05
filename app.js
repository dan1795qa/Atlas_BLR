// Координаты областных центров
const capitalCoords = {
  Минск: [53.9006, 27.559],
  Брест: [52.0975, 23.734],
  Гродно: [53.6884, 23.8258],
  Витебск: [55.1904, 30.2049],
  Могилев: [53.9007, 30.3313],
  Гомель: [52.4345, 30.9754],
};

// Инициализация карты
const map = L.map("map").setView([53.7098, 27.9534], 7);

// Добавление базового слоя карты
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
  maxZoom: 18,
  minZoom: 6,
}).addTo(map);

// Группы слоев
const regionsLayer = L.layerGroup().addTo(map);
const centersLayer = L.layerGroup().addTo(map);
const districtsLayer = L.layerGroup();
const riversLayer = L.layerGroup();
const lakesLayer = L.layerGroup();
const roadsLayer = L.layerGroup();
const railwaysLayer = L.layerGroup();
const reliefLayer = L.layerGroup();

// Состояние видимости слоев
let regionsVisible = true;
let districtMode = false;
const layerStates = {
  rivers: false,
  lakes: false,
  roads: false,
  railways: false,
  relief: false,
};

// Хранилище для полигонов и данных
const regionPolygons = {};
const districtPolygons = {};
let geojsonData = null;
let currentDistrictData = null;

// Названия областей и соответствующие файлы
const regionFiles = {
  "Минская область": "geojson/Минская область.geojson",
  "Брестская область": "geojson/Брестская область.geojson",
  "Витебская область": "geojson/Витебская область.geojson",
  "Гомельская область": "geojson/Гомельская область.geojson",
  "Гродненская область": "geojson/Гродненская область.geojson",
  "Могилевская область": "geojson/Могилевская область.geojson",
};

// Функция переключения режима область/районы
function toggleDistrictMode() {
  districtMode = !districtMode;
  const toggleBtn = document.getElementById("toggleMode");

  if (districtMode) {
    toggleBtn.classList.add("districts-mode");
    toggleBtn.textContent = "🏛️ Области";
    showRegionSelection();
  } else {
    toggleBtn.classList.remove("districts-mode");
    toggleBtn.textContent = "🏛️ Районы";
    closeDistrictModal();
    closeDistrictsListModal();
    districtsLayer.clearLayers();
    if (map.hasLayer(districtsLayer)) {
      map.removeLayer(districtsLayer);
    }
  }
}

// Показать выбор области
function showRegionSelection() {
  const modal = document.getElementById("districtModal");
  const regionsList = document.getElementById("regionsList");
  regionsList.innerHTML = "";

  Object.keys(regionFiles).forEach((regionName) => {
    const btn = document.createElement("button");
    btn.className = "region-btn";
    btn.textContent = regionName;
    btn.onclick = () => loadDistrictsByRegion(regionName);
    regionsList.appendChild(btn);
  });

  modal.classList.add("show");
}

// Загрузить районы для выбранной области
function loadDistrictsByRegion(regionName) {
  const filePath = regionFiles[regionName];

  fetch(filePath)
    .then((response) => response.json())
    .then((data) => {
      currentDistrictData = data;
      showDistrictsList(regionName, data);
    })
    .catch((error) => {
      console.error("Ошибка загрузки районов:", error);
      alert("Не удалось загрузить районы");
    });
}

// Показать список районов
function showDistrictsList(regionName, data) {
  const modal = document.getElementById("districtModal");
  const listModal = document.getElementById("districtsListModal");
  const districtsList = document.getElementById("districtsList");
  const title = document.getElementById("districtRegionTitle");

  title.textContent = `Районы: ${regionName}`;
  districtsList.innerHTML = "";

  // Собираем уникальные районы из GeoJSON
  const districts = new Map();

  data.features.forEach((feature) => {
    // Пытаемся получить название района из свойств
    const districtName =
      feature.properties.name ||
      feature.properties.district ||
      feature.properties.DISTRICT;
    if (districtName && feature.geometry.type === "Polygon") {
      if (!districts.has(districtName)) {
        districts.set(districtName, feature);
      }
    }
  });

  // Если районы не найдены, показываем все полигоны как районы
  if (districts.size === 0) {
    data.features.forEach((feature, index) => {
      if (feature.geometry.type === "Polygon") {
        const name = feature.properties.name || `Район ${index + 1}`;
        if (!districts.has(name)) {
          districts.set(name, feature);
        }
      }
    });
  }

  districts.forEach((feature, districtName) => {
    const btn = document.createElement("button");
    btn.className = "district-btn";
    btn.textContent = districtName;
    btn.onclick = () => showDistrict(districtName, feature);
    districtsList.appendChild(btn);
  });

  modal.classList.remove("show");
  listModal.classList.add("show");
}

// Показать выбранный район
function showDistrict(districtName, feature) {
  // Очистить предыдущие районы
  districtsLayer.clearLayers();

  // Создать полигон района
  L.geoJSON(feature, {
    style: {
      color: "#FF6B6B",
      fillColor: "#FF6B6B",
      fillOpacity: 0.3,
      weight: 3,
      dashArray: "5, 5",
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`<strong>${districtName}</strong>`);
    },
  }).addTo(districtsLayer);

  // Добавить слой районов на карту
  if (!map.hasLayer(districtsLayer)) {
    districtsLayer.addTo(map);
  }

  // Получить границы района и приблизить карту
  const bounds = L.geoJSON(feature).getBounds();
  map.fitBounds(bounds, {
    padding: [50, 50],
    maxZoom: 12,
  });

  // Закрыть модальные окна
  closeDistrictsListModal();

  // Показать информацию о районе
  const infoPanel = document.getElementById("infoPanel");
  const infoPanelContent = document.getElementById("infoPanelContent");
  infoPanelContent.innerHTML = `
    <h2>${districtName}</h2>
    <div class="info-item">
      <span class="info-label">📍 Район:</span>
      <span class="info-value">${
        feature.properties.name || "Информация отсутствует"
      }</span>
    </div>
  `;
  infoPanel.classList.add("show");
}

// Закрыть модальные окна
function closeDistrictModal() {
  document.getElementById("districtModal").classList.remove("show");
}

function closeDistrictsListModal() {
  document.getElementById("districtsListModal").classList.remove("show");
}

// Загрузка GeoJSON данных
fetch("belarus-regions.geojson")
  .then((response) => response.json())
  .then((data) => {
    geojsonData = data;

    // Создание полигонов из GeoJSON (только области - Polygon)
    L.geoJSON(data, {
      filter: function (feature) {
        // Показываем только полигоны (области), исключаем точки (города)
        return feature.geometry.type === "Polygon";
      },
      style: function (feature) {
        return {
          color: feature.properties.color,
          fillColor: feature.properties.color,
          fillOpacity: 0.4,
          weight: 3,
        };
      },
      onEachFeature: function (feature, layer) {
        const regionName = feature.properties.name;
        const props = feature.properties;

        // Сохранение полигона
        regionPolygons[regionName] = layer;

        // Добавление всплывающей подсказки
        layer.bindTooltip(regionName, {
          permanent: false,
          direction: "center",
          className: "region-tooltip",
        });

        // Обработчик клика на область
        layer.on("click", function () {
          showRegionInfo(regionName, props);
        });

        // Эффект при наведении
        layer.on("mouseover", function () {
          this.setStyle({
            fillOpacity: 0.7,
            weight: 5,
          });
        });

        layer.on("mouseout", function () {
          this.setStyle({
            fillOpacity: 0.4,
            weight: 3,
          });
        });

        // Добавление в слой
        regionsLayer.addLayer(layer);
      },
    });

    // Создание маркеров городов (областных центров и столицы)
    data.features.forEach((feature) => {
      const props = feature.properties;
      const regionName = props.name;

      // Проверяем, является ли это городом (Point) или областью (Polygon)
      if (feature.geometry.type === "Point") {
        // Это город - используем координаты из geometry
        const coords = feature.geometry.coordinates.slice().reverse(); // [lng, lat] -> [lat, lng]

        // Определяем, является ли город столицей
        const isCapital = props.isCapital || regionName === "Минск";

        // Размер маркера: столица - 20px, областные центры - 15px
        const markerSize = isCapital ? 20 : 15;
        const borderWidth = isCapital ? 3 : 2;

        // Создание пульсирующей иконки для города
        const cityIcon = L.divIcon({
          className: "custom-marker city-marker-wrapper",
          html: `<div class="${
            isCapital ? "capital-marker" : "city-marker-pulse"
          }" style="
            background-color: ${props.color};
            width: ${markerSize}px;
            height: ${markerSize}px;
            border-radius: 50%;
            border: ${borderWidth}px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            cursor: pointer;
          "></div>`,
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize / 2, markerSize / 2],
        });

        const marker = L.marker(coords, { icon: cityIcon });

        // Обработчик клика - показываем информацию о городе
        marker.on("click", function () {
          showCityInfo(regionName, props);
        });

        // Эффект при наведении
        marker.on("mouseover", function () {
          this.setIcon(
            L.divIcon({
              className: "custom-marker city-marker-wrapper",
              html: `<div class="${
                isCapital ? "capital-marker" : "city-marker-pulse"
              }" style="
              background-color: ${props.color};
              width: ${markerSize + 5}px;
              height: ${markerSize + 5}px;
              border-radius: 50%;
              border: ${borderWidth}px solid white;
              box-shadow: 0 6px 20px rgba(0,0,0,0.5);
              transition: all 0.3s ease;
              cursor: pointer;
            "></div>`,
              iconSize: [markerSize + 5, markerSize + 5],
              iconAnchor: [(markerSize + 5) / 2, (markerSize + 5) / 2],
            })
          );
        });

        marker.on("mouseout", function () {
          this.setIcon(cityIcon);
        });

        centersLayer.addLayer(marker);
      }
    });

    console.log("GeoJSON данные загружены успешно!");
  })
  .catch((error) => {
    console.error("Ошибка загрузки GeoJSON:", error);
  });

// Функция отображения информации о городе
function showCityInfo(cityName, cityData) {
  const infoPanel = document.getElementById("infoPanel");
  const infoPanelHeader = document.getElementById("infoPanelHeader");
  const infoPanelContent = document.getElementById("infoPanelContent");

  // Формирование списка национальностей
  let nationalitiesHTML = '<div class="nationality-list">';
  Object.keys(cityData.nationalities).forEach((nationality) => {
    nationalitiesHTML += `
      <div class="nationality-item">
        • ${nationality}: ${cityData.nationalities[nationality]}%
      </div>
    `;
  });
  nationalitiesHTML += "</div>";

  // Определяем, является ли город столицей
  const isCapital = cityData.isCapital || cityName === "Минск";
  const badge = isCapital
    ? '<span class="city-badge capital-badge">Столица</span>'
    : '<span class="city-badge">Областной центр</span>';

  // Заголовок (не скроллится)
  infoPanelHeader.innerHTML = `
    <h2>${cityName}${badge}</h2>
  `;

  // Контент (скроллится)
  infoPanelContent.innerHTML = `
    ${
      cityData.founded
        ? `
    <div class="info-item">
      <span class="info-label">🏛️ Год основания:</span>
      <span class="info-value">${cityData.founded} г.</span>
    </div>
    `
        : ""
    }
    <div class="info-item">
      <span class="info-label">👥 Население:</span>
      <span class="info-value">${cityData.population.toLocaleString(
        "ru-RU"
      )} чел.</span>
    </div>
    <div class="info-item">
      <span class="info-label">📏 Площадь:</span>
      <span class="info-value">${cityData.area.toLocaleString(
        "ru-RU"
      )} км²</span>
    </div>
    <div class="info-item">
      <span class="info-label">📊 Плотность:</span>
      <span class="info-value">${(cityData.population / cityData.area).toFixed(
        1
      )} чел/км²</span>
    </div>
    ${
      cityData.description
        ? `<div class="info-description">${cityData.description}</div>`
        : ""
    }
    <div class="info-item">
      <span class="info-label">🌍 Национальный состав:</span>
      ${nationalitiesHTML}
    </div>
  `;

  infoPanel.classList.add("show");

  // Приближение карты отключено - карта остается на текущей позиции
}

// Функция отображения информации об области
function showRegionInfo(regionName, region) {
  const infoPanel = document.getElementById("infoPanel");
  const infoPanelHeader = document.getElementById("infoPanelHeader");
  const infoPanelContent = document.getElementById("infoPanelContent");

  // Поиск населения областного центра
  let capitalPopulation = null;
  if (geojsonData && region.capital) {
    const cityFeature = geojsonData.features.find(
      (feature) =>
        feature.properties.name === region.capital &&
        feature.geometry.type === "Point"
    );
    if (cityFeature) {
      capitalPopulation = cityFeature.properties.population;
    }
  }

  let nationalitiesHTML = '<div class="nationality-list">';
  Object.keys(region.nationalities).forEach((nationality) => {
    nationalitiesHTML += `
      <div class="nationality-item">
        • ${nationality}: ${region.nationalities[nationality]}%
      </div>
    `;
  });
  nationalitiesHTML += "</div>";

  // Заголовок (не скроллится)
  infoPanelHeader.innerHTML = `
    <h2>${regionName}</h2>
  `;

  // Формирование строки с населением
  let populationHTML = region.population.toLocaleString("ru-RU");
  if (capitalPopulation) {
    populationHTML += ` <span style="color: #666; font-size: 0.9em;">(в т.ч. ${
      region.capital
    }: ${capitalPopulation.toLocaleString("ru-RU")})</span>`;
  }

  // Контент (скроллится)
  infoPanelContent.innerHTML = `
    <div class="info-item">
      <span class="info-label">🏛️ Областной центр:</span>
      <span class="info-value">${region.capital}</span>
    </div>
    <div class="info-item">
      <span class="info-label">👥 Население:</span>
      <span class="info-value">${populationHTML} чел.</span>
    </div>
    <div class="info-item">
      <span class="info-label">📏 Площадь:</span>
      <span class="info-value">${region.area.toLocaleString("ru-RU")} км²</span>
    </div>
    <div class="info-item">
      <span class="info-label">📊 Плотность:</span>
      <span class="info-value">${(region.population / region.area).toFixed(
        1
      )} чел/км²</span>
    </div>
    <div class="info-item">
      <span class="info-label">🌍 Национальный состав:</span>
      ${nationalitiesHTML}
    </div>
  `;

  infoPanel.classList.add("show");

  // Приближение карты отключено - карта остается на текущей позиции
}

// Функция закрытия информационной панели
function closeInfoPanel() {
  document.getElementById("infoPanel").classList.remove("show");
}

// Обработчики для чекбоксов в легенде (включение/выключение областей)
document.querySelectorAll(".region-toggle").forEach((checkbox) => {
  checkbox.addEventListener("change", function () {
    const legendItem = this.closest(".legend-item");
    const regionName = legendItem.getAttribute("data-region");
    const polygon = regionPolygons[regionName];

    if (polygon) {
      if (this.checked) {
        // Показать область
        if (regionsVisible && !regionsLayer.hasLayer(polygon)) {
          regionsLayer.addLayer(polygon);
        }
        legendItem.style.opacity = "1";
      } else {
        // Скрыть область
        if (regionsLayer.hasLayer(polygon)) {
          regionsLayer.removeLayer(polygon);
        }
        legendItem.style.opacity = "0.5";
      }
    }
  });
});

// Ограничение перемещения карты в пределах Беларуси
map.setMaxBounds([
  [51.0, 23.0], // Юго-западный угол
  [56.5, 32.0], // Северо-восточный угол
]);

// Обработчик кнопки переключения режима
document
  .getElementById("toggleMode")
  .addEventListener("click", toggleDistrictMode);

// Закрытие модальных окон при клике на фон
window.addEventListener("click", function (event) {
  const districtModal = document.getElementById("districtModal");
  const districtsListModal = document.getElementById("districtsListModal");

  if (event.target === districtModal) {
    closeDistrictModal();
  }
  if (event.target === districtsListModal) {
    closeDistrictsListModal();
  }
});

// Функция переключения слоев
function toggleLayer(layerName) {
  const layers = {
    rivers: riversLayer,
    lakes: lakesLayer,
    roads: roadsLayer,
    railways: railwaysLayer,
    relief: reliefLayer,
  };

  if (!layers[layerName]) return;

  layerStates[layerName] = !layerStates[layerName];
  const layer = layers[layerName];

  if (layerStates[layerName]) {
    map.addLayer(layer);
    loadLayerData(layerName, layer);
  } else {
    map.removeLayer(layer);
  }
}

// Функция загрузки данных для слоёв (заготовка)
function loadLayerData(layerName, layer) {
  console.log(`Загрузка слоя: ${layerName}`);

  // Заготовка для загрузки GeoJSON данных
  // const geojsonUrl = `geojson/${layerName}.geojson`;
  // fetch(geojsonUrl)
  //   .then((response) => response.json())
  //   .then((data) => {
  //     L.geoJSON(data, {
  //       style: {
  //         color: getLayerColor(layerName),
  //         weight: 2,
  //         opacity: 0.7,
  //       },
  //     }).addTo(layer);
  //   })
  //   .catch((error) => console.error(`Ошибка загрузки ${layerName}:`, error));
}

// Функция получения цвета слоя
function getLayerColor(layerName) {
  const colors = {
    rivers: "#0066cc",
    lakes: "#0099ff",
    roads: "#ff6600",
    railways: "#660033",
    relief: "#999999",
  };
  return colors[layerName] || "#000000";
}

console.log("Интерактивная карта Беларуси загружена успешно!");
