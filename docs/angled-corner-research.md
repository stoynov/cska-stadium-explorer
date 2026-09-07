# Angled Sector A passages and reference collection

Revision: 7 September 2026, following the user's comparison of the model with a frontal construction photograph.

## Why the previous reconstruction was wrong

The first entrance correction proved that two routes were open, but tested the wrong layout: constant-Z cuts travelled straight through the main stand's long facade. The reference places the large mouths in the curved corner transitions at either end of Sector A. Clear passage tests alone could not establish faithful placement.

The revised interpretation uses mirrored diagonal routes through the bowl corners. Their clearance, concrete cuts, gallery links and openings through the rounded exterior share one local coordinate frame. The straight main-stand glazing is restored. The photograph supports this corner placement; the selected angle and width are proportional modelling assumptions, not measured construction dimensions. The earlier speculative long return-stair arrangement is not evidence for an actual route.

## Evidence register

| Topic | Evidence | Model consequence and remaining uncertainty |
| --- | --- | --- |
| Corner passage placement | User's model screenshot at 09:26 and reference screenshot at 09:28 on 7 September 2026; official August gallery photographs in the local asset manifest | Openings belong in the corner transitions, under connecting galleries. Screenshot time does not date the underlying photograph; exact angles and dimensions remain unverified. |
| Hospitality structure | [Official Sector A article, 29 January 2026](https://stadium.cska.bg/в-сърцето-на-българска-армия-секто-2/) | Distinct Bronze/Silver zones and Gold/Platinum skyboxes, with private outdoor terraces. Room divisions and public entrance descriptions do not establish the dimensions or access rules of the large corner passages. |
| Ground-floor circulation | [Official level 0 article, 23 December 2025](https://stadium.cska.bg/в-сърцето-на-българска-армия-секто/) | Describes player access, a player tunnel, dressing rooms and media spaces. A faithful full interior would need additional drawings or video review; corner passages must not be conflated with the central player tunnel. |
| Roof construction | [Official roof update, 19 June 2025](https://stadium.cska.bg/с-мисъл-за-едно-страхотно-изживяване-п/) | Reports a translucent polycarbonate canopy component. Historical construction milestones do not verify present completion or exact roof subdivisions. |
| Video evidence | Official links to [Sector A](https://www.youtube.com/watch?v=AZ1Ds_p81t0), [level 0](https://youtu.be/Ick9nHlBm_A) and [project details](https://www.youtube.com/watch?v=-zivX59we7Y) | Indexed for subsequent timestamped review; collecting a URL is not equivalent to viewing or validating every frame. |

## Research skill

The English `cska-stadium-research` skill collects a bounded, resumable archive of public official pages and reference media, with source URLs, retrieval times, hashes, failures and coverage limits. It uses the public article index and sitemap to reduce dependence on search indexing. The official article index exposed 20 posts during this revision.

The workflow separates construction photos, intended-design renders, published facts and inferred dimensions. It produces an evidence matrix and identifies missing viewpoints before geometry changes. Raw downloads and agent instructions stay in the ignored local research cache; the public repository retains concise findings and source links. Neither the collection nor the model claims to contain every document about the stadium or access to unpublished architectural drawings.

The real collection completed its discovered queue: **31 web documents, 159 images and one robots document**, approximately **87.4 MB** in total. SHA-256 verification passed for all 191 successful cached objects. One optional sitemap probe returned 404; the site's working WordPress sitemap and article API were processed. Fifty-seven external links were indexed without downloading their destinations, including the official videos. This is a snapshot of discoverable official-site references, not exhaustive internet coverage.

For this correction, six August gallery photographs were inspected together in a labelled local viewpoint index; `DJI_20260809161028_0097_D-2048x1152.jpg` was also inspected at full resolution. Its cached SHA-256 is `0c4941613d01687d93435847978eb84264af886195449c770c79b7ecaea7b7b8`. The two user-supplied comparison images were reviewed separately. The remaining downloaded images have not all received visual review. The cache contains a complete reference index and manifest so later modelling tasks can continue that review.

## Validation

- `bun run check`: **41 tests passed**, 169,555 assertions; formatting, TypeScript and production build passed.
- Six offline geographic extractor tests passed. The installed research skill passed its validator and six separate collector fixture tests, plus the real crawl, resume and cached-object hash checks.
- New geometry tests failed against the previous straight-slot implementation, then passed for diagonal seating/facade clearance, restored straight glazing, supported curved galleries and a chair-free connection to the public stairs. Independent review checked 40 full-stadium diagonal rays, six restored glazing probes, and 212 approach/support rays. It caught and resolved seats obstructing the public gallery landing.
- Desktop browser inspection compared the front elevation, plan view and each passage from inside/outside. The actual app was checked at a mobile-emulated 390 × 844 with cutaway and evening controls; no application errors were logged.
- Export produced a **40,088,096-byte GLB**. Re-import retained both named diagonal passage groups and the complete roof. All 24 post-import sample clearance rays were unobstructed, and the imported geometry was rendered from inside one passage and outside the other.

The 45° axes and 7 m widths remain estimates. Browser emulation is not a physical mobile GPU benchmark; manual visual/export review remains separate from CI. The existing large scene-chunk and Three.js deprecation/material warnings remain unchanged in nature.
