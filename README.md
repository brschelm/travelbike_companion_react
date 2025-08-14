# TravelBike Companion - React Application

Aplikacja rowerowa zintegrowana ze Strava, przekształcona z Streamlit na React.

## Funkcje

- 🔗 Integracja ze Strava API
- 📊 Analiza aktywności rowerowych
- 📈 Statystyki i wykresy
- 🎯 Śledzenie celów treningowych
- 📍 Import tras GPX
- 🎨 Nowoczesny, responsywny interfejs

## Technologie

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Animations**: Framer Motion
- **State Management**: React Context API

## Instalacja

1. Zainstaluj zależności:
```bash
npm install
```

2. Skonfiguruj zmienne środowiskowe:
Utwórz plik `.env` w głównym katalogu z następującą zawartością:
```
REACT_APP_STRAVA_CLIENT_ID=your_strava_client_id_here
REACT_APP_STRAVA_CLIENT_SECRET=your_strava_client_secret_here
REACT_APP_STRAVA_REDIRECT_URI=http://localhost:3000
```

3. Uruchom aplikację:
```bash
npm start
```

Aplikacja będzie dostępna pod adresem: http://localhost:3000

## Konfiguracja Strava API

1. Przejdź do [Strava API Settings](https://www.strava.com/settings/api)
2. Skonfiguruj "Authorization Callback Domain" jako `localhost`
3. Skopiuj Client ID i Client Secret do pliku `.env`

## Struktura projektu

```
src/
├── components/          # Komponenty UI
├── contexts/           # React Contexts
├── pages/             # Strony aplikacji
├── services/          # Serwisy API
└── types/             # Definicje TypeScript
```

## Dostępne skrypty

- `npm start` - Uruchom aplikację w trybie deweloperskim
- `npm run build` - Zbuduj aplikację produkcyjną
- `npm test` - Uruchom testy
- `npm run eject` - Eject z Create React App (nieodwracalne)

## Migracja ze Streamlit

Ta aplikacja została przekształcona z oryginalnej aplikacji Streamlit, zachowując wszystkie funkcjonalności:
- Import tras ze Strava i GPX
- Analiza aktywności
- Statystyki i wykresy
- Śledzenie postępów
- Plany treningowe
- Ustawienia aplikacji
