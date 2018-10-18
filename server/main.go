package main

import (
	"flag"
	"log"
	"net/http"
)

var dataDir = flag.String("data-dir", "data/tmp", "data directory")

func main() {
	flag.Parse()

	http.HandleFunc("/upload", cors(uploadHandler))
	http.HandleFunc("/frame/", cors(frameHandler))
	http.HandleFunc("/track/", cors(trackHandler))
	http.HandleFunc("/meta/", cors(metaHandler))

	log.Println(http.ListenAndServe(":8080", nil))
}

func cors(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "*")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		log.Printf("Should set headers")

		if r.Method == "OPTIONS" {
			log.Printf("Should return for OPTIONS")
			return
		}
		next.ServeHTTP(w, r)
	})
}
