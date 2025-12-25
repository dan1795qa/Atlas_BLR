// Обработчики для навигационных кнопок
document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn:not(.disabled)');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    
    // Обработка кликов по основным кнопкам
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('disabled')) {
                const mapType = this.getAttribute('data-map');
                console.log('Переключение на карту:', mapType);
                
                // Убираем активное состояние со всех кнопок
                document.querySelectorAll('.nav-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Добавляем активное состояние к текущей кнопке
                this.classList.add('active');
                
                // Здесь будет логика переключения карт
                // switchMap(mapType);
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
    
    // Функция переключения карт (будет реализована позже)
    function switchMap(mapType) {
        console.log('Загрузка карты:', mapType);
        // TODO: Реализовать переключение между разными типами карт
    }
});
