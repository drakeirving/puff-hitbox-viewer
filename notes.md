#### webm

```
for f in *.gif; do ffmpeg -y -i "$f" -c:v libvpx -crf 4 -b:v 0 -pix_fmt yuv420p -pass 1 -f webm /dev/null && ffmpeg -y -i "$f" -c:v libvpx -crf 4 -b:v 0 -pix_fmt yuv420p -pass 2 "${f%.gif}".webm; done
```

#### mp4

```
for f in *; do ffmpeg -y -i "$f" -c:v libx264 -vf "crop=in_w-1:in_h:0:0" -crf 17 -preset veryslow -pix_fmt yuv420p ../mp4/"${f%.*}".mp4; done
```

you want gif output dimensions to be divisible by 2 for yuv420p conversion, `-vf "crop=in_w-1:in_h:0:0"` cropped width


bair is two frames faster than the animation due to framespeedmul so specific frames were cut
oh god what do i do for fsm>1

```
ffmpeg -y -i Back\ Air.gif -c:v libx264 -vf "crop=in_w-1:in_h:0:0, select='1-eq(n\,4)-eq(n\,6)',setpts=N/FRAME_RATE/TB" -crf 17 -preset veryslow -pix_fmt yuv420p Back\ Air.mp4
```
