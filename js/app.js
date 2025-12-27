let map;
let regionsLayer;
let minskLayer;
let minskMarker;
let regionsGeoJSON;
let cityMarkers = [];
let selectedRegion = null;
let regionClickHandler;

// Маппинг capital -> название области для regionsInfo
const capitalToRegion = {
    "Брест": "Брестская",
    "Витебск": "Витебская",
    "Гомель": "Гомельская",
    "Гродно": "Гродненская",
    "Минск": "Минская",
    "Могилев": "Могилёвская",
    "Могилёв": "Могилёвская"
};

// Цвета для каждой области (серые тона)
const regionColors = {
    "Брестская": "#7a7a7a",
    "Витебская": "#858585",
    "Гомельская": "#6e6e6e",
    "Гродненская": "#909090",
    "Минская": "#787878",
    "Могилёвская": "#828282",
    "Минск": "#7a7a7a"
};

// Настройки отображения городов в зависимости от зума
const zoomLevels = {
    capital: 6,      // Минск виден всегда
    regional: 7,     // Областные центры с зума 7
    city: 8          // Обычные города с зума 8
};

// Инициализация карты
function initMap() {
    map = L.map('map', {
        center: mapConfig.center,
        zoom: 7,
        minZoom: 6,
        maxZoom: 12,
        zoomControl: true,
        attributionControl: true
    });

    map.getContainer().blur();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    loadRegionsData();

    // Обработчик закрытия панели
    const closePanel = document.getElementById('closePanel');
    const infoPanel = document.getElementById('infoPanel');
    
    if (closePanel) {
        closePanel.addEventListener('click', () => {
            if (infoPanel) {
                infoPanel.classList.remove('active');
            }
            resetAllRegions();
            map.setView(mapConfig.center, 7);
        });
    }
    
    map.on('focus', function() {
        map.getContainer().blur();
    });
    
    // Обновляем видимость маркеров при зуме
    map.on('zoomend', updateMarkersVisibility);
    
    // Сброс выделения при клике на карту (для режима областей)
    regionClickHandler = function() {
        resetAllRegions();
        if (infoPanel) {
            infoPanel.classList.remove('active');
        }
        map.setView(mapConfig.center, 7);
    };
    map.on('click', regionClickHandler);
}

// Загрузка данных регионов из GeoJSON файла
async function loadRegionsData() {
    try {
        const response = await fetch('belarus-regions.geojson');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        regionsGeoJSON = await response.json();
        
        console.log('GeoJSON загружен успешно');
        
        const regionFeatures = regionsGeoJSON.features.filter(feature => {
            return feature.geometry && 
                   feature.geometry.type === 'Polygon' && 
                   feature.properties && 
                   feature.properties.area && 
                   feature.properties.area > 10000 &&
                   feature.properties.capital;
        });

        const minskCity = regionsGeoJSON.features.find(feature => {
            return feature.properties && 
                   feature.properties.name === "Минск" &&
                   feature.properties.isCity === true &&
                   feature.properties.isCapital === true;
        });

        console.log('Найдено областей:', regionFeatures.length);

        const filteredGeoJSON = {
            type: 'FeatureCollection',
            features: regionFeatures
        };

        addRegionBoundaries(filteredGeoJSON);
        
        if (minskCity) {
            addMinskRegion(minskCity);
        } else {
            addMinskRegion({ geometry: { coordinates: [27.56, 53.9] } });
        }
        
        addCityMarkers();
        addMinskMarker();
        
        // Обновляем видимость после загрузки
        updateMarkersVisibility();
    } catch (error) {
        console.error('Ошибка загрузки GeoJSON:', error);
    }
}

// Публичная функция для загрузки регионов (используется из districts.js)
window.loadRegions = function() {
    console.log('Нагружение регионов...');
    // Обновляем карту
    updateMarkersVisibility();
};

// Глобальная функция switchToRegions для districts.js
window.switchToRegionsOriginal = function() {
    console.log('Переключение на регионы из districts.js');
    // Основная логика уже реализована в districts.js
    // Это функция может активировать данные регионов
    if (regionsLayer) {
        map.addLayer(regionsLayer);
    }
    if (minskLayer) {
        map.addLayer(minskLayer);
    }
    updateMarkersVisibility();
};

// Добавление границ областей
function addRegionBoundaries(geoJSON) {
    regionsLayer = L.geoJSON(geoJSON, {
        style: function(feature) {
            const capital = feature.properties.capital;
            const regionName = capitalToRegion[capital];
            const color = regionName ? regionColors[regionName] : '#7a7a7a';
            
            return {
                fillColor: color,
                weight: 2,
                opacity: 1,
                color: '#37FF8B',
                fillOpacity: 0.3,
                className: 'region-polygon'
            };
        },
        onEachFeature: function(feature, layer) {
            const capital = feature.properties.capital;
            const regionName = capitalToRegion[capital];
            
            if (!regionName) {
                console.warn('Не найдено соответствие для capital:', capital);
                return;
            }
            
            // Сохраняем имя региона в layer
            layer.regionName = regionName;
            
            layer.on({
                click: function(e) {
                    selectRegion(layer, regionName);
                    showRegionInfo(regionName);
                    zoomToRegion(layer);
                    L.DomEvent.stopPropagation(e);
                }
            });
            
            layer.bindTooltip(regionName, {
                permanent: false,
                direction: 'center',
                className: 'region-label'
            });
        }
    }).addTo(map);
}

// Добавление города Минска как отдельного региона
function addMinskRegion(minskFeature) {
    let lat, lng;
    
    if (minskFeature.geometry && minskFeature.geometry.type === 'Point') {
        lng = minskFeature.geometry.coordinates[0];
        lat = minskFeature.geometry.coordinates[1];
    } else {
        lng = 27.56;
        lat = 53.9;
    }

    minskLayer = L.circle([lat, lng], {
        radius: 15000,
        fillColor: regionColors["Минск"],
        weight: 2,
        opacity: 1,
        color: '#37FF8B',
        fillOpacity: 0.3,
        className: 'region-polygon minsk-region',
        pane: 'overlayPane',
        interactive: true
    }).addTo(map);

    minskLayer.regionName = "Минск";
    minskLayer.bringToFront();

    minskLayer.on({
        click: function(e) {
            selectRegion(minskLayer, "Минск");
            showRegionInfo("Минск");
            zoomToRegion(minskLayer);
            L.DomEvent.stopPropagation(e);
        }
    });

    minskLayer.bindTooltip("г. Минск", {
        permanent: false,
        direction: 'center',
        className: 'region-label'
    });
}

// Максимальное приближение к региону
function zoomToRegion(layer) {
    const bounds = layer.getBounds();
    
    // Фиксированная ширина панели
    const panelWidth = 420;
    
    // Минимальные отступы для максимального приближения
    const paddingTop = 20;
    const paddingBottom = 20;
    const paddingLeft = 20;
    const paddingRight = panelWidth + 30;
    
    // Применяем fitBounds с maxZoom 12 (максимальный для карты)
    map.fitBounds(bounds, {
        paddingTopLeft: [paddingLeft, paddingTop],
        paddingBottomRight: [paddingRight, paddingBottom],
        maxZoom: 12,
        animate: true,
        duration: 0.6
    });
}

// Выделение региона
function selectRegion(layer, regionName) {
    // Сбрасываем предыдущее выделение
    resetAllRegions();
    
    // Выделяем новый регион
    layer.setStyle({
        fillColor: '#7cf578',
        weight: 3,
        fillOpacity: 0.5,
        color: '#7cf578'
    });
    
    layer.bringToFront();
    if (minskLayer) {
        minskLayer.bringToFront();
    }
    
    selectedRegion = layer;
}

// Сброс всех регионов
function resetAllRegions() {
    if (regionsLayer) {
        regionsLayer.eachLayer(function(layer) {
            const regionName = layer.regionName;
            if (regionName) {
                layer.setStyle({
                    fillColor: regionColors[regionName],
                    weight: 2,
                    fillOpacity: 0.3,
                    color: '#37FF8B'
                });
            }
        });
    }
    
    if (minskLayer) {
        minskLayer.setStyle({
            fillColor: regionColors["Минск"],
            weight: 2,
            fillOpacity: 0.3,
            color: '#37FF8B'
        });
        minskLayer.bringToFront();
    }
    
    selectedRegion = null;
}

// Показать информацию об области
function showRegionInfo(regionName) {
    const regionData = regionsInfo[regionName];
    
    if (!regionData) {
        console.warn(`Нет данных для области: ${regionName}`);
        return;
    }

    const infoPanel = document.getElementById('infoPanel');
    const infoPanelContent = document.getElementById('infoPanelContent');
    
    if (!infoPanel || !infoPanelContent) {
        console.error('Элементы панели не найдены');
        return;
    }
    
    infoPanelContent.innerHTML = `
        <div class="region-header">
            <h2>${regionData.name}</h2>
            <p class="region-capital">🃄 ${regionName === "Минск" ? "Столица Республики Беларусь" : "Административный центр: " + regionData.capital}</p>
        </div>

        <div class="info-section">
            <h3>📈 Общие данные</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Площадь</span>
                    <span class="info-value">${regionData.area}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Население</span>
                    <span class="info-value">${regionData.population}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Плотность</span>
                    <span class="info-value">${regionData.density}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">${regionName === "Минск" ? "Статус" : "Городов"}</span>
                    <span class="info-value">${regionName === "Минск" ? "Столица" : regionData.cities}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Урбанизация</span>
                    <span class="info-value">${regionData.urbanPopulation}</span>
                </div>
            </div>
        </div>

        <div class="info-section">
            <h3>👥 Национальный состав</h3>
            <ul class="info-list">
                ${regionData.nationality.map(n => 
                    `<li><span>${n.name}</span><span class="percentage">${n.percent}</span></li>`
                ).join('')}
            </ul>
        </div>

        <div class="info-section">
            <h3>⚪ Религиозный состав</h3>
            <ul class="info-list">
                ${regionData.religion.map(r => 
                    `<li><span>${r.name}</span><span class="percentage">${r.percent}</span></li>`
                ).join('')}
            </ul>
        </div>

        <div class="info-section">
            <h3>💼 Экономика</h3>
            <div class="economy-tags">
                ${regionData.economy.map(e => 
                    `<span class="economy-tag">${e}</span>`
                ).join('')}
            </div>
            ${regionData.economyDetails ? `
                <div class="economy-details">
                    <div class="economy-detail-item">
                        <div class="economy-detail-label">Вклад в ВВП</div>
                        <div class="economy-detail-value">${regionData.economyDetails.gdp}</div>
                    </div>
                    <div class="economy-detail-item">
                        <div class="economy-detail-label">Основные отрасли</div>
                        <div class="economy-detail-value">${regionData.economyDetails.mainIndustries}</div>
                    </div>
                    <div class="economy-detail-item">
                        <div class="economy-detail-label">${regionName === "Минск" ? "Специализация" : "Сельское хозяйство"}</div>
                        <div class="economy-detail-value">${regionData.economyDetails.agriculture}</div>
                    </div>
                </div>
            ` : ''}
        </div>

        <div class="info-section">
            <h3>ℹ️ Описание</h3>
            <p class="region-description">${regionData.description}</p>
        </div>
    `;
    
    infoPanel.classList.add('active');
    infoPanelContent.scrollTop = 0;
}

// Добавление маркера для города Минска
function addMinskMarker() {
    const minskCity = belarusCities.find(city => city.capital);
    
    if (!minskCity) return;
    
    const popupContent = createPopupContent(minskCity);
    
    minskMarker = L.circleMarker(minskCity.coords, {
        radius: 10,
        fillColor: '#7cf578',
        color: '#37FF8B',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
        className: 'city-marker capital-marker',
        pane: 'markerPane'
    }).addTo(map);
    
    minskMarker.bindPopup(popupContent);
    
    const tooltip = L.tooltip({
        permanent: true,
        direction: 'bottom',
        className: 'city-name-label capital-label',
        offset: [0, 12]
    }).setContent(minskCity.name);
    
    minskMarker.bindTooltip(tooltip);
    
    minskMarker.on({
        mouseover: function(e) {
            e.target.setStyle({
                radius: 12,
                fillOpacity: 1,
                color: '#7cf578',
                weight: 3
            });
        },
        mouseout: function(e) {
            e.target.setStyle({
                radius: 10,
                fillOpacity: 0.8,
                color: '#37FF8B',
                weight: 2
            });
        },
        click: function(e) {
            e.target.openPopup();
            L.DomEvent.stopPropagation(e);
        }
    });
    
    cityMarkers.push({
        marker: minskMarker,
        name: minskCity.name,
        coords: minskCity.coords,
        type: 'capital',
        minZoom: zoomLevels.capital
    });
}

// Добавление маркеров городов
function addCityMarkers() {
    belarusCities.forEach(city => {
        if (city.capital) {
            return;
        }
        
        const popupContent = createPopupContent(city);
        
        let radius, className, minZoom;
        if (city.regional) {
            radius = 9;
            className = 'city-marker regional-marker';
            minZoom = zoomLevels.regional;
        } else {
            radius = 7;
            className = 'city-marker town-marker';
            minZoom = zoomLevels.city;
        }
        
        const marker = L.circleMarker(city.coords, {
            radius: radius,
            fillColor: '#37FF8B',
            color: '#67db97',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
            className: className,
            pane: 'markerPane'
        }).addTo(map);
        
        marker.bindPopup(popupContent);
        
        const tooltip = L.tooltip({
            permanent: true,
            direction: 'bottom',
            className: city.regional ? 'city-name-label regional-label' : 'city-name-label town-label',
            offset: [0, city.regional ? 11 : 9]
        }).setContent(city.name);
        
        marker.bindTooltip(tooltip);
        
        const originalRadius = radius;
        
        marker.on({
            mouseover: function(e) {
                e.target.setStyle({
                    radius: originalRadius + 2,
                    fillOpacity: 1,
                    color: '#7cf578',
                    weight: 3
                });
            },
            mouseout: function(e) {
                e.target.setStyle({
                    radius: originalRadius,
                    fillOpacity: 0.8,
                    color: '#67db97',
                    weight: 2
                });
            },
            click: function(e) {
                e.target.openPopup();
                L.DomEvent.stopPropagation(e);
            }
        });
        
        cityMarkers.push({
            marker: marker,
            name: city.name,
            coords: city.coords,
            type: city.regional ? 'regional' : 'town',
            minZoom: minZoom
        });
    });
}

// Обновление видимости маркеров в зависимости от зума
function updateMarkersVisibility() {
    const currentZoom = map.getZoom();
    
    cityMarkers.forEach(cityData => {
        if (currentZoom >= cityData.minZoom) {
            if (!map.hasLayer(cityData.marker)) {
                cityData.marker.addTo(map);
            }
        } else {
            if (map.hasLayer(cityData.marker)) {
                map.removeLayer(cityData.marker);
            }
        }
    });
}

// Создание содержимого popup с годом основания
function createPopupContent(city) {
    const foundedYear = city.founded || "Неизвестно";
    const foundedDesc = city.foundedDescription || "";
    
    return `
        <div class="city-popup">
            <h3>${city.name}</h3>
            <div class="popup-info">
                <p class="popup-founded">
                    <strong>📅 Год основания:</strong> ${foundedYear}${city.founded ? ' г.' : ''}
                </p>
                ${foundedDesc ? `<p class="popup-founded-desc">${foundedDesc}</p>` : ''}
                <p><strong>👥 Население:</strong> ${city.population}</p>
                <p><strong>📍 Регион:</strong> ${city.region}</p>
            </div>
        </div>
    `;
}


// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, запуск приложения...');
    initMap();
});

console.log('app.js загружен');
