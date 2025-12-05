# -*- coding: utf-8 -*-
import json

# Актуальные данные из Википедии (2025)
regions_data = {
    "Брестская область": {
        "population": 1299912,  # на 1 января 2025
        "area": 32777,
        "nationalities": {
            "Белорусы": 86.92,
            "Русские": 7.26,
            "Украинцы": 2.79,
            "Поляки": 1.10,
            "Другие": 1.93
        }
    },
    "Витебская область": {
        "population": 1072063,  # на 1 января 2025
        "area": 40051,
        "nationalities": {
            "Белорусы": 82.32,
            "Русские": 12.16,
            "Украинцы": 1.58,
            "Поляки": 0.86,
            "Другие": 3.08
        }
    },
    "Гомельская область": {
        "population": 1327973,  # на 1 января 2025
        "area": 40372,
        "nationalities": {
            "Белорусы": 88.45,
            "Русские": 7.42,
            "Украинцы": 2.26,
            "Другие": 1.87
        }
    },
    "Гродненская область": {
        "population": 984880,  # на 1 января 2025
        "area": 25127,
        "nationalities": {
            "Белорусы": 68.29,
            "Поляки": 21.73,
            "Русские": 6.38,
            "Украинцы": 1.05,
            "Другие": 2.55
        }
    },
    "Минская область": {
        "population": 1456357,  # на 1 января 2025
        "area": 39854,
        "nationalities": {
            "Белорусы": 88.55,
            "Русские": 5.87,
            "Украинцы": 1.45,
            "Поляки": 1.07,
            "Другие": 3.06
        }
    },
    "Могилевская область": {
        "population": 971365,  # на 1 января 2025
        "area": 29068,
        "nationalities": {
            "Белорусы": 89.35,
            "Русские": 6.07,
            "Украинцы": 1.19,
            "Другие": 3.39
        }
    },
    "Минск": {
        "population": 1996730,  # столица
        "area": 353.6,
        "nationalities": {
            "Белорусы": 79.0,
            "Русские": 13.5,
            "Украинцы": 2.5,
            "Поляки": 1.2,
            "Другие": 3.8
        }
    }
}

# Читаем GeoJSON файл
with open('belarus-regions.geojson', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Обновляем данные для каждой области
for feature in data['features']:
    region_name = feature['properties']['name']
    
    if region_name in regions_data:
        print(f"Обновление данных для: {region_name}")
        
        # Обновляем население
        feature['properties']['population'] = regions_data[region_name]['population']
        
        # Обновляем площадь
        feature['properties']['area'] = regions_data[region_name]['area']
        
        # Обновляем национальный состав
        feature['properties']['nationalities'] = regions_data[region_name]['nationalities']
        
        print(f"  Население: {regions_data[region_name]['population']:,}")
        print(f"  Площадь: {regions_data[region_name]['area']:,} км²")
        print(f"  Плотность: {regions_data[region_name]['population'] / regions_data[region_name]['area']:.1f} чел/км²")

# Сохраняем обновленный файл
with open('belarus-regions.geojson', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\n✓ Данные успешно обновлены!")
print("\nИсточник: Википедия (данные на 1 января 2025 года)")