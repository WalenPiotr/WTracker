package main

import (
	"encoding/json"
	"image"
	"image/jpeg"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/pkg/errors"
	"github.com/segmentio/ksuid"
	"gocv.io/x/gocv"
	"gocv.io/x/gocv/contrib"
)

type Data struct {
	Rectangle image.Rectangle
}

func main() {
	http.HandleFunc("/upload", uploadHandler)
	http.HandleFunc("/frame/", cors(frameHandler))
	http.HandleFunc("/track/", trackHandler)

	http.ListenAndServe(":8080", nil)
}

type FrameSettings struct {
	Index int
	Size  image.Point
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

func frameHandler(w http.ResponseWriter, r *http.Request) {

	id := r.URL.Path[len("/frame/"):]

	var settings FrameSettings
	err := json.NewDecoder(r.Body).Decode(&settings)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	path := filepath.Join("data", "tmp", id, "footage.mp4")
	frame, err := grabFrame(path, settings.Size, settings.Index)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	img, err := frame.ToImage()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.Header().Set("Content-Type", "image/jpeg")
	jpeg.Encode(w, img, nil)
}

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
	path := filepath.Join("data", "tmp", id, "footage.mp4")

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

func uploadHandler(w http.ResponseWriter, r *http.Request) {

	readLimit := int64(250e6)

	id := ksuid.New().String()

	dir := filepath.Join("data", "tmp", id)
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

func grabFrame(src string, size image.Point, index int) (frame gocv.Mat, err error) {

	video, err := gocv.VideoCaptureFile(src)
	if err != nil {
		err = errors.Wrap(err, "While opening video")
		return
	}

	count := int(video.Get(gocv.VideoCaptureFrameCount))
	log.Printf("Frame count = %d \n", count)

	if index >= count {
		err = errors.Wrapf(err, "Index (%d) is out of range (last frame index = %d) \n", index, count-1)
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
