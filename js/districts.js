// ===== УПРАВЛЕНИЕ РАЙОНАМИ БЕЛАРУСИ =====

// Переменные для хранения слоев
let districtBoundariesLayer = null;
let districtMarkersLayer = null;
let selectedDistrictLayer = null;
let currentDistrictName = null;
let districtClickHandler = null;

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
        
        // Добавляем обработчик клика на карту для режима районов
        attachDistrictClickHandler();
        
        console.log('Районы загружены успешно');
    } catch (error) {
        console.error('Ошибка при загрузке районов:', error);
    }
}

// Добавление обработчика клика на карту (для сброса выделения)
function attachDistrictClickHandler() {
    // Удаляем старый обработчик если был
    if (districtClickHandler && map) {
        map.off('click', districtClickHandler);
    }
    
    // Создаем новый обработчик
    districtClickHandler = function(e) {
        // Проверяем, клик ли по элементу (через e.originalEvent.target)
        const clickedElement = e.originalEvent.target;
        const isOnPath = clickedElement.tagName === 'path' || 
                         clickedElement.closest('.leaflet-interactive');
        
        // Сброс только если клик вне районов и маркеров
        if (!isOnPath) {
            resetAllDistricts();
        }
    };
    
    map.on('click', districtClickHandler);
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
            
            // Сохраняем имя района в layer
            layer.districtName = districtName;
            
            // Событие: наведение мыши
            layer.on('mouseover', function() {
                this.setStyle({
                    fillOpacity: 0.35,
                    weight: 2,
                    cursor: 'pointer'
                });
                this.bringToFront();
            });
            
            layer.on('mouseout', function() {
                if (currentDistrictName !== districtName) {
                    this.setStyle({
                        fillOpacity: 0.25,
                        weight: 1.5,
                        color: '#7cf578',
                        cursor: 'default'
                    });
                }
            });
            
            // Событие: клик на район (как в app.js для regions)
            layer.on('click', function(e) {
                console.log('Клик на район:', districtName);
                selectDistrict(districtName, layer, feature);
                L.DomEvent.stopPropagation(e);
            });
            
            // Tooltip
            layer.bindTooltip(districtName, {
                permanent: false,
                direction: 'center',
                className: 'district-label'
            });
        }
    }).addTo(map);
    
    console.log('Границы районов добавлены');
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
            
            // Создаем маркер с улучшенными стилями
            const marker = L.circleMarker([lat, lng], {
                radius: 8,                  // Чуть больше размер
                color: '#37FF8B',           // Светлая граница
                weight: 2,
                opacity: 1,
                fillColor: '#7cf578',       // Светло-зеленая заливка
                fillOpacity: 0.9,
                className: 'district-marker',
                pane: 'markerPane'
            });
            
            // Popup при клике на маркер
            const popupContent = createDistrictPopupContent(districtInfo);
            marker.bindPopup(popupContent, {
                className: 'district-popup',
                maxWidth: 300
            });
            
            // Hover эффекты для маркера (как в app.js для городов)
            marker.on('mouseover', function(e) {
                e.target.setStyle({
                    radius: 11,
                    fillOpacity: 1,
                    color: '#7cf578',
                    weight: 3
                });
                e.target.bringToFront();
            });
            
            marker.on('mouseout', function(e) {
                e.target.setStyle({
                    radius: 8,
                    fillOpacity: 0.9,
                    color: '#37FF8B',
                    weight: 2
                });
            });
            
            // Событие клика на маркер
            marker.on('click', function(e) {
                // Отображаем popup
                e.target.openPopup();
                // Отображаем инфо-панель
                showDistrictInfo(districtInfo);
                L.DomEvent.stopPropagation(e);
            });
            
            districtMarkersLayer.addLayer(marker);
        }
    }
    
    districtMarkersLayer.addTo(map);
    console.log('Маркеры районов добавлены');
}

// Создание содержимого popup
function createDistrictPopupContent(districtInfo) {
    return `
        <div class="district-popup">
            <h3>${districtInfo.name}</h3>
            <div class="popup-info">
                <p><strong>📍 Центр:</strong> ${districtInfo.center}</p>
                <p><strong>📦 Область:</strong> ${districtInfo.region}</p>
                <p><strong>👥 Население:</strong> ${districtInfo.population}</p>
                <p><strong>📅 Основан:</strong> ${districtInfo.founded} г.</p>
            </div>
        </div>
    `;
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
    
    // Фиксированная ширина панели
    const panelWidth = 420;
    
    // Отступы с учетом боковой панели (как в app.js для регионов)
    const paddingTop = 20;
    const paddingBottom = 20;
    const paddingLeft = 20;
    const paddingRight = panelWidth + 30;
    
    map.fitBounds(bounds, {
        paddingTopLeft: [paddingLeft, paddingTop],
        paddingBottomRight: [paddingRight, paddingBottom],
        maxZoom: 10,
        animate: true,
        duration: 0.6
    });
}

// Отображение информации в боковой панели
function showDistrictInfo(districtInfo) {
    const infoPanelContent = document.getElementById('infoPanelContent');
    const infoPanel = document.getElementById('infoPanel');
    
    if (!infoPanelContent || !infoPanel) {
        console.error('Элемент infoPanelContent не найден');
        return;
    }
    
    let landmarksHTML = '';
    if (districtInfo.landmarks && districtInfo.landmarks.length > 0) {
        landmarksHTML = '<ul class="info-list">' + 
            districtInfo.landmarks.map(landmark => `<li>${landmark}</li>`).join('') + 
            '</ul>';
    }
    
    let economyHTML = '';
    if (districtInfo.economy && districtInfo.economy.length > 0) {
        economyHTML = '<div class="economy-tags">' + 
            districtInfo.economy.map(sector => `<span class="economy-tag">${sector}</span>`).join('') + 
            '</div>';
    }
    
    const density = districtInfo.density || 'Нет данных';
    
    const html = `
        <div class="district-info">
            <div class="region-header">
                <h2>${districtInfo.name}</h2>
                <p class="region-capital">🏛️ Область: <strong>${districtInfo.region}</strong></p>
            </div>
            
            <div class="info-section">
                <h3>📊 Административный центр</h3>
                <p>${districtInfo.center}</p>
            </div>
            
            <div class="info-section">
                <h3>📊 Общие данные</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Население</span>
                        <span class="info-value">${districtInfo.population}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Площадь</span>
                        <span class="info-value">${districtInfo.area}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Плотность</span>
                        <span class="info-value">${density}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Год основания</span>
                        <span class="info-value">${districtInfo.founded}</span>
                    </div>
                </div>
            </div>
            
            <div class="info-section">
                <h3>📖 История основания</h3>
                <p>${districtInfo.foundedDescription}</p>
            </div>
            
            ${landmarksHTML ? `
                <div class="info-section">
                    <h3>🎭 Достопримечательности</h3>
                    ${landmarksHTML}
                </div>
            ` : ''}
            
            ${economyHTML ? `
                <div class="info-section">
                    <h3>💼 Основные отрасли экономики</h3>
                    ${economyHTML}
                </div>
            ` : ''}
            
            <div class="info-section">
                <h3>ℹ️ Описание</h3>
                <p>${districtInfo.description}</p>
            </div>
        </div>
    `;
    
    infoPanelContent.innerHTML = html;
    infoPanelContent.scrollTop = 0;
    
    // Показываем панель
    infoPanel.classList.add('active');
}

// Сброс всех выделений
function resetAllDistricts() {
    // Сбрасываем стили всех районов
    if (districtBoundariesLayer) {
        districtBoundariesLayer.eachLayer(function(layer) {
            layer.setStyle({
                fillOpacity: 0.25,
                weight: 1.5,
                color: '#7cf578'
            });
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
    
    // Удаляем старый обработчик клика с режима регионов
    if (window.regionClickHandler && map) {
        map.off('click', window.regionClickHandler);
    }
    
    // Скрываем слой регионов
    if (window.regionsLayer) {
        map.removeLayer(window.regionsLayer);
    }
    
    // Скрываем слой Минска
    if (window.minskLayer) {
        map.removeLayer(window.minskLayer);
    }
    
    // Удаляем маркеры городов
    if (window.cityMarkers) {
        window.cityMarkers.forEach(cityData => {
            if (map.hasLayer(cityData.marker)) {
                map.removeLayer(cityData.marker);
            }
        });
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
    
    // Удаляем обработчик клика с режима районов
    if (districtClickHandler && map) {
        map.off('click', districtClickHandler);
    }
    
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
    
    // Загружаем регионы
    if (typeof switchToRegionsOriginal === 'function') {
        switchToRegionsOriginal();
    } else if (typeof loadRegions === 'function') {
        loadRegions();
    }
    
    // Возвращаемся к начальному виду
    map.setView([53.9045, 27.5615], 7);
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
