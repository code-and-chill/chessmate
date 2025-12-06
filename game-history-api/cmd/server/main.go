package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/chessmate/game-history-api/internal/config"
	"github.com/chessmate/game-history-api/internal/server"
)

func main() {
	cfg := config.Load()
	seed := server.SampleGames()
	s := server.NewWithMemoryRepo(cfg, seed)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("starting %s on %s", cfg.ServiceName, addr)
	if err := http.ListenAndServe(addr, s.Handler()); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
