// Обработчики для навигационных кнопок
document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    
    // Обработка кликов по основным кнопкам
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('disabled')) {
                const mapType = this.getAttribute('data-map');
                console.log('Навигация:', mapType);
                
                // Убираем активное состояние со всех кнопок
                navButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Добавляем активное состояние к текущей кнопке
                this.classList.add('active');
                
                // Переключаем карты
                switchMap(mapType);
            }
        });
    });
    
    // Обработка кликов по элементам dropdown
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const mapType = this.getAttribute('data-map');
            console.log('Выбран тип дорог:', mapType);
            
            // Здесь будет логика переключения на карту дорог
            // switchMap(mapType);
        });
    });
    
    // Функция переключения карт
    function switchMap(mapType) {
        console.log('Переключение на карту:', mapType);
        
        // Закрываем панель информации
        const infoPanel = document.getElementById('info-panel');
        if (infoPanel) {
            infoPanel.classList.add('hidden');
        }
        
        // Определяем направление переключения
        switch(mapType) {
            case 'regions':
                console.log('Активируем режим областей');
                switchToRegions();
                break;
            case 'districts':
                console.log('Активируем режим районов');
                switchToDistricts();
                break;
            case 'hydrography':
                console.log('Гидрография (в разработке)');
                break;
            case 'roads':
            case 'railways':
            case 'highways':
                console.log('дороги (в разработке)');
                break;
            default:
                console.log('Неизвестный тип карты');
        }
    }
});
