package server

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/chessmate/game-history-api/internal/config"
)

func TestHealth(t *testing.T) {
	s := NewWithMemoryRepo(testConfig(), SampleGames())
	req := httptest.NewRequest(http.MethodGet, "/game-history/v1/health", nil)
	rec := httptest.NewRecorder()

	s.Handler().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var body map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if body["status"] != "ok" {
		t.Fatalf("expected status ok, got %s", body["status"])
	}
}

func TestGetGame(t *testing.T) {
	s := NewWithMemoryRepo(testConfig(), SampleGames())

	req := httptest.NewRequest(http.MethodGet, "/game-history/v1/games/11111111-2222-3333-4444-555555555555", nil)
	rec := httptest.NewRecorder()
	s.Handler().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var gameResponse map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &gameResponse); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if gameResponse["gameId"] != "11111111-2222-3333-4444-555555555555" {
		t.Fatalf("unexpected gameId: %v", gameResponse["gameId"])
	}
}

func TestPlayerHistory(t *testing.T) {
	s := NewWithMemoryRepo(testConfig(), SampleGames())

	req := httptest.NewRequest(http.MethodGet, "/game-history/v1/players/player-local-example/games?limit=5", nil)
	rec := httptest.NewRecorder()
	s.Handler().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if resp["playerId"] != "player-local-example" {
		t.Fatalf("unexpected playerId: %v", resp["playerId"])
	}
}

func TestExportRequiresWindow(t *testing.T) {
	s := NewWithMemoryRepo(testConfig(), SampleGames())

	req := httptest.NewRequest(http.MethodGet, "/game-history/v1/export/games", nil)
	rec := httptest.NewRecorder()
	s.Handler().ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", rec.Code)
	}
}

func testConfig() config.Config {
	return config.Config{Port: "0", Environment: "test", ServiceName: "game-history-api", Version: "test"}
}
