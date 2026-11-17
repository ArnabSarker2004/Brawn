# Brawn technical guide

[Back to the project overview](../README.md)

This guide contains setup, API, persistence, calculation, and verification details. Commands run from the repository root unless a different directory is specified.

## Environment reference

| Variable | Location | Required? | Behavior |
| --- | --- | --- | --- |
| `MONGO_URI` | `backend/.env` | Yes | MongoDB connection used by `backend/index.js`; the API waits for connection before listening |
| `PORT` | `backend/.env` | Yes for documented startup | Set `4000` to match frontend API addresses |
| `NODE_ENV` | Runtime/build environment | Usually set by tooling | Selects local versus production API/proxy behavior |
| `REACT_APP_OPEN_AI` | Recognized by the frontend build | Optional, Brawnify only | Current browser integration embeds this value; move secret handling to a backend endpoint before shared use |

The current JWT signing value is configured in backend source, not an environment variable. Adding a `JWT_SECRET` line alone does not change the implementation. Frontend API addresses and backend CORS origins also remain source configuration.

## Terminology

| Term | Meaning in Brawn |
| --- | --- |
| Frontend / backend | The browser interface / the server handling requests and storage |
| API / endpoint | The server interface / one URL and HTTP method used to call it |
| CRUD | Create, read, update, and delete operations |
| Schema / embedded document | The expected data shape / a nested record stored inside another MongoDB record |
| React Context | Shared state made available to components without passing every value through intermediate components |
| JWT / HttpOnly cookie | A signed session token / a browser cookie inaccessible to normal page JavaScript |
| Authentication / authorization | Checking who is signed in / checking which records that person may access |
| CORS | Browser rules controlling which frontend origins may call the API |
| Browser-local storage | Saved state on the current browser, not shared delivery or server persistence |

## Architecture and data model

```text
React pages and components
  |-- Context: authentication, routines, workouts, sets, timer
  |-- Social context and browser localStorage
  |-- Optional Brawnify request to external model API
  |
  +--> Express routes --> controllers --> Mongoose --> MongoDB
```

```text
Brawn/
  package.json                    Root install/start/build convenience scripts
  backend/
    index.js                      Express setup, route mounts, MongoDB startup
    config.js                     Existing backend configuration
    routes/                       Auth, profile, routine, workout, and set routes
    controllers/                  HTTP handlers and database operations
    middleware/authMiddleware.js  Cookie JWT verification
    models/User.js                Credentials and editable profile attributes
    models/routineModel.js        Routine -> workouts -> sets, completion summaries
  frontend/
    src/App.js                    Routing, providers, authenticated app shell
    src/context/                  Shared React state and social persistence
    src/components/ui/            Reusable controls and UI primitives
    src/custom-components/        Workout, timer, modal, analytics, social UI
    src/pages/                    Training, profile, feed, creator, reels, messages
    src/data/exerciseDatabase.js   Bundled exercise reference catalog
    src/utils/exerciseInsights.js Exercise matching and set aggregation
    src/utils/socialProfiles.js   Sample profile and navigation helpers
```

Each routine belongs to a user and embeds its workouts. Each workout embeds sets containing `weight`, `reps`, and `time`, with `timeBased` and `cardio` flags controlling the exercise type. Routines also retain timestamped `completionStats` with `totalTime` and `totalWeight`.

Routine CRUD queries include the authenticated user ID. The routine router's authentication middleware runs before the mounted workout/set routers. However, the nested controllers load routines by ID without independently checking ownership; authentication alone does not establish complete authorization.

React Context separates shared concerns into providers. The social provider shares post/story actions across the feed, reels, creator studio, and messaging UI. Reusable controls, exercise helpers, and edit modals support multiple feature screens.

## API reference

All paths below are relative to the Express server, normally `http://localhost:4000`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a username/password and set an auth cookie |
| POST | `/api/auth/login` | Validate credentials and set an auth cookie |
| GET | `/api/auth/verify` | Check the JWT cookie |
| POST | `/api/auth/logout` | Clear the cookie |
| GET / POST | `/api/routines` | List the user's routines / create a routine |
| GET / PATCH / DELETE | `/api/routines/:id` | Read, edit, or remove a routine |
| POST | `/api/routines/:id/complete` | Append completion statistics; body includes `{ "value": 1200 }` for elapsed time |
| GET / POST | `/api/routines/:routineId/workouts` | List / create embedded exercises |
| GET / PATCH / DELETE | `/api/routines/:routineId/workouts/:workoutId` | Read, edit, or remove an exercise |
| GET / POST | `/api/routines/:routineId/workouts/:workoutId/sets` | List / create sets |
| GET / PATCH / DELETE | `/api/routines/:routineId/workouts/:workoutId/sets/:setId` | Read, edit, or remove a set |
| POST | `/api/user/getbodyinfo` | Read profile information and derived activity summaries |
| PATCH | `/api/user/updatebody` | Update profile fields |

Legacy code also registers `GET /api/routines/:id/complete` against the completion mutation handler. Use POST; removing the mutating GET is future API cleanup. Profile requests currently include a `username` field; this needs the ownership correction described below.

## Local setup

Use Node.js and npm, plus a reachable local MongoDB instance or MongoDB Atlas database. The documentation audit used Node **20.12.2** and npm **10.5.0**; the repository does not declare a formal Node engine range.

From the repository root:

```sh
npm run install-server
npm run install-client
```

Create `backend/.env` with your own database connection:

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/brawn
PORT=4000
```

Run the API and frontend in separate terminals:

```sh
# Terminal 1, repository root
npm run start-server
```

```sh
# Terminal 2, repository root
npm run start-client
```

The frontend normally opens at `http://localhost:3000`. The backend only begins listening after MongoDB connects. `backend/config.js` contains an older `mongoURI` property, but `backend/index.js` actually reads **`MONGO_URI`** from the environment.

**Local sign-in caveat:** the current auth controller always sets `Secure` and `SameSite=None` cookies. Browser behavior on plain HTTP localhost can affect whether those cookies are accepted and sent. A development-specific cookie configuration or a trusted HTTPS setup may be needed. The documented commands start the existing code; they do not resolve that configuration issue.

The frontend's development API address is hard-coded to port 4000, and the backend allows `http://localhost:3000` in CORS. Changing ports requires updating the matching frontend URLs and CORS configuration. A second frontend dev-server port is not automatically allowed.

## Brawnify integration

Brawnify builds prompts from the selected routine and available profile context, requests generated text/JSON, normalizes exercise fields, and invokes the routine/workout API. It includes loading/error states and requires the exact text `DELETE` before routine removal.

The implementation currently reads `REACT_APP_OPEN_AI` and sends model requests directly from the browser. Create React App embeds `REACT_APP_*` values into its client bundle. **A real API secret must be moved behind a server-side endpoint before this feature is shared or deployed.** The core routine tracker does not require this integration. No external model call was made during the documentation audit.

## Tests and builds

```sh
# Run inside frontend/
npm test -- --watchAll=false --runInBand
npm run build
```

Or build from the repository root with `npm run build-client`. The frontend output is `frontend/build`; the Express server does not currently serve that build directory.

Existing tests cover feed interactions and story sharing, messaging search/composition/attachments/conversation actions, and reel playback/comments/saves/sharing. These are component interaction tests, not a verified end-to-end backend workflow or real messaging transport.

**Documentation audit, November 16, 2026:** 11 frontend tests ran; **9 passed and 2 failed** across 3 suites. The failing cases were `likes posts and adds persistent comments` and `adds comments and sends reels to messages`. Do not describe the suite as fully passing. No backend integration test, production build, external AI request, or deployed application was verified in this audit.

## Current limitations and next improvements

- Move the hard-coded JWT signing secret in `backend/config.js` into server-only configuration, strengthen credential validation, and review cookie/logout behavior before public use.
- Enforce authenticated ownership in nested workout/set controllers and profile handlers. Profile handlers currently trust a request-supplied username, and profile updates return the full updated user document; filter the response to avoid returning credential fields.
- Move Brawnify calls and credentials to the backend, validate generated payloads, and review what profile information is shared externally.
- Add backend tests for authorization, nested CRUD, completion statistics, validation, and error handling; repair the two failing frontend tests.
- Standardize time representation across forms, stored set values, and formatting helpers. Some code interprets time as HHMMSS text while other code handles seconds.
- Store immutable completed-session exercise/set snapshots if historical performance is needed. Current exercise summaries can reflect the current routine definition.
- Complete the older progress analytics views and reconcile chart field names with completion records.
- Add server persistence, per-user storage, media hosting, and message transport if the social prototype becomes a multi-user feature. Current browser-local social keys are not scoped to an account.
- Production API/frontend URLs reference Render hosts in source, but current hosting availability, successful deployment, usage, and performance have not been verified.
