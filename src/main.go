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
	DumpImages bool
	Rectangle  image.Rectangle
	Limits     Limits
	Style      Style
}

type Limits struct {
	Start int
	End   int
}

func main() {
	s := flag.String("src", "data/src/toro.mp4", "mp4 file path")
	o := flag.String("out", "data/out/toro.avi", "output file")
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

	video, err := gocv.VideoCaptureFile(src)
	if err != nil {
		log.Fatalln(errors.Wrap(err, "while opening video"))

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

	var writer *gocv.VideoWriter

	fps := video.Get(gocv.VideoCaptureFPS)

	for i := 0; true; i++ {
		ok := video.Read(&img)
		if i == start {
			writer, err = gocv.VideoWriterFile(out, "XVID", fps, img.Cols(), img.Rows(), true)
			defer writer.Close()
			if err != nil {
				fmt.Printf("error opening video writer device: %v\n", out)
				return
			}

			init := tracker.Init(img, rect)
			if !init {
				log.Fatalln("while tracker init")
				break
			}
			if data.DumpImages {
				os.Mkdir(filepath.Join(filepath.Dir(out), "images"), 0777)
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
					draw(&img, rects, style, fps)
					if data.DumpImages {
						filename := fmt.Sprintf("output%d.png", i)
						gocv.IMWrite(filepath.Join(filepath.Dir(out), "images", filename), img)
					}
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
	Text      Text
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

type Text struct {
	Origin          image.Point
	Margin          image.Point
	FontType        gocv.HersheyFont
	FontScale       float64
	FontThickness   int
	BackgroundColor color.RGBA
	TextColor       color.RGBA
}

func draw(img *gocv.Mat, rects []image.Rectangle, style Style, fps float64) {

	axisX := (rects[0].Max.X + rects[0].Min.X) / 2
	axisY := (rects[0].Max.Y + rects[0].Min.Y) / 2
	gocv.Line(img, image.Point{axisX, 0}, image.Point{axisX, img.Rows() - 1}, style.Axis.Color, style.Axis.Thickness)
	gocv.Line(img, image.Point{0, axisY}, image.Point{img.Cols() - 1, axisY}, style.Axis.Color, style.Axis.Thickness)

	rect := rects[len(rects)-1]
	rect0 := rects[0]
	gocv.Rectangle(img, rect, style.Rectangle.Color, style.Rectangle.Thickness)

	fx := 45.0 / float64(rects[0].Dx())
	fy := 45.0 / float64(rects[0].Dy())

	xc := float64((rect.Min.X+rect.Max.X)/2-(rect0.Min.X+rect0.Max.X)/2) * fx
	yc := float64(-(rect.Min.Y+rect.Max.Y)/2+(rect0.Min.Y+rect0.Max.Y)/2) * fy

	text := fmt.Sprintf("x=%5.1f y=%5.1f", xc, yc)
	origin := style.Text.Origin
	margin := style.Text.Margin
	fontType := style.Text.FontType
	fontScale := style.Text.FontScale
	fontThickness := style.Text.FontThickness
	textSize := gocv.GetTextSize(text, fontType, fontScale, fontThickness)

	gocv.Rectangle(img, image.Rectangle{
		image.Point{origin.X - margin.X, origin.Y + margin.Y},
		image.Point{origin.X + margin.X + textSize.X, origin.Y - (margin.Y + textSize.Y)},
	}, style.Text.BackgroundColor, -1)

	gocv.PutText(img, text, origin, fontType, fontScale, style.Text.TextColor, fontThickness)

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
