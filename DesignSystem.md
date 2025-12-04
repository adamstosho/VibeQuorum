VibeQuorum Design System
A complete, production-ready design system crafted for Web3Answers — a modern web3 Q&A platform that blends lightweight AI assistance with on-chain rewards. This design system is intentionally practical: it contains design tokens, component specifications, accessibility rules, interaction patterns, Tailwind-ready configuration snippets, and UX patterns tuned for developer-focused dApps.

1. Principles
Clarity first - prioritise readability and clear information hierarchy for technical content. Use generous spacing and high typographic contrast.


Trust and transparency - visual cues must communicate on-chain actions and provenance. Transactions, signatures and rewards should always show explicit feedback.


Familiarity for developers - align control patterns with developer tooling (terminal-like code blocks, monospace for snippets, compact dense lists for logs) so the product feels native.


Calm confidence - a refined, minimal aesthetic that signals security and professionalism without feeling corporate or sterile.


Accessibility and inclusivity - all components meet WCAG AA at minimum; critical flows aim for AAA where practical.



2. Brand foundation
Name: VibeQuorum
Tagline: Developer knowledge, incentivised on-chain.
Tone of voice: Professional, concise, direct, helpful. Use plain language for instructions, avoid jargon where possible, and provide links to references for advanced topics.
Logo guidelines
Primary logo marks: symbol-only (Vibe mark) and logotype (wordmark + mark).


Clear space: 1x the mark width on all sides.


Minimum size: 32px for symbol; 120px for wordmark on desktop usage.


Usage: symbol for favicon and token badge. Wordmark for header and marketing.



3. Typography
Primary fonts
Inter - use for body and UI elements. A modern, highly-legible variable font suited for interfaces.


Space Grotesk (or Manrope) - use for headings and emphasis. Contemporary geometric sans that pairs well with Inter.


Type stack
Headings: Space Grotesk, Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;


Body: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;


Code: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;


Font sizes and scale (base 16px)
h1: 32px / 2rem - weight 700


h2: 24px / 1.5rem - weight 600


h3: 20px / 1.25rem - weight 600


body (base): 16px / 1rem - weight 400


small: 14px / 0.875rem - weight 400


code: 13px / 0.8125rem - weight 400


Line heights
headings: 1.2


body: 1.5


code and labels: 1.4


Heading usage
Use H1 for page title only. H2 for major sections, H3 for sub sections. Keep headings concise and descriptive.



4. Colour system
Design colours are organised as tokens. All tokens include hex and suggested usage. Colour choices aim for modern, high-contrast, and professional Web3 feel: deep indigos, electric accents, soft neutrals.
Palette - primary tokens
--color-primary-900: #0B1220 - deep indigo - primary background and dark UI elements


--color-primary-700: #10233A - navy rich


--color-primary-500: #2563EB - vivid blue - primary action


--color-accent: #7C3AED - electric violet - highlights, token accents


Success / Warning / Danger
--color-success: #16A34A - success green


--color-warning: #F59E0B - warning amber


--color-danger: #DC2626 - critical red


Neutrals
--color-gray-100: #F8FAFC


--color-gray-200: #EEF2F7


--color-gray-300: #E2E8F0


--color-gray-400: #CBD5E1


--color-gray-500: #94A3B8


--color-gray-700: #475569


--color-gray-900: #0F1724


Token / Vibe colours
--vibe-1: #FFD166 - gold accent for token UI


--vibe-2: #06D6A0 - green accent for earned tokens


--vibe-3: #00B4FF - bright cyan for activity indicators


Accessibility notes
Ensure text over primary action (--color-primary-500 text on white) meets contrast 4.5:1 for body text. If not, use white text on --color-primary-500. Use WCAG tools to validate.


Use --color-gray-900 or --color-primary-900 for primary body text on light backgrounds. Reserve --color-gray-100 for surfaces.



5. Design tokens (CSS custom properties)
Add tokens to a root stylesheet so they can be exported to Figma and Tailwind.
:root {
  --font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-heading: 'Space Grotesk', var(--font-body);

  /* colours */
  --primary-900: #0B1220;
  --primary-700: #10233A;
  --primary-500: #2563EB;
  --accent: #7C3AED;

  --success: #16A34A;
  --warning: #F59E0B;
  --danger: #DC2626;

  --gray-100: #F8FAFC;
  --gray-200: #EEF2F7;
  --gray-300: #E2E8F0;
  --gray-400: #CBD5E1;
  --gray-500: #94A3B8;
  --gray-700: #475569;
  --gray-900: #0F1724;

  --vibe-1: #FFD166;
  --vibe-2: #06D6A0;
  --vibe-3: #00B4FF;

  /* spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 40px;
  --space-8: 56px;

  /* radii */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;

  /* shadows */
  --shadow-sm: 0 1px 2px rgba(2,6,23,0.06);
  --shadow-md: 0 6px 20px rgba(2,6,23,0.08);
  --shadow-lg: 0 20px 40px rgba(2,6,23,0.12);
}


6. Spacing and layout
Base spacing: 4px unit. Use multiples for margin and padding. Keep vertical rhythm consistent using the type scale.


Container widths: responsive max-widths


sm: 640px


md: 768px


lg: 1024px


xl: 1280px


2xl: 1440px


Grid: 12-column layout for large screens with 24px gutters, switching to 8 columns for tablet and single column on mobile.



7. Elevation and shadow system
Use 3 elevations for depth: raised items on cards and modals. Keep shadows subtle and neutral.


Example:


Card: --shadow-sm


Modal: --shadow-lg


Floating toolbar: --shadow-md



8. Iconography
Recommended icon set: Lucide or Feather — both are open, minimal and pair well with modern UIs. Use icons at 16px, 20px, and 24px for different contexts.


Token and chain icons: use custom SVG tokens for VibeToken and popular chain icons (Ethereum, BSC). Keep them monochrome for small sizes and full colour for badges.


Always provide accessible aria-label or title attributes.



9. Motion and interaction
Motion style: subtle, short, purposeful. Prefer ease-out cubic-bezier curves.


Standard timings:


short: 120ms


normal: 200ms


long: 300-400ms


Use motion to indicate: focus, success, transaction progress, and micro-interactions such as toasts and toogle states.


Respect prefers-reduced-motion and disable non-essential motion for users who opt out.


Example CSS transition
:root { --ease-standard: cubic-bezier(0.2, 0.9, 0.2, 1); }
.component { transition: transform 200ms var(--ease-standard), opacity 160ms var(--ease-standard); }


10. Accessibility guidelines
Ensure text contrast ratio of at least 4.5:1 for body text, 3:1 for larger headings. Use white text on accent colours only if it meets contrast requirements.


Provide keyboard-first navigation: tab order, skip-links, and logical focus states.


For modals and overlays: trap focus, restore focus on close, and provide aria-modal and descriptive labels.


For wallet interactions: include clear messages and confirmation steps before sensitive operations.


Provide alt text for images and accessible descriptions for transaction links.



11. Component library - specifications
Each component entry contains behaviour, variants, accessibility notes and code tokens.
Button
Variants: primary, secondary, ghost, danger, icon-only


Sizes: sm, md, lg


States: default, hover, active, focus, disabled, loading


Primary example token


background: var(--primary-500)


text: white


border-radius: var(--radius-sm)


padding-md: space-3 vertically, space-4 horizontally


Accessibility: focus ring should be visible and 3px wide. Use aria-pressed for toggle states.


Input / Textarea
Support Markdown editor for question body and answer body with toolbar: bold, italic, code, code block, link, image.


Validation messages appear inline with icons and ARIA aria-invalid.


Use monospace for code blocks. Show line numbers optionally.


Card (Question / Answer)
Layout: author avatar + metadata row (wallet, reputation, timestamp), content area, action row (upvote, reply, AI-draft).


Use --shadow-sm, --radius-md. Provide compact and expanded variants.


For answers with AI-generation, show a subtle badge: AI draft with tooltip: "Generated by model - edit before posting".


Modal - Transaction / Signature
Purpose: show transaction details and require user confirmation via wallet popup.


Elements: title, summary (what will change on-chain), gas estimate, confirmation CTA, cancel.


Show link to block explorer after submission and live status.


Accessibility: focus trap and keyboard cancel.


Toast / Notification
Types: info, success, error


Auto-dismiss: 6s for info/success, persistent for errors until dismissed.


Include optional action CTA for quick undo or view tx.


Badge / Token display
Token chip shows token symbol, balance, and optional token logo. For earned tokens show animated micro-confetti on increment.


Reputation badges: tiered visuals with small icons and tooltip explaining how they are earned.


Wallet Connect Button
Shows: Connect Wallet / Connected state with truncated address, token balance, and small identicon.


Provide network indicator (Goerli/BSC/Testnet) with warning state when on wrong network.


Activity Feed / Transaction Timeline
Chronological list showing tx hash, action type, amount, and status. Each item links to block explorer.


Use colour-coded status chips: pending (amber), success (green), failed (red).


Admin Panel Components
Reward queue with filters, bulk reward action, audit log and tx status. Include safety prompts before executing on-chain calls.



12. UI Patterns and microcopy
Use short CTAs: "Ask", "Answer", "AI Draft", "Accept Answer".


Transaction confirmations: "This will mint 50 VIBE to 0x... Confirm in your wallet." Provide clear gas estimate and cancel options.


Error messages: specific and actionable. Example: "Transaction failed: insufficient funds for gas. Please switch to a network with test ETH.".


Empty states: include CTA and suggested starter questions or trending tags.



13. Developer-ready Tailwind integration
Tailwind is the recommended styling system for rapid development. Below is a starting tailwind.config.js snippet mapped to design tokens.
// tailwind.config.js
module.exports = {
  content: ['./frontend/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#0B1220',
          700: '#10233A',
          500: '#2563EB'
        },
        accent: '#7C3AED',
        vibe1: '#FFD166',
        vibe2: '#06D6A0',
        vibe3: '#00B4FF'
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '24px',
        6: '32px'
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px'
      },
      fontFamily: {
        body: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace']
      }
    }
  }
}

Include an exported design-tokens.json to import into the Figma token plugin.

14. Figma and design tooling
Create a Figma file with pages: Tokens, Components, Patterns, Marketing.


Token page: mirror the CSS variables, with aliases and usage notes.


Components: build atomic elements (button, input), molecules (card, modal), organisms (question list, profile) and templates (question page).


Export icons as a single SVG sprite and maintain an icons folder.


Use Figma auto layout and constraints for responsive variants.



15. Component accessibility checklist
For each component verify:
Keyboard operable


Meaningful ARIA labels and roles


Focus visible and meets contrast for focus ring


Screen reader announcements for state changes (e.g. toast announces)


Proper landmark usage (main, nav, header)




