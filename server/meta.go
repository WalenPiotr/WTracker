package main

import (
	"encoding/json"
	"image"
	"net/http"
	"path/filepath"

	"github.com/pkg/errors"
	"gocv.io/x/gocv"
)

type Meta struct {
	Size  image.Point
	FPS   float64
	Count int64
}

func metaHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/meta/"):]
	path := filepath.Join(*dataDir, id, "footage.mp4")

	meta, err := getMeta(path)
	rectsJSON, err := json.Marshal(map[string]interface{}{
		"ID":   id,
		"Meta": meta,
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(rectsJSON)

}

func getMeta(src string) (meta Meta, err error) {
	video, err := gocv.VideoCaptureFile(src)
	if err != nil {
		err = errors.Wrap(err, "While opening video")
		return
	}

	count := int64(video.Get(gocv.VideoCaptureFrameCount))
	size := image.Point{
		X: int(video.Get(gocv.VideoCaptureFrameWidth)),
		Y: int(video.Get(gocv.VideoCaptureFrameHeight)),
	}
	fps := video.Get(gocv.VideoCaptureFPS)

	meta = Meta{
		Size:  size,
		Count: count,
		FPS:   fps,
	}
	return
}
