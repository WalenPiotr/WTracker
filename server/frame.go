package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"image"
	"image/png"
	"log"
	"net/http"
	"path/filepath"
	"time"

	"github.com/pkg/errors"
	"gocv.io/x/gocv"
)

type FrameSettings struct {
	Indices []int
	Size    image.Point
}

func frameHandler(w http.ResponseWriter, r *http.Request) {
	start := time.Now()

	id := r.URL.Path[len("/frame/"):]

	var settings FrameSettings
	err := json.NewDecoder(r.Body).Decode(&settings)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	path := filepath.Join(*dataDir, id, "footage.mp4")

	indexToImage := make(map[int]string)

	for _, index := range settings.Indices {
		frame, err := grabFrame(path, index, settings.Size)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		img, err := frame.ToImage()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		var buf bytes.Buffer
		err = png.Encode(&buf, img)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		b64 := base64.StdEncoding.EncodeToString(buf.Bytes())
		indexToImage[index] = b64
	}

	JSON, err := json.Marshal(map[string]interface{}{
		"ID":           id,
		"IndexToImage": indexToImage,
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(JSON)

	elapsed := time.Since(start)
	log.Printf("Took %s", elapsed)
}

func grabFrame(src string, index int, size image.Point) (frame gocv.Mat, err error) {

	video, err := gocv.VideoCaptureFile(src)
	if err != nil {
		err = errors.Wrap(err, "While opening video")
		return
	}

	count := int(video.Get(gocv.VideoCaptureFrameCount))
	if index >= count {
		err = errors.Wrapf(err, "Index (%d) is out of range (last frame index = %d) \n", index, count-1)
		return
	}

	frame = gocv.NewMat()
	video.Set(gocv.VideoCapturePosFrames, float64(index))
	ok := video.Read(&frame)
	if !ok {
		err = errors.Errorf("While reading frame i = %d", index)
	}

	gocv.Resize(frame, &frame, size, 0, 0, gocv.InterpolationNearestNeighbor)

	return
}
