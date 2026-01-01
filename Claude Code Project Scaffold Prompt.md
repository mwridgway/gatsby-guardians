## Claude Code Project Scaffold Prompt

```
Create a production-ready retro side-scrolling platformer web game with the following architecture:

### Core Stack
- Engine: Phaser 3 (latest stable, 3.80+)
- Language: TypeScript (strict mode)
- Bundler: Vite (optimized for fast HMR)
- Audio: Howler.js (7KB, not FMOD/WASM)
- Input: RexVirtualJoystick plugin for mobile
- Distribution: Web portals (Poki/CrazyGames SDK integration)

### Resolution & Rendering
- Base logical resolution: 640x360 (16:9)
- Integer scaling strategy (2x=720p, 3x=1080p, 6x=4K)
- Safe zone with horizontal bleed to 768px minimum
- pixelArt: true (nearest-neighbor scaling, no anti-aliasing)
- WebGL renderer, 60 FPS target
- Snap-to-grid rendering (round coordinates before GPU submission)

### Asset Pipeline Structure
```
/src
  /game          # Game logic
  /scenes        # Phaser scenes (Preload, MainMenu, Level1, etc.)
  /entities      # Player, Enemy classes
  /systems       # InputMapper, AudioManager, AdManager
/assets
  /raw           # Source files (DO NOT commit to dist)
    /audio       # WAV files
    /graphics    # PSD/PNG sources
    /maps        # Tiled TMX files
  /dist          # Processed, ready-to-load assets
    /audio       # WebM (Opus) + MP3 fallback, Audio Sprites
    /graphics    # WebP, texture atlases (JSON + PNG)
    /maps        # Tiled JSON exports
    manifest.json
```

### Asset Specifications
**Graphics:**
- Texture atlases with 2px padding + extrusion
- Max atlas size: 4096x4096
- Format: WebP for delivery, PNG-24/32 for authoring
- Packer: TexturePacker with MaxRects algorithm, rotation disabled
- Separate atlases per context (UI, Level_Forest, Player)

**Audio:**
- Primary: WebM (Opus, 96-128kbps music, 64-96kbps SFX)
- Fallback: MP3 (192kbps CBR)
- SFX: Mono, packed as audio sprites
- BGM: Stereo, individual files
- Dual-format delivery: filename.{webm,mp3}

**Tilemaps:**
- Format: Tiled JSON (not TMX)
- Middleware: @pixi/tilemap or Phaser's native tilemap
- Separate collision layer (invisible, data-only)

### Required Systems

**1. InputMapper Abstraction**
```typescript
// Game logic checks: inputMapper.jumpRequested
// InputMapper sets true if: Spacebar OR Gamepad A OR Virtual Joystick A
// Supports simultaneous keyboard, gamepad, and touch
```

**2. AudioManager Wrapper**
```typescript
// Wraps Howler.js
// Methods: playMusic(key), playSFX(key), setVolume(music/sfx)
// Handles audio context unlock on mobile
```

**3. AdManager Adapter**
```typescript
// Environment detection: window.PokiSDK or window.CrazyGames
// Methods: showInterstitial(), showRewarded()
// Localhost mock mode (console logs only)
```

**4. Object Pooling**
```typescript
// For bullets, particles, enemies
// Use Phaser.GameObjects.Group with maxSize
// Prevents GC stutters at 60 FPS
```

### Build Automation (Vite Config)
- Watch /assets/raw for changes
- Auto-generate texture atlases (invoke TexturePacker CLI)
- Transcode audio (FFmpeg: WAV -> WebM + MP3)
- Generate manifest.json from /assets/dist scan
- Output TypeScript asset declarations (assets.d.ts) for type-safe loading

### PWA Configuration
- manifest.webmanifest with display: "standalone"
- viewport meta: viewport-fit=cover
- CSS: min-height: 100dvh (not 100vh)
- Service Worker: Workbox with Cache-First for assets, Stale-While-Revalidate for shell
- Icons: Full Apple-specific resolution set

### Physics & Game Feel
- Phaser Arcade Physics (AABB, not Matter.js)
- Snappy, instant movement (NES/SNES style, not momentum-heavy)
- Coyote time and input buffering implementation
- Frame-perfect collision detection

### AI Coding Assistant Configuration
Create .cursorrules with:
```
- Use Phaser 3.80+ syntax (avoid deprecated WebGL 1.0 calls)
- Prefer TypeScript interfaces for config objects
- Use Arcade Physics syntax exclusively (not Matter.js unless specified)
- Implement Preload-Create-Update lifecycle pattern
- Never use HTML <form> tags in game UI
- All coordinates must be integers before rendering
- Always implement object pooling for frequently created/destroyed objects
```

### Initial Scaffold Requirements
1. Vite + TypeScript project structure
2. Phaser 3 integration with proper types
3. Base Scene architecture (Boot, Preload, MainMenu, GamePlay)
4. InputMapper, AudioManager, AdManager stub implementations
5. Asset manifest system with bundle loading
6. Example sprite with texture atlas setup
7. Example Tiled map integration
8. Mobile touch controls (RexVirtualJoystick)
9. Build script with TexturePacker + FFmpeg hooks
10. PWA manifest and service worker config

### Deliverables
- Fully configured project structure
- Working build pipeline (npm run dev, npm run build)
- Example level with player movement and collision
- Mobile-responsive with virtual controls
- Type-safe asset loading system
- README with architecture documentation

Start with the Vite + Phaser 3 + TypeScript template, then build out the directory structure and core systems.
```