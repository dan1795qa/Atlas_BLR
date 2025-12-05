import json

# Правильные координаты городов (lat, lng)
correct_coords = {
    "Минск": [53.9006, 27.5590],
    "Брест": [52.0975, 23.7340],
    "Витебск": [55.1904, 30.2049],
    "Гомель": [52.4345, 30.9754],
    "Гродно": [53.6884, 23.8258],
    "Могилев": [53.9007, 30.3313]
}

# Читаем GeoJSON
with open('belarus-regions.geojson', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("Текущие координаты городов в GeoJSON (lng, lat):")
print("=" * 60)

for feature in data['features']:
    if feature['geometry']['type'] == 'Point':
        name = feature['properties']['name']
        # Убираем лишние части из названия
        clean_name = name.replace("Минская область (центр)", "Минск")
        coords = feature['geometry']['coordinates']
        print(f"{clean_name}: [{coords[0]}, {coords[1]}]")
        
        # Проверяем правильность
        if clean_name in correct_coords:
            correct = correct_coords[clean_name]
            # В GeoJSON координаты в формате [lng, lat]
            if abs(coords[0] - correct[1]) > 0.001 or abs(coords[1] - correct[0]) > 0.001:
                print(f"  ⚠️ НЕПРАВИЛЬНО! Должно быть: [{correct[1]}, {correct[0]}]")
            else:
                print(f"  ✅ Правильно")

print("\n" + "=" * 60)
print("Правильные координаты (для справки):")
for city, coords in correct_coords.items():
    print(f"{city}: lat={coords[0]}, lng={coords[1]} → GeoJSON: [{coords[1]}, {coords[0]}]")