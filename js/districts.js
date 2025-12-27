// Управление слоем районов с полной интеграцией всех 118 районов
let districtLayer;
let districtMarkers = [];
let selectedDistrictLayer;
let currentMapMode = 'regions';
let districtClickHandler;

// Функция для нормализации имен районов из GeoJSON
function normalizeDistrictName(name) {
    if (!name) return null;
    return name
        .trim()
        .toLowerCase()
        .replace(/ский$/g, 'ский')
        .replace(/ский городской/g, 'ский')
        .replace(/район/g, '')
        .trim();
}

// Функция для поиска района в всех данных по разным вариантам названия
function findDistrictByName(geojsonName) {
    if (!geojsonName || !allDistrictsInfo) return null;
    
    const normalized = normalizeDistrictName(geojsonName);
    
    // Попытка точного совпадения
    for (const districtName in allDistrictsInfo) {
        if (normalizeDistrictName(districtName) === normalized) {
            return districtName;
        }
    }
    
    // Попытка частичного совпадения
    for (const districtName in allDistrictsInfo) {
        if (normalizeDistrictName(geojsonName).includes(normalizeDistrictName(districtName)) || 
            normalizeDistrictName(districtName).includes(normalizeDistrictName(geojsonName))) {
            return districtName;
        }
    }
    
    return null;
}

function initializePanelClosing() {
    const closeBtn = document.getElementById('close-panel');
    const infoPanel = document.getElementById('info-panel');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (infoPanel) infoPanel.classList.add('hidden');
            resetAllDistricts();
        });
    }
}

async function loadDistrictsData() {
    try {
        const response = await fetch('belarus-regions-district.geojson');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const geojson = await response.json();
        console.log('✅ Районы загружены. Всего полигонов:', geojson.features.length);
        
        const foundDistricts = [];
        const missingDistricts = [];
        
        geojson.features.forEach(feature => {
            const geojsonName = feature.properties.shapeName || feature.properties.name || feature.properties.NAME || feature.properties.DISTRICT;
            const mappedName = findDistrictByName(geojsonName);
            if (mappedName) {
                foundDistricts.push(mappedName);
            } else if (geojsonName) {
                missingDistricts.push(geojsonName);
            }
        });
        
        console.log('✅ Найдено районов:', foundDistricts.length);
        if (missingDistricts.length > 0) {
            console.warn('⚠️ Районы не найдены в данных:', missingDistricts.slice(0, 5));
        }
        
        addDistrictBoundaries(geojson);
        addDistrictMarkers();
    } catch (error) {
        console.error('❌ Ошибка загружения районов:', error);
    }
}

function addDistrictBoundaries(geojson) {
    districtLayer = L.geoJSON(geojson, {
        style: function(feature) {
            return {
                fillColor: '#4a7c7e',
                weight: 1.5,
                opacity: 1,
                color: '#7cf578',
                fillOpacity: 0.25,
                interactive: true
            };
        },
        onEachFeature: function(feature, layer) {
            const geojsonName = feature.properties.shapeName || feature.properties.name || feature.properties.NAME || feature.properties.DISTRICT;
            const districtName = findDistrictByName(geojsonName);
            
            if (!districtName || !allDistrictsInfo[districtName]) {
                console.warn('⚠️ Не найден район:', geojsonName);
                return;
            }
            
            layer.districtName = districtName;
            layer.districtData = allDistrictsInfo[districtName];
            
            // Клик по территории района
            layer.on('click', function(e) {
                selectDistrict(layer, districtName);
                showDistrictInfo(districtName);
                zoomToDistrict(layer);
                L.DomEvent.stopPropagation(e);
            });
            
            // Наведение мышки
            layer.on('mouseover', function() {
                if (selectedDistrictLayer !== layer) {
                    layer.setStyle({
                        fillOpacity: 0.35,
                        weight: 2,
                        cursor: 'pointer'
                    });
                    layer.bringToFront();
                }
            });
            
            layer.on('mouseout', function() {
                if (selectedDistrictLayer !== layer) {
                    layer.setStyle({
                        fillOpacity: 0.25,
                        weight: 1.5,
                        cursor: 'default'
                    });
                }
            });
            
            // Подсказка при наведении
            layer.bindTooltip(districtName, {
                permanent: false,
                direction: 'center',
                className: 'district-label'
            });
        }
    }).addTo(map);
}

function addDistrictMarkers() {
    districtMarkers = [];
    
    for (const districtName in allDistrictsInfo) {
        const district = allDistrictsInfo[districtName];
        const coords = district.centerCoords;
        
        if (!coords || coords.length < 2) {
            console.warn('⚠️ Нет координат для:', districtName);
            continue;
        }
        
        // Координаты в GeoJSON обычно [lat, lng]
        const marker = L.circleMarker([coords[0], coords[1]], {
            radius: 7,
            fillColor: '#7cf578',
            color: '#37FF8B',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
            className: 'district-marker'
        }).addTo(map);
        
        marker.districtName = districtName;
        marker.districtData = district;
        
        // Клик по маркеру
        marker.on('click', function(e) {
            selectDistrictByMarker(districtName);
            showDistrictInfo(districtName);
            L.DomEvent.stopPropagation(e);
        });
        
        // Наведение
        marker.on('mouseover', function() {
            marker.setStyle({
                radius: 9,
                weight: 3,
                fillOpacity: 1
            });
            marker.bringToFront();
        });
        
        marker.on('mouseout', function() {
            marker.setStyle({
                radius: 7,
                weight: 2,
                fillOpacity: 0.9
            });
        });
        
        // Popup при клике на маркер
        marker.bindPopup(() => createDistrictPopupContent(district), {
            maxWidth: 350,
            className: 'district-popup-container',
            closeButton: true
        });
        
        // Подсказка - название центра
        marker.bindTooltip(district.center, {
            permanent: false,
            direction: 'top',
            offset: [0, -15],
            className: 'district-marker-label'
        });
        
        districtMarkers.push(marker);
    }
    
    console.log('✅ Добавлено маркеров:', districtMarkers.length);
}

function createDistrictPopupContent(district) {
    const foundedYear = district.founded || 'Неизвестно';
    const foundedDesc = district.foundedDescription || '';
    
    return `
        <div class="district-popup">
            <h3>🏁 ${district.name}</h3>
            <div class="popup-info">
                <p class="popup-center"><strong>🏛️ Административный центр:</strong> ${district.center}</p>
                <p class="popup-region"><strong>📍 Область:</strong> ${district.region}</p>
                <p class="popup-founded"><strong>📅 Основана:</strong> ${foundedYear}${district.founded ? ' г.' : ''}</p>
                ${foundedDesc ? `<p class="popup-text">💭 ${foundedDesc}</p>` : ''}
                <p><strong>👥 Население:</strong> ${district.population}</p>
                <p><strong>📋 Площадь:</strong> ${district.area} км²</p>
                <p><strong>📊 Плотность:</strong> ${district.density} чел/км²</p>
            </div>
        </div>
    `;
}

function selectDistrict(layer, districtName) {
    resetAllDistricts();
    
    if (layer) {
        layer.setStyle({
            fillColor: '#7cf578',
            weight: 3,
            fillOpacity: 0.5,
            color: '#7cf578'
        });
        layer.bringToFront();
        selectedDistrictLayer = layer;
    }
}

function selectDistrictByMarker(districtName) {
    resetAllDistricts();
    
    if (districtLayer) {
        districtLayer.eachLayer(function(layer) {
            if (layer.districtName === districtName) {
                layer.setStyle({
                    fillColor: '#7cf578',
                    weight: 3,
                    fillOpacity: 0.5,
                    color: '#7cf578'
                });
                layer.bringToFront();
                selectedDistrictLayer = layer;
            }
        });
    }
}

function resetAllDistricts() {
    if (districtLayer) {
        districtLayer.eachLayer(function(layer) {
            layer.setStyle({
                fillColor: '#4a7c7e',
                weight: 1.5,
                fillOpacity: 0.25,
                color: '#7cf578'
            });
        });
    }
    selectedDistrictLayer = null;
}

function zoomToDistrict(layer) {
    const bounds = layer.getBounds();
    const panelWidth = 420;
    
    map.fitBounds(bounds, {
        paddingTopLeft: [20, 20],
        paddingBottomRight: [panelWidth + 30, 20],
        maxZoom: 10,
        animate: true,
        duration: 0.6
    });
}

function showDistrictInfo(districtName) {
    const districtData = allDistrictsInfo[districtName];
    if (!districtData) {
        console.warn('⚠️ Нет данных для района:', districtName);
        return;
    }
    
    const infoPanel = document.getElementById('info-panel');
    const regionInfo = document.getElementById('region-info');
    
    if (!infoPanel || !regionInfo) {
        console.error('❌ Не найдены элементы панели информации');
        return;
    }
    
    regionInfo.innerHTML = `
        <div class="region-header">
            <h2>🏁 ${districtData.name}</h2>
            <p class="region-capital">🏛️ Административный центр: <strong>${districtData.center}</strong></p>
            <p class="region-capital-region">📍 Область: <strong>${districtData.region}</strong></p>
        </div>
        
        <div class="info-section">
            <h3>📊 Основные сведения</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">📋 Площадь</span>
                    <span class="info-value">${districtData.area} км²</span>
                </div>
                <div class="info-item">
                    <span class="info-label">👥 Население</span>
                    <span class="info-value">${districtData.population}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">📊 Плотность</span>
                    <span class="info-value">${districtData.density} чел/км²</span>
                </div>
                <div class="info-item">
                    <span class="info-label">📅 Основана</span>
                    <span class="info-value">${districtData.founded} г.</span>
                </div>
            </div>
        </div>
        
        <div class="info-section">
            <h3>🏛️ История центра</h3>
            <p class="center-description">${districtData.foundedDescription || 'Информация отсутствует'}</p>
        </div>
        
        ${districtData.landmarks && districtData.landmarks.length > 0 ? `
        <div class="info-section">
            <h3>🏰 Достопримечательности</h3>
            <ul class="landmarks-list">
                ${districtData.landmarks.map(l => `<li>🏰 ${l}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        <div class="info-section">
            <h3>🏭 Экономика</h3>
            <div class="economy-tags">
                ${districtData.economy.map(e => `<span class="economy-tag">🏢 ${e}</span>`).join('')}
            </div>
        </div>
        
        <div class="info-section">
            <h3>ℹ️ Описание</h3>
            <p class="region-description">${districtData.description}</p>
        </div>
    `;
    
    infoPanel.classList.remove('hidden');
    regionInfo.scrollTop = 0;
}

function switchToDistricts() {
    if (currentMapMode === 'districts') return;
    
    // Скрыть слой регионов
    if (window.regionsLayer) map.removeLayer(window.regionsLayer);
    if (window.minskLayer) map.removeLayer(window.minskLayer);
    
    // Удалить маркеры городов
    if (window.cityMarkers) {
        window.cityMarkers.forEach(city => {
            if (city && city.marker && map.hasLayer(city.marker)) {
                map.removeLayer(city.marker);
            }
        });
    }
    if (window.minskMarker && map.hasLayer(window.minskMarker)) {
        map.removeLayer(window.minskMarker);
    }
    
    // Загрузить районы
    loadDistrictsData();
    currentMapMode = 'districts';
    
    // Обработчик клика на карту для сброса
    if (districtClickHandler) map.off('click', districtClickHandler);
    districtClickHandler = function(e) {
        resetAllDistricts();
        const panel = document.getElementById('info-panel');
        if (panel) panel.classList.add('hidden');
        map.setView(mapConfig.center, 7);
    };
    map.on('click', districtClickHandler);
    
    map.setView(mapConfig.center, 7);
}

function switchToRegions() {
    if (currentMapMode === 'regions') return;
    
    // Скрыть слой районов
    if (districtLayer) map.removeLayer(districtLayer);
    
    // Удалить маркеры районов
    districtMarkers.forEach(marker => {
        if (map.hasLayer(marker)) map.removeLayer(marker);
    });
    
    if (districtClickHandler) map.off('click', districtClickHandler);
    
    // Загрузить регионы
    loadRegionsData();
    currentMapMode = 'regions';
    map.setView(mapConfig.center, 7);
    
    if (window.resetAllRegions) window.resetAllRegions();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePanelClosing);
} else {
    initializePanelClosing();
}