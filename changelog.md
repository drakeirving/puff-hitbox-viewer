---
layout: top
title: Changelog
---

### Todo

{% if jekyll.environment != "production" %}
#### Private

- allow move notes
- show active frames, faf?
- tool to scrape ultframedata (active, faf)

#### Public
{% endif %}

- Hitbox info display
  - tooltip for term explanations

- Document workflow on wiki
  - prepare for kludge

### Changelog

{% if jekyll.environment != "production" %}
#### Private

{% endif %}

#### v1.0.7
- Added Grab type and color mapping for grabs
- Adjusted colors to match CrossMod output
- Added hitbox parameter for custom colors
- Added hitbox parameter for additional move notes
- Fixed some bad things

#### v1.0.6
- Implemented hitbox detail table, minor adjustments

#### v1.0.5
- Added frame slider

#### v1.0.4

- Switched clips over to h264 as webm still unsupported on some browsers
- Frame counter now seeks to frame
- Self-hosting fonts to minimize loading times

#### v1.0.3

- Added frame counter  
- Fixed a ton of bugs caused by FP inaccuracies by being way more rigorous about frame timing and seeking
  - End of some clips caused video stalling, infinite event calls, some other nonsense
  - Chrome: frame timing off by one due to playback engine I guess, caused jittering at clip end (esp. combined with above)

#### v1.0.2
- Added FAQ and changelog pages
- Added more links to places

#### v1.0.1

- Changed video loading
- Made favicon work
- Small bugfixes

#### v1.0.0

- Site first published
