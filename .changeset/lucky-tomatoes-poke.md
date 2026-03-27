---
'react-mapy': patch
---

Fix npm publishing so release builds always generate and include the `dist`
files exported by the package. This prevents installed consumer applications
from failing on missing runtime and type entrypoints after installing the
published library.
