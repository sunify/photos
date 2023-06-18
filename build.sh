mkdir -p build
node resize-images.js
node build-pages.js
cp -r static build/
cp -r images build/