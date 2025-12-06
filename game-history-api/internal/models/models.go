package models

import "time"

// Move represents a single move recorded in a chess game.
type Move struct {
	MoveNumber      int       `json:"moveNumber"`
	Side            string    `json:"side"`
	SAN             string    `json:"san"`
	UCI             string    `json:"uci"`
	FENAfter        string    `json:"fenAfter,omitempty"`
	PlayedAt        time.Time `json:"playedAt"`
	WhiteClockAfter int64     `json:"whiteClockAfterMs"`
	BlackClockAfter int64     `json:"blackClockAfterMs"`
}

// Game captures the canonical game summary for retrieval by ID.
type Game struct {
	GameID            string    `json:"gameId"`
	WhitePlayerID     string    `json:"whitePlayerId"`
	BlackPlayerID     string    `json:"blackPlayerId"`
	WhiteRatingPre    int       `json:"whiteRatingPre"`
	WhiteRatingPost   int       `json:"whiteRatingPost"`
	BlackRatingPre    int       `json:"blackRatingPre"`
	BlackRatingPost   int       `json:"blackRatingPost"`
	TimeControl       string    `json:"timeControl"`
	Variant           string    `json:"variant"`
	Mode              string    `json:"mode"`
	Region            string    `json:"region"`
	Platform          string    `json:"platform"`
	ClientVersion     string    `json:"clientVersion"`
	StartedAt         time.Time `json:"startedAt"`
	EndedAt           time.Time `json:"endedAt"`
	Result            string    `json:"result"`
	TerminationReason string    `json:"terminationReason"`
	Moves             []Move    `json:"moves"`
}

// PlayerGameSummary represents a single item in the player history feed.
type PlayerGameSummary struct {
	GameID             string    `json:"gameId"`
	Role               string    `json:"role"`
	EndedAt            time.Time `json:"endedAt"`
	Mode               string    `json:"mode"`
	TimeControl        string    `json:"timeControl"`
	Result             string    `json:"result"`
	OpponentID         string    `json:"opponentId"`
	OpponentRatingPre  int       `json:"opponentRatingPre"`
	OpponentRatingPost int       `json:"opponentRatingPost"`
}

// PlayerGamesResponse is returned by the player history endpoint.
type PlayerGamesResponse struct {
	PlayerID   string              `json:"playerId"`
	Games      []PlayerGameSummary `json:"games"`
	NextCursor string              `json:"nextCursor"`
}

// ExportFilter captures the query parameters for exporting games.
type ExportFilter struct {
	From        time.Time
	To          time.Time
	Mode        string
	TimeControl string
	MinRating   int
	MaxRating   int
	Region      string
	Limit       int
}

// PlayerHistoryFilter captures filters for player history lookups.
type PlayerHistoryFilter struct {
	Mode        string
	TimeControl string
	Result      string
	Since       time.Time
	Until       time.Time
	Limit       int
}
