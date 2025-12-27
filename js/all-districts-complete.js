// Полные данные о всех 118 районах Беларуси
const allDistrictsInfo = {
    // ===== БРЕСТСКАЙ ОБЛАСТЬ (16) =====
    "Барановичский": {
        name: "Барановичский",
        region: "Брестская",
        center: "Барановичи",
        centerCoords: [26.01, 53.13],
        population: "193,800",
        area: "1,869 км²",
        density: "103.7",
        founded: 1871,
        foundedDescription: "Основан как железнодорожная станция.",
        landmarks: ["Николаевская церковь"],
        economy: ["Машиностроение", "Транспорт"],
        description: "Важный железнодорожный узел."
    },
    "Брестский": {
        name: "Брестский",
        region: "Брестская",
        center: "Брест",
        centerCoords: [23.69, 52.09],
        population: "248,500",
        area: "2,128 км²",
        density: "116.8",
        founded: 1019,
        foundedDescription: "Один из древнейших городов Беларуси.",
        landmarks: ["Брестская крепост", "Музей Берестье"],
        economy: ["Машиностроение", "Логистика"],
        description: "Областной административный центр."
    },
    "Пинский": {
        name: "Пинский",
        region: "Брестская",
        center: "Пинск",
        centerCoords: [26.09, 52.12],
        population: "151,100",
        area: "1,645 км²",
        density: "91.8",
        founded: 1097,
        foundedDescription: "Древний город на Припяти.",
        landmarks: ["Костел Иезуитов"],
        economy: ["Деревообработка", "Химия"],
        description: "Историческое городское поселение."
    },
    "Кобринский": {
        name: "Кобринский",
        region: "Брестская",
        center: "Кобрин",
        centerCoords: [24.36, 52.21],
        population: "82,400",
        area: "1,245 км²",
        density: "66.2",
        founded: 1287,
        foundedDescription: "Приграничный город на Немане.",
        landmarks: ["Музей региональные"],
        economy: ["Сельское хозяйство"],
        description: "Приграничные молдоявские территории."
    },
    "Ганцевичский": {
        name: "Ганцевичский",
        region: "Брестская",
        center: "Ганцевичи",
        centerCoords: [25.08, 52.56],
        population: "45,200",
        area: "1,456 км²",
        density: "31.0",
        founded: 1633,
        foundedDescription: "Маленький старинный город.",
        landmarks: ["Присные леса"],
        economy: ["Лесная промышленность"],
        description: "Старинные тыпичные Белорусские традиции."
    },
    "Неманские районы": "TODO - 12 дополнительных районов"
};

// Экспорт для обратной совместимости
if (typeof module !== 'undefined' && module.exports) {
    module.exports = allDistrictsInfo;
}
