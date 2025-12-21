// ===================================
// ПОИСК ПО РАЙОНАМ И ГОРОДАМ
// ===================================

class SearchManager {
    constructor(map) {
        this.map = map;
        this.searchInput = document.querySelector('.search-input');
        this.searchBtn = document.querySelector('.search-btn');
        this.searchResults = null;
        this.allLocations = [];
        
        this.initializeSearch();
    }
    
    initializeSearch() {
        // Создаем контейнер для результатов поиска
        this.createResultsContainer();
        
        // Обработчики событий
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchBtn.addEventListener('click', () => this.handleSearch(this.searchInput.value));
        
        // Поиск по Enter
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch(this.searchInput.value);
            }
        });
        
        // Закрытие результатов при клике вне
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideResults();
            }
        });
    }
    
    createResultsContainer() {
        this.searchResults = document.createElement('div');
        this.searchResults.className = 'search-results';
        this.searchResults.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--primary-dark);
            border-radius: 8px;
            margin-top: 8px;
            max-height: 400px;
            overflow-y: auto;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            display: none;
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        
        const searchContainer = document.querySelector('.search-container');
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(this.searchResults);
    }
    
    // Загрузка всех локаций из GeoJSON
    loadLocations(geojsonData) {
        this.allLocations = [];
        
        if (!geojsonData || !geojsonData.features) return;
        
        geojsonData.features.forEach(feature => {
            const props = feature.properties;
            const name = props.name;
            const type = feature.geometry.type === 'Point' ? 'city' : 'region';
            
            if (name) {
                this.allLocations.push({
                    name: name,
                    type: type,
                    feature: feature,
                    searchText: name.toLowerCase(),
                    capital: props.capital || null,
                    population: props.population || null
                });
            }
        });
        
        console.log(`Загружено ${this.allLocations.length} локаций для поиска`);
    }
    
    // Добавление районов в базу поиска
    addDistricts(districts, regionName) {
        districts.forEach(district => {
            const name = district.properties.name || district.properties.district;
            if (name && !this.allLocations.find(loc => loc.name === name)) {
                this.allLocations.push({
                    name: name,
                    type: 'district',
                    feature: district,
                    searchText: name.toLowerCase(),
                    region: regionName
                });
            }
        });
    }
    
    // Обработка поиска
    handleSearch(query) {
        if (!query || query.length < 2) {
            this.hideResults();
            return;
        }
        
        const searchQuery = query.toLowerCase().trim();
        const results = this.allLocations.filter(location => 
            location.searchText.includes(searchQuery)
        );
        
        this.displayResults(results, query);
    }
    
    // Отображение результатов
    displayResults(results, query) {
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div style="padding: 16px; color: var(--text-secondary); text-align: center;">
                    Ничего не найдено для "${query}"
                </div>
            `;
            this.showResults();
            return;
        }
        
        // Сортировка: сначала точные совпадения, потом города, потом области
        results.sort((a, b) => {
            const aExact = a.searchText === query.toLowerCase();
            const bExact = b.searchText === query.toLowerCase();
            
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            
            if (a.type === 'city' && b.type !== 'city') return -1;
            if (a.type !== 'city' && b.type === 'city') return 1;
            
            return a.name.localeCompare(b.name);
        });
        
        this.searchResults.innerHTML = results.slice(0, 10).map(result => {
            const icon = this.getLocationIcon(result.type);
            const typeLabel = this.getTypeLabel(result.type);
            const population = result.population ? 
                `<span style="color: var(--text-secondary); font-size: 12px; margin-left: 8px;">
                    ${result.population.toLocaleString('ru-RU')} чел.
                </span>` : '';
            
            return `
                <div class="search-result-item" data-location="${result.name}" data-type="${result.type}"
                     style="padding: 12px 16px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05);
                            transition: all 0.2s ease;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 20px;">${icon}</span>
                        <div style="flex: 1;">
                            <div style="color: var(--text-color); font-weight: 500;">${result.name}</div>
                            <div style="color: var(--text-secondary); font-size: 12px; margin-top: 2px;">
                                ${typeLabel}${result.region ? ` • ${result.region}` : ''}
                            </div>
                        </div>
                        ${population}
                    </div>
                </div>
            `;
        }).join('');
        
        // Добавляем обработчики кликов
        this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(74, 222, 128, 0.1)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'transparent';
            });
            
            item.addEventListener('click', () => {
                const locationName = item.dataset.location;
                const locationType = item.dataset.type;
                const location = results.find(r => r.name === locationName && r.type === locationType);
                
                if (location) {
                    this.selectLocation(location);
                }
            });
        });
        
        this.showResults();
    }
    
    getLocationIcon(type) {
        const icons = {
            'city': '🏛️',
            'region': '🗺️',
            'district': '📍'
        };
        return icons[type] || '📍';
    }
    
    getTypeLabel(type) {
        const labels = {
            'city': 'Город',
            'region': 'Область',
            'district': 'Район'
        };
        return labels[type] || 'Локация';
    }
    
    // Выбор локации из результатов
    selectLocation(location) {
        this.hideResults();
        this.searchInput.value = location.name;
        
        // Получаем границы объекта
        const layer = L.geoJSON(location.feature);
        const bounds = layer.getBounds();
        
        // Приближаем карту
        if (location.type === 'city') {
            // Для городов - зум на точку
            const coords = location.feature.geometry.coordinates.slice().reverse();
            this.map.setView(coords, 10, { animate: true });
        } else {
            // Для областей и районов - fitBounds
            this.map.fitBounds(bounds, {
                padding: [50, 50],
                animate: true,
                duration: 1
            });
        }
        
        // Показываем информацию о локации
        if (typeof showCityInfo === 'function' && location.type === 'city') {
            showCityInfo(location.name, location.feature.properties);
        } else if (typeof showRegionInfo === 'function' && location.type === 'region') {
            showRegionInfo(location.name, location.feature.properties);
        }
        
        // Подсвечиваем выбранную локацию
        this.highlightLocation(location);
    }
    
    // Подсветка выбранной локации
    highlightLocation(location) {
        // Удаляем предыдущую подсветку
        if (this.highlightLayer) {
            this.map.removeLayer(this.highlightLayer);
        }
        
        // Создаем временный слой с подсветкой
        this.highlightLayer = L.geoJSON(location.feature, {
            style: {
                color: '#FFD700',
                fillColor: '#FFD700',
                fillOpacity: 0.3,
                weight: 3,
                dashArray: '10, 5'
            },
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 15,
                    fillColor: '#FFD700',
                    color: '#FFD700',
                    weight: 3,
                    opacity: 1,
                    fillOpacity: 0.5
                });
            }
        }).addTo(this.map);
        
        // Убираем подсветку через 3 секунды
        setTimeout(() => {
            if (this.highlightLayer) {
                this.map.removeLayer(this.highlightLayer);
                this.highlightLayer = null;
            }
        }, 3000);
    }
    
    showResults() {
        this.searchResults.style.display = 'block';
    }
    
    hideResults() {
        this.searchResults.style.display = 'none';
    }
}

// Экспорт для использования в основном коде
if (typeof window !== 'undefined') {
    window.SearchManager = SearchManager;
}
