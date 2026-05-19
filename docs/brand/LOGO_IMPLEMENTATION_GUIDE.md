# RenewCanvas Africa - Logo & Brand Implementation Guide

## Brand Assets Overview

### Logo Files (in `/public/`)

| File | Dimensions | Use Case |
|------|------------|----------|
| `favicon.svg` | 64x64 | Browser tab favicon |
| `icon.svg` | 192x192 | PWA icon, general use |
| `apple-touch-icon.svg` | 180x180 | iOS home screen |
| `icon-300.svg` | 300x300 | Large icon with text |
| `icon-mark-300.svg` | 300x300 | Icon mark only (no text) |
| `linkedin-banner.svg` | 1584x396 | LinkedIn company banner |
| `linkedin-icon.svg` | 400x400 | LinkedIn profile picture |

### Brand Colors

```css
/* Teal (Primary) */
--teal-500: #14b8a6;
--teal-700: #0f766e;

/* Amber (Accent) */
--amber-400: #fbbf24;
--amber-500: #f59e0b;
--amber-600: #d97706;

/* Text */
--gray-900: #111827;
--gray-500: #6b7280;
```

---

## Web App Implementation

### 1. Favicon Setup

In `app/layout.tsx` or `_document.tsx`:

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },
};
```

### 2. Loading Screen Usage

```tsx
import { LoadingScreen, SplashScreen } from '@/components/AnimatedLogo';

// For page transitions or data loading
function MyPage() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingScreen message="Loading artworks..." />;
  }

  return <PageContent />;
}

// For app startup (in _app.tsx or layout)
function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Initialize app
    setTimeout(() => setReady(true), 2000);
  }, []);

  if (!ready) {
    return <SplashScreen />;
  }

  return <MainApp />;
}
```

### 3. Animated Logo in Components

```tsx
import AnimatedLogo from '@/components/AnimatedLogo';

// Header/Navbar logo (static)
<AnimatedLogo size={40} animate={false} />

// Loading indicator
<AnimatedLogo size={60} animate />

// With brand text
<AnimatedLogo size={80} animate showText />
```

---

## Animation Specifications

### Circle Rotation (Circulate)
- **Duration**: 8 seconds
- **Timing**: Linear
- **Direction**: Clockwise 360°
- **Purpose**: Represents circularity/sustainability

### Leaf Bob Animation
- **Duration**: 2 seconds
- **Timing**: Ease-in-out
- **Movement**: 4px vertical oscillation
- **Purpose**: Natural, organic movement

### Leaf Spin Animation
- **Duration**: 4 seconds
- **Timing**: Ease-in-out
- **Movement**: ±3° rotation
- **Purpose**: Subtle life-like motion

### Pulse Effect
- **Duration**: 2 seconds
- **Timing**: Ease-in-out
- **Movement**: 5% scale + opacity fade
- **Purpose**: Breathing/heartbeat effect

---

## Mobile App Implementation

### React Native

```tsx
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';
import Svg, { Path, G, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';

const AnimatedLogo = ({ size = 80 }) => {
  const rotation = useSharedValue(0);
  const bobValue = useSharedValue(0);

  useEffect(() => {
    // Circle rotation
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1, // infinite
      false
    );

    // Leaf bob
    bobValue.value = withRepeat(
      withTiming(4, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const leafStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -bobValue.value }],
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="teal" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#14b8a6" />
          <Stop offset="100%" stopColor="#0f766e" />
        </LinearGradient>
        <LinearGradient id="amber" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#fbbf24" />
          <Stop offset="100%" stopColor="#f59e0b" />
        </LinearGradient>
      </Defs>

      <AnimatedView style={circleStyle}>
        {/* Circle path */}
      </AnimatedView>

      <AnimatedView style={leafStyle}>
        {/* Leaf path */}
      </AnimatedView>
    </Svg>
  );
};
```

### Flutter

```dart
class AnimatedLogo extends StatefulWidget {
  final double size;
  AnimatedLogo({this.size = 80});

  @override
  _AnimatedLogoState createState() => _AnimatedLogoState();
}

class _AnimatedLogoState extends State<AnimatedLogo>
    with TickerProviderStateMixin {
  late AnimationController _circleController;
  late AnimationController _bobController;

  @override
  void initState() {
    super.initState();

    // Circle rotation (8 seconds, infinite)
    _circleController = AnimationController(
      duration: Duration(seconds: 8),
      vsync: this,
    )..repeat();

    // Leaf bob (2 seconds, bounce)
    _bobController = AnimationController(
      duration: Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([_circleController, _bobController]),
      builder: (context, child) {
        return CustomPaint(
          size: Size(widget.size, widget.size),
          painter: LogoPainter(
            circleRotation: _circleController.value * 2 * pi,
            bobOffset: _bobController.value * 4,
          ),
        );
      },
    );
  }
}
```

---

## Social Media Assets

### LinkedIn Banner (1584 x 396)
- Use `linkedin-banner.svg`
- Contains: Logo, company name, tagline, website URL
- White background for clean professional look

### LinkedIn Profile Picture (400 x 400)
- Use `linkedin-icon.svg`
- Icon only (no text) for small display
- Circular crop-friendly

### Other Social Platforms
- **Twitter/X header**: Export at 1500 x 500
- **Instagram profile**: Export at 400 x 400 (square)
- **Facebook cover**: Export at 820 x 312

---

## Export Instructions

### PNG Export (from SVG)

Using Inkscape CLI:
```bash
# Favicon (64x64)
inkscape favicon.svg --export-png=favicon.png --export-width=64

# Icon (192x192)
inkscape icon.svg --export-png=icon-192.png --export-width=192

# Icon (512x512 for PWA)
inkscape icon.svg --export-png=icon-512.png --export-width=512

# LinkedIn banner
inkscape linkedin-banner.svg --export-png=linkedin-banner.png --export-width=1584
```

Using ImageMagick:
```bash
# Convert SVG to PNG
convert favicon.svg -resize 64x64 favicon.png
convert icon.svg -resize 192x192 icon-192.png
```

### ICO File (Windows favicon)
```bash
convert favicon.svg -resize 16x16 favicon-16.png
convert favicon.svg -resize 32x32 favicon-32.png
convert favicon.svg -resize 48x48 favicon-48.png
convert favicon-16.png favicon-32.png favicon-48.png favicon.ico
```

---

## Design Elements Breakdown

### Brush Stroke Circle (Enso)
- Represents: Circularity, sustainability, continuous cycle
- Style: Zen brush stroke aesthetic
- Opening at top: Incompleteness, room for growth

### Amber Leaf
- Represents: Nature, growth, renewal, Africa's vegetation
- Color: Amber/gold for warmth and value
- Veins: Detail showing craftsmanship

### Color Psychology
- **Teal**: Trust, sustainability, eco-friendly, calm
- **Amber**: Creativity, warmth, energy, African sun
- **Combination**: Balance of environmental responsibility and artistic creativity

---

## Quick Reference

```
Brand Name: RenewCanvas Africa
Tagline: Transforming waste into art, one masterpiece at a time
Website: www.renewcanvas.page
LinkedIn: linkedin.com/company/renewcanvas-africa

Primary Color: #0f766e (Teal 700)
Accent Color: #f59e0b (Amber 500)
```
