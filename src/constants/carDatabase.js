// ============================================================
// BAZA DANYCH KRAJÓW — treść pop-upów na globusie
// type: "export"      — kraj źródłowy (USA, Kanada)
// type: "transit"     — kraj tranzytowy EU (Niemcy, Holandia)
// type: "destination" — kraj docelowy (Polska)
// ============================================================

export const GLOBAL_CAR_DB = {
    "United States of America": {
        type: "export",
        cities: ["New York", "Miami", "Savannah", "Los Angeles", "Houston"],
        citiesNote: "i inne",
        auctions: ["IAA", "Copart", "Manheim Auctions"],
        brands: ["Audi Q5", "Dodge RAM", "BMW 3", "Mercedes GLC", "Mazda CX5"],
    },
    "United States": {
        type: "export",
        cities: ["New York", "Miami", "Savannah", "Los Angeles", "Houston"],
        citiesNote: "i inne",
        auctions: ["IAA", "Copart", "Manheim Auctions"],
        brands: ["Audi Q5", "Dodge RAM", "BMW 3", "Mercedes GLC", "Mazda CX5"],
    },
    "Canada": {
        type: "export",
        cities: ["Toronto", "Montreal", "Quebec", "Ottawa", "Vancouver"],
        citiesNote: "i inne",
        auctions: ["IAA", "Copart Canada", "Aukcje dealerskie Kanada", "Adesa Canada", "Zakupy od osób prywatnych"],
        brands: ["Audi Q5", "Dodge RAM", "BMW 3", "Mercedes GLC", "Mazda CX5"],
    },
    "Netherlands": {
        type: "transit",
        ports: ["Rotterdam"],
        description: "To między innymi w Rotterdamie samochody z USA i Kanady zaczynają swoją europejską podróż. Odbieramy auta z portu i wyruszamy w podróż do Polski, prosto pod Twój dom.",
    },
    "Germany": {
        type: "transit",
        ports: ["Bremerhaven", "Hamburg"],
        description: "Porty w Hamburgu i Bremerhaven to kluczowe miejsca w europejskiej logistyce importu aut. To tutaj najczęściej trafiają auta, które sprowadzamy, i to stąd wyruszamy do Polski, aby dostarczyć naszym klientom ich wymarzone samochody.",
    },
    "Poland": {
        type: "destination",
        description: "Po odprawie celnej i transporcie samochód trafia pod Twój dom lub do wybranego punktu odbioru w Polsce. Zapewniamy komplet dokumentów, weryfikację stanu auta i wsparcie przy rejestracji.",
    },
};

export const getCarInfo = (countryName) => {
    if (GLOBAL_CAR_DB[countryName]) return GLOBAL_CAR_DB[countryName];

    const lowerName = countryName.toLowerCase();
    for (const key in GLOBAL_CAR_DB) {
        if (key.toLowerCase() === lowerName) return GLOBAL_CAR_DB[key];
    }

    for (const key in GLOBAL_CAR_DB) {
        const lowerKey = key.toLowerCase();
        if (lowerName.includes(lowerKey) || lowerKey.includes(lowerName)) {
            return GLOBAL_CAR_DB[key];
        }
    }

    return null;
};
