import json
import os

# Данные об областях
regions_data = {
    "Брестская область": {
        "capital": "Брест",
        "population": 1348900,
        "area": 32787,
        "nationalities": {
            "Белорусы": 84.2,
            "Русские": 9.1,
            "Украинцы": 3.5,
            "Поляки": 1.9,
            "Другие": 1.3
        },
        "color": "#32CD32"
    },
    "Витебская область": {
        "capital": "Витебск",
        "population": 1135500,
        "area": 40051,
        "nationalities": {
            "Белорусы": 81.5,
            "Русские": 14.8,
            "Украинцы": 1.4,
            "Поляки": 0.9,
            "Другие": 1.4
        },
        "color": "#9370DB"
    },
    "Гомельская область": {
        "capital": "Гомель",
        "population": 1387900,
        "area": 40372,
        "nationalities": {
            "Белорусы": 85.9,
            "Русские": 9.2,
            "Украинцы": 2.9,
            "Поляки": 0.4,
            "Другие": 1.6
        },
        "color": "#FF8C00"
    },
    "Гродненская область": {
        "capital": "Гродно",
        "population": 1027600,
        "area": 25127,
        "nationalities": {
            "Белорусы": 62.3,
            "Поляки": 23.5,
            "Русские": 9.4,
            "Украинцы": 1.9,
            "Другие": 2.9
        },
        "color": "#FF6347"
    },
    "Минская область": {
        "capital": "Минск",
        "population": 1441200,
        "area": 39854,
        "nationalities": {
            "Белорусы": 83.5,
            "Русские": 10.2,
            "Поляки": 2.1,
            "Украинцы": 1.8,
            "Другие": 2.4
        },
        "color": "#4169E1"
    },
    "Могилевская область": {
        "capital": "Могилев",
        "population": 1012000,
        "area": 29068,
        "nationalities": {
            "Белорусы": 86.3,
            "Русские": 10.0,
            "Украинцы": 1.5,
            "Поляки": 0.5,
            "Другие": 1.7
        },
        "color": "#FFD700"
    }
}

# Создание объединенного GeoJSON
merged_geojson = {
    "type": "FeatureCollection",
    "features": []
}

# Путь к папке с GeoJSON файлами
geojson_folder = "geojson"

# Обработка каждого файла
for region_name, region_info in regions_data.items():
    file_path = os.path.join(geojson_folder, f"{region_name}.geojson")
    
    if os.path.exists(file_path):
        print(f"Обработка: {region_name}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            region_geojson = json.load(f)
        
        # Извлечение features из файла
        if "features" in region_geojson and len(region_geojson["features"]) > 0:
            feature = region_geojson["features"][0]
            
            # Добавление свойств
            feature["properties"] = {
                "name": region_name,
                "capital": region_info["capital"],
                "population": region_info["population"],
                "area": region_info["area"],
                "nationalities": region_info["nationalities"],
                "color": region_info["color"]
            }
            
            merged_geojson["features"].append(feature)
            print(f"  ✓ Добавлено")
        else:
            print(f"  ✗ Нет features в файле")
    else:
        print(f"  ✗ Файл не найден: {file_path}")

# Сохранение объединенного файла
output_file = "belarus-regions.geojson"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(merged_geojson, f, ensure_ascii=False, indent=2)

print(f"\n✓ Объединенный файл сохранен: {output_file}")
print(f"  Всего областей: {len(merged_geojson['features'])}")