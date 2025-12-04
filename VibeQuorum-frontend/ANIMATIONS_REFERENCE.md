# VibeQuorum Landing Page - Animations & Features Reference

## Animation Keyframes

### 1. slideInDown
\`\`\`css
@keyframes slideInDown {
  from: translateY(-20px), opacity 0
  to: translateY(0), opacity 1
}
Duration: 0.6s | Easing: ease-out
\`\`\`
**Used For**: Header, badges, top-aligned content

### 2. slideInUp
\`\`\`css
@keyframes slideInUp {
  from: translateY(20px), opacity 0
  to: translateY(0), opacity 1
}
Duration: 0.6s | Easing: ease-out
\`\`\`
**Used For**: Feature cards, CTA sections, bottom content

### 3. slideInLeft / slideInRight
\`\`\`css
@keyframes slideInLeft/Right {
  from: translateX(±20px), opacity 0
  to: translateX(0), opacity 1
}
Duration: 0.6s | Easing: ease-out
\`\`\`
**Used For**: Alternating content layouts

### 4. scaleIn
\`\`\`css
@keyframes scaleIn {
  from: scale(0.95), opacity 0
  to: scale(1), opacity 1
}
Duration: 0.6s | Easing: ease-out
\`\`\`
**Used For**: Dropdown menus, modals, popovers

### 5. float / floatAlt
\`\`\`css
@keyframes float {
  0%, 100%: translateY(0)
  50%: translateY(-20px)
}
Duration: 3-4s | Easing: ease-in-out | Loop: infinite
\`\`\`
**Used For**: Decorative background orbs, visual elements

### 6. rotate
\`\`\`css
@keyframes rotate {
  from: rotate(0deg)
  to: rotate(360deg)
}
Duration: 20s | Easing: linear | Loop: infinite
\`\`\`
**Used For**: Loading spinners, decorative circles

### 7. pulse-glow
\`\`\`css
@keyframes pulse-glow {
  0%, 100%: opacity 1
  50%: opacity 0.7
}
Duration: 2s | Easing: ease-in-out | Loop: infinite
\`\`\`
**Used For**: Emphasis indicators, status lights

### 8. shimmer
\`\`\`css
@keyframes shimmer {
  0%: background-position -1000px
  100%: background-position 1000px
}
Duration: 2s | Easing: none | Loop: infinite
\`\`\`
**Used For**: Loading skeletons

### 9. gradient-shift
\`\`\`css
@keyframes gradient-shift {
  0%, 100%: background-position 0% 50%
  50%: background-position 100% 50%
}
Duration: 8s | Easing: ease | Loop: infinite
\`\`\`
**Used For**: Animated gradient backgrounds

## Stagger Animation Pattern

All multi-element sections use staggered animations:

\`\`\`tsx
style={{
  animation: `slideInUp 0.6s ease-out ${0.1 + index * delayIncrement}s both`
}}
\`\`\`

**Default Increment**: 0.1s (100ms)
**Range**: 0.08s - 0.15s for optimal visual rhythm

## Hover Effects

### Scale on Hover
\`\`\`css
hover:scale-105 transition-transform duration-300
\`\`\`

### Shadow Glow
\`\`\`css
hover:shadow-lg hover:shadow-primary/20 transition-shadow duration-300
\`\`\`

### Color Transition
\`\`\`css
hover:text-primary transition-colors duration-300
\`\`\`

### Border Color Change
\`\`\`css
hover:border-primary/50 transition-colors duration-300
\`\`\`

## Scroll-Triggered Animations

### IntersectionObserver Setup
\`\`\`tsx
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-fade-in")
      }
    })
  },
  { threshold: 0.1 } // Trigger when 10% visible
)
\`\`\`

**Common Thresholds**:
- 0.1 (10%) - Early trigger, good for entrance
- 0.3 (30%) - Balanced trigger
- 0.5 (50%) - Middle of viewport

## Responsive Animation Adjustments

### Mobile (< 640px)
- Animations play at normal speed
- Reduced blur effects to save battery
- Simpler transitions

### Tablet (640px - 1024px)
- Standard animation durations
- Medium blur effects

### Desktop (> 1024px)
- Full animation suite
- Maximum blur and shadow effects

## Performance Tips

1. **Use GPU-Accelerated Properties**
   - `transform: translateX()`
   - `transform: scale()`
   - `transform: rotate()`
   - `opacity`

2. **Avoid Animating**
   - `width`, `height` (use transform: scale)
   - `left`, `top` (use transform: translate)
   - `background-color` (too expensive)

3. **Enable Hardware Acceleration**
   \`\`\`css
   .animate-element {
     will-change: transform;
     transform: translateZ(0);
   }
   \`\`\`

4. **Use `animation: both` for fill-forwards**
   \`\`\`css
   animation: slideInUp 0.6s ease-out 0.2s both;
   /* 'both' = maintain final state */
   \`\`\`

## Animation Timing Presets

| Name | Duration | Easing | Use Case |
|------|----------|--------|----------|
| Quick | 200ms | ease-out | Micro-interactions |
| Standard | 300ms | ease-out | Button clicks, hovers |
| Normal | 600ms | ease-out | Page entry animations |
| Slow | 800ms | ease-out | Important CTAs |
| Continuous | 3-8s | ease-in-out | Background elements |

## Common Animation Combinations

### Hero Section Pattern
\`\`\`
Badge: 0.1s delay
Headline: 0.2s delay
Subtext: 0.3s delay
Buttons: 0.4s delay
Demo card: 0.6s delay
\`\`\`

### Feature Grid Pattern
\`\`\`
First card: 0.1s
Second card: 0.18s
Third card: 0.26s
...
Gap between: 0.08s
\`\`\`

### Scroll-in Pattern
\`\`\`
Use `slideInUp` for cards
Stagger by 0.1s or 0.15s
Total visible delay: 1-2 seconds
Optimal for grids of 6-12 items
\`\`\`

## Testing Animations

### Browser DevTools
1. Open DevTools → Elements
2. Right-click element → Inspect
3. Look for animation properties in Computed Styles
4. Slow down animations: DevTools → Menu → More Tools → Rendering → Animation Playback Rate

### Animation Checker
\`\`\`jsx
// In console:
document.querySelectorAll('[style*="animation"]').length
// Shows how many elements have inline animations
\`\`\`

## Accessibility Considerations

### Prefers-Reduced-Motion
\`\`\`css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
\`\`\`

### Animation Limits
- Never exceed 3 seconds for primary interactions
- Keep continuous animations subtle (pulse, rotate only)
- Provide non-animated alternatives for critical content

## Troubleshooting

### Animation Not Playing
1. Check `animation-fill-mode: both` is set
2. Verify element is visible (not `display: none`)
3. Ensure IntersectionObserver is firing
4. Check for conflicting CSS classes

### Animation Jittery/Stuttering
1. Use `transform` instead of position properties
2. Add `will-change: transform`
3. Reduce blur amount on mobile
4. Check GPU acceleration is enabled

### Animation Too Fast/Slow
1. Adjust duration in animation definition
2. Check for conflicting `transition` properties
3. Verify easing function (ease-out is standard)

## Migration from Old Animations

If updating from previous animation system:

\`\`\`tsx
// Old
className="animate-slide-in-down"

// New - with stagger
style={{ animation: "slideInDown 0.6s ease-out 0.1s both" }}
