import json

# Читаем существующий GeoJSON файл
with open('belarus-regions.geojson', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Данные о городе Минске
minsk_data = {
    "type": "Feature",
    "properties": {
        "name": "Минск",
        "capital": "Минск",
        "population": 1996730,
        "area": 353.6,
        "nationalities": {
            "Белорусы": 79.0,
            "Русские": 13.5,
            "Украинцы": 2.8,
            "Поляки": 1.2,
            "Другие": 3.5
        },
        "color": "#FF6347",
        "isCity": True  # Флаг для определения, что это город
    },
    "geometry": {
        "type": "Point",
        "coordinates": [27.559, 53.9006]  # Координаты центра Минска
    }
}

# Добавляем Минск в список features
data['features'].append(minsk_data)

# Сохраняем обновленный файл
with open('belarus-regions.geojson', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✅ Данные о городе Минске успешно добавлены в GeoJSON файл!")
print(f"📊 Минск: {minsk_data['properties']['population']:,} чел., {minsk_data['properties']['area']} км²")
print(f"📍 Плотность: {minsk_data['properties']['population'] / minsk_data['properties']['area']:.1f} чел/км²")