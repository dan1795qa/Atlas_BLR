// Управление слоем районов
let districtsLayer;
let districtMarkers = [];
let selectedDistrict = null;
let currentMapMode = 'regions'; // 'regions' или 'districts'

// Загрузка и отображение районов
async function loadDistrictsData() {
    try {
        const response = await fetch('belarus-regions-district.geojson');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const geojson = await response.json();
        
        console.log('Районы загружены успешно');
        
        addDistrictBoundaries(geojson);
        addDistrictMarkers();
        
    } catch (error) {
        console.error('Ошибка загрузки районов:', error);
    }
}

// Добавление границ районов на карту
function addDistrictBoundaries(geojson) {
    districtsLayer = L.geoJSON(geojson, {
        style: function(feature) {
            return {
                fillColor: '#4a7c7e',
                weight: 1.5,
                opacity: 0.8,
                color: '#7cf578',
                fillOpacity: 0.25,
                className: 'district-polygon'
            };
        },
        onEachFeature: function(feature, layer) {
            const districtName = feature.properties.name || feature.properties.district;
            
            if (!districtName) {
                console.warn('Не найдено имя района');
                return;
            }
            
            layer.districtName = districtName;
            
            layer.on({
                click: function(e) {
                    selectDistrict(layer, districtName);
                    showDistrictInfo(districtName);
                    zoomToDistrict(layer);
                    L.DomEvent.stopPropagation(e);
                },
                mouseover: function() {
                    if (selectedDistrict !== layer) {
                        layer.setStyle({
                            fillOpacity: 0.35
                        });
                    }
                },
                mouseout: function() {
                    if (selectedDistrict !== layer) {
                        layer.setStyle({
                            fillOpacity: 0.25
                        });
                    }
                }
            });
            
            layer.bindTooltip(districtName, {
                permanent: false,
                direction: 'center',
                className: 'district-label'
            });
        }
    });
}

// Добавление маркеров районных центров
function addDistrictMarkers() {
    districtMarkers = [];
    
    for (const districtName in districtsInfo) {
        const district = districtsInfo[districtName];
        const coords = district.centerCoords;
        
        const marker = L.circleMarker(coords, {
            radius: 8,
            fillColor: '#7cf578',
            color: '#37FF8B',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
            className: 'district-marker',
            pane: 'markerPane'
        });
        
        marker.districtName = districtName;
        marker.districtData = district;
        
        marker.on('click', function(e) {
            selectDistrict(null, districtName);
            showDistrictInfo(districtName);
            L.DomEvent.stopPropagation(e);
        });
        
        // Popup при клике на маркер
        marker.bindPopup(() => createDistrictPopupContent(district));
        
        districtMarkers.push(marker);
    }
}

// Создание содержимого popup для районного центра
function createDistrictPopupContent(district) {
    const foundedYear = district.founded || "Неизвестно";
    const foundedDesc = district.foundedDescription || "";
    
    return `
        <div class="district-popup">
            <h3>${district.name}</h3>
            <div class="popup-info">
                <p class="popup-founded">
                    <strong>📅 Год основания:</strong> ${foundedYear}${district.founded ? ' г.' : ''}
                </p>
                ${foundedDesc ? `<p class="popup-founded-desc">${foundedDesc}</p>` : ''}
                <p><strong>👥 Население:</strong> ${district.population}</p>
                <p><strong>📍 Область:</strong> ${district.region}</p>
                <p><strong>📏 Площадь:</strong> ${district.area}</p>
            </div>
        </div>
    `;
}

// Выделение района
function selectDistrict(layer, districtName) {
    // Сбрасываем предыдущее выделение
    resetAllDistricts();
    
    if (layer) {
        // Выделяем новый район
        layer.setStyle({
            fillColor: '#7cf578',
            weight: 3,
            fillOpacity: 0.5,
            color: '#7cf578'
        });
        
        layer.bringToFront();
        selectedDistrict = layer;
    }
}

// Сброс всех районов
function resetAllDistricts() {
    if (districtsLayer) {
        districtsLayer.eachLayer(function(layer) {
            layer.setStyle({
                fillColor: '#4a7c7e',
                weight: 1.5,
                fillOpacity: 0.25,
                color: '#7cf578'
            });
        });
    }
    
    selectedDistrict = null;
}

// Максимальное приближение к району
function zoomToDistrict(layer) {
    const bounds = layer.getBounds();
    const panelWidth = 420;
    
    const paddingTop = 20;
    const paddingBottom = 20;
    const paddingLeft = 20;
    const paddingRight = panelWidth + 30;
    
    map.fitBounds(bounds, {
        paddingTopLeft: [paddingLeft, paddingTop],
        paddingBottomRight: [paddingRight, paddingBottom],
        maxZoom: 12,
        animate: true,
        duration: 0.6
    });
}

// Показание информации о районе
function showDistrictInfo(districtName) {
    const districtData = districtsInfo[districtName];
    
    if (!districtData) {
        console.warn(`Нет данных для района: ${districtName}`);
        return;
    }

    const infoPanel = document.getElementById('info-panel');
    const regionInfo = document.getElementById('region-info');
    
    if (!infoPanel || !regionInfo) {
        console.error('Элементы панели не найдены');
        return;
    }
    
    regionInfo.innerHTML = `
        <div class="region-header">
            <h2>${districtData.name}</h2>
            <p class="region-capital">🏛️ Районный центр: ${districtData.center}</p>
        </div>

        <div class="info-section">
            <h3>📊 Общие данные</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Площадь</span>
                    <span class="info-value">${districtData.area}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Население</span>
                    <span class="info-value">${districtData.population}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Плотность</span>
                    <span class="info-value">${districtData.density}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Год основания</span>
                    <span class="info-value">${districtData.founded}</span>
                </div>
            </div>
        </div>

        <div class="info-section">
            <h3>📍 Районный центр</h3>
            <p class="center-description">${districtData.foundedDescription || ''}</p>
        </div>

        ${districtData.landmarks && districtData.landmarks.length > 0 ? `
            <div class="info-section">
                <h3>🏛️ Достопримечательности</h3>
                <ul class="landmarks-list">
                    ${districtData.landmarks.map(l => `<li>${l}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        <div class="info-section">
            <h3>💼 Экономика</h3>
            <div class="economy-tags">
                ${districtData.economy.map(e => 
                    `<span class="economy-tag">${e}</span>`
                ).join('')}
            </div>
        </div>

        <div class="info-section">
            <h3>ℹ️ Описание</h3>
            <p class="region-description">${districtData.description}</p>
        </div>
    `;
    
    infoPanel.classList.remove('hidden');
}

// Переключение на режим районов
function switchToDistricts() {
    if (currentMapMode === 'districts') return;
    
    // Скрываем регионы
    if (regionsLayer) regionsLayer.remove();
    if (minskLayer) minskLayer.remove();
    cityMarkers.forEach(marker => marker.remove());
    if (minskMarker) minskMarker.remove();
    
    // Показываем районы
    loadDistrictsData();
    currentMapMode = 'districts';
    
    // Возвращаемся к начальному виду
    map.setView(mapConfig.center, 7);
    resetAllDistricts();
}

// Переключение обратно на регионы
function switchToRegions() {
    if (currentMapMode === 'regions') return;
    
    // Скрываем районы
    if (districtsLayer) districtsLayer.remove();
    districtMarkers.forEach(marker => marker.remove());
    
    // Показываем регионы
    loadRegionsData();
    currentMapMode = 'regions';
    
    // Возвращаемся к начальному виду
    map.setView(mapConfig.center, 7);
    resetAllRegions();
}
