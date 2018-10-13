package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"image"
	"image/color"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"

	"github.com/pkg/errors"
	gocv "gocv.io/x/gocv"
	"gocv.io/x/gocv/contrib"
)

type Data struct {
	Rectangle image.Rectangle
	Limits    Limits
	Style     Style
}

type Limits struct {
	Start int
	End   int
}

func main() {
	s := flag.String("src", "/data/src/toro.mp4", "mp4 file path")
	o := flag.String("out", "/data/out", "output dir")
	d := flag.String("data", "data/src/data.json", "json file with data")

	flag.Parse()

	src, err := filepath.Abs(*s)
	if err != nil {
		log.Fatalln(errors.Wrap(err, "while creating absolute path"))
	}

	out, err := filepath.Abs(*o)
	if err != nil {
		log.Fatalln(errors.Wrap(err, "while creating absolute path"))
	}

	dataPath, err := filepath.Abs(*d)
	if err != nil {
		log.Fatalln(errors.Wrap(err, "while creating absolute path"))
	}

	os.Mkdir(out, 0777)
	if err != nil {
		log.Fatalln(errors.Wrap(err, "while creating out dir"))
	}

	video, err := gocv.VideoCaptureFile(src)
	if err != nil {

	}

	b, err := ioutil.ReadFile(dataPath)
	if err != nil {
		log.Fatalln(errors.Wrap(err, "while loading json"))
	}
	var data Data
	err = json.Unmarshal(b, &data)
	if err != nil {
		log.Fatalln(errors.Wrap(err, "while unmarshaling json"))
	}

	tracker := contrib.NewTrackerMOSSE()
	defer tracker.Close()

	img := gocv.NewMat()
	defer img.Close()

	rect := data.Rectangle
	start := data.Limits.Start
	end := data.Limits.End
	style := data.Style

	var rects []image.Rectangle

	saveFile := "/data/out/output.avi"
	var writer *gocv.VideoWriter

	for i := 0; true; i++ {
		ok := video.Read(&img)
		if i == start {
			writer, err = gocv.VideoWriterFile(saveFile, "MJPG", 25, img.Cols(), img.Rows(), true)
			defer writer.Close()
			if err != nil {
				fmt.Printf("error opening video writer device: %v\n", saveFile)
				return
			}

			init := tracker.Init(img, rect)
			if !init {
				log.Fatalln("while tracker init")
				break
			}
		}

		if !ok {
			log.Println("Device closed")
			break
		} else if img.Empty() {
			continue
		} else {
			if i >= start && i < end {
				rect, ok = tracker.Update(img)
				if ok {
					rects = append(rects, rect)
					draw(&img, rects, style)

					// filename := fmt.Sprintf("output%d.png", i)
					// gocv.IMWrite(filepath.Join(out, filename), img)

					writer.Write(img)
					log.Println(rect)
				}
			}
		}
	}

	log.Printf("rects len = %d \n", len(rects))

}

type Style struct {
	Point     Point
	Line      Line
	Rectangle Rectangle
	Axis      Axis
}

type Point struct {
	Color     color.RGBA
	Radius    int
	Thickness int
}

type Line struct {
	Color     color.RGBA
	Thickness int
}

type Rectangle struct {
	Color     color.RGBA
	Thickness int
}

type Axis struct {
	Color     color.RGBA
	Thickness int
}

func draw(img *gocv.Mat, rects []image.Rectangle, style Style) {

	axisX := (rects[0].Max.X + rects[0].Min.X) / 2
	axisY := (rects[0].Max.Y + rects[0].Min.Y) / 2
	gocv.Line(img, image.Point{axisX, 0}, image.Point{axisX, img.Rows() - 1}, style.Axis.Color, style.Axis.Thickness)
	gocv.Line(img, image.Point{0, axisY}, image.Point{img.Cols() - 1, axisY}, style.Axis.Color, style.Axis.Thickness)

	rect := rects[len(rects)-1]
	gocv.Rectangle(img, rect, style.Rectangle.Color, style.Rectangle.Thickness)

	for _, r := range rects {
		x := (r.Min.X + r.Max.X) / 2
		y := (r.Min.Y + r.Max.Y) / 2
		gocv.Circle(img, image.Point{X: x, Y: y}, style.Point.Radius, style.Point.Color, style.Point.Thickness)
	}

	for i := range rects {
		if i > 0 {
			x1 := (rects[i].Min.X + rects[i].Max.X) / 2
			y1 := (rects[i].Min.Y + rects[i].Max.Y) / 2
			x2 := (rects[i-1].Min.X + rects[i-1].Max.X) / 2
			y2 := (rects[i-1].Min.Y + rects[i-1].Max.Y) / 2
			gocv.Line(img, image.Point{X: x1, Y: y1}, image.Point{X: x2, Y: y2}, style.Line.Color, style.Line.Thickness)
		}
	}
}
