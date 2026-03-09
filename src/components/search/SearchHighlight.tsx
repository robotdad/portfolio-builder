'use client';

interface SearchHighlightProps {
  text: string;
  query: string;
  className?: string;
}

/**
 * Component to highlight search terms in text
 */
export function SearchHighlight({ text, query, className = '' }: SearchHighlightProps) {
  if (!text || !query) {
    return <span className={className}>{text}</span>;
  }
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  if (!lowerText.includes(lowerQuery)) {
    return <span className={className}>{text}</span>;
  }
  
  const parts: { text: string; highlight: boolean }[] = [];
  let lastIndex = 0;
  let index = lowerText.indexOf(lowerQuery);
  
  while (index !== -1) {
    // Add text before match
    if (index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, index),
        highlight: false,
      });
    }
    
    // Add matched text
    parts.push({
      text: text.substring(index, index + query.length),
      highlight: true,
    });
    
    lastIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, lastIndex);
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      highlight: false,
    });
  }
  
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.highlight ? (
          <mark
            key={i}
            className="search-highlight-mark"
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </span>
  );
}
