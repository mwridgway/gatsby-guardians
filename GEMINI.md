# Gatsby Guardians - Project Gemini Context

This document provides a comprehensive overview of the Gatsby Guardians project, its architecture, and development conventions to be used as instructional context for future interactions.

## 1. Project Overview

Gatsby Guardians is a production-ready, retro-themed side-scrolling platformer game.

*   **Core Technologies:**
    *   **Game Engine:** [Phaser 3](https://phaser.io/) (v3.80.1)
    *   **Language:** [TypeScript](https://www.typescriptlang.org/) (v5.3.3, in strict mode)
    *   **Build Tool:** [Vite](https://vitejs.dev/) (v5.0.8)
    *   **Audio:** [Howler.js](https://howlerjs.com/) (v2.2.4)
    *   **UI/Plugins:** [Rex-Plugins for Phaser 3](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/index.html)

*   **Key Features:**
    *   **Pixel-Perfect Rendering:** Uses integer scaling (2x, 3x, 6x) on a 640x360 base resolution to ensure crisp pixel art across different display sizes.
    *   **Multi-Platform Input:** An advanced `InputMapper` system abstracts Keyboard, Gamepad, and Touch controls into standardized game actions.
    *   **Automated Asset Pipeline:** A Node.js-based toolchain processes raw assets (PNGs, WAVs, Tiled maps) into game-ready formats (texture atlases, WebM/MP3 audio) and auto-generates TypeScript type definitions for them.
    *   **Progressive Web App (PWA):** Fully installable with offline support via a service worker.
    *   **Modern Game Feel:** Implements features like coyote time and jump input buffering.
    *   **System-Based Architecture:** The logic is organized into scenes (`src/scenes`) and systems (`src/systems`), such as the `AdManager`, `AudioManager`, and `WeaponManager`.

## 2. Building and Running the Project

All project scripts are defined in `package.json`.

*   **Development Server:**
    *   Starts a Vite dev server with live reloading and simultaneously watches for asset changes.
    *   **Command:**
        ```bash
        npm run dev
        ```

*   **Production Build:**
    *   Processes all assets, compiles the TypeScript code, and bundles the application for production into the `dist/` directory.
    *   **Command:**
        ```bash
        npm run build
        ```

*   **Asset Processing:**
    *   Manually triggers the asset pipeline to process files from `assets/raw/` into `assets/dist/` and generate the asset manifest and TypeScript types.
    *   **Command:**
        ```bash
        npm run process:assets
        ```

## 3. Project Structure and Conventions

*   **Directory Structure:**
    *   `src/`: Contains all game source code, organized by features.
        *   `main.ts`: The main entry point that initializes the Phaser game.
        *   `game/`: Core game configuration (`config.ts`) and global constants (`constants.ts`).
        *   `scenes/`: Each major part of the game (Boot, Preload, MainMenu, GamePlay) is a separate `Phaser.Scene`.
        *   `entities/`: Game objects with physics and logic, like the `Player`.
        *   `systems/`: Global managers for handling cross-cutting concerns like input, audio, ads, and weapons.
    *   `assets/`: Contains all game assets.
        *   `raw/`: Source assets (e.g., individual PNGs, WAV files) that are not deployed.
        *   `dist/`: Processed, game-ready assets (e.g., texture atlases, compressed audio) that are deployed with the build.
    *   `tools/`: Node.js scripts that form the asset processing pipeline (`process-assets.js`, `watch-assets.js`, etc.).
    *   `public/`: Static assets that are copied directly into the build output, including PWA icons and the web manifest.

*   **Development Conventions:**
    *   **Input Handling:** All input should be consumed through the `InputMapper` system (`src/systems/InputMapper.ts`). This ensures consistent behavior across Keyboard, Gamepad, and Touch. Avoid accessing `this.input.keyboard` directly in game scenes.
    *   **Asset Management:** New assets must be added to the `assets/raw` directory. The `npm run process:assets` script must be run to make them available in the game. This process is automated when using `npm run dev`.
    *   **Type Safety:** The project uses TypeScript in `strict` mode. The asset pipeline generates type definitions for all assets, which should be used to prevent runtime errors from typos in asset keys.
    *   **Game Feel:** The `Player` entity (`src/entities/Player.ts`) contains implementations for "coyote time" and "jump buffering" which should be maintained and extended for new character actions.
    *   **Styling:** Code follows standard TypeScript/ESLint conventions, with a focus on readability and clear separation of concerns between scenes, entities, and systems.
    *   **The application is for CS2 (Counter-Strike 2), not CS:GO. Do not use 'CS:GO' or its variants in naming; use 'cs2' instead.**
