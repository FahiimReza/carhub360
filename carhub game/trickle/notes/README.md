# CarHub360 Games & Rewards

A modern, interactive games section for CarHub360 featuring two engaging mini-games where users can earn discount coupons and rewards.

## Features

### 🎯 Main Games Section
- **Modern Design**: Dark automotive theme with cyan and yellow neon highlights
- **Responsive Layout**: Adapts to mobile, tablet, and desktop screens
- **Smooth Animations**: Hover effects, card tilts, and glowing borders

### 🎮 Available Games

1. **🎰 Spin the Wheel** (`spin.html`)
   - Interactive spinning wheel with 6 prize segments
   - Smooth CSS animations with 3-second spin duration
   - Random coupon generation (CH360-XXXXX format)

2. **🎫 Scratch Card** (`scratch.html`)
   - Canvas-based scratching mechanic
   - Touch and mouse support
   - Auto-reveal when 30% scratched
   - 6 different prize types

### 💾 Reward System
- Unique coupon code generation
- LocalStorage persistence
- Timestamp tracking
- Used/unused status management

### 🎨 Design Features
- Poppins font family
- Radial gradient backgrounds
- Neon glow effects
- Smooth transitions (0.3s ease)
- Premium card hover effects

## Technical Implementation

### Structure
- **Multi-page application** (MPA) with separate HTML files
- **Vanilla JavaScript** - no frameworks required
- **CSS3 animations** and transitions
- **Responsive design** with mobile-first approach

### Files
- `index.html` - Main games section
- `spin.html` - Spinning wheel game
- `scratch.html` - Scratch card game
- `styles.css` - Shared styling
- `components/` - Reusable UI components
- `utils/` - Game utility functions

### Browser Compatibility
- Modern browsers with ES6 support
- Canvas API support for scratch card
- CSS Grid and Flexbox support

## Future Enhancements
- Leaderboard system
- Social sharing features
- More game types
- Progressive difficulty levels