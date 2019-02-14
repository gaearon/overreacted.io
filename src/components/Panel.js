import React from 'react';

function Panel({ children, style = {} }) {
  return (
    <p
      style={{
        fontSize: '0.9em',
        border: '1px solid var(--hr)',
        borderRadius: '0.75em',
        padding: '0.75em',
        background: 'var(--inlineCode-bg)',
        wordBreak: 'keep-all',
        ...style,
      }}
    >
      {children}
    </p>
  );
}

export default Panel;
