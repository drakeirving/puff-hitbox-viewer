#### webm

```
for f in *.gif; do ffmpeg -y -i "$f" -c:v libvpx -crf 4 -b:v 0 -pix_fmt yuv420p -pass 1 -f webm /dev/null && ffmpeg -y -i "$f" -c:v libvpx -crf 4 -b:v 0 -pix_fmt yuv420p -pass 2 "${f%.gif}".webm; done
```

#### mp4

```
for f in *; do ffmpeg -y -i "$f" -c:v libx264 -vf "crop=in_w-1:in_h:0:0" -crf 17 -preset veryslow -pix_fmt yuv420p ../mp4/"${f%.*}".mp4; done
```

you want gif output dimensions to be divisible by 2 for yuv420p conversion, `-vf "crop=in_w-1:in_h:0:0"` cropped width
