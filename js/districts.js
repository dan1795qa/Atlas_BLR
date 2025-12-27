// ====================================================================
// УПРАВЛЕНИЕ СЛОЕМ РАЙОНОВ - Полная реализация
// ====================================================================

let districtLayer;
let districtMarkers = [];
let selectedDistrictLayer;
let currentMapMode = 'regions';
let districtClickHandler;

// ====================================================================
// 1. ПРЯМОЙ МАППИНГ НАЗВАНИЙ ИЗ GEOJSON К КЛЮЧАМ В allDistrictsInfo
// ====================================================================

const districtNameMapping = {
    // Брестская область
    'Барановичский': 'Барановичский',
    'Брестский': 'Брестский',
    'Пинский': 'Пинский',
    'Кобринский': 'Кобринский',
    'Ганцевичский': 'Ганцевичский',
    'Дрогичинский': 'Дрогичинский',
    'Жабинковский': 'Жабинковский',
    'Ивановский': 'Ивановский',
    'Камынский': 'Камынский',
    'Лунинецкий': 'Лунинецкий',
    'Малоритский': 'Малоритский',
    'Пружанский': 'Пружанский',
    'Радунский': 'Радунский',
    'Свислочский': 'Свислочский',
    'Высоковский': 'Высоковский',
    
    // Витебская область
    'Витебский': 'Витебский',
    'Полоцкий': 'Полоцкий',
    'Бешенковичский': 'Бешенковичский',
    'Браславский': 'Браславский',
    'Верхнедвинский': 'Верхнедвинский',
    'Докшицкий': 'Докшицкий',
    'Дубровский': 'Дубровский',
    'Лепельский': 'Лепельский',
    'Оршанский': 'Оршанский',
    'Поставский': 'Поставский',
    'Сенненский': 'Сенненский',
    'Толочинский': 'Толочинский',
    'Ушачский': 'Ушачский',
    'Чашникский': 'Чашникский',
    'Шумилинский': 'Шумилинский',
    'Россоньский': 'Россоньский',
    
    // Гомельская область
    'Гомельский': 'Гомельский',
    'Мозырский': 'Мозырский',
    'Речицкий': 'Речицкий',
    'Бобруйский': 'Бобруйский',
    'Букский': 'Букский',
    'Брагинский': 'Брагинский',
    'Ветковский': 'Ветковский',
    'Гомельский (сельский)': 'Гомельский (сельский)',
    'Добрушский': 'Добрушский',
    'Ельский': 'Ельский',
    'Жлобинский': 'Жлобинский',
    'Ивановский': 'Ивановский',
    'Калинковичский': 'Калинковичский',
    'Корма': 'Корма',
    'Лоевский': 'Лоевский',
    'Мозырский (сельский)': 'Мозырский (сельский)',
    'Наровльский': 'Наровльский',
    'Петриковский': 'Петриковский',
    'Речицкий (сельский)': 'Речицкий (сельский)',
    'Светлогорский': 'Светлогорский',
    'Хойнский': 'Хойский'
};

function findDistrictByGeoName(geoJsonName) {
    if (!geoJsonName) return null;
    
    // Сначала пробуем точное совпадение
    if (districtNameMapping[geoJsonName]) {
        return districtNameMapping[geoJsonName];
    }
    
    // Пробуем поиск по частичному совпадению
    const lowerGeoName = geoJsonName.toLowerCase().trim();
    for (const [geoName, dataName] of Object.entries(districtNameMapping)) {
        if (geoName.toLowerCase() === lowerGeoName) {
            return dataName;
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

// ====================================================================
// 2. ЗАГРУЗКА И ОТОБРАЖЕНИЕ ГРАНИЦ РАЙОНОВ
// ====================================================================

async function loadDistrictsData() {
    try {
        console.log('⏳ Загрузка GeoJSON районов...');
        const response = await fetch('belarus-regions-district.geojson');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const geojson = await response.json();
        console.log('✅ GeoJSON загружен. Полигонов:', geojson.features.length);
        
        if (!allDistrictsInfo) {
            console.error('❌ allDistrictsInfo недоступен!');
            return;
        }
        
        addDistrictBoundaries(geojson);
        addDistrictMarkers();
    } catch (error) {
        console.error('❌ Ошибка загрузки районов:', error);
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
            // Достаем название из свойств GeoJSON
            const geojsonName = feature.properties.shapeName || 
                               feature.properties.name || 
                               feature.properties.NAME || 
                               feature.properties.DISTRICT;
            
            // Ищем соответствие в данных
            const districtDataName = findDistrictByGeoName(geojsonName);
            
            if (!districtDataName || !allDistrictsInfo[districtDataName]) {
                console.warn('⚠️ Район не найден:', geojsonName);
                return;
            }
            
            const districtData = allDistrictsInfo[districtDataName];
            layer.districtName = districtDataName;
            layer.districtData = districtData;
            
            // ===== КЛИК ПО ГРАНИЦЕ =====
            layer.on('click', function(e) {
                selectDistrict(layer);
                showDistrictInfo(districtDataName);
                zoomToDistrict(layer);
                L.DomEvent.stopPropagation(e);
            });
            
            // ===== НАВЕДЕНИЕ МЫШИ =====
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
            
            // ===== ПОДСКАЗКА =====
            layer.bindTooltip(districtDataName, {
                permanent: false,
                direction: 'center',
                className: 'district-label'
            });
        }
    }).addTo(map);
    
    console.log('✅ Границы районов добавлены');
}

// ====================================================================
// 3. МАРКЕРЫ АДМИНИСТРАТИВНЫХ ЦЕНТРОВ
// ====================================================================

function addDistrictMarkers() {
    districtMarkers = [];
    
    for (const districtName in allDistrictsInfo) {
        const districtData = allDistrictsInfo[districtName];
        const coords = districtData.centerCoords;
        
        if (!coords || coords.length < 2) {
            console.warn('⚠️ Нет координат для:', districtName);
            continue;
        }
        
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
        marker.districtData = districtData;
        
        // ===== КЛИК ПО МАРКЕРУ =====
        marker.on('click', function(e) {
            selectDistrictByMarker(districtName);
            showDistrictInfo(districtName);
            L.DomEvent.stopPropagation(e);
        });
        
        // ===== НАВЕДЕНИЕ МЫШИ НА МАРКЕР =====
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
        
        // ===== POPUP ПРИ КЛИКЕ =====
        marker.bindPopup(() => createDistrictPopupContent(districtData), {
            maxWidth: 350,
            className: 'district-popup-container',
            closeButton: true
        });
        
        // ===== ПОДСКАЗКА ПРИ НАВЕДЕНИИ =====
        marker.bindTooltip(districtData.center, {
            permanent: false,
            direction: 'top',
            offset: [0, -15],
            className: 'district-marker-label'
        });
        
        districtMarkers.push(marker);
    }
    
    console.log('✅ Маркеры добавлены:', districtMarkers.length);
}

// ====================================================================
// 4. СОЗДАНИЕ POPUP МАРКЕРА
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
// 5. ВЫДЕЛЕНИЕ И СБРОС РАЙОНОВ
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
// 6. ПРИБЛИЖЕНИЕ К РАЙОНУ
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
// 7. ОТОБРАЖЕНИЕ ИНФОРМАЦИОННОЙ ПАНЕЛИ
// ====================================================================

function showDistrictInfo(districtName) {
    const districtData = allDistrictsInfo[districtName];
    if (!districtData) {
        console.warn('⚠️ Нет данных для района:', districtName);
        return;
    }
    
    const infoPanel = document.getElementById('info-panel');
    const regionInfo = document.getElementById('region-info');
    
    if (!infoPanel || !regionInfo) {
        console.error('❌ Панель информации не найдена');
        return;
    }
    
    // Форматирование плотности: округляем до целого
    const densityValue = districtData.density
        ? districtData.density.toString().split(' ')[0]
        : '—';
    const densityRounded = densityValue !== '—' 
        ? Math.round(parseFloat(densityValue.replace(',', '.')))
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
}

// ====================================================================
// 8. ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ КАРТЫ
// ====================================================================

function switchToDistricts() {
    if (currentMapMode === 'districts') return;
    
    console.log('🔄 Переключение на режим Районы...');
    
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
    console.log('✅ Режим Районы активирован');
}

function switchToRegions() {
    if (currentMapMode === 'regions') return;
    
    console.log('🔄 Переключение на режим Области...');
    
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
    console.log('✅ Режим Области активирован');
}

// ====================================================================
// 9. ИНИЦИАЛИЗАЦИЯ
// ====================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePanelClosing);
} else {
    initializePanelClosing();
}