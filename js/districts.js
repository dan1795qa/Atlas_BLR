// Управление слоем районов
let districtsLayer;
let districtMarkers = [];
let selectedDistrict = null;
let currentMapMode = 'regions'; // 'regions' или 'districts'
let districtClickHandler;

// Загрузка и отображение районов
async function loadDistrictsData() {
    try {
        const response = await fetch('belarus-regions-district.geojson');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const geojson = await response.json();
        
        console.log('Районы загружены успешно');
        console.log('Пример данных:', geojson.features[0].properties);
        
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
                opacity: 1,
                color: '#7cf578',
                fillOpacity: 0.25,
                interactive: true,
                className: 'district-polygon'
            };
        },
        onEachFeature: function(feature, layer) {
            // ИСПРАВЛЕНИЕ: используем shapeName из GeoJSON
            const districtName = feature.properties.shapeName || feature.properties.name || feature.properties.district;
            
            if (!districtName) {
                console.warn('Не найдено имя района в свойствах:', feature.properties);
                return;
            }
            
            console.log('Обработка района из GeoJSON:', districtName);
            
            // Проверяем есть ли данные для этого района в нашей БД
            if (!districtsInfo[districtName]) {
                console.warn(`Нет данных для района: ${districtName}. Доступные районы:`, Object.keys(districtsInfo));
                // Продолжаем без показа информации, чтобы полигон всё еще отображался
            }
            
            layer.districtName = districtName;
            
            // Устанавливаем cursor: pointer
            layer.options.interactive = true;
            
            layer.on({
                click: function(e) {
                    console.log('Клик по району:', districtName);
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
            console.warn(`Не установлены координаты для ${districtName}`);
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
                console.log('Клик по маркеру:', districtName);
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
            className: 'district-popup-container'
        });
        
        // Лабел с названием районного центра
        marker.bindTooltip(district.center, {
            permanent: false,
            direction: 'top',
            offset: [0, -15],
            className: 'district-marker-label'
        });
        
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

// Выделение района по территории
function selectDistrict(layer, districtName) {
    // Сбрасываем предыдущее выделение
    resetAllDistricts();
    
    if (layer) {
        // Выделяем новый район - так же как это делают для областей
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

// Выделение района по маркеру (для визуалисации)
function selectDistrictByMarker(districtName) {
    resetAllDistricts();
    
    // Найдем и выделим корреспондирующие границы
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
        maxZoom: 10,
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
    regionInfo.scrollTop = 0;
}

// Переключение на режим районов
function switchToDistricts() {
    if (currentMapMode === 'districts') return;
    
    console.log('Переключение на районы...');
    
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
    
    // Загружаем районы
    loadDistrictsData();
    currentMapMode = 'districts';
    
    // Обновляем обработчик клика на карту для районов
    map.off('click', districtClickHandler);
    districtClickHandler = function(e) {
        resetAllDistricts();
        document.getElementById('info-panel').classList.add('hidden');
        map.setView(mapConfig.center, 7);
    };
    map.on('click', districtClickHandler);
    
    // Возвращаемся к начальному виду
    map.setView(mapConfig.center, 7);
    resetAllDistricts();
    
    console.log('Режим районов активирован');
}

// Переключение обратно на регионы
function switchToRegions() {
    if (currentMapMode === 'regions') return;
    
    console.log('Переключение на области...');
    
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
    
    // Удаляем старый обработчик клика
    map.off('click', districtClickHandler);
    
    // Загружаем регионы
    loadRegionsData();
    currentMapMode = 'regions';
    
    // Возвращаемся к начальному виду
    map.setView(mapConfig.center, 7);
    resetAllRegions();
    
    console.log('Режим областей активирован');
}
