// Управление слоем районов
let districtLayer;
let districtMarkers = [];
let selectedDistrictLayer;
let currentMapMode = 'regions'; // 'regions' или 'districts'
let districtClickHandler;

// Расширенный маппинг названий районов из GeoJSON на русские
const districtNameMapping = {
    // Брестская область
    'brest': 'Брестский',
    'broysk': 'Брестский',
    'brest district': 'Брестский',
    'baranovichi': 'Барановичский',
    'baranowici': 'Барановичский',
    'baranovichi district': 'Барановичский',
    'pinsk': 'Пинский',
    'pinsk district': 'Пинский',
    'kobrin': 'Кобринский',
    'kobrin district': 'Кобринский',
    
    // Гомельская область
    'gomel': 'Гомельский',
    'homiel': 'Гомельский',
    'gomel district': 'Гомельский',
    'mozyr': 'Мозырский',
    'mozyr district': 'Мозырский',
    'rechitsa': 'Речицкий',
    'rechytsa': 'Речицкий',
    'rechitsa district': 'Речицкий',
    
    // Витебская область
    'vitebsk': 'Витебский',
    'vitebsk district': 'Витебский',
    'polock': 'Полоцкий',
    'polatsk': 'Полоцкий',
    'polotsk': 'Полоцкий',
    'polock district': 'Полоцкий',
    'orsha': 'Витебский',
    'orsha district': 'Витебский',
    'novopolotsk': 'Витебский',
    
    // Минская область
    'minsk': 'Минский',
    'minsk district': 'Минский',
    'borisov': 'Борисовский',
    'borisov district': 'Борисовский',
    'myadel': 'Мядельский',
    'myadel district': 'Мядельский',
    'molodechno': 'Минский',
    'molodechno district': 'Минский',
    
    // Гродненская область
    'grodno': 'Гродненский',
    'grodno district': 'Гродненский',
    'lida': 'Лидский',
    'lida district': 'Лидский',
    'slonim': 'Гродненский',
    'slonim district': 'Гродненский',
    
    // Могилёвская область
    'mogilev': 'Могилёвский',
    'mogiljow': 'Могилёвский',
    'mogilev district': 'Могилёвский',
    'bobruysk': 'Бобруйский',
    'bobrujsk': 'Бобруйский',
    'bobruisk district': 'Бобруйский',
    'bobruysk district': 'Бобруйский'
};

// Отображение английского названия района на русское
function mapDistrictName(geojsonName) {
    if (!geojsonName) return null;
    
    const normalized = geojsonName.toLowerCase().trim();
    
    // Точный поиск
    if (districtNameMapping[normalized]) {
        return districtNameMapping[normalized];
    }
    
    // Проверка частичных совпадений
    for (const [key, value] of Object.entries(districtNameMapping)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return value;
        }
    }
    
    console.warn(`⚠️ Нет маппинга для '${geojsonName}'`);
    return null;
}

// Инициализация функций закрытия панели
function initializePanelClosing() {
    const closeBtn = document.getElementById('close-panel');
    const infoPanel = document.getElementById('info-panel');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (infoPanel) {
                infoPanel.classList.add('hidden');
            }
            resetAllDistricts();
            console.log('✖️ Панель информации закрыта');
        });
    }
}

// Загрузка и отображение районов
async function loadDistrictsData() {
    try {
        const response = await fetch('belarus-regions-district.geojson');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const geojson = await response.json();
        
        console.log('✅ Районы загружены успешно');
        console.log('Всего полигонов:', geojson.features.length);
        
        // Логи находимых районов
        const foundDistricts = [];
        const missingDistricts = [];
        
        geojson.features.forEach(feature => {
            const geojsonName = feature.properties.shapeName || feature.properties.name || feature.properties.NAME || feature.properties.DISTRICT;
            const mappedName = mapDistrictName(geojsonName);
            console.log(`GeoJSON name: '${geojsonName}' -> Mapped: '${mappedName}'`);
            
            if (mappedName && districtsInfo[mappedName]) {
                foundDistricts.push(mappedName);
            } else if (geojsonName) {
                missingDistricts.push(geojsonName);
            }
        });
        
        console.log('✅ Найдено объектов:', foundDistricts.length);
        if (missingDistricts.length > 0) {
            console.log('⚠️ Отсутствуют данные для (' + missingDistricts.length + '):', missingDistricts);
        }
        
        addDistrictBoundaries(geojson);
        addDistrictMarkers();
        
    } catch (error) {
        console.error('❌ Ошибка при загрузке районов:', error);
    }
}

// Добавление границ районов на карту
function addDistrictBoundaries(geojson) {
    districtLayer = L.geoJSON(geojson, {
        style: function(feature) {
            return {
                fillColor: '#4a7c7e',
                weight: 1.5,
                opacity: 1,
                color: '#7cf578',
                fillOpacity: 0.25,
                interactive: true,
                className: 'district-polygon'
            };
        },
        onEachFeature: function(feature, layer) {
            // Получаем имя района из GeoJSON
            const geojsonName = feature.properties.shapeName || feature.properties.name || feature.properties.NAME || feature.properties.DISTRICT;
            // Преобразуем к русскому
            const districtName = mapDistrictName(geojsonName);
            
            if (!districtName) {
                console.warn(`⚠️ Не найден маппинг для: ${geojsonName}`);
                return;
            }
            
            if (!districtsInfo[districtName]) {
                console.warn(`⚠️ Нет данных в districtsInfo для: ${districtName}`);
                return;
            }
            
            layer.districtName = districtName;
            layer.options.interactive = true;
            
            // Обработчик клика
            layer.on('click', function(e) {
                console.log('🔍 Клик по территории района:', districtName);
                selectDistrict(layer, districtName);
                if (districtsInfo[districtName]) {
                    showDistrictInfo(districtName);
                }
                zoomToDistrict(layer);
                L.DomEvent.stopPropagation(e);
            });
            
            // Эффект наведения
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
            
            // Лабель с названием района
            layer.bindTooltip(districtName, {
                permanent: false,
                direction: 'center',
                className: 'district-label'
            });
        }
    }).addTo(map);
    
    console.log('✅ Границы районов добавлены на карту');
}

// Добавление маркеров районных центров
function addDistrictMarkers() {
    districtMarkers = [];
    
    for (const districtName in districtsInfo) {
        const district = districtsInfo[districtName];
        const coords = district.centerCoords;
        
        if (!coords || coords.length < 2) {
            console.warn(`⚠️ Нет координат для: ${districtName}`);
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
            pane: 'markerPane',
            interactive: true
        }).addTo(map);
        
        marker.districtName = districtName;
        marker.districtData = district;
        
        // Обработчик клика по маркеру
        marker.on('click', function(e) {
            console.log('🔍 Клик по маркеру района:', districtName);
            selectDistrictByMarker(districtName);
            showDistrictInfo(districtName);
            L.DomEvent.stopPropagation(e);
        });
        
        // Эффект наведения
        marker.on('mouseover', function() {
            marker.setStyle({
                radius: 9,
                weight: 3,
                fillOpacity: 1
            });
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
            maxWidth: 300,
            className: 'district-popup-container',
            closeButton: true
        });
        
        // Лабель с названием центра района
        marker.bindTooltip(district.center, {
            permanent: false,
            direction: 'top',
            offset: [0, -15],
            className: 'district-marker-label'
        });
        
        districtMarkers.push(marker);
    }
    
    console.log('📍 Маркеры районных центров добавлены (' + districtMarkers.length + ')');
}

// Создание содержимого popup для районного центра
function createDistrictPopupContent(district) {
    const foundedYear = district.founded || "Неизвестно";
    const foundedDesc = district.foundedDescription || "";
    
    return `
        <div class="district-popup">
            <h3>🏁 ${district.name}</h3>
            <div class="popup-info">
                ${foundedDesc ? `<p class="popup-founded-desc"><strong>🏛️ Центр:</strong> ${district.center}</p>` : ''}
                <p class="popup-founded">
                    <strong>📅 Основана:</strong> ${foundedYear}${district.founded ? ' г.' : ''}
                </p>
                ${foundedDesc ? `<p class="popup-text">${foundedDesc}</p>` : ''}
                <p><strong>👥 Население:</strong> ${district.population}</p>
                <p><strong>📋 Площадь:</strong> ${district.area}</p>
            </div>
        </div>
    `;
}

// Выделение района по территории
function selectDistrict(layer, districtName) {
    // Сбрасываем предыдущее выделение
    resetAllDistricts();
    
    if (layer) {
        // Выделяем новый район ощутимым цветом
        layer.setStyle({
            fillColor: '#7cf578',      // светло-зеленый
            weight: 3,                 // толстая граница
            fillOpacity: 0.5,          // высокая прозрачность
            color: '#7cf578'           // цвет границы
        });
        
        layer.bringToFront();
        selectedDistrictLayer = layer;
    }
}

// Выделение района по маркеру
function selectDistrictByMarker(districtName) {
    resetAllDistricts();
    
    // Найдем и выделим основные границы района
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

// Сброс всех выделений районов
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

// Приближение к району
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
        maxZoom: 10,
        animate: true,
        duration: 0.6
    });
}

// Отображение детальной информации о районе в боковой панели
function showDistrictInfo(districtName) {
    const districtData = districtsInfo[districtName];
    
    if (!districtData) {
        console.warn(`⚠️ Нет данных для: ${districtName}`);
        return;
    }

    const infoPanel = document.getElementById('info-panel');
    const regionInfo = document.getElementById('region-info');
    
    if (!infoPanel || !regionInfo) {
        console.error('❌ Панель информации не найдена в DOM');
        return;
    }
    
    // Основная информация
    regionInfo.innerHTML = `
        <div class="region-header">
            <h2>🏁 ${districtData.name}</h2>
            <p class="region-capital">🏛️ Центр: <strong>${districtData.center}</strong></p>
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
                    <span class="info-value">${districtData.density}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">📅 Основана</span>
                    <span class="info-value">${districtData.founded}</span>
                </div>
            </div>
        </div>

        <div class="info-section">
            <h3>🏁 О центре</h3>
            <p class="center-description">${districtData.foundedDescription || 'Нет информации'}</p>
        </div>

        ${districtData.landmarks && districtData.landmarks.length > 0 ? `
            <div class="info-section">
                <h3>🏛️ Достопримечательности</h3>
                <ul class="landmarks-list">
                    ${districtData.landmarks.map(l => `<li>🏰 ${l}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        <div class="info-section">
            <h3>🏭 Экономика</h3>
            <div class="economy-tags">
                ${districtData.economy.map(e => 
                    `<span class="economy-tag">🏢 ${e}</span>`
                ).join('')}
            </div>
        </div>

        <div class="info-section">
            <h3>ℹ️ Описание</h3>
            <p class="region-description">${districtData.description}</p>
        </div>
    `;
    
    // Отображаем панель
    infoPanel.classList.remove('hidden');
    regionInfo.scrollTop = 0;
    
    console.log('✅ Панель информации сформирована для района: ', districtName);
}

// Переключение на режим районов
function switchToDistricts() {
    if (currentMapMode === 'districts') return;
    
    console.log('🔁 Переключаюсь на районы...');
    
    // Скрываем регионы
    if (window.regionsLayer) {
        map.removeLayer(window.regionsLayer);
    }
    if (window.minskLayer) {
        map.removeLayer(window.minskLayer);
    }
    
    // Удаляем маркеры городов
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
    
    // Загружаем районы
    loadDistrictsData();
    currentMapMode = 'districts';
    
    // Обновляем обработчик клика на карту
    if (districtClickHandler) {
        map.off('click', districtClickHandler);
    }
    districtClickHandler = function(e) {
        resetAllDistricts();
        const panel = document.getElementById('info-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
        map.setView(mapConfig.center, 7);
    };
    map.on('click', districtClickHandler);
    
    // Возвращаемся к стандартному виду
    map.setView(mapConfig.center, 7);
    resetAllDistricts();
    
    console.log('✅ Модуль районов активирован');
}

// Переключение назад на регионы
function switchToRegions() {
    if (currentMapMode === 'regions') return;
    
    console.log('🔁 Переключаюсь на области...');
    
    // Скрываем районы
    if (districtLayer) {
        map.removeLayer(districtLayer);
    }
    
    // Удаляем маркеры районов
    districtMarkers.forEach(marker => {
        if (map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    });
    
    // Очищаем старый обработчик
    if (districtClickHandler) {
        map.off('click', districtClickHandler);
    }
    
    // Перегружаем регионы
    loadRegionsData();
    currentMapMode = 'regions';
    
    // Берем к стандартному виду
    map.setView(mapConfig.center, 7);
    if (window.resetAllRegions) {
        window.resetAllRegions();
    }
    
    console.log('✅ Модуль областей активирован');
}

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePanelClosing);
} else {
    initializePanelClosing();
}
