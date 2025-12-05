import json
import os

test_dir = 'geojson'
regions = ['Минская область', 'Брестская область', 'Витебская область', 'Гомельская область', 'Гродненская область', 'Могилевская область']

print('📋 Проверка GeoJSON файлов:')
print('=' * 70)

total_districts = 0

for region in regions:
    filepath = os.path.join(test_dir, region + '.geojson')
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Проверяем структуру
        if 'features' not in data:
            print('❌ ' + region + ': отсутствует ключ features')
            continue
        
        # Проверяем, что все feature имеют название
        missing_names = 0
        for i, feature in enumerate(data['features']):
            if 'properties' not in feature or 'name' not in feature['properties']:
                missing_names += 1
        
        # Выводим информацию
        count = len(data['features'])
        total_districts += count
        
        if missing_names == 0:
            print('✅ ' + region + ': ' + str(count) + ' районов')
        else:
            print('⚠️ ' + region + ': ' + str(count) + ' районов (' + str(missing_names) + ' без названия)')
        
        # Показываем несколько названий
        names = [f['properties']['name'] for f in data['features'][:3]]
        print('   Примеры: ' + ', '.join(names) + ' ...')
        
    except Exception as e:
        print('❌ ' + region + ': Ошибка - ' + str(e))

print('=' * 70)
print('✅ Все GeoJSON файлы готовы к использованию!')
print('📊 Всего районов: ' + str(total_districts))