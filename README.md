# RN Maps Ghost Cluster Repro

This repository contains a **minimal reproducible example** demonstrating the persistent **ghost markers and stale clusters** issue when using **react-native-maps** with **react-native-map-clustering**.

---

## ⚙️ Tested environment

- **React Native:** 0.81.4
- **react-native-maps:** 1.26.14
- **react-native-map-clustering:** 4.0.0
- **Android Emulator:** API 28–35
- **Provider:** Google Maps

---

## 🧭 What it does

The app renders **1,000 random markers** centered around a defined coordinate (`Razová 230, Czech Republic`) and runs an automated **“Excessive Zooming Test”**.  
During the test, the map continuously zooms in and out while slightly panning in random directions.

After several zoom cycles, some clusters remain visible even when their items no longer exist — resulting in “ghost” markers that cannot be interacted with and no longer belong to any cluster.

---

## 🧪 How to reproduce

1. Clone the repo:

   ```bash
   git clone https://github.com/gogoSpace/rnmapsGhostRepro.git
   cd rnmapsGhostRepro
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run on Android:

   ```bash
   npm run android
   ```

4. Tap **“Run Excessive Zooming Test”** and observe the map while it zooms and pans automatically.

---

## 🪲 Observed behavior

- Some clusters remain visible after zooming/panning cycles even though their items are gone.
- Affected clusters stop responding to touch events.
- Issue occurs regardless of `radius`, `extent`, or `tracksViewChanges` settings.
- Behavior is random but reproducible after several automated zoom cycles.

---

## 📋 Notes

Occasionally, a `NullPointerException` is thrown by the Google Maps renderer during JS reload (`RR`), possibly unrelated, but it happens consistently alongside the ghost marker issue.

---

## 📎 License

MIT © [gogoSpace](https://github.com/gogoSpace)
