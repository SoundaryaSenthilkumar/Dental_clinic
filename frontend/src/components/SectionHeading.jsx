import { SplitText, EyebrowReveal, LineReveal } from './TextSplit.jsx';

export default function SectionHeading({ eyebrow, title, description, id }) {
  return (
    <header className="section-heading">
      {eyebrow && <EyebrowReveal text={eyebrow} />}
      <SplitText as="h2" id={id} text={title} mode="words" delay={eyebrow ? 120 : 0} />
      {description && <LineReveal as="p" text={description} className="section-desc" delay={eyebrow ? 260 : 140} />}
    </header>
  );
}
