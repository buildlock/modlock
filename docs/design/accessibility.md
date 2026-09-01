# Accessibility requirements

Status: required baseline  
Last reviewed: 2026-09-01

- Website targets WCAG 2.2 AA.
- Desktop uses native Windows accessibility APIs/UI Automation and works at 100–400% text/display scaling.
- Every action is keyboard reachable with visible focus and logical order.
- Status is communicated with text/icon/semantics, never color alone.
- Lists, reorder controls, diffs, conflicts, charts, progress, and crosshair previews have accessible alternatives.
- Drag-and-drop always has keyboard/button equivalents.
- Live progress announcements are throttled and meaningful; cancellation remains reachable.
- Destructive confirmations name target and recovery; focus returns predictably.
- Animation honors reduced-motion settings; no flashing content.
- Contrast meets AA, including disabled/secondary text where meaningful content remains.
- Crosshair color selection exposes numeric values, contrast/context warnings, and nonvisual descriptions.
- Error messages identify the field/action and remediation, not only an error code.

## Feature gate

Each feature page specifies keyboard path, focus behavior, screen-reader name/role/value, scaling/reflow, status announcement, and alternative for visual-only content. Automated checks supplement, not replace, NVDA/Narrator and keyboard testing on Windows.

