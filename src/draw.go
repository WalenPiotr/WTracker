package main

import (
	"fmt"
	"image"
	"image/color"

	"gocv.io/x/gocv"
)

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
