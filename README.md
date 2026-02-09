# MD Studio

MD Studio is a desktop markdown editor built with React, Vite, and Tauri.

![Latest Release](https://img.shields.io/github/v/release/bhumitschaudhry/MD-Studio?sort=semver)

Release page: https://github.com/bhumitschaudhry/MD-Studio/releases/latest

## Stable Downloads

These links download the latest Windows installers from GitHub Releases.

- Windows (NSIS `.exe`): [MD Studio 1.0.1 Setup](https://github.com/bhumitschaudhry/MD-Studio/blob/master/releases/MD%20Studio_1.0.1_x64-setup.exe)
- Windows (MSI): [MD Studio 1.0.1 MSI](https://github.com/bhumitschaudhry/MD-Studio/blob/master/releases/MD%20Studio_1.0.1_x64_en-US.msi)

If you publish a new version, update the filenames here to match the release assets.

## Local Builds

Tauri bundles are produced under `src-tauri/target/release/bundle/` after running a release build.
If you want to keep artifacts in-repo, copy the `.exe` and `.msi` into `releases/` and commit them.
