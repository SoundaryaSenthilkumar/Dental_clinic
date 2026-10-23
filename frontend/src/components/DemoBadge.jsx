import { SHOW_DEMO_BADGES } from '../data/clinicConfig.js';

// Marks sample content so it is not mistaken for real clinic information. Hidden when SHOW_DEMO_BADGES is false.
export default function DemoBadge({ children = 'Demo content' }) {
  if (!SHOW_DEMO_BADGES) return null;
  return <span className="demo-badge">{children}</span>;
}
