package config

import (
	"log"
	"os"
)

// Config captures runtime configuration for the service.
type Config struct {
	Port        string
	Environment string
	ServiceName string
	Version     string
}

// Load builds Config from environment variables with sensible defaults.
func Load() Config {
	cfg := Config{
		Port:        getEnv("PORT", "8080"),
		Environment: getEnv("ENVIRONMENT", "local"),
		ServiceName: getEnv("SERVICE_NAME", "game-history-api"),
		Version:     getEnv("SERVICE_VERSION", "dev"),
	}

	if cfg.Port == "" {
		log.Println("warning: PORT not set, defaulting to 8080")
		cfg.Port = "8080"
	}

	return cfg
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
