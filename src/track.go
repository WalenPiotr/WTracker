package main

import (
	"fmt"
	"image"
	"log"

	"github.com/pkg/errors"
	"gocv.io/x/gocv"
	"gocv.io/x/gocv/contrib"
)

func track(src, out string, rect image.Rectangle, limits Limits, style Style) error {
	start := limits.Start
	end := limits.End

	tracker := contrib.NewTrackerMOSSE()
	defer tracker.Close()

	img := gocv.NewMat()
	defer img.Close()

	var rects []image.Rectangle
	var writer *gocv.VideoWriter

	video, err := gocv.VideoCaptureFile(src)
	if err != nil {
		log.Fatalln(errors.Wrap(err, "while opening video"))

	}
	fps := video.Get(gocv.VideoCaptureFPS)

	for i := 0; true; i++ {
		ok := video.Read(&img)
		if i == start {
			writer, err = gocv.VideoWriterFile(out, "XVID", fps, img.Cols(), img.Rows(), true)
			defer writer.Close()
			if err != nil {
				fmt.Printf("error opening video writer device: %v\n", out)
				return err
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
					draw(&img, rects, style, fps)
					writer.Write(img)
					log.Println(rect)
				}
			}
		}
	}
	return nil
}
