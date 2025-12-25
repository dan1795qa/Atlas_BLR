// Упрощенные границы областей Беларуси (GeoJSON)
const regionsBoundaries = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "Минская", "id": "minsk" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [27.56, 54.5], [28.8, 54.3], [29.2, 53.5],
                    [28.5, 52.8], [27.0, 52.9], [26.5, 53.3],
                    [26.8, 54.2], [27.56, 54.5]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Гомельская", "id": "gomel" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [29.2, 53.5], [31.0, 53.3], [31.5, 52.5],
                    [30.5, 51.5], [29.0, 51.7], [28.5, 52.8],
                    [29.2, 53.5]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Брестская", "id": "brest" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [23.2, 53.2], [26.5, 53.3], [27.0, 52.9],
                    [26.8, 51.8], [24.0, 51.5], [23.2, 52.0],
                    [23.2, 53.2]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Витебская", "id": "vitebsk" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [27.5, 56.0], [30.5, 55.8], [31.0, 54.5],
                    [28.8, 54.3], [27.56, 54.5], [26.8, 54.2],
                    [27.0, 55.5], [27.5, 56.0]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Гродненская", "id": "grodno" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [23.2, 54.5], [26.8, 54.2], [26.5, 53.3],
                    [23.2, 53.2], [23.2, 54.5]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Могилёвская", "id": "mogilev" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [28.8, 54.3], [31.0, 54.5], [31.0, 53.3],
                    [29.2, 53.5], [28.5, 52.8], [29.0, 51.7],
                    [28.0, 52.5], [28.8, 54.3]
                ]]
            }
        }
    ]
};
