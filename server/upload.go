package main

import (
	"encoding/json"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/segmentio/ksuid"
)

func uploadHandler(w http.ResponseWriter, r *http.Request) {

	readLimit := int64(250e6)

	id := ksuid.New().String()

	dir := filepath.Join(*dataDir, id)
	err := os.Mkdir(dir, 0777)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	data, err := ioutil.ReadAll(io.LimitReader(r.Body, readLimit))
	if int64(len(data)) == readLimit {
		http.Error(w, "File too big", http.StatusInternalServerError)
		log.Fatal("File too big")
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return

	}
	err = ioutil.WriteFile(filepath.Join(dir, "footage.mp4"), data, 0777)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	j, err := json.Marshal(map[string]interface{}{
		"ID": id,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(j)
}
