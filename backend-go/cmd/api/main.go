package main

import (
	"log"
	"net/http"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/router"
)

func main() {
	srv := &http.Server{
		Addr:              ":3000",
		Handler:           router.NewRouter(),
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second,
	}
	log.Println("listening on :3000")
	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
