import { isPlaceholder } from '../data/clinicConfig.js';

// Renders text. Strings containing "REPLACE" are highlighted so missing clinic details stand out.
export default function PlaceholderText({ text, as: Tag = 'span', className = '' }) {
  const placeholder = isPlaceholder(text);
  return (
    <Tag className={`${className} ${placeholder ? 'placeholder' : ''}`.trim()} title={placeholder ? 'Replace in src/data' : undefined}>
      {text}
    </Tag>
  );
}
