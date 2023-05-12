rm -r images
mkdir -p images
mkdir -p images/thumbs
mkdir -p images/full
mkdir -p images/og

mogrify -path images/og -units PixelsPerInch -density 72 -interlace plane -resize 1960x590 -extent 1200x630 -gravity center -quality 70 -strip photos/*.jpg
mogrify -path images/full -units PixelsPerInch -density 72 -interlace plane -resize 2500x2500 -quality 90 photos/*.jpg
mogrify -path images/thumbs -units PixelsPerInch -density 72 -interlace plane -resize 900x900 -quality 80 -strip photos/*.jpg