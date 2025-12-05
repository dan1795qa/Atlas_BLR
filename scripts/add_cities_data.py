#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для добавления данных о всех областных центрах Беларуси в GeoJSON файл
"""

import json

# Данные об областных центрах Беларуси (актуальные на 2025 год)
cities_data = [
    {
        "name": "Брест",
        "coordinates": [23.734, 52.0975],  # [lng, lat]
        "population": 350616,
        "area": 146.12,
        "founded": 1019,
        "description": "Город-герой, известен Брестской крепостью",
        "color": "#4CAF50",
        "regionName": "Брестская область",
        "nationalities": {
            "Белорусы": 82.5,
            "Русские": 10.2,
            "Украинцы": 3.1,
            "Поляки": 2.8,
            "Другие": 1.4
        }
    },
    {
        "name": "Витебск",
        "coordinates": [30.2049, 55.1904],
        "population": 361644,
        "area": 134.6,
        "founded": 974,
        "description": "Культурная столица, родина Марка Шагала",
        "color": "#2196F3",
        "regionName": "Витебская область",
        "nationalities": {
            "Белорусы": 72.8,
            "Русские": 20.5,
            "Украинцы": 3.2,
            "Поляки": 0.8,
            "Другие": 2.7
        }
    },
    {
        "name": "Гомель",
        "coordinates": [30.9754, 52.4345],
        "population": 481199,
        "area": 139.77,
        "founded": 1142,
        "description": "Второй по величине город Беларуси",
        "color": "#FF9800",
        "regionName": "Гомельская область",
        "nationalities": {
            "Белорусы": 82.7,
            "Русские": 11.4,
            "Украинцы": 3.5,
            "Поляки": 0.3,
            "Другие": 2.1
        }
    },
    {
        "name": "Гродно",
        "coordinates": [23.8258, 53.6884],
        "population": 361115,
        "area": 142.11,
        "founded": 1128,
        "description": "Один из старейших городов Беларуси",
        "color": "#9C27B0",
        "regionName": "Гродненская область",
        "nationalities": {
            "Белорусы": 62.8,
            "Русские": 16.5,
            "Поляки": 16.1,
            "Украинцы": 2.3,
            "Другие": 2.3
        }
    },
    {
        "name": "Могилев",
        "coordinates": [30.3313, 53.9007],
        "population": 353110,
        "area": 118.50,
        "founded": 1267,
        "description": "Третий по величине город Беларуси",
        "color": "#F44336",
        "regionName": "Могилевская область",
        "nationalities": {
            "Белорусы": 79.5,
            "Русские": 15.2,
            "Украинцы": 2.8,
            "Поляки": 0.4,
            "Другие": 2.1
        }
    },
    {
        "name": "Минская область (центр)",
        "coordinates": [27.559, 53.9006],
        "population": 1996730,
        "area": 353.6,
        "founded": 1067,
        "description": "Столица Республики Беларусь",
        "color": "#FF6347",
        "regionName": "Минск",
        "isCapital": True,
        "nationalities": {
            "Белорусы": 79.0,
            "Русские": 13.5,
            "Украинцы": 2.8,
            "Поляки": 1.2,
            "Другие": 3.5
        }
    }
]

def add_cities_to_geojson(input_file, output_file):
    """
    Добавляет данные о городах в GeoJSON файл
    """
    # Загрузка существующего GeoJSON
    with open(input_file, 'r', encoding='utf-8') as f:
        geojson = json.load(f)
    
    # Удаляем старую запись о Минске, если она есть
    geojson['features'] = [f for f in geojson['features'] 
                          if not (f.get('properties', {}).get('isCity') == True)]
    
    # Добавление городов
    for city in cities_data:
        city_feature = {
            "type": "Feature",
            "properties": {
                "name": city["name"],
                "capital": city["name"],
                "population": city["population"],
                "area": city["area"],
                "founded": city["founded"],
                "description": city["description"],
                "regionName": city["regionName"],
                "nationalities": city["nationalities"],
                "color": city["color"],
                "isCity": True,
                "isCapital": city.get("isCapital", False)
            },
            "geometry": {
                "type": "Point",
                "coordinates": city["coordinates"]
            }
        }
        geojson['features'].append(city_feature)
    
    # Сохранение обновленного GeoJSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Успешно добавлено {len(cities_data)} городов в {output_file}")
    print("\nДобавленные города:")
    for city in cities_data:
        print(f"  • {city['name']} - население: {city['population']:,} чел., основан: {city['founded']} г.")

if __name__ == "__main__":
    input_file = "belarus-regions.geojson"
    output_file = "belarus-regions.geojson"
    
    add_cities_to_geojson(input_file, output_file)
    print("\n🎉 Данные о городах успешно добавлены!")