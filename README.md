# Excessive Zooming Cluster Stress Test

This React Native app is a minimal reproducible demo built to investigate **ghost markers and clustering artifacts** in [react-native-map-clustering](https://github.com/tomchentw/react-native-map-clustering).

## 🎯 Purpose

To stress-test how map clusters recalculate during extreme zoom in/out cycles combined with random panning.  
It helps reproduce and analyze the issue where **markers or clusters persist ("ghosts")** after camera changes.

## 🧩 Tech Stack

- [react-native](https://reactnative.dev/)
- [react-native-maps](https://github.com/react-native-maps/react-native-maps)
- [react-native-map-clustering](https://github.com/tomchentw/react-native-map-clustering)

## 🧪 What It Does

- Generates 1000 random markers centered around **Razová, Czech Republic** (`49.931305 N, 17.531996 E`)
- Runs an automated **Excessive Zooming Test** that:
  - repeatedly zooms from `zoom = 15 → 5` and back
  - adds small random pans at each step
  - returns to the original center
- Uses `clusterColor`, `clusterTextColor`, and `pinColor` for clear visual feedback
- Marker and cluster colors change **only when regenerating data**, not during the test itself

## 🕹️ Controls

| Button                         | Action                                    |
| ------------------------------ | ----------------------------------------- |
| **Run Excessive Zooming Test** | performs automated zoom / pan cycles      |
| **Regenerate 1k markers**      | creates new random dataset + color scheme |
| **Toggle Cluster**             | enables / disables clustering             |

## 🧭 Usage

> **Google Maps API key (Android)**
>
> 1. Create a key in Google Cloud Console and enable “Maps SDK for Android”.
> 2. Restrict it to **Android apps** with:
>    - **Package name:** `com.rnmapsghostrepro`
>    - **SHA-1:** from `./gradlew signingReport` (variant **debug**)
> 3. Paste the key directly into the manifest:

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<!-- Google Maps API key -->
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_API_KEY_HERE" />
```

### Run

```bash
npm install
npx react-native run-android
```

Then simply tap buttons in the UI.

## ⚠️ Notes

- The test intentionally pushes clustering updates to their limits.
- On some Android 9 emulators, reloading the app (`⌘ R` or `RR`) may crash due to Google Maps SDK’s `NullPointerException` during teardown — unrelated to app logic but reproducible here.
- Best tested on Android ≥ API 30 or iOS ≥ 15.

## 🪲 Related issue

This repository was created to reproduce and analyze:

> **Ghost markers / stale clusters after zoom or camera animation**

Feel free to fork it, run your own scenarios, and report findings in the related issue thread.

---

MIT License © 2025 Jiří Bílek
