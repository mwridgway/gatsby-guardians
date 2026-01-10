# Engineering Standards & Best Practices

This document outlines the engineering standards, architectural patterns, and best practices followed in the Gatsby Guardians project.

## Code Quality Standards

### TypeScript Configuration

We enforce strict TypeScript standards for type safety and code quality:

- **Strict Mode**: All strict type-checking options enabled (`strict: true`)
- **No Unused Code**: Enforce `noUnusedLocals` and `noUnusedParameters`
- **Switch Safety**: `noFallthroughCasesInSwitch` prevents accidental fall-throughs
- **Cross-Platform**: `forceConsistentCasingInFileNames` ensures compatibility across operating systems

### Modern JavaScript/TypeScript

- **Target**: ES2020 with ESNext module system
- **Module Resolution**: Bundler mode for optimal Vite integration
- **Type Safety**: Auto-generated `.d.ts` files for asset manifests
- **JSON Support**: `resolveJsonModule` enabled for importing JSON data

## Architecture Patterns

### Entity-Component System

Organize game objects using an entity-component pattern:

- **Entities**: `Player`, `Enemy` - game objects with behavior
- **Components**: Reusable behaviors attached to entities
- **Systems**: `WeaponManager`, `StatusEffectManager`, `InputMapper`, `AudioManager`

### Scene-Based Organization

Structure the game flow using Phaser scenes:

- `BootScene`: Initialize core systems and registry
- `PreloadScene`: Load assets with progress indication
- `MainMenuScene`: Title screen and main navigation
- `PromenadeScene` (and other level scenes): Gameplay implementation

### Dependency Injection

Promote loose coupling and testability:

- Pass dependencies via constructor parameters
- Use scene registry for shared systems
- Avoid global state where possible
- Example: `InputMapper` and managers passed to entities

### Separation of Concerns

Maintain clear boundaries between different parts of the system:

```
src/
├── entities/     # Game objects (Player, Enemy)
├── scenes/       # Game flow and levels
├── systems/      # Reusable game systems
├── utils/        # Pure utility functions
└── types/        # TypeScript type definitions
```

## Documentation Standards

### JSDoc Comments

All classes, methods, and complex logic should include JSDoc comments:

```typescript
/**
 * Player entity with physics, movement, and game feel enhancements
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * Creates a new player instance
   * @param scene - The Phaser scene
   * @param x - Initial x position
   * @param y - Initial y position
   * @param inputMapper - Input system reference
   */
  constructor(scene: Phaser.Scene, x: number, y: number, inputMapper: InputMapper) {
    // ...
  }
}
```

### Inline Comments

Use inline comments to explain:
- Complex algorithms (e.g., coyote time, input buffering)
- Physics calculations (e.g., hitbox offset calculations)
- Non-obvious business logic
- Workarounds or temporary solutions

### README Documentation

Maintain comprehensive README.md with:
- Quick start guide
- Prerequisites and installation
- Project structure overview
- Build and deployment instructions

## Build & Deployment

### CI/CD Pipeline

GitHub Actions workflow for automated deployment:

- **Trigger**: Push to `main` branch
- **Environment**: Node.js 18 with npm caching
- **Build**: TypeScript compilation + Vite bundling
- **Deploy**: Automated GitHub Pages deployment
- **Permissions**: Read contents, write pages, id-token

### Build Process

```bash
# Development
npm run dev          # Start Vite dev server

# Production
npm run build        # TypeScript → Vite build → dist/
npm run preview      # Preview production build
```

### Asset Pipeline

Separation of raw and processed assets:

- `assets/raw/`: Source assets (not deployed)
- `assets/dist/`: Processed assets (deployed)
- `manifest.json`: Auto-generated asset manifest
- Type-safe asset references via generated TypeScript definitions

## Game Development Best Practices

### Performance Optimization

#### Object Pooling

Reuse objects instead of creating/destroying:

```typescript
// Use ObjectPool for frequently created objects
const bulletPool = new ObjectPool<Bullet>(
  () => new Bullet(scene),
  (bullet) => bullet.reset()
);
```

#### Integer Scaling

Pixel-perfect rendering with integer scaling:
- Base resolution: 640x360 (16:9)
- Scale factors: 2x, 3x, 6x for 720p/1080p/4K
- Prevents blurry pixels in retro-style games

#### Optimized Physics

- Minimal hitboxes for performance
- Only enable collision on necessary objects
- Use tile-based collision where appropriate

### Game Feel

#### Coyote Time

Allow jumping briefly after leaving a platform:

```typescript
// Grace period for jumping after falling off platform
private coyoteFrames: number = 0;
const COYOTE_TIME_FRAMES = 6; // ~100ms at 60fps
```

#### Input Buffering

Buffer player inputs for responsive controls:

```typescript
// Register jump input even if player is airborne
private jumpBufferFrames: number = 0;
const INPUT_BUFFER_FRAMES = 6;
```

#### Collision Accuracy

Account for sprite anatomy:

```typescript
// The sprite has 8 pixels of space at the bottom
const offsetY = this.height - hitHeight - 8;
```

### Responsive Design

#### Multi-Platform Input

Support all input methods:
- **Keyboard**: WASD, Arrow keys, Space
- **Gamepad**: Xbox/PlayStation controllers
- **Touch**: Virtual joystick for mobile

#### PWA Support

Progressive Web App features:
- Service worker for offline play
- Web manifest for installation
- Icon sets for various devices
- Mobile-optimized UI/UX

### Asset Management

#### Data-Driven Design

Load game data from external files:
- **Tiled Maps**: JSON-based level design
- **Asset Manifests**: Centralized asset registry
- **Configuration**: Separate constants from code

#### Lazy Loading

Only load assets when needed:
- Scene-specific preloading
- Progress indication during load
- Fallback for missing assets

#### Visibility Checks

Don't process hidden elements:

```typescript
// Skip rendering if layer is not visible
if (layerData.visible === false) {
  console.log(`Skipping hidden layer '${layerData.name}'`);
  return;
}
```

### Initialization Best Practices

#### Deferred Initialization

Don't initialize values before data is loaded:

```typescript
// ❌ Bad: Hardcoded default before loading
private spawnPoint = { x: 36, y: 208 };

// ✅ Good: Null until loaded from data
private spawnPoint: { x: number; y: number } | null = null;
```

#### Graceful Fallbacks

Provide sensible defaults when data is missing:

```typescript
const spawn = this.spawnPoint || { x: 36, y: 208 };
if (!this.spawnPoint) {
  console.warn('No spawn point found, using default');
}
```

## Version Control

### Branch Strategy

- `main`: Production-ready code, auto-deploys
- Feature branches: For development work
- Merge to `main` triggers CI/CD pipeline

### Commit Messages

Follow conventional commit format:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code restructuring
- `perf:` Performance improvements
- `test:` Test additions/changes

## Dependencies

### Core Framework

- **Phaser 3.80+**: Game engine
- **TypeScript 5.3+**: Type-safe development
- **Vite 5+**: Fast build tool

### Production Dependencies

- `howler`: Cross-browser audio engine
- `pako`: GZIP compression
- `phaser3-rex-plugins`: Extended Phaser functionality

### Development Dependencies

- `@types/*`: TypeScript definitions
- `gh-pages`: GitHub Pages deployment
- `vite-plugin-pwa`: PWA generation
- `workbox-*`: Service worker tools

## Future Improvements

Areas not yet enforced but recommended:

- **ESLint**: Automated code style enforcement
- **Prettier**: Code formatting consistency
- **Unit Tests**: Jest or Vitest for testing
- **E2E Tests**: Playwright for integration testing
- **Pre-commit Hooks**: Husky for git hooks
- **Bundle Analysis**: Monitor bundle size
