package main

import (
	"encoding/json"
	"image"
	"log"
	"net/http"
	"path/filepath"

	"github.com/pkg/errors"
	"gocv.io/x/gocv"
	"gocv.io/x/gocv/contrib"
)

type Settings struct {
	Rectangle image.Rectangle
	Limits    Limits
}

type Limits struct {
	Start int
	End   int
	Jump  int
}

func trackHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/track/"):]
	path := filepath.Join(*dataDir, id, "footage.mp4")

	var settings Settings
	err := json.NewDecoder(r.Body).Decode(&settings)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	rect := settings.Rectangle
	limits := settings.Limits

	rects, err := track(path, rect, limits.Start, limits.End, limits.Jump)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	rectsJSON, err := json.Marshal(map[string]interface{}{
		"ID":         id,
		"Rectangles": rects,
		"Limits":     settings.Limits,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(rectsJSON)
}

func track(src string, rect image.Rectangle, start, end, jump int) (frameToRects map[int]image.Rectangle, err error) {
	video, err := gocv.VideoCaptureFile(src)
	if err != nil {
		err = errors.Wrap(err, "While opening video")
		return
	}

	count := int(video.Get(gocv.VideoCaptureFrameCount))
	log.Printf("Frame count = %d \n", count)

	if start > end {
		err = errors.Errorf("Start frame index is bigger than end frame index (%d > %d) ", start, end)
		return
	}
	if start >= count {
		err = errors.Errorf("Start frame (%d) is out of range (last frame = %d)", start, count-1)
		return
	}
	if end >= count {
		err = errors.Errorf("End frame (%d) is out of range (last frame = %d)", end, count-1)
		return
	}

	tracker := contrib.NewTrackerMOSSE()
	defer tracker.Close()

	video.Set(gocv.VideoCapturePosFrames, float64(start))

	frameToRects = make(map[int]image.Rectangle)
	img := gocv.NewMat()
	for i := start; i <= end; i += jump {
		ok := video.Read(&img)
		if !ok {
			err = errors.New("While reading frame")
			return
		}

		if i == start {
			ok = tracker.Init(img, rect)
			if !ok {
				err = errors.New("While tracker init")
				return
			}
		} else {
			rect, ok = tracker.Update(img)
			if !ok {
				err = errors.New("While tracker update")
				return
			}
		}
		frameToRects[i] = rect

	}
	return
}
