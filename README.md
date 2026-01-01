# Gatsby Guardians

A production-ready retro side-scrolling platformer built with Phaser 3, TypeScript, and Vite.

## Features

- **Phaser 3.80+** game engine with TypeScript strict mode
- **Integer scaling** for pixel-perfect rendering (2x, 3x, 6x for 720p/1080p/4K)
- **Responsive design** with 640x360 base resolution (16:9)
- **Advanced input system** supporting keyboard, gamepad, and touch controls
- **Automated asset pipeline** with TexturePacker and FFmpeg integration
- **PWA-ready** with service worker and offline support
- **Game feel enhancements** including coyote time and input buffering
- **Mobile-optimized** with virtual joystick for touch devices

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **TexturePacker** (optional, for sprite atlas generation)
  - Download from: https://www.codeandweb.com/texturepacker
  - Free version works fine
- **FFmpeg** (optional, for audio transcoding)
  - Download from: https://ffmpeg.org/download.html
  - Ensure libopus support for WebM audio

### Installation

```bash
# Install dependencies
npm install

# Create placeholder assets (already done)
node tools/create-placeholder-assets.js

# Generate asset manifest and types
npm run process:assets

# Start development server
npm run dev
```

The game will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Project Structure

```
gatsby-guardians/
├── src/
│   ├── main.ts              # Entry point
│   ├── game/
│   │   ├── config.ts        # Phaser configuration
│   │   └── constants.ts     # Game constants
│   ├── scenes/
│   │   ├── BootScene.ts     # Initialize systems
│   │   ├── PreloadScene.ts  # Load assets with progress
│   │   ├── MainMenuScene.ts # Title screen
│   │   └── GamePlayScene.ts # Main gameplay
│   ├── entities/
│   │   └── Player.ts        # Player entity with physics
│   ├── systems/
│   │   ├── InputMapper.ts   # Input abstraction layer
│   │   ├── AudioManager.ts  # Howler.js wrapper
│   │   ├── AdManager.ts     # Ad platform adapter
│   │   └── AssetLoader.ts   # Manifest-driven loading
│   ├── types/
│   │   ├── assets.d.ts      # Auto-generated asset types
│   │   └── global.d.ts      # Global type definitions
│   └── utils/
│       ├── ScaleManager.ts  # Integer scaling logic
│       └── ObjectPool.ts    # Object pooling
├── assets/
│   ├── raw/                 # Source assets (NOT deployed)
│   │   ├── audio/
│   │   ├── graphics/        # PNGs for TexturePacker
│   │   └── maps/            # Tiled JSON files
│   └── dist/                # Processed assets (deployed)
│       ├── audio/           # WebM + MP3
│       ├── graphics/        # Texture atlases
│       ├── maps/            # Tiled JSON
│       └── manifest.json    # Asset manifest
├── tools/
│   ├── process-assets.js    # Asset processing pipeline
│   ├── generate-manifest.js # Generate manifest.json
│   ├── generate-types.js    # Generate TypeScript types
│   └── watch-assets.js      # Watch for asset changes
└── public/
    ├── manifest.webmanifest # PWA manifest
    └── icons/               # PWA icons
```

## Development Workflow

### Adding New Sprites

1. Add PNG files to `assets/raw/graphics/{category}/`
2. Run `npm run process:assets` (or let watch mode auto-process)
3. TexturePacker will generate atlases in `assets/dist/graphics/`
4. Types are auto-generated in `src/types/assets.d.ts`

### Adding Audio

1. Add WAV files to `assets/raw/audio/`
2. Run `npm run process:assets`
3. FFmpeg will transcode to WebM (Opus) + MP3
4. Use `audioManager.playSFX('sound-name')` in code

### Adding Maps

1. Create/edit Tiled map in `assets/raw/maps/`
2. Export as JSON (or hand-code JSON)
3. Map will be copied to `assets/dist/maps/`
4. Load in scene: `this.load.tilemapTiledJSON('level1', ...)`

## Controls

### Keyboard
- **Arrow Keys** or **WASD**: Move
- **Space** or **Up**: Jump
- **Z/X**: Attack
- **Esc**: Pause

### Gamepad
- **D-Pad** or **Left Stick**: Move
- **A Button**: Jump
- **X Button**: Attack
- **Start**: Pause

### Touch (Mobile)
- **Virtual Joystick**: Move and jump
- Screen automatically shows touch controls on mobile devices

## Architecture

### Input Abstraction

The `InputMapper` class abstracts input sources (keyboard, gamepad, touch) into game actions. This allows seamless support for multiple input methods without conditional logic in game code.

```typescript
// Instead of:
if (this.input.keyboard.isDown('SPACE')) { ... }

// Use:
if (this.inputMapper.isActionJustPressed(GameAction.JUMP)) { ... }
```

### Asset Pipeline

The build automation system:
1. Watches `assets/raw/` for changes
2. Runs TexturePacker on sprite folders
3. Transcodes audio with FFmpeg
4. Generates `manifest.json` with all asset paths
5. Creates TypeScript types for type-safe asset loading

### Scene Flow

1. **BootScene**: Initialize core systems (InputMapper, AudioManager, AdManager)
2. **PreloadScene**: Load manifest and show progress bar
3. **MainMenuScene**: Title screen with play button
4. **GamePlayScene**: Main game loop with player and platforms

### Game Feel

- **Coyote Time**: 6-frame grace period for jumping after leaving a platform
- **Input Buffering**: Jump inputs are buffered for 5 frames if pressed while airborne
- **Pixel-Perfect Rendering**: Coordinates rounded to integers before GPU submission
- **Integer Scaling**: Display scales by whole numbers (2x, 3x, 6x) for crisp pixels

## PWA Features

The game is installable as a Progressive Web App:
- **Service Worker**: Offline support with asset precaching
- **App Manifest**: Install to home screen on mobile
- **Responsive**: Adapts to different screen sizes with integer scaling

## Web Portal Integration

The `AdManager` automatically detects and integrates with:
- **Poki SDK**: `window.PokiSDK`
- **CrazyGames SDK**: `window.CrazyGames`
- **Localhost Mock**: Console logging for local development

## Performance Optimizations

- **Object Pooling**: Bullets and particles reuse objects to prevent GC pauses
- **WebGL Renderer**: Hardware-accelerated rendering
- **Texture Atlases**: Reduced draw calls by batching sprites
- **Audio Sprites**: SFX packed into single files with sprite sheets
- **Code Splitting**: Phaser separated into its own chunk for better caching

## Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (including mobile)
- **Mobile Browsers**: Touch controls + PWA install

## License

This project was scaffolded as a template. Customize as needed.

## Credits

Built with:
- [Phaser 3](https://phaser.io/) - Game engine
- [Howler.js](https://howlerjs.com/) - Audio library
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Language
