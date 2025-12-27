// ====================================================================
// УПРАВЛЕНИЕ СЛОЕМ РАЙОНОВ - Полная реализация
// ====================================================================

let districtLayer;
let districtMarkers = [];
let selectedDistrictLayer;
let currentMapMode = 'regions';
let districtClickHandler;

console.log('🔍 [Districts] Модуль загружен');

// ====================================================================
// 1. ПРИМЕЧАНИЕ: ПОВОРАЦИВАНИЕ ДАННЫХ
// ====================================================================

// Правка имен для грамотного совпадения
const districtNameCorrections = {
    'Баранович': 'Барановичский',
    'Бобруйским': 'Бобруйский',
    'Хойский': 'Хойский'
};

function cleanDistrictName(name) {
    if (!name) return null;
    let cleaned = name.trim();
    
    // Применяем коррекции
    for (const [from, to] of Object.entries(districtNameCorrections)) {
        if (cleaned.includes(from)) {
            cleaned = cleaned.replace(from, to);
        }
    }
    
    // Убираем половинные элементы
    cleaned = cleaned
        .replace(/\s*\(.*?\)/g, '') // Убираем всё в скобках
        .replace(/\s+район$/i, '') // Убираем " район" в конце
        .trim();
    
    return cleaned;
}

function findDistrictInData(geoJsonName) {
    if (!geoJsonName || !allDistrictsInfo) {
        console.warn('⚠️ [Districts] Отсутствует geoJsonName или allDistrictsInfo');
        return null;
    }
    
    const cleaned = cleanDistrictName(geoJsonName);
    console.log(`🔍 [Districts] Поиск района: "${geoJsonName}" → "${cleaned}"`);
    
    // Пробуем точное совпадение
    if (allDistrictsInfo[cleaned]) {
        console.log(`✅ [Districts] Найден: ${cleaned}`);
        return cleaned;
    }
    
    // Пробуем регистрнезависимый поиск
    const cleanedLower = cleaned.toLowerCase();
    for (const districtKey in allDistrictsInfo) {
        if (districtKey.toLowerCase() === cleanedLower) {
            console.log(`✅ [Districts] Найден (регистр): ${districtKey}`);
            return districtKey;
        }
    }
    
    console.warn(`❌ [Districts] Не найден район: "${cleaned}"`);
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

// ====================================================================
// 2. ЗАГРУЗКА И ОТОБРАЖЕНИЕ ГРАНИЦ РАЙОНОВ
// ====================================================================

async function loadDistrictsData() {
    try {
        console.log('⏳ [Districts] Загрузка GeoJSON...');
        const response = await fetch('belarus-regions-district.geojson');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const geojson = await response.json();
        console.log('✅ [Districts] GeoJSON загружен. Полигонов:', geojson.features.length);
        
        if (!allDistrictsInfo) {
            console.error('❌ [Districts] allDistrictsInfo недоступен!');
            return;
        }
        
        console.log('✅ [Districts] allDistrictsInfo активен, кол-во районов:', Object.keys(allDistrictsInfo).length);
        
        addDistrictBoundaries(geojson);
        addDistrictMarkers();
    } catch (error) {
        console.error('❌ [Districts] Ошибка загружки:', error);
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
            const geojsonName = feature.properties.shapeName || 
                               feature.properties.name || 
                               feature.properties.NAME || 
                               feature.properties.DISTRICT;
            
            const districtDataName = findDistrictInData(geojsonName);
            
            if (!districtDataName) {
                console.warn(`⚠️ [Districts] Территория без данных: "${geojsonName}"`);
                return;
            }
            
            const districtData = allDistrictsInfo[districtDataName];
            layer.districtName = districtDataName;
            layer.districtData = districtData;
            
            // КЛИК - основной обработчик
            layer.on('click', function(e) {
                console.log('✅ [Districts] КЛИК СРАБОТАЛ! Район:', districtDataName);
                L.DomEvent.stopPropagation(e);
                selectDistrict(layer);
                showDistrictInfo(districtDataName);
                zoomToDistrict(layer);
            });
            
            // НАВЕДЕНИЕ
            layer.on('mouseover', function() {
                console.log('🔄 [Districts] Наведение на:', districtDataName);
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
            
            // ПОДСКАЗКА
            layer.bindTooltip(districtDataName, {
                permanent: false,
                direction: 'center',
                className: 'district-label'
            });
        }
    }).addTo(map);
    
    // Убедимся, что слой в переднем плане
    districtLayer.bringToFront();
    
    console.log('✅ [Districts] Границы добавлены и готовы к клику');
}

// ====================================================================
// 3. МАРКЕРЫ
// ====================================================================

function addDistrictMarkers() {
    districtMarkers = [];
    
    for (const districtName in allDistrictsInfo) {
        const districtData = allDistrictsInfo[districtName];
        const coords = districtData.centerCoords;
        
        if (!coords || coords.length < 2) {
            continue;
        }
        
        const marker = L.circleMarker([coords[0], coords[1]], {
            radius: 7,
            fillColor: '#7cf578',
            color: '#37FF8B',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
            className: 'district-marker',
            interactive: true
        }).addTo(map);
        
        marker.districtName = districtName;
        marker.districtData = districtData;
        
        marker.on('click', function(e) {
            console.log('✅ [Districts] Клик по маркеру:', districtName);
            L.DomEvent.stopPropagation(e);
            selectDistrictByMarker(districtName);
            showDistrictInfo(districtName);
        });
        
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
        
        marker.bindPopup(() => createDistrictPopupContent(districtData), {
            maxWidth: 350,
            className: 'district-popup-container',
            closeButton: true
        });
        
        marker.bindTooltip(districtData.center, {
            permanent: false,
            direction: 'top',
            offset: [0, -15],
            className: 'district-marker-label'
        });
        
        districtMarkers.push(marker);
    }
    
    console.log('✅ [Districts] Маркеры добавлены:', districtMarkers.length);
}

// ====================================================================
// 4. POPUP
// ====================================================================

function createDistrictPopupContent(districtData) {
    const foundedYear = districtData.founded || 'Неизвестно';
    const foundedDesc = districtData.foundedDescription || '';
    
    return `
        <div class="district-popup">
            <h3>🏁 ${districtData.name}</h3>
            <div class="popup-info">
                <p class="popup-center"><strong>🏛️ Центр:</strong> ${districtData.center}</p>
                <p class="popup-region"><strong>📍 Область:</strong> ${districtData.region}</p>
                <p class="popup-founded"><strong>📅 Основана:</strong> ${foundedYear}${districtData.founded ? ' г.' : ''}</p>
                ${foundedDesc ? `<p class="popup-text">💭 ${foundedDesc}</p>` : ''}
                <p><strong>👥 Население:</strong> ${districtData.population}</p>
                <p><strong>📋 Площадь:</strong> ${districtData.area}</p>
                <p><strong>📊 Плотность:</strong> ${districtData.density}</p>
            </div>
        </div>
    `;
}

// ====================================================================
// 5. ВЫДЕЛЕНИЕ / СБРОС
// ====================================================================

function selectDistrict(layer) {
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
        console.log('✅ [Districts] Район выделен:', layer.districtName);
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

// ====================================================================
// 6. ПРИБЛИЖЕНИЕ
// ====================================================================

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

// ====================================================================
// 7. ИНФОПАНЕЛЬ
// ====================================================================

function showDistrictInfo(districtName) {
    const districtData = allDistrictsInfo[districtName];
    if (!districtData) {
        console.warn('⚠️ [Districts] Нет данных для:', districtName);
        return;
    }
    
    const infoPanel = document.getElementById('info-panel');
    const regionInfo = document.getElementById('region-info');
    
    if (!infoPanel || !regionInfo) {
        console.error('❌ [Districts] Панель не найдена');
        return;
    }
    
    const densityValue = districtData.density
        ? districtData.density.toString().split(' ')[0]
        : '—';
    const densityRounded = densityValue !== '—' 
        ? Math.round(parseFloat(densityValue.replace(',', '.')));
        : '—';
    const densityFormatted = densityRounded !== '—' 
        ? `${densityRounded} чел/км²`
        : '—';
    
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
                    <span class="info-value">${districtData.area}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">👥 Население</span>
                    <span class="info-value">${districtData.population}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">📊 Плотность</span>
                    <span class="info-value">${densityFormatted}</span>
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
    console.log('✅ [Districts] Панель выведена');
}

// ====================================================================
// 8. ПЕРЕКЛЮЧЕНИЕ МОДОВ - ГЛОБАЛЬНЫЕ ФУНКЦИИ
// ====================================================================

window.switchToDistricts = function() {
    if (currentMapMode === 'districts') return;
    
    console.log('🔄 [Districts] Переключение на режим районы...');
    
    // Скрыть слои регионов
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
    
    loadDistrictsData();
    currentMapMode = 'districts';
    
    if (districtClickHandler) map.off('click', districtClickHandler);
    districtClickHandler = function(e) {
        resetAllDistricts();
        const panel = document.getElementById('info-panel');
        if (panel) panel.classList.add('hidden');
        map.setView(mapConfig.center, 7);
    };
    map.on('click', districtClickHandler);
    
    map.setView(mapConfig.center, 7);
    console.log('✅ [Districts] Режим районов включен');
};

window.switchToRegions = function() {
    if (currentMapMode === 'regions') return;
    
    console.log('🔄 [Districts] Переключение на режим областей...');
    
    if (districtLayer) map.removeLayer(districtLayer);
    
    districtMarkers.forEach(marker => {
        if (map.hasLayer(marker)) map.removeLayer(marker);
    });
    
    if (districtClickHandler) map.off('click', districtClickHandler);
    
    loadRegionsData();
    currentMapMode = 'regions';
    map.setView(mapConfig.center, 7);
    
    if (window.resetAllRegions) window.resetAllRegions();
    console.log('✅ [Districts] Режим областей включен');
};

// ====================================================================
// 9. ИНИЦИАЛИЗАЦИЯ
// ====================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePanelClosing);
} else {
    initializePanelClosing();
}

console.log('🔏 [Districts] Модуль инициализирован и готов к работе');