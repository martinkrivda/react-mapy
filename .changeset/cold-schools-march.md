---
'react-mapy': patch
---

Fix built-in `ofeed` marker preset asset loading in consumer applications by bundling
preset SVGs into the published library output instead of relying on host-app root asset
paths.

Add light and dark color scheme support for the built-in `ofeed` marker preset so host
applications can select the appropriate variant for different map themes.
