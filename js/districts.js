// Управление слоем районов
let districtLayer;
let districtMarkers = [];
let selectedDistrictLayer;
let currentMapMode = 'regions';
let districtClickHandler;

// Полный маппинг для всех 118 районов
const districtNameMapping = {
    // Брестская (16)
    'brest': 'Брестский', 'broysk': 'Брестский',
    'baranovichi': 'Барановичский', 'baranowici': 'Барановичский',
    'pinsk': 'Пинский',
    'kobrin': 'Кобринский',
    'gantsevichi': 'Ганцевичский',
    'drogichin': 'Дрогичинский',
    'ivanovo': 'Ивановский',
    'ivatsevichy': 'Ивацевичский',
    'zhabinka': 'Жабинковский',
    'kamenets': 'Каменецкий',
    'luninets': 'Лунинецкий',
    'lyakhovichi': 'Ляховичский',
    'malorita': 'Малоритский',
    'pruzhany': 'Пружанский',
    'stolin': 'Столинский',
    'bereza': 'Берёзовский',
    
    // Гомельская (21)
    'gomel': 'Гомельский', 'homiel': 'Гомельский',
    'mozyr': 'Мозырский',
    'rechitsa': 'Речицкий', 'rechytsa': 'Речицкий',
    'bragin': 'Брагинский',
    'vetka': 'Ветковский',
    'buda-koshelevo': 'Буда-Кошелёвский',
    'dobrusch': 'Добрушский',
    'elsk': 'Ельский',
    'zhitkovichi': 'Житковичский',
    'zlobin': 'Жлобинский',
    'kalinkovichi': 'Калинковичский',
    'korma': 'Кормянский',
    'lelchitsy': 'Лельчицкий',
    'loev': 'Лоевский',
    'narovlya': 'Наровлянский',
    'oktyabrsky': 'Октябрьский',
    'petrikov': 'Петриковский',
    'rogachev': 'Рогачёвский',
    'svetlogorsk': 'Светлогорский',
    'hoyniki': 'Хойникский',
    'chechersk': 'Чечерский',
    
    // Витебская (21)
    'vitebsk': 'Витебский',
    'polotsk': 'Полоцкий', 'polatsk': 'Полоцкий',
    'orsha': 'Оршанский',
    'beshenkovichi': 'Бешенковичский',
    'braslav': 'Браславский',
    'glubokoe': 'Глубокский',
    'lepel': 'Лепельский',
    'liozno': 'Лиозненский',
    'miory': 'Миорский',
    'tolochin': 'Толочинский',
    'chashniki': 'Чашникский',
    'shumilinsk': 'Шумилинский',
    'gorodok': 'Городокский',
    'dokshitsy': 'Докшицкий',
    'dubrovno': 'Дубровенский',
    'ushachi': 'Ушачский',
    'verkhnedvinsk': 'Верхнедвинский',
    'postav': 'Поставский',
    'senno': 'Сенненский',
    'glusk': 'Глусский',
    
    // Минская (22)
    'minsk': 'Минский',
    'borisov': 'Борисовский',
    'myadel': 'Мядельский',
    'molodechno': 'Молодечненский',
    'vileyka': 'Вилейский',
    'volozhyn': 'Воложинский',
    'nesvizh': 'Несвижский',
    'klets': 'Клецкий',
    'slutsk': 'Слуцкий',
    'soligorsk': 'Солигорский',
    'smolevichi': 'Смолевичский',
    'dzerzhysk': 'Дзержинский',
    'lyuban': 'Любанский',
    'logoisk': 'Логойский',
    'starodorogi': 'Стародорожский',
    'uzda': 'Узденский',
    'cherven': 'Червень',
    
    // Гродненская (17)
    'grodno': 'Гродненский',
    'lida': 'Лидский',
    'novogrudok': 'Новогрудский',
    'korelich': 'Кореличский',
    'volkovysk': 'Волковысский',
    'mosty': 'Мостовский',
    'smorgon': 'Сморгонский',
    'slonim': 'Слонимский',
    'oshmyany': 'Ошмянский',
    'shchuchin': 'Щучинский',
    'zelva': 'Зельвенский',
    'svisloch': 'Свислочский',
    'dyatlovo': 'Дятловский',
    'ivye': 'Ивьевский',
    'voronovo': 'Вороновский',
    'berestovitsy': 'Берестовицкий',
    'ostrovets': 'Островецкий',
    
    // Могилёвская (21)
    'mogilev': 'Могилёвский', 'mogiljow': 'Могилёвский',
    'bobruysk': 'Бобруйский', 'bobrujsk': 'Бобруйский',
    'krichev': 'Кричевский',
    'osipovichi': 'Осиповичский',
    'gorki': 'Горецкий',
    'kirovsk': 'Кировский',
    'belynitsy': 'Белыничский',
    'bychov': 'Быховский',
    'klichev': 'Ключевский',
    'kruglyany': 'Круглянский',
    'kostyukovichi': 'Костюковичский',
    'krasnopolskii': 'Краснопольский',
    'klimovichi': 'Климовичский',
    'mstislavl': 'Мстиславский',
    'chausy': 'Чаусский',
    'cherikovskii': 'Чериковский',
    'shklov': 'Шкловский',
    'slavgorod': 'Славгородский',
    'hotimsk': 'Хотимский',
    'dribin': 'Дрибинский'
};

function mapDistrictName(geojsonName) {
    if (!geojsonName) return null;
    const normalized = geojsonName.toLowerCase().trim();
    if (districtNameMapping[normalized]) return districtNameMapping[normalized];
    for (const [key, value] of Object.entries(districtNameMapping)) {
        if (normalized.includes(key) || key.includes(normalized)) return value;
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
            const mappedName = mapDistrictName(geojsonName);
            if (mappedName && districtsInfo[mappedName]) {
                foundDistricts.push(mappedName);
            } else if (geojsonName) {
                missingDistricts.push(geojsonName);
            }
        });
        console.log('✅ Найдено районов:', foundDistricts.length);
        addDistrictBoundaries(geojson);
        addDistrictMarkers();
    } catch (error) {
        console.error('❌ Ошибка загружения районов:', error);
    }
}

function addDistrictBoundaries(geojson) {
    districtLayer = L.geoJSON(geojson, {
        style: function(feature) {
            return {fillColor: '#4a7c7e', weight: 1.5, opacity: 1, color: '#7cf578', fillOpacity: 0.25, interactive: true};
        },
        onEachFeature: function(feature, layer) {
            const geojsonName = feature.properties.shapeName || feature.properties.name || feature.properties.NAME || feature.properties.DISTRICT;
            const districtName = mapDistrictName(geojsonName);
            if (!districtName || !districtsInfo[districtName]) return;
            layer.districtName = districtName;
            layer.on('click', function(e) {
                selectDistrict(layer, districtName);
                showDistrictInfo(districtName);
                zoomToDistrict(layer);
                L.DomEvent.stopPropagation(e);
            });
            layer.on('mouseover', function() {
                if (selectedDistrictLayer !== layer) {
                    layer.setStyle({fillOpacity: 0.35, weight: 2, cursor: 'pointer'});
                    layer.bringToFront();
                }
            });
            layer.on('mouseout', function() {
                if (selectedDistrictLayer !== layer) {
                    layer.setStyle({fillOpacity: 0.25, weight: 1.5, cursor: 'default'});
                }
            });
            layer.bindTooltip(districtName, {permanent: false, direction: 'center', className: 'district-label'});
        }
    }).addTo(map);
}

function addDistrictMarkers() {
    districtMarkers = [];
    for (const districtName in districtsInfo) {
        const district = districtsInfo[districtName];
        const coords = district.centerCoords;
        if (!coords || coords.length < 2) continue;
        const marker = L.circleMarker([coords[0], coords[1]], {
            radius: 7, fillColor: '#7cf578', color: '#37FF8B', weight: 2, opacity: 1, fillOpacity: 0.9, className: 'district-marker'
        }).addTo(map);
        marker.districtName = districtName;
        marker.on('click', function(e) {
            selectDistrictByMarker(districtName);
            showDistrictInfo(districtName);
            L.DomEvent.stopPropagation(e);
        });
        marker.on('mouseover', function() {
            marker.setStyle({radius: 9, weight: 3, fillOpacity: 1});
        });
        marker.on('mouseout', function() {
            marker.setStyle({radius: 7, weight: 2, fillOpacity: 0.9});
        });
        marker.bindPopup(() => createDistrictPopupContent(district), {maxWidth: 300, className: 'district-popup-container', closeButton: true});
        marker.bindTooltip(district.center, {permanent: false, direction: 'top', offset: [0, -15], className: 'district-marker-label'});
        districtMarkers.push(marker);
    }
}

function createDistrictPopupContent(district) {
    const foundedYear = district.founded || 'Неизвестно';
    const foundedDesc = district.foundedDescription || '';
    return `<div class="district-popup"><h3>🏁 ${district.name}</h3><div class="popup-info">${foundedDesc ? `<p class="popup-founded-desc"><strong>🏛️ Центр:</strong> ${district.center}</p>` : ''}<p class="popup-founded"><strong>📅 Основана:</strong> ${foundedYear}${district.founded ? ' г.' : ''}</p>${foundedDesc ? `<p class="popup-text">${foundedDesc}</p>` : ''}<p><strong>👥 Население:</strong> ${district.population}</p><p><strong>📋 Площадь:</strong> ${district.area}</p></div></div>`;
}

function selectDistrict(layer, districtName) {
    resetAllDistricts();
    if (layer) {
        layer.setStyle({fillColor: '#7cf578', weight: 3, fillOpacity: 0.5, color: '#7cf578'});
        layer.bringToFront();
        selectedDistrictLayer = layer;
    }
}

function selectDistrictByMarker(districtName) {
    resetAllDistricts();
    if (districtLayer) {
        districtLayer.eachLayer(function(layer) {
            if (layer.districtName === districtName) {
                layer.setStyle({fillColor: '#7cf578', weight: 3, fillOpacity: 0.5, color: '#7cf578'});
                layer.bringToFront();
                selectedDistrictLayer = layer;
            }
        });
    }
}

function resetAllDistricts() {
    if (districtLayer) {
        districtLayer.eachLayer(function(layer) {
            layer.setStyle({fillColor: '#4a7c7e', weight: 1.5, fillOpacity: 0.25, color: '#7cf578'});
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
    const districtData = districtsInfo[districtName];
    if (!districtData) return;
    const infoPanel = document.getElementById('info-panel');
    const regionInfo = document.getElementById('region-info');
    if (!infoPanel || !regionInfo) return;
    regionInfo.innerHTML = `
        <div class="region-header">
            <h2>🏁 ${districtData.name}</h2>
            <p class="region-capital">🏛️ Центр: <strong>${districtData.center}</strong></p>
            <p class="region-capital-region">📍 Область: <strong>${districtData.region}</strong></p>
        </div>
        <div class="info-section">
            <h3>📊 Основные сведения</h3>
            <div class="info-grid">
                <div class="info-item"><span class="info-label">📋 Площадь</span><span class="info-value">${districtData.area}</span></div>
                <div class="info-item"><span class="info-label">👥 Население</span><span class="info-value">${districtData.population}</span></div>
                <div class="info-item"><span class="info-label">📊 Плотность</span><span class="info-value">${districtData.density}</span></div>
                <div class="info-item"><span class="info-label">📅 Основана</span><span class="info-value">${districtData.founded}</span></div>
            </div>
        </div>
        <div class="info-section">
            <h3>🏁 О центре</h3>
            <p class="center-description">${districtData.foundedDescription || 'Нет информации'}</p>
        </div>
        ${districtData.landmarks && districtData.landmarks.length > 0 ? `<div class="info-section"><h3>🏛️ Достопримечательности</h3><ul class="landmarks-list">${districtData.landmarks.map(l => `<li>🏰 ${l}</li>`).join('')}</ul></div>` : ''}
        <div class="info-section">
            <h3>🏭 Экономика</h3>
            <div class="economy-tags">${districtData.economy.map(e => `<span class="economy-tag">🏢 ${e}</span>`).join('')}</div>
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
    if (window.regionsLayer) map.removeLayer(window.regionsLayer);
    if (window.minskLayer) map.removeLayer(window.minskLayer);
    if (window.cityMarkers) {
        window.cityMarkers.forEach(city => {
            if (city && city.marker && map.hasLayer(city.marker)) map.removeLayer(city.marker);
        });
    }
    if (window.minskMarker && map.hasLayer(window.minskMarker)) map.removeLayer(window.minskMarker);
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
}

function switchToRegions() {
    if (currentMapMode === 'regions') return;
    if (districtLayer) map.removeLayer(districtLayer);
    districtMarkers.forEach(marker => {
        if (map.hasLayer(marker)) map.removeLayer(marker);
    });
    if (districtClickHandler) map.off('click', districtClickHandler);
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