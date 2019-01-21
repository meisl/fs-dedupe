# fs-dedupe

* clone with **no checkout**
* edit `.git/config`: set `symlinks = true` (under `[core]`)
* on Windows: `mklink` is used to create symbolic links, which requires admin rights. So: **with admin rights: do the checkout**.