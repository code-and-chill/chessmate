package server

import (
	"time"

	"github.com/chessmate/game-history-api/internal/models"
)

// SampleGames returns deterministic fixtures to exercise the API locally and in tests.
func SampleGames() []models.Game {
	endedAt, _ := time.Parse(time.RFC3339, "2025-12-06T09:16:55Z")
	startAt, _ := time.Parse(time.RFC3339, "2025-12-06T09:12:34Z")
	moveTime, _ := time.Parse(time.RFC3339, "2025-12-06T09:12:50Z")

	game := models.Game{
		GameID:            "11111111-2222-3333-4444-555555555555",
		WhitePlayerID:     "player-local-example",
		BlackPlayerID:     "player-456",
		WhiteRatingPre:    1820,
		WhiteRatingPost:   1835,
		BlackRatingPre:    1904,
		BlackRatingPost:   1890,
		TimeControl:       "3+2",
		Variant:           "standard",
		Mode:              "RATED",
		Region:            "ap-southeast-1",
		Platform:          "mobile",
		ClientVersion:     "1.4.2",
		StartedAt:         startAt,
		EndedAt:           endedAt,
		Result:            "WHITE_WIN",
		TerminationReason: "CHECKMATE",
		Moves: []models.Move{
			{
				MoveNumber:      1,
				Side:            "WHITE",
				SAN:             "e4",
				UCI:             "e2e4",
				PlayedAt:        moveTime,
				WhiteClockAfter: 175000,
				BlackClockAfter: 180000,
			},
		},
	}

	return []models.Game{game}
}
