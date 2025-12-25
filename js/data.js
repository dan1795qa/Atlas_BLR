// Данные о городах Беларуси
const belarusCities = [
    // Областные центры
    {
        name: "Минск",
        coords: [53.9, 27.56],
        population: "2 070 930",
        capital: true,
        region: "Минская область"
    },
    {
        name: "Гомель",
        coords: [52.43, 30.98],
        population: "575 827",
        regional: true,
        region: "Гомельская область"
    },
    {
        name: "Могилёв",
        coords: [53.90, 30.33],
        population: "369 200",
        regional: true,
        region: "Могилёвская область"
    },
    {
        name: "Витебск",
        coords: [55.19, 30.20],
        population: "384 385",
        regional: true,
        region: "Витебская область"
    },
    {
        name: "Гродно",
        coords: [53.68, 23.83],
        population: "317 365",
        regional: true,
        region: "Гродненская область"
    },
    {
        name: "Брест",
        coords: [52.09, 23.69],
        population: "370 503",
        regional: true,
        region: "Брестская область"
    },
    
    // Крупные города
    {
        name: "Бобруйск",
        coords: [53.14, 29.22],
        population: "220 517",
        region: "Могилёвская область"
    },
    {
        name: "Барановичи",
        coords: [53.13, 26.01],
        population: "168 772",
        region: "Брестская область"
    },
    {
        name: "Борисов",
        coords: [54.23, 28.51],
        population: "143 919",
        region: "Минская область"
    },
    {
        name: "Пинск",
        coords: [52.12, 26.09],
        population: "130 777",
        region: "Брестская область"
    },
    {
        name: "Орша",
        coords: [54.51, 30.42],
        population: "125 347",
        region: "Витебская область"
    },
    {
        name: "Мозырь",
        coords: [52.05, 29.25],
        population: "112 137",
        region: "Гомельская область"
    },
    {
        name: "Солигорск",
        coords: [52.79, 27.54],
        population: "101 614",
        region: "Минская область"
    },
    {
        name: "Молодечно",
        coords: [54.31, 26.85],
        population: "101 300",
        region: "Минская область"
    },
    {
        name: "Новополоцк",
        coords: [55.53, 28.65],
        population: "100 885",
        region: "Витебская область"
    },
    {
        name: "Лида",
        coords: [53.88, 25.30],
        population: "98 036",
        region: "Гродненская область"
    },
    {
        name: "Полоцк",
        coords: [55.49, 28.78],
        population: "82 258",
        region: "Витебская область"
    },
    {
        name: "Жлобин",
        coords: [52.89, 30.02],
        population: "73 089",
        region: "Гомельская область"
    },
    {
        name: "Светлогорск",
        coords: [52.63, 29.74],
        population: "71 250",
        region: "Гомельская область"
    },
    {
        name: "Речица",
        coords: [52.36, 30.39],
        population: "65 400",
        region: "Гомельская область"
    },
    {
        name: "Слуцк",
        coords: [53.02, 27.55],
        population: "62 228",
        region: "Минская область"
    },
    {
        name: "Жодино",
        coords: [54.10, 28.33],
        population: "61 007",
        region: "Минская область"
    },
    {
        name: "Слоним",
        coords: [53.09, 25.32],
        population: "51 434",
        region: "Гродненская область"
    },
    {
        name: "Кобрин",
        coords: [52.21, 24.36],
        population: "50 691",
        region: "Брестская область"
    },
    {
        name: "Волковыск",
        coords: [53.16, 24.45],
        population: "47 300",
        region: "Гродненская область"
    }
];

// Настройки карты
const mapConfig = {
    center: [53.9, 27.56],
    zoom: 7,
    minZoom: 6,
    maxZoom: 18
};
