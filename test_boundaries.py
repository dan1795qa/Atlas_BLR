#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт проверки файлов границ районов.
"""

import json
import os

def test_regional_files():
    """Проверяет все региональные файлы."""
    base_path = r'c:\Users\HP PAVILION\Desktop\map\geojson'
    
    regions = [
        'Минская область',
        'Брестская область',
        'Витебская область',
        'Гомельская область',
        'Гродненская область',
        'Могилевская область'
    ]
    
    total_districts = 0
    errors = []
    
    print("🔍 Проверка региональных GeoJSON файлов...\n")
    
    for region in regions:
        file_path = os.path.join(base_path, f'{region}.geojson')
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Проверки
            if data.get('type') != 'FeatureCollection':
                errors.append(f"❌ {region}: Неправильный тип (не FeatureCollection)")
                continue
            
            features = data.get('features', [])
            
            # Проверяем каждый feature
            for i, feature in enumerate(features):
                if feature.get('type') != 'Feature':
                    errors.append(f"❌ {region}: Feature {i} имеет неправильный тип")
                    continue
                
                props = feature.get('properties', {})
                if not props.get('name'):
                    errors.append(f"❌ {region}: Feature {i} не имеет имени")
                
                if not props.get('region'):
                    errors.append(f"❌ {region}: Feature {i} не имеет региона")
                
                geom = feature.get('geometry', {})
                if geom.get('type') not in ['Polygon', 'MultiPolygon']:
                    errors.append(f"❌ {region}: Feature {i} имеет неправильный тип геометрии")
                
                coords = geom.get('coordinates')
                if not coords:
                    errors.append(f"❌ {region}: Feature {i} не имеет координат")
            
            print(f"✅ {region}: {len(features)} районов")
            total_districts += len(features)
            
        except FileNotFoundError:
            errors.append(f"❌ {region}: Файл не найден")
        except json.JSONDecodeError as e:
            errors.append(f"❌ {region}: Ошибка JSON - {str(e)}")
        except Exception as e:
            errors.append(f"❌ {region}: {str(e)}")
    
    print(f"\n📊 Всего районов: {total_districts}")
    
    if errors:
        print(f"\n⚠️  Найдено ошибок: {len(errors)}")
        for error in errors:
            print(f"   {error}")
    else:
        print("\n✨ Все проверки пройдены успешно!")
    
    return len(errors) == 0

if __name__ == '__main__':
    success = test_regional_files()
    exit(0 if success else 1)