# Brawn frontend

The React application for Brawn's routine planner, live workout interface, activity/profile views, Brawnify, and social fitness prototype.

For a product walkthrough, architecture diagram, backend setup, and project status, start with the [main Brawn README](../README.md). The [technical guide](../docs/technical-guide.md) contains the full route and configuration reference.

## Run locally

The frontend needs the Express API on `http://localhost:4000` for account and training workflows. Follow the root README to configure MongoDB and start that API first.

Run these commands inside `frontend/`:

```sh
npm install
npm start
```

Open **http://localhost:3000**. The backend's allowed origins include this exact address; changing the frontend port requires matching CORS configuration. The current secure-cookie settings can also affect local HTTP login; see [the setup caveat](../README.md#getting-started).

## Commands

| Command | Purpose |
| --- | --- |
| `npm start` | Run the Create React App development server |
| `npm test -- --watchAll=false --runInBand` | Run component interaction tests once |
| `npm run build` | Compile the frontend into `build/` |

The build command does not deploy the application or start the backend.

## Source map

| Location | Responsibility |
| --- | --- |
| [src/App.js](src/App.js) | Page routes, authenticated app shell, and Context providers |
| [src/context](src/context/) | Shared authentication, training, timing, and social state |
| [src/pages/WorkoutPage.js](src/pages/WorkoutPage.js) | Routine details, editable sets, live session, and rest timers |
| [src/pages/Routines.js](src/pages/Routines.js) | Routine browsing, management, and exercise references |
| [src/pages/Brawnify.js](src/pages/Brawnify.js) | Optional model-generated routine/exercise workflow |
| [src/components/ui](src/components/ui/) | Reusable buttons, cards, inputs, tabs, dialogs, and chart helpers |
| [src/custom-components](src/custom-components/) | Feature-specific workout, timer, analytics, and social UI |
| [src/data/exerciseDatabase.js](src/data/exerciseDatabase.js) | Bundled exercise catalog and instruction content |
| [src/utils/exerciseInsights.js](src/utils/exerciseInsights.js) | Title matching and exercise/set summary helpers |

## State and storage

- **Training/profile data:** requested from the Express API and saved in MongoDB.
- **Session UI:** React state manages the current timer, rest countdown, and checked-off sets.
- **Social prototype:** browser-local storage remembers posts, stories, interactions, and message threads. It is not an account-isolated server database or real-time messaging system.
- **Sample content:** profiles, engagement counts, and some media provide demonstration content.

React Context is the mechanism used to share state between components without passing every value through each intervening component.

## Brawnify configuration boundary

The current implementation recognizes `REACT_APP_OPEN_AI` and makes model calls directly from the browser. Create React App embeds `REACT_APP_*` values in the frontend bundle. Move the integration behind a server endpoint before using real credentials in a shared deployment. The manual workout interface works independently of this optional feature.

## Verification

The November 16, 2026 recorded component test run passed 9 tests and failed 2, across 3 suites. Failures concern feed likes/comments and reel sharing into messages. See the [root project status](../README.md#testing-and-project-status) for the dated result and limitations.
