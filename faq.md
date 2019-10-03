---
layout: top
title: FAQ
---

### FAQ

> What do the different colors on the hitboxes mean?

The different colors represent different hitbox IDs. When checking for collision, hitboxes are checked in ascending order, so if a Red (ID 0) and Purple (ID 1) hitbox both connect with something on the same frame, the Red hitbox is the one that actually hits.

> What are the lines on the hitboxes?

The straight lines show the knockback angle of the hitbox. Hitboxes with a + shape denote the Sakurai angle, which you can read about [here](https://www.ssbwiki.com/Sakurai_angle).

> What does [X] hitbox parameter/value mean?

For now you can either wait until tooltips are implemented or you can go do a bit of research.

> Are you going to add other characters?

At the very least I've been planning to make this app moderately extensible, but the process of putting together all the relevant data and clips and setting it all up correctly is largely a manual process (even though scripts are involved). Implementing any new exceptions that arise will likely also make it not so straightforward.

I'm aiming to provide some tools and document the workflow that would be needed to get other characters added, and people willing to contribute are welcome to contact me and/or submit pull requests.

> I have a feature request / suggestion!

Check the [changelog]({{ 'changelog.html' | relative_url }}) page for the to-do list to see if it's already planned.  
If it isn't, you can contact me on [Twitter](https://twitter.com/drakeirving) or in the [Puff Discord](https://smashcords.com/s5jigglypuff).

> Something isn't working / a dumb thing happened! pls fix!

See above contact info. You could also open an issue directly on [GitHub](https://github.com/drakeirving/puff-hitbox-viewer).


### Special Thanks

Special thanks goes to [EyeDonutz](https://twitter.com/theEyeDonutz) for providing the rendered animations from Cross Mod, and [Struz](https://twitter.com/struzsmash) for their genius Smash 4 move viewer this was heavily influenced by.
