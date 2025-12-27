// ===== УПРАВЛЕНИЕ РАЙОНАМИ БЕЛАРУСИ =====

// Переменные для хранения слоев
let districtBoundariesLayer = null;
let districtMarkersLayer = null;
let selectedDistrictLayer = null;
let currentDistrictName = null;

// Загрузка и отображение районов
async function loadDistrictsData() {
    try {
        console.log('Загрузка данных районов...');
        
        // Загружаем GeoJSON
        const response = await fetch('belarus-regions-district.geojson');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const geojson = await response.json();
        console.log('GeoJSON загружен, районов:', geojson.features.length);
        
        // Добавляем границы районов
        addDistrictBoundaries(geojson);
        
        // Добавляем маркеры центров районов
        addDistrictMarkers();
        
        console.log('Районы загружены успешно');
    } catch (error) {
        console.error('Ошибка при загрузке районов:', error);
    }
}

// Добавление границ районов с интерактивностью
function addDistrictBoundaries(geojson) {
    // Удаляем старый слой если существует
    if (districtBoundariesLayer) {
        map.removeLayer(districtBoundariesLayer);
    }
    
    districtBoundariesLayer = L.geoJSON(geojson, {
        style: {
            color: '#7cf578',          // Светло-зеленая граница
            weight: 1.5,
            opacity: 0.8,
            fillColor: '#4a7c7e',      // Серо-зеленая заливка
            fillOpacity: 0.25
        },
        onEachFeature: function(feature, layer) {
            const districtName = feature.properties.shapeName;
            
            if (!districtName) return;
            
            // Событие: наведение мыши
            layer.on('mouseover', function() {
                this.setStyle({
                    fillOpacity: 0.35,
                    weight: 2
                });
                this.bringToFront();
            });
            
            layer.on('mouseout', function() {
                if (currentDistrictName !== districtName) {
                    this.setStyle({
                        fillOpacity: 0.25,
                        weight: 1.5,
                        color: '#7cf578'
                    });
                }
            });
            
            // Событие: клик на район
            layer.on('click', function(e) {
                console.log('Клик на район:', districtName);
                selectDistrict(districtName, layer, feature);
            });
            
            // Popup при клике на маркер
            const districtInfo = allDistrictsInfo[districtName];
            if (districtInfo) {
                const popupContent = createDistrictPopupContent(districtInfo);
                layer.bindPopup(popupContent, {
                    className: 'district-popup',
                    maxWidth: 300
                });
            }
        }
    }).addTo(map);
    
    console.log('Границы районов добавлены');
}

// Создание содержимого popup
function createDistrictPopupContent(districtInfo) {
    return `
        <div class="district-popup">
            <h3>${districtInfo.name}</h3>
            <div class="popup-info">
                <p><strong>Область:</strong> ${districtInfo.region}</p>
                <p><strong>Центр:</strong> ${districtInfo.center}</p>
                <p><strong>Население:</strong> ${districtInfo.population}</p>
                <p><strong>Основан:</strong> ${districtInfo.founded} г.</p>
                <p><strong>Описание:</strong> ${districtInfo.foundedDescription}</p>
            </div>
        </div>
    `;
}

// Добавление маркеров центров районов
function addDistrictMarkers() {
    if (districtMarkersLayer) {
        map.removeLayer(districtMarkersLayer);
    }
    
    districtMarkersLayer = L.featureGroup();
    
    // Перебираем все районы из данных
    for (const districtName in allDistrictsInfo) {
        const districtInfo = allDistrictsInfo[districtName];
        const coords = districtInfo.centerCoords;
        
        if (coords && coords.length === 2) {
            const [lng, lat] = coords;
            
            // Создаем маркер
            const marker = L.circleMarker([lat, lng], {
                radius: 6,
                color: '#7cf578',
                weight: 2,
                opacity: 1,
                fillColor: '#4a7c7e',
                fillOpacity: 0.8,
                className: 'district-marker'
            });
            
            // Popup при клике на маркер
            const popupContent = `
                <div class="district-popup">
                    <h3>${districtInfo.name}</h3>
                    <div class="popup-info">
                        <p><strong>Центр:</strong> ${districtInfo.center}</p>
                        <p><strong>Координаты:</strong> ${lat.toFixed(2)}, ${lng.toFixed(2)}</p>
                        <p><strong>Основан:</strong> ${districtInfo.founded} г.</p>
                        <p><strong>Описание:</strong> ${districtInfo.foundedDescription}</p>
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent, {
                className: 'district-popup',
                maxWidth: 300
            });
            
            // Событие клика на маркер
            marker.on('click', function() {
                // Отображаем инфо-панель
                showDistrictInfo(districtInfo);
            });
            
            districtMarkersLayer.addLayer(marker);
        }
    }
    
    districtMarkersLayer.addTo(map);
    console.log('Маркеры районов добавлены');
}

// Выделение выбранного района
function selectDistrict(districtName, layer, feature) {
    // Сбрасываем предыдущее выделение
    if (selectedDistrictLayer && currentDistrictName) {
        selectedDistrictLayer.setStyle({
            fillOpacity: 0.25,
            weight: 1.5,
            color: '#7cf578'
        });
    }
    
    // Выделяем новый район
    currentDistrictName = districtName;
    selectedDistrictLayer = layer;
    
    layer.setStyle({
        fillOpacity: 0.5,
        weight: 2,
        color: '#7cf578',
        fillColor: '#7cf578'
    });
    
    layer.bringToFront();
    
    // Приближаемся к границам района
    zoomToDistrict(feature);
    
    // Показываем информацию
    const districtInfo = allDistrictsInfo[districtName];
    if (districtInfo) {
        showDistrictInfo(districtInfo);
    }
}

// Приближение к выбранному району
function zoomToDistrict(feature) {
    const bounds = L.geoJSON(feature).getBounds();
    map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 10
    });
}

// Отображение информации в боковой панели
function showDistrictInfo(districtInfo) {
    const infoPanelContent = document.getElementById('infoPanelContent');
    
    if (!infoPanelContent) {
        console.error('Элемент infoPanelContent не найден');
        return;
    }
    
    let landmarksHTML = '';
    if (districtInfo.landmarks && districtInfo.landmarks.length > 0) {
        landmarksHTML = '<ul>' + 
            districtInfo.landmarks.map(landmark => `<li>${landmark}</li>`).join('') + 
            '</ul>';
    }
    
    let economyHTML = '';
    if (districtInfo.economy && districtInfo.economy.length > 0) {
        economyHTML = '<ul>' + 
            districtInfo.economy.map(sector => `<li>${sector}</li>`).join('') + 
            '</ul>';
    }
    
    const density = districtInfo.density || 'Нет данных';
    
    const html = `
        <div class="district-info">
            <h2>${districtInfo.name}</h2>
            <p class="region-badge">Область: <strong>${districtInfo.region}</strong></p>
            
            <div class="info-section">
                <h4>Административный центр</h4>
                <p>${districtInfo.center}</p>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <p class="label">Население</p>
                    <p class="value">${districtInfo.population}</p>
                </div>
                <div class="info-item">
                    <p class="label">Площадь</p>
                    <p class="value">${districtInfo.area}</p>
                </div>
                <div class="info-item">
                    <p class="label">Плотность</p>
                    <p class="value">${density}</p>
                </div>
                <div class="info-item">
                    <p class="label">Год основания</p>
                    <p class="value">${districtInfo.founded}</p>
                </div>
            </div>
            
            <div class="info-section">
                <h4>История основания</h4>
                <p>${districtInfo.foundedDescription}</p>
            </div>
            
            ${landmarksHTML ? `
                <div class="info-section">
                    <h4>Достопримечательности</h4>
                    ${landmarksHTML}
                </div>
            ` : ''}
            
            ${economyHTML ? `
                <div class="info-section">
                    <h4>Основные отрасли экономики</h4>
                    ${economyHTML}
                </div>
            ` : ''}
            
            <div class="info-section">
                <h4>Описание</h4>
                <p>${districtInfo.description}</p>
            </div>
        </div>
    `;
    
    infoPanelContent.innerHTML = html;
    
    // Показываем панель
    const infoPanel = document.getElementById('infoPanel');
    if (infoPanel) {
        infoPanel.classList.add('active');
    }
}

// Сброс всех выделений
function resetAllDistricts() {
    if (selectedDistrictLayer && currentDistrictName) {
        selectedDistrictLayer.setStyle({
            fillOpacity: 0.25,
            weight: 1.5,
            color: '#7cf578'
        });
    }
    
    currentDistrictName = null;
    selectedDistrictLayer = null;
    
    // Закрываем инфо-панель
    const infoPanel = document.getElementById('infoPanel');
    if (infoPanel) {
        infoPanel.classList.remove('active');
    }
}

// ===== ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ КАРТЫ =====

function switchToDistricts() {
    console.log('Переключение на режим РАЙОНОВ');
    
    // Скрываем слой регионов
    if (window.regionBoundariesLayer) {
        map.removeLayer(window.regionBoundariesLayer);
    }
    
    // Удаляем маркеры городов
    if (window.cityMarkersLayer) {
        map.removeLayer(window.cityMarkersLayer);
    }
    
    // Загружаем и отображаем районы
    loadDistrictsData();
    
    // Возвращаемся к начальному виду
    map.setView([53.9045, 27.5615], 7);
    
    // Закрываем инфо-панель
    resetAllDistricts();
    
    // Обновляем кнопки навигации
    updateNavigationButtons('districts');
}

function switchToRegions() {
    console.log('Переключение на режим ОБЛАСТЕЙ');
    
    // Скрываем слой районов
    if (districtBoundariesLayer) {
        map.removeLayer(districtBoundariesLayer);
    }
    
    // Скрываем маркеры районов
    if (districtMarkersLayer) {
        map.removeLayer(districtMarkersLayer);
    }
    
    // Удаляем выделение района
    resetAllDistricts();
    
    // Загружаем регионы (вызываем функцию из других модулей)
    if (typeof switchToRegionsOriginal === 'function') {
        switchToRegionsOriginal();
    } else {
        // Загружаем и отображаем регионы
        loadRegions();
    }
}

// Обновление состояния кнопок навигации
function updateNavigationButtons(activeType) {
    const regionsBtn = document.getElementById('mapRegionsBtn');
    const districtsBtn = document.getElementById('mapDistrictsBtn');
    
    if (regionsBtn && districtsBtn) {
        if (activeType === 'regions') {
            regionsBtn.classList.add('active');
            districtsBtn.classList.remove('active');
        } else if (activeType === 'districts') {
            districtsBtn.classList.add('active');
            regionsBtn.classList.remove('active');
        }
    }
}

console.log('districts.js загружен');
