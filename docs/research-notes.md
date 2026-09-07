# Stadium prompt research

Inspected on 6 September 2026. These notes distinguish observed behavior from requirements proposed in the prompts.

## Reference experience

Source: https://gpt-6-stadium.vercel.app/

Inspected in a desktop browser at a screenshot size of 1728 × 865. The site renders a full-screen interactive model of RAMS Park, with a floating toolbar, crest/title, location metadata, lower-left chapter copy, five-part bottom navigation, compass, and dark edge shading. The overall presentation combines large serif headings with small sans-serif control text.

Directly tested: selecting the bowl chapter updates the camera framing, heading, chapter counter, and navigation state; cutaway exposes the seating bowl by removing the roof; labels appear over model features; the daylight control changes to Night; the About dialog opens and closes.

Visible but not tested end to end: music, PNG capture, GLB export, fullscreen, automatic tour, language switching, free-orbit gestures, and drone-show selection. A visitor badge is visible, but its backend was not inspected. Mobile behavior was not tested. The exact application stack, geometry-generation code, camera coordinates, and animation durations were not established.

The About dialog describes an approximate reconstruction from photographic references, with illustrative surroundings. This is an important constraint for the CSKA adaptation as well.

## Official CSKA reference

Source: https://stadium.cska.bg/

The official page provides construction galleries, architectural imagery, project information, history, FAQs, and links to club channels. The current-photo gallery inspected contains filenames dated August 2026. Homepage text also includes older construction estimates and counters initially displayed as zeros; neither was used to assert a current completion date or capacity.

The inspected architectural rendering `22142-CAM-002-scaled.jpg` depicts a completed stadium with a warm metallic horizontal-louver façade, rounded corners, an open roof center, red seating, and extensive park landscaping.

The inspected aerial `DJI_20260809160800_0092_D-2048x1152.jpg` shows a closely matching façade, exposed roof supports, red seating with large white Cyrillic ЦСКА lettering, a green pitch, and construction details. The rendering and photograph are different evidence types. Neither should be described as a surveyed model or treated as proof of public opening.

## Downloaded material

22 image files were downloaded successfully and copied to `public/assets/cska/`, totaling 5,281,017 bytes. The folder includes 18 August-gallery files (17 views with one additional-resolution duplicate), the crest, two architectural-render files, and an archive image. Most gallery files are cropped 845 × 684 variants. One aerial and the main rendering are 2048 × 1152. The second render is only a 300 × 169 thumbnail.

`public/assets/cska/manifest.json` records original URLs, local paths, content types, source page, retrieval date, and broad categories. Downloading does not establish licensing terms. No license was independently verified.

## Prompt use

1. Run `prompts/01-reverse-engineer-reference.md` for a fresh, detailed interaction audit and reconstruction specification.
2. Run `prompts/02-cska-stadium-master-prompt.md` to implement the CSKA experience. It is self-contained and can also be used directly with this asset folder.

The prompts specify proposed engineering choices rather than claiming the reference's original implementation. No application code was built as part of this prompt-writing task.
