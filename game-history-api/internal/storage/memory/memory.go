package memory

import (
	"context"
	"errors"
	"sort"
	"strings"
	"sync"

	"github.com/chessmate/game-history-api/internal/models"
)

// Repository offers an in-memory implementation suitable for local testing.
type Repository struct {
	mu          sync.RWMutex
	games       map[string]models.Game
	playerIndex map[string][]models.PlayerGameSummary
}

// NewRepository creates an empty memory repository.
func NewRepository() *Repository {
	return &Repository{
		games:       make(map[string]models.Game),
		playerIndex: make(map[string][]models.PlayerGameSummary),
	}
}

// Seed loads initial games into the repository for local usage.
func (r *Repository) Seed(games []models.Game) {
	r.mu.Lock()
	defer r.mu.Unlock()

	for _, game := range games {
		r.games[game.GameID] = game
		r.addPlayerIndexLocked(game)
	}
}

// GetGame returns a game by ID.
func (r *Repository) GetGame(ctx context.Context, gameID string) (models.Game, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	game, ok := r.games[gameID]
	return game, ok
}

// ListPlayerGames returns games for a player applying filters.
func (r *Repository) ListPlayerGames(ctx context.Context, playerID string, filter models.PlayerHistoryFilter) ([]models.PlayerGameSummary, string) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	entries := r.playerIndex[playerID]
	filtered := make([]models.PlayerGameSummary, 0, len(entries))

	for _, pg := range entries {
		if filter.Mode != "" && !strings.EqualFold(filter.Mode, pg.Mode) {
			continue
		}
		if filter.TimeControl != "" && !strings.EqualFold(filter.TimeControl, pg.TimeControl) {
			continue
		}
		if filter.Result != "" && !strings.EqualFold(filter.Result, pg.Result) {
			continue
		}
		if !filter.Since.IsZero() && pg.EndedAt.Before(filter.Since) {
			continue
		}
		if !filter.Until.IsZero() && pg.EndedAt.After(filter.Until) {
			continue
		}

		filtered = append(filtered, pg)
		if filter.Limit > 0 && len(filtered) >= filter.Limit {
			break
		}
	}

	return filtered, ""
}

// ExportGames returns games between a date range applying optional filters.
func (r *Repository) ExportGames(ctx context.Context, filter models.ExportFilter) ([]models.Game, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	if filter.From.IsZero() || filter.To.IsZero() {
		return nil, errors.New("from and to are required")
	}

	games := make([]models.Game, 0)
	for _, game := range r.games {
		if game.EndedAt.Before(filter.From) || game.EndedAt.After(filter.To) {
			continue
		}
		if filter.Mode != "" && !strings.EqualFold(filter.Mode, game.Mode) {
			continue
		}
		if filter.TimeControl != "" && !strings.EqualFold(filter.TimeControl, game.TimeControl) {
			continue
		}
		if filter.Region != "" && !strings.EqualFold(filter.Region, game.Region) {
			continue
		}

		games = append(games, game)
	}

	sort.Slice(games, func(i, j int) bool {
		return games[i].EndedAt.After(games[j].EndedAt)
	})

	if filter.Limit > 0 && len(games) > filter.Limit {
		games = games[:filter.Limit]
	}

	return games, nil
}

// Health is a simple readiness indicator for the memory repository.
func (r *Repository) Health(ctx context.Context) error {
	return nil
}

func (r *Repository) addPlayerIndexLocked(game models.Game) {
	add := func(playerID, opponentID string, role string, oppPre, oppPost int) {
		pg := models.PlayerGameSummary{
			GameID:             game.GameID,
			Role:               role,
			EndedAt:            game.EndedAt,
			Mode:               game.Mode,
			TimeControl:        game.TimeControl,
			Result:             playerResult(game.Result, role),
			OpponentID:         opponentID,
			OpponentRatingPre:  oppPre,
			OpponentRatingPost: oppPost,
		}
		r.playerIndex[playerID] = append(r.playerIndex[playerID], pg)
	}

	add(game.WhitePlayerID, game.BlackPlayerID, "WHITE", game.BlackRatingPre, game.BlackRatingPost)
	add(game.BlackPlayerID, game.WhitePlayerID, "BLACK", game.WhiteRatingPre, game.WhiteRatingPost)

	// Ensure newest-first ordering for deterministic pagination.
	for playerID := range r.playerIndex {
		entries := r.playerIndex[playerID]
		sort.Slice(entries, func(i, j int) bool {
			return entries[i].EndedAt.After(entries[j].EndedAt)
		})
		r.playerIndex[playerID] = entries
	}
}

func playerResult(gameResult, role string) string {
	switch strings.ToUpper(gameResult) {
	case "WHITE_WIN":
		if strings.EqualFold(role, "WHITE") {
			return "WIN"
		}
		return "LOSS"
	case "BLACK_WIN":
		if strings.EqualFold(role, "BLACK") {
			return "WIN"
		}
		return "LOSS"
	case "DRAW":
		return "DRAW"
	case "ABORTED":
		return "ABORTED"
	case "TIMEOUT":
		if strings.EqualFold(role, "WHITE") {
			return "LOSS"
		}
		return "LOSS"
	default:
		return "UNKNOWN"
	}
}
