package main

import (
	"encoding/json"
	"flag"
	"image"
	"io/ioutil"
	"log"
	"path/filepath"

	"github.com/pkg/errors"
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

	b, err := ioutil.ReadFile(dataPath)
	if err != nil {
		log.Fatalln(errors.Wrap(err, "while loading json"))
	}
	var data Data
	err = json.Unmarshal(b, &data)
	if err != nil {
		log.Fatalln(errors.Wrap(err, "while unmarshaling json"))
	}

	track(src, out, data.Rectangle, data.Limits, data.Style)
}
