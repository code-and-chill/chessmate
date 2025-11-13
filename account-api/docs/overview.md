1. Background

The account-api is the source of truth for player identity and profile in the chess platform.

It does not own authentication (credentials, tokens) and does not own gameplay stats or ratings. Instead, it focuses on:

Who the player is (username, display name, title, country).

How the player presents themselves (bio, links, avatar, banner).

How the player wants the app to behave (preferences).

What the player allows others to see/do (privacy settings).

Lightweight denormalized counters for fast profile rendering.

Everything else (ratings, game history, clubs, achievements, subscriptions) will live in other microservices and be composed in profile views.

account-api is therefore the identity & profile backbone for all other domains.

2. Tech Stack

Language & Framework

Python 3.11+

FastAPI (HTTP API, OpenAPI, async support)

Data & Persistence

PostgreSQL for relational data

SQLAlchemy 2.x (ORM / query layer)

Alembic (schema migrations)

Infrastructure

Docker (per-service container)

Kubernetes deployment (later, via shared Helm charts)

Environment-driven configuration (12-factor style)

Cross-cutting

Pydantic models for request/response validation

JWT-based user identity from existing auth-api
(decoded in gateway or in account-api with shared secret/public key)

OpenTelemetry hooks (later) for metrics/tracing

3. List of Endpoints

We’ll separate public/user-facing and internal/service-facing endpoints.

3.1 Public / User-facing (/v1/accounts)
Method & Path	Description	Auth
GET /v1/accounts/me	Get current user’s full account profile (self view).	Required (JWT)
PATCH /v1/accounts/me	Update display profile (name, country, language, bio, links).	Required
PATCH /v1/accounts/me/preferences	Update UI/game preferences (board, pieces, sounds…).	Required
PATCH /v1/accounts/me/privacy	Update privacy & communication settings.	Required
GET /v1/accounts/{username}	Get public profile by username (respect privacy).	Optional (public)

In Phase 1, ratings and other external data will be omitted or stubbed on /v1/accounts/{username}; later they can be added from other services.

3.2 Internal / Service-facing (/internal/accounts)
Method & Path	Description	Auth
POST /internal/accounts	Create account for a newly-created auth user.	Service-to-service only
GET /internal/accounts/{account_id}	Fetch full account record by ID (for other services).	Service-to-service only
GET /internal/accounts/by-auth-user/{auth_user_id}	Resolve account by auth_user_id.	Service-to-service only
POST /internal/accounts/{account_id}/deactivate	Deactivate an account (e.g. user delete / GDPR deactivation).	Admin/service-only
POST /internal/accounts/{account_id}/ban	Mark account as banned (e.g. fair-play / moderation decision).	Admin/service-only
POST /internal/accounts/{account_id}/unban	Reverse a ban.	Admin/service-only

Plus one simple healthcheck:

GET /health → { "status": "ok", "service": "account-api" }

4. List of DB Schemas

All tables are in the account schema or dedicated DB (depending on how you organise).

4.1 accounts

Purpose: canonical identity & core metadata.

accounts (
  id               UUID PRIMARY KEY,
  auth_user_id     UUID NOT NULL UNIQUE,

  username         VARCHAR(32) NOT NULL UNIQUE,
  display_name     VARCHAR(64) NOT NULL,

  title_code       VARCHAR(8),         -- 'GM','IM','FM','WGM','NM', etc.
  country_code     CHAR(2),            -- ISO-3166
  time_zone        VARCHAR(64),        -- e.g. "Asia/Jakarta"
  language_code    VARCHAR(8),         -- e.g. "en", "id", "es"

  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  is_banned        BOOLEAN NOT NULL DEFAULT FALSE,
  is_kid_account   BOOLEAN NOT NULL DEFAULT FALSE,
  is_titled_player BOOLEAN NOT NULL DEFAULT FALSE,

  member_since     TIMESTAMPTZ NOT NULL,
  last_seen_at     TIMESTAMPTZ,

  created_at       TIMESTAMPTZ NOT NULL,
  updated_at       TIMESTAMPTZ NOT NULL
);

4.2 account_profile_details

Purpose: “About me” + links and flavor text.

account_profile_details (
  account_id       UUID PRIMARY KEY REFERENCES accounts(id),

  bio              TEXT,
  location_text    VARCHAR(128),

  website_url      VARCHAR(255),
  youtube_url      VARCHAR(255),
  twitch_url       VARCHAR(255),
  twitter_url      VARCHAR(255),
  other_link_url   VARCHAR(255),

  favorite_players  TEXT,
  favorite_openings TEXT,

  created_at       TIMESTAMPTZ NOT NULL,
  updated_at       TIMESTAMPTZ NOT NULL
);

4.3 account_media

Purpose: avatar & banner (stored in file storage, referenced here).

account_media (
  account_id       UUID PRIMARY KEY REFERENCES accounts(id),

  avatar_file_id   UUID,     -- or VARCHAR if you prefer a URL
  banner_file_id   UUID,
  avatar_version   INT NOT NULL DEFAULT 1,

  created_at       TIMESTAMPTZ NOT NULL,
  updated_at       TIMESTAMPTZ NOT NULL
);

4.4 account_preferences

Purpose: UI and gameplay preferences.

account_preferences (
  account_id            UUID PRIMARY KEY REFERENCES accounts(id),

  board_theme           VARCHAR(32),    -- 'classic', 'wood', 'dark', etc.
  piece_set             VARCHAR(32),    -- 'classic', 'neo', etc.
  sound_enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  animation_level       VARCHAR(16),    -- 'none' | 'minimal' | 'full'
  highlight_legal_moves BOOLEAN NOT NULL DEFAULT TRUE,
  show_coordinates      BOOLEAN NOT NULL DEFAULT TRUE,
  confirm_moves         BOOLEAN NOT NULL DEFAULT FALSE,

  default_time_control  VARCHAR(16),    -- 'blitz','rapid','bullet', etc.
  auto_queen_promotion  BOOLEAN NOT NULL DEFAULT TRUE,

  created_at            TIMESTAMPTZ NOT NULL,
  updated_at            TIMESTAMPTZ NOT NULL
);

4.5 account_privacy_settings

Purpose: visibility & communication rules.

account_privacy_settings (
  account_id              UUID PRIMARY KEY REFERENCES accounts(id),

  show_ratings            BOOLEAN NOT NULL DEFAULT TRUE,
  show_online_status      BOOLEAN NOT NULL DEFAULT TRUE,
  show_game_archive       BOOLEAN NOT NULL DEFAULT TRUE,

  allow_friend_requests   VARCHAR(16) NOT NULL DEFAULT 'everyone',
    -- ENUM: 'everyone' | 'friends_of_friends' | 'no_one'
  allow_messages_from     VARCHAR(16) NOT NULL DEFAULT 'everyone',
    -- 'everyone' | 'friends' | 'no_one'
  allow_challenges_from   VARCHAR(16) NOT NULL DEFAULT 'everyone',

  is_profile_public       BOOLEAN NOT NULL DEFAULT TRUE,

  created_at              TIMESTAMPTZ NOT NULL,
  updated_at              TIMESTAMPTZ NOT NULL
);

4.6 account_social_counters (optional but recommended)

Purpose: fast read for profile header, denormalized from other services.

account_social_counters (
  account_id           UUID PRIMARY KEY REFERENCES accounts(id),

  followers_count      INT NOT NULL DEFAULT 0,
  following_count      INT NOT NULL DEFAULT 0,
  friends_count        INT NOT NULL DEFAULT 0,
  clubs_count          INT NOT NULL DEFAULT 0,

  total_games_played   INT NOT NULL DEFAULT 0,
  total_puzzles_solved INT NOT NULL DEFAULT 0,

  last_game_at         TIMESTAMPTZ,
  last_puzzle_at       TIMESTAMPTZ,

  updated_at           TIMESTAMPTZ NOT NULL
);


In Phase 1 you can keep everything at 0 and update later via events from social-graph, game-history, puzzle.

5. Scenarios

Here are the main flows that validate this design.

5.1 New User Signup

Actors: apps/web, auth-api, account-api

User signs up via web:

POST /v1/auth/signup (to auth-api)

auth-api:

Creates auth_user with email/password.

Generates auth_user_id.

Calls POST /internal/accounts on account-api with:

auth_user_id

suggested_username

optional country, language

account-api:

Creates accounts row + default rows in:

account_profile_details

account_media

account_preferences

account_privacy_settings

account_social_counters

Returns account_id and username.

auth-api returns a JWT to client with sub = auth_user_id.

Web app then calls GET /v1/accounts/me to display initial profile.

Result: new player has identity & default settings without touching any other service.

5.2 User Views Their Own Profile

Actors: apps/web, account-api

Web app sends GET /v1/accounts/me with user’s JWT.

Gateway or account-api decodes JWT → auth_user_id.

account-api:

Resolves account_id via accounts.auth_user_id.

Joins/profile-aggregates:

accounts

account_profile_details

account_media

account_preferences

account_privacy_settings

account_social_counters

Returns a profile DTO (self view, doesn’t apply privacy filters).

Web renders:

Username, title, country, avatar.

Bio, links.

Preferences (for settings page).

Basic social counters and join date.

Later, you can optionally enrich this response by calling leaderboard-api or entitlement-api from the web/BFF side.

5.3 User Updates Profile & Settings

Profile (bio, links, location)

Web calls PATCH /v1/accounts/me with partial payload:

Example: { "display_name": "...", "bio": "...", "location_text": "...", "website_url": "..." }.

account-api:

Validates fields and applies to:

accounts (for display_name/country/language/time_zone).

account_profile_details (for bio, links).

Updates updated_at.

Returns updated profile.

Preferences

Web calls PATCH /v1/accounts/me/preferences with:

{ "board_theme": "wood", "piece_set": "neo", "sound_enabled": false }.

account-api updates account_preferences.

Frontend persists that locally and re-renders board accordingly.

Privacy

Web calls PATCH /v1/accounts/me/privacy with:

{ "show_ratings": false, "allow_messages_from": "friends" }.

account-api updates account_privacy_settings.

All of these are local to account-api, no external service needed.

5.4 Another User Views Your Profile

Actors: apps/web, account-api (+ possibly others later)

Web calls GET /v1/accounts/{username}.

account-api:

Looks up account_id by username.

Loads:

accounts (basic info)

account_profile_details

account_media

account_privacy_settings

account_social_counters

Applies privacy rules:

If is_profile_public = FALSE and viewer is not allowed → return “limited profile” or 404.

If show_ratings = FALSE → mask rating fields (later, when integrating ratings).

If show_game_archive = FALSE → omit archive link, etc.

Returns a public profile DTO.

In Phase 1, the public DTO will mostly show just identity + limited bio. Later, as you connect ratings, clubs, and achievements, you use the privacy settings to filter those sections.

5.5 Admin / System Bans a User

Actors: moderation-api or admin panel, account-api

Moderator decides to ban account_id.

Admin panel calls POST /internal/accounts/{account_id}/ban.

account-api sets:

is_banned = TRUE and optionally is_active = FALSE.

Other services (auth, matchmaking, game creation) check is_banned via cached profile or internal calls and deny actions.

This keeps the ban flag centralized in one place.