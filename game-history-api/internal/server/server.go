package server

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/chessmate/game-history-api/internal/config"
	"github.com/chessmate/game-history-api/internal/models"
	"github.com/chessmate/game-history-api/internal/storage/memory"
)

// Repository defines the storage layer the server depends on.
type Repository interface {
	GetGame(ctx context.Context, gameID string) (models.Game, bool)
	ListPlayerGames(ctx context.Context, playerID string, filter models.PlayerHistoryFilter) ([]models.PlayerGameSummary, string)
	ExportGames(ctx context.Context, filter models.ExportFilter) ([]models.Game, error)
	Health(ctx context.Context) error
}

// Server exposes HTTP handlers for the Game History API.
type Server struct {
	repo Repository
	cfg  config.Config
}

// New constructs a Server with dependencies.
func New(cfg config.Config, repo Repository) *Server {
	return &Server{cfg: cfg, repo: repo}
}

// Handler returns the HTTP mux with all endpoints mounted.
func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/game-history/v1/health", s.health)
	mux.HandleFunc("/game-history/v1/games/", s.getGame)
	mux.HandleFunc("/game-history/v1/players/", s.getPlayerGames)
	mux.HandleFunc("/game-history/v1/export/games", s.exportGames)
	return mux
}

func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if err := s.repo.Health(ctx); err != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "degraded"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"status":         "ok",
		"service":        s.cfg.ServiceName,
		"environment":    s.cfg.Environment,
		"serviceVersion": s.cfg.Version,
	})
}

func (s *Server) getGame(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	const prefix = "/game-history/v1/games/"
	if !strings.HasPrefix(r.URL.Path, prefix) {
		http.NotFound(w, r)
		return
	}
	gameID := strings.TrimPrefix(r.URL.Path, prefix)
	if gameID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "gameId is required"})
		return
	}
	game, ok := s.repo.GetGame(r.Context(), gameID)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "game not found"})
		return
	}

	writeJSON(w, http.StatusOK, game)
}

func (s *Server) getPlayerGames(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	const prefix = "/game-history/v1/players/"
	if !strings.HasPrefix(r.URL.Path, prefix) {
		http.NotFound(w, r)
		return
	}
	path := strings.TrimPrefix(r.URL.Path, prefix)
	parts := strings.SplitN(path, "/", 2)
	if len(parts) != 2 || parts[1] != "games" {
		http.NotFound(w, r)
		return
	}
	playerID := parts[0]
	limit := parseLimit(r.URL.Query().Get("limit"), 20)

	filter := models.PlayerHistoryFilter{
		Mode:        r.URL.Query().Get("mode"),
		TimeControl: r.URL.Query().Get("timeControl"),
		Result:      r.URL.Query().Get("result"),
		Limit:       limit,
	}

	if since := r.URL.Query().Get("since"); since != "" {
		parsed, err := time.Parse(time.RFC3339, since)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid since timestamp"})
			return
		}
		filter.Since = parsed
	}

	if until := r.URL.Query().Get("until"); until != "" {
		parsed, err := time.Parse(time.RFC3339, until)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid until timestamp"})
			return
		}
		filter.Until = parsed
	}

	games, nextCursor := s.repo.ListPlayerGames(r.Context(), playerID, filter)

	resp := models.PlayerGamesResponse{
		PlayerID:   playerID,
		Games:      games,
		NextCursor: nextCursor,
	}

	writeJSON(w, http.StatusOK, resp)
}

func (s *Server) exportGames(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	query := r.URL.Query()
	fromStr := query.Get("from")
	toStr := query.Get("to")

	if fromStr == "" || toStr == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "from and to parameters are required"})
		return
	}

	from, err := time.Parse(time.RFC3339, fromStr)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "from must be RFC3339"})
		return
	}
	to, err := time.Parse(time.RFC3339, toStr)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "to must be RFC3339"})
		return
	}

	filter := models.ExportFilter{
		From:        from,
		To:          to,
		Mode:        query.Get("mode"),
		TimeControl: query.Get("timeControl"),
		Region:      query.Get("region"),
		Limit:       parseLimit(query.Get("limit"), 1000),
	}

	games, err := s.repo.ExportGames(r.Context(), filter)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"from":  filter.From,
		"to":    filter.To,
		"count": len(games),
		"games": games,
	})
}

func parseLimit(raw string, fallback int) int {
	if raw == "" {
		return fallback
	}
	value, err := strconv.Atoi(raw)
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}

func writeJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("failed to encode response: %v", err)
	}
}

// NewWithMemoryRepo is a convenience constructor for local bootstrapping.
func NewWithMemoryRepo(cfg config.Config, seed []models.Game) *Server {
	repo := memory.NewRepository()
	repo.Seed(seed)
	return New(cfg, repo)
}
