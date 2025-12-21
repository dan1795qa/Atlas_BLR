// ===================================
// СИСТЕМА ФИЛЬТРОВ ДЛЯ КАРТЫ
// ===================================

class MapFilters {
    constructor(map) {
        this.map = map;
        this.filters = {
            populationMin: 0,
            populationMax: Infinity,
            areaMin: 0,
            areaMax: Infinity,
            regions: new Set(),
            showCities: true,
            showRegions: true,
            showDistricts: true
        };
        
        this.createFilterPanel();
    }
    
    createFilterPanel() {
        const filterPanel = document.createElement('div');
        filterPanel.className = 'filter-panel';
        filterPanel.innerHTML = `
            <div class="filter-header">
                <h3 class="filter-title">🔍 Фильтры</h3>
                <button class="filter-toggle-btn" onclick="mapFilters.togglePanel()">−</button>
            </div>
            <div class="filter-content">
                <!-- Фильтр по типу -->
                <div class="filter-section">
                    <h4 class="filter-section-title">Тип объектов</h4>
                    <label class="filter-checkbox-label">
                        <input type="checkbox" id="filter-cities" checked>
                        <span>🏛️ Города</span>
                    </label>
                    <label class="filter-checkbox-label">
                        <input type="checkbox" id="filter-regions" checked>
                        <span>🗺️ Области</span>
                    </label>
                    <label class="filter-checkbox-label">
                        <input type="checkbox" id="filter-districts" checked>
                        <span>📍 Районы</span>
                    </label>
                </div>
                
                <!-- Фильтр по населению -->
                <div class="filter-section">
                    <h4 class="filter-section-title">Население (тыс. чел.)</h4>
                    <div class="filter-range">
                        <input type="number" id="filter-pop-min" placeholder="От" min="0" step="10">
                        <span>—</span>
                        <input type="number" id="filter-pop-max" placeholder="До" min="0" step="10">
                    </div>
                </div>
                
                <!-- Фильтр по площади -->
                <div class="filter-section">
                    <h4 class="filter-section-title">Площадь (км²)</h4>
                    <div class="filter-range">
                        <input type="number" id="filter-area-min" placeholder="От" min="0" step="100">
                        <span>—</span>
                        <input type="number" id="filter-area-max" placeholder="До" min="0" step="100">
                    </div>
                </div>
                
                <!-- Быстрые фильтры -->
                <div class="filter-section">
                    <h4 class="filter-section-title">Быстрые фильтры</h4>
                    <button class="filter-quick-btn" onclick="mapFilters.applyQuickFilter('large-cities')">
                        🏙️ Крупные города (>100 тыс.)
                    </button>
                    <button class="filter-quick-btn" onclick="mapFilters.applyQuickFilter('small-regions')">
                        📐 Малые области (<30 тыс. км²)
                    </button>
                    <button class="filter-quick-btn" onclick="mapFilters.applyQuickFilter('reset')">
                        🔄 Сбросить все
                    </button>
                </div>
                
                <!-- Кнопка применения -->
                <button class="filter-apply-btn" onclick="mapFilters.applyFilters()">
                    Применить фильтры
                </button>
            </div>
        `;
        
        // Добавляем стили
        const style = document.createElement('style');
        style.textContent = `
            .filter-panel {
                position: fixed;
                top: 80px;
                left: 20px;
                z-index: 1000;
                background: rgba(30, 41, 59, 0.95);
                backdrop-filter: blur(10px);
                padding: 16px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                width: 280px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                max-height: calc(100vh - 100px);
                overflow-y: auto;
            }
            
            .filter-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid var(--card-border);
            }
            
            .filter-title {
                font-size: 14px;
                font-weight: 600;
                color: var(--accent-color);
                margin: 0;
            }
            
            .filter-toggle-btn {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: var(--text-secondary);
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                line-height: 1;
                transition: all 0.2s ease;
            }
            
            .filter-toggle-btn:hover {
                background: var(--accent-color);
                color: white;
            }
            
            .filter-section {
                margin-bottom: 16px;
            }
            
            .filter-section-title {
                font-size: 12px;
                font-weight: 600;
                color: var(--accent-light);
                margin: 0 0 10px 0;
            }
            
            .filter-checkbox-label {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
                cursor: pointer;
                color: var(--text-secondary);
                font-size: 13px;
            }
            
            .filter-checkbox-label input[type="checkbox"] {
                width: 16px;
                height: 16px;
                cursor: pointer;
                accent-color: var(--accent-color);
            }
            
            .filter-range {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .filter-range input {
                flex: 1;
                padding: 8px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                color: var(--text-color);
                font-size: 12px;
            }
            
            .filter-range input:focus {
                outline: none;
                border-color: var(--accent-color);
            }
            
            .filter-range span {
                color: var(--text-secondary);
            }
            
            .filter-quick-btn {
                display: block;
                width: 100%;
                padding: 10px;
                margin-bottom: 8px;
                background: rgba(74, 222, 128, 0.1);
                border: 1px solid rgba(74, 222, 128, 0.2);
                border-radius: 6px;
                color: var(--text-secondary);
                cursor: pointer;
                font-size: 12px;
                text-align: left;
                transition: all 0.2s ease;
            }
            
            .filter-quick-btn:hover {
                background: rgba(74, 222, 128, 0.2);
                border-color: var(--accent-color);
                transform: translateX(3px);
            }
            
            .filter-apply-btn {
                width: 100%;
                padding: 12px;
                background: var(--accent-color);
                border: none;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            .filter-apply-btn:hover {
                background: var(--accent-dark);
                transform: scale(1.02);
                box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
            }
            
            .filter-content.collapsed {
                display: none;
            }
            
            @media (max-width: 768px) {
                .filter-panel {
                    width: calc(100vw - 40px);
                    left: 20px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(filterPanel);
        
        // Инициализация обработчиков
        this.initializeHandlers();
    }
    
    initializeHandlers() {
        // Чекбоксы типов
        document.getElementById('filter-cities').addEventListener('change', (e) => {
            this.filters.showCities = e.target.checked;
        });
        
        document.getElementById('filter-regions').addEventListener('change', (e) => {
            this.filters.showRegions = e.target.checked;
        });
        
        document.getElementById('filter-districts').addEventListener('change', (e) => {
            this.filters.showDistricts = e.target.checked;
        });
    }
    
    togglePanel() {
        const content = document.querySelector('.filter-content');
        const btn = document.querySelector('.filter-toggle-btn');
        
        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            btn.textContent = '−';
        } else {
            content.classList.add('collapsed');
            btn.textContent = '+';
        }
    }
    
    applyQuickFilter(filterType) {
        switch(filterType) {
            case 'large-cities':
                document.getElementById('filter-pop-min').value = 100;
                document.getElementById('filter-cities').checked = true;
                document.getElementById('filter-regions').checked = false;
                document.getElementById('filter-districts').checked = false;
                break;
                
            case 'small-regions':
                document.getElementById('filter-area-max').value = 30000;
                document.getElementById('filter-regions').checked = true;
                document.getElementById('filter-cities').checked = false;
                document.getElementById('filter-districts').checked = false;
                break;
                
            case 'reset':
                document.getElementById('filter-pop-min').value = '';
                document.getElementById('filter-pop-max').value = '';
                document.getElementById('filter-area-min').value = '';
                document.getElementById('filter-area-max').value = '';
                document.getElementById('filter-cities').checked = true;
                document.getElementById('filter-regions').checked = true;
                document.getElementById('filter-districts').checked = true;
                break;
        }
        
        this.applyFilters();
    }
    
    applyFilters() {
        // Получаем значения фильтров
        const popMin = parseFloat(document.getElementById('filter-pop-min').value) * 1000 || 0;
        const popMax = parseFloat(document.getElementById('filter-pop-max').value) * 1000 || Infinity;
        const areaMin = parseFloat(document.getElementById('filter-area-min').value) || 0;
        const areaMax = parseFloat(document.getElementById('filter-area-max').value) || Infinity;
        
        this.filters.populationMin = popMin;
        this.filters.populationMax = popMax;
        this.filters.areaMin = areaMin;
        this.filters.areaMax = areaMax;
        
        // Применяем фильтры к слоям карты
        this.filterMapLayers();
        
        // Уведомление
        this.showNotification('Фильтры применены');
    }
    
    filterMapLayers() {
        // Эта функция будет вызываться из основного кода
        // Она должна перерисовать слои карты согласно фильтрам
        console.log('Применение фильтров:', this.filters);
        
        // Триггерим событие для основного кода
        const event = new CustomEvent('filtersChanged', { 
            detail: this.filters 
        });
        window.dispatchEvent(event);
    }
    
    // Проверка, проходит ли объект фильтры
    passesFilters(feature) {
        const props = feature.properties;
        const type = feature.geometry.type === 'Point' ? 'city' : 
                    (props.district ? 'district' : 'region');
        
        // Проверка типа
        if (type === 'city' && !this.filters.showCities) return false;
        if (type === 'region' && !this.filters.showRegions) return false;
        if (type === 'district' && !this.filters.showDistricts) return false;
        
        // Проверка населения
        if (props.population) {
            if (props.population < this.filters.populationMin || 
                props.population > this.filters.populationMax) {
                return false;
            }
        }
        
        // Проверка площади
        if (props.area) {
            if (props.area < this.filters.areaMin || 
                props.area > this.filters.areaMax) {
                return false;
            }
        }
        
        return true;
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-color);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            font-size: 14px;
            font-weight: 500;
            animation: slideDown 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Стили для анимации уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(notificationStyles);

// Экспорт для использования в основном коде
if (typeof window !== 'undefined') {
    window.MapFilters = MapFilters;
}
