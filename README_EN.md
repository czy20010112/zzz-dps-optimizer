# Zenless Zone Zero (ZZZ) Optimizer & Damage Calculator

A web-based React tool designed for ZZZ players to calculate theoretical damage, optimize disc drive inventories, and verify raw damage stats.

## 🌟 Key Features

1.  **Theoretical Calculation**
    *   Based on base stats of Agents and W-Engines.
    *   Set a "Substat Budget" to automatically allocate optimal substats (ATK, CRIT, PEN, etc.) using a greedy algorithm.
    *   Calculates the theoretical DPS ceiling.

2.  **Inventory Optimization**
    *   **Core Feature**: Import or manually input your actual Disc Drive inventory.
    *   **Algorithm**: Uses a backtracking algorithm to find the highest damage combinations (Top 5 Builds) from your specific items.
    *   Automatically handles 2-piece and 4-piece set bonuses.

3.  **Raw Damage Mode**
    *   Directly input final in-game panel stats (Final ATK, Crit, etc.).
    *   Support for custom Skill Motion Values (MV).
    *   Perfect for verifying in-battle buff efficiency or comparing screenshots.

## 🛠️ Tech Stack

*   **Frontend**: React 18, TypeScript
*   **Styling**: Custom CSS, Cyberpunk/Industrial UI (ZZZ Style)
*   **Performance**: Web Workers are used to run intensive optimization algorithms in the background to prevent UI freezing.

## 🚀 Quick Start

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start dev server:
    ```bash
    npm run start
    ```
3.  Build for production:
    ```bash
    npm run build
    ```

## 📸 Usage Tips

*   **Custom Data**: Click `+ Custom` in the top right to add temporary custom Agents or Engines.
*   **Language**: Toggle `[CN]` / `[EN]` in the header.
*   **State Isolation**: Raw mode inputs are isolated and won't be overwritten when switching back to Theoretical mode.

## ⚠️ Disclaimer

*   This is a fan-made tool. Calculations are based on community findings and may differ slightly from in-game values.
*   For JSON import format, please refer to the `DiscItem` interface in `src/types.ts`.
