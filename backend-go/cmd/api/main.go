package main

import (
	"net/http"
	"os"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/config"
	"github.com/posiposi/dragons-counter/backend-go/internal/logger"
	"github.com/posiposi/dragons-counter/backend-go/internal/router"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		logger.New(config.Config{}, os.Stdout).Error("failed to load config", "error", err)
		os.Exit(1)
	}

	log := logger.New(cfg, os.Stdout)

	srv := &http.Server{
		Addr:              cfg.Addr,
		Handler:           router.NewRouter(),
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	log.Info("server starting", "addr", cfg.Addr, "env", cfg.Env)

	if cfg.TLSEnabled {
		err = srv.ListenAndServeTLS(cfg.CertFile, cfg.KeyFile)
	} else {
		err = srv.ListenAndServe()
	}
	if err != nil {
		log.Error("server stopped", "error", err)
		os.Exit(1)
	}
}
