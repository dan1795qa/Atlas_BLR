// Управление слоем районов
let districtsLayer;
let districtMarkers = [];
let selectedDistrict = null;
let currentMapMode = 'regions'; // 'regions' или 'districts'
let districtClickHandler;

// Полный маппинг названий районов из GeoJSON на русские
const districtNameMapping = {
    // Магилёвская область
    'Mogilev': 'Могилёвский',
    'Bobruysk': 'Бобруйский',
    
    // Гомельская область
    'Gomel': 'Гомельский',
    'Zhlobin': 'Гомельский', // Шлобин в области
    'Mozyr': 'Мозырский',
    'Rechytsa': 'Речицкий',
    
    // Витебская область
    'Vitebsk': 'Витебский',
    'Polotsk': 'Полоцкий',
    'Orsha': 'Орша',
    'Novopolotsk': 'Новополоцк',
    
    // Минская область
    'Minsk': 'Минский',
    'Borisov': 'Борисовский',
    'Myadel': 'Мядельский',
    'Molodechno': 'Молодечно',
    
    // Гродненская область
    'Grodno': 'Гродненский',
    'Lida': 'Лидский',
    'Slonim': 'Слоним',
    'Baranovichi': 'Барановичский',
    
    // Брестская область
    'Brest': 'Брестский',
    'Pinsk': 'Пинский',
    'Kobrin': 'Кобринский',
    'Baranowicze': 'Барановичский'
};

// Отображаем английские названия районов к русским
function mapDistrictName(geojsonName) {
    if (!geojsonName) return null;
    
    // Пытаемся точно соответствовать
    for (const [englishName, russianName] of Object.entries(districtNameMapping)) {
        if (geojsonName === englishName) {
            return russianName;
        }
    }
    
    // Эогда ялашный поиск
    for (const [englishName, russianName] of Object.entries(districtNameMapping)) {
        if (geojsonName.toLowerCase().includes(englishName.toLowerCase())) {
            return russianName;
        }
    }
    
    // Эсли ничего не найдено
    return null;
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
            const geojsonName = feature.properties.shapeName;
            const mappedName = mapDistrictName(geojsonName);
            if (mappedName && districtsInfo[mappedName]) {
                foundDistricts.push(mappedName);
            } else {
                missingDistricts.push(geojsonName);
            }
        });
        
        console.log('✅ Найдено объектов:', foundDistricts.length);
        console.log('⚠️ Отсутствуют данные для (' + missingDistricts.length + '):', missingDistricts.slice(0, 5));
        
        addDistrictBoundaries(geojson);
        addDistrictMarkers();
        
    } catch (error) {
        console.error('❌ Ошибка при загрузке районов:', error);
    }
}

// Добавление границ районов на карту
function addDistrictBoundaries(geojson) {
    districtsLayer = L.geoJSON(geojson, {
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
            const geojsonName = feature.properties.shapeName;
            // Преобразуем к русскому
            const districtName = mapDistrictName(geojsonName);
            
            if (!districtName) {
                console.warn(`⚠️ Не найден маппинг для: ${geojsonName}`);
                return;
            }
            
            layer.districtName = districtName;
            layer.options.interactive = true;
            
            layer.on({
                click: function(e) {
                    console.log('🖍️ Клик по району:', districtName);
                    selectDistrict(layer, districtName);
                    if (districtsInfo[districtName]) {
                        showDistrictInfo(districtName);
                    }
                    zoomToDistrict(layer);
                    L.DomEvent.stopPropagation(e);
                },
                mouseover: function() {
                    if (selectedDistrict !== layer) {
                        layer.setStyle({
                            fillOpacity: 0.35,
                            weight: 2,
                            cursor: 'pointer'
                        });
                        layer.bringToFront();
                    }
                },
                mouseout: function() {
                    if (selectedDistrict !== layer) {
                        layer.setStyle({
                            fillOpacity: 0.25,
                            weight: 1.5,
                            cursor: 'default'
                        });
                    }
                }
            });
            
            // Лабел с названием района
            layer.bindTooltip(districtName, {
                permanent: false,
                direction: 'center',
                className: 'district-label'
            });
        }
    }).addTo(map);
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
        
        const marker = L.circleMarker([coords[1], coords[0]], {
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
        
        marker.on({
            click: function(e) {
                console.log('🖍️ Клик по маркеру:', districtName);
                selectDistrictByMarker(districtName);
                showDistrictInfo(districtName);
                L.DomEvent.stopPropagation(e);
            },
            mouseover: function() {
                marker.setStyle({
                    radius: 9,
                    weight: 3,
                    fillOpacity: 1
                });
            },
            mouseout: function() {
                marker.setStyle({
                    radius: 7,
                    weight: 2,
                    fillOpacity: 0.9
                });
            }
        });
        
        // Popup при клике на маркер
        marker.bindPopup(() => createDistrictPopupContent(district), {
            maxWidth: 300,
            className: 'district-popup-container',
            closeButton: true
        });
        
        // Лабел с названием центра района
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
                ${foundedDesc ? `<p class="popup-founded-desc"><strong>📍 Центр:</strong> ${district.center}</p>` : ''}
                <p class="popup-founded">
                    <strong>📅 Основан:</strong> ${foundedYear}${district.founded ? ' г.' : ''}
                </p>
                ${foundedDesc ? `<p class="popup-text">${foundedDesc}</p>` : ''}
                <p><strong>👥 Население:</strong> ${district.population}</p>
                <p><strong>📏 Площадь:</strong> ${district.area}</p>
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
            color: '#7cf578'           // цвет границ
        });
        
        layer.bringToFront();
        selectedDistrict = layer;
    }
}

// Выделение района по маркеру
function selectDistrictByMarker(districtName) {
    resetAllDistricts();
    
    // Найдем и выделим основые границы района
    if (districtsLayer) {
        districtsLayer.eachLayer(function(layer) {
            if (layer.districtName === districtName) {
                layer.setStyle({
                    fillColor: '#7cf578',
                    weight: 3,
                    fillOpacity: 0.5,
                    color: '#7cf578'
                });
                layer.bringToFront();
                selectedDistrict = layer;
            }
        });
    }
}

// Сброс всех выделений районов
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
                    <span class="info-label">📏 Площадь</span>
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
                    <span class="info-label">📅 Основан</span>
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
                <h3>🏛️ Ностопримечательности</h3>
                <ul class="landmarks-list">
                    ${districtData.landmarks.map(l => `<li>🇀 ${l}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        <div class="info-section">
            <h3>🎦 Экономика</h3>
            <div class="economy-tags">
                ${districtData.economy.map(e => 
                    `<span class="economy-tag">🏙️ ${e}</span>`
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
    
    console.log('✅ Панель информации формирована для района г. г. ', districtName);
}

// Переключение на режим районов
function switchToDistricts() {
    if (currentMapMode === 'districts') return;
    
    console.log('🔁 Переключаюсь на районы...');
    
    // Скрываем регионы
    if (regionsLayer) {
        map.removeLayer(regionsLayer);
    }
    if (minskLayer) {
        map.removeLayer(minskLayer);
    }
    
    // Удаляем маркеры городов
    cityMarkers.forEach(city => {
        if (map.hasLayer(city.marker)) {
            map.removeLayer(city.marker);
        }
    });
    
    if (minskMarker && map.hasLayer(minskMarker)) {
        map.removeLayer(minskMarker);
    }
    
    // Ново - загружаем районы
    loadDistrictsData();
    currentMapMode = 'districts';
    
    // Обновляем обработчик клика на мапу
    map.off('click', districtClickHandler);
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
    
    console.log('✅ Модюль районов активирован');
}

// Переключение назад на регионы
function switchToRegions() {
    if (currentMapMode === 'regions') return;
    
    console.log('🔁 Переключаюсь на области...');
    
    // Скрываем районы
    if (districtsLayer) {
        map.removeLayer(districtsLayer);
    }
    
    // Удаляем маркеры районов
    districtMarkers.forEach(marker => {
        if (map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    });
    
    // Очищаем старый обработчик
    map.off('click', districtClickHandler);
    
    // Перегружаем регионы
    loadRegionsData();
    currentMapMode = 'regions';
    
    // Берем к стандартному виду
    map.setView(mapConfig.center, 7);
    resetAllRegions();
    
    console.log('✅ Модюль областей активирован');
}
