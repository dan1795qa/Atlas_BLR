// Данные о городах Беларуси
const belarusCities = [
    // Областные центры
    {
        name: "Минск",
        coords: [53.9, 27.56],
        population: "2 070 930",
        founded: 1067,
        foundedDescription: "Впервые упоминается в 'Повести временных лет' в связи с битвой на Немиге",
        capital: true,
        region: "Минская область"
    },
    {
        name: "Гомель",
        coords: [52.43, 30.98],
        population: "575 827",
        founded: 1142,
        foundedDescription: "Первое упоминание в летописи",
        regional: true,
        region: "Гомельская область"
    },
    {
        name: "Могилёв",
        coords: [53.90, 30.33],
        population: "369 200",
        founded: 1267,
        foundedDescription: "Согласно Могилевской хронике, заложен Могилевский замок",
        regional: true,
        region: "Могилёвская область"
    },
    {
        name: "Витебск",
        coords: [55.19, 30.20],
        population: "384 385",
        founded: 974,
        foundedDescription: "По легенде основан княгиней Ольгой, первое письменное упоминание - 1021 год",
        regional: true,
        region: "Витебская область"
    },
    {
        name: "Гродно",
        coords: [53.68, 23.83],
        population: "317 365",
        founded: 1128,
        foundedDescription: "Первое упоминание в летописи",
        regional: true,
        region: "Гродненская область"
    },
    {
        name: "Брест",
        coords: [52.09, 23.69],
        population: "370 503",
        founded: 1019,
        foundedDescription: "Впервые упоминается в летописи как Берестье",
        regional: true,
        region: "Брестская область"
    },
    
    // Крупные города
    {
        name: "Бобруйск",
        coords: [53.14, 29.22],
        population: "220 517",
        founded: 1387,
        foundedDescription: "Первое упоминание в письменных источниках",
        region: "Могилёвская область"
    },
    {
        name: "Барановичи",
        coords: [53.13, 26.01],
        population: "168 772",
        founded: 1871,
        foundedDescription: "Основан как железнодорожная станция",
        region: "Брестская область"
    },
    {
        name: "Борисов",
        coords: [54.23, 28.51],
        population: "143 919",
        founded: 1102,
        foundedDescription: "Основан полоцким князем Борисом",
        region: "Минская область"
    },
    {
        name: "Пинск",
        coords: [52.12, 26.09],
        population: "130 777",
        founded: 1097,
        foundedDescription: "Первое летописное упоминание",
        region: "Брестская область"
    },
    {
        name: "Орша",
        coords: [54.51, 30.42],
        population: "125 347",
        founded: 1067,
        foundedDescription: "Впервые упоминается в летописях",
        region: "Витебская область"
    },
    {
        name: "Мозырь",
        coords: [52.05, 29.25],
        population: "112 137",
        founded: 1155,
        foundedDescription: "Первое упоминание в Ипатьевской летописи",
        region: "Гомельская область"
    },
    {
        name: "Солигорск",
        coords: [52.79, 27.54],
        population: "101 614",
        founded: 1958,
        foundedDescription: "Основан как город горняков",
        region: "Минская область"
    },
    {
        name: "Молодечно",
        coords: [54.31, 26.85],
        population: "101 300",
        founded: 1388,
        foundedDescription: "Первое упоминание в документах",
        region: "Минская область"
    },
    {
        name: "Новополоцк",
        coords: [55.53, 28.65],
        population: "100 885",
        founded: 1958,
        foundedDescription: "Основан как город нефтепереработчиков",
        region: "Витебская область"
    },
    {
        name: "Лида",
        coords: [53.88, 25.30],
        population: "98 036",
        founded: 1323,
        foundedDescription: "Первое упоминание в летописи",
        region: "Гродненская область"
    },
    {
        name: "Полоцк",
        coords: [55.49, 28.78],
        population: "82 258",
        founded: 862,
        foundedDescription: "Один из древнейших городов Руси",
        region: "Витебская область"
    },
    {
        name: "Жлобин",
        coords: [52.89, 30.02],
        population: "73 089",
        founded: 1654,
        foundedDescription: "Первое упоминание в документах",
        region: "Гомельская область"
    },
    {
        name: "Светлогорск",
        coords: [52.63, 29.74],
        population: "71 250",
        founded: 1504,
        foundedDescription: "Первоначально назывался Шатилки",
        region: "Гомельская область"
    },
    {
        name: "Речица",
        coords: [52.36, 30.39],
        population: "65 400",
        founded: 1213,
        foundedDescription: "Первое упоминание в летописи",
        region: "Гомельская область"
    },
    {
        name: "Слуцк",
        coords: [53.02, 27.55],
        population: "62 228",
        founded: 1116,
        foundedDescription: "Первое упоминание в Ипатьевской летописи",
        region: "Минская область"
    },
    {
        name: "Жодино",
        coords: [54.10, 28.33],
        population: "61 007",
        founded: 1963,
        foundedDescription: "Основан как город автомобилестроителей",
        region: "Минская область"
    },
    {
        name: "Слоним",
        coords: [53.09, 25.32],
        population: "51 434",
        founded: 1252,
        foundedDescription: "Первое упоминание в Ипатьевской летописи",
        region: "Гродненская область"
    },
    {
        name: "Кобрин",
        coords: [52.21, 24.36],
        population: "50 691",
        founded: 1287,
        foundedDescription: "Первое упоминание в летописи",
        region: "Брестская область"
    },
    {
        name: "Волковыск",
        coords: [53.16, 24.45],
        population: "47 300",
        founded: 1005,
        foundedDescription: "Один из древнейших городов Беларуси",
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
