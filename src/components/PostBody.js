import React, { useCallback } from 'react';
import { navigate } from 'gatsby';

export default function PostBody({ html }) {
  const handler = useCallback(event => {
    if (
      event.target.matches('a[href]') &&
      event.target.host === location.host
    ) {
      navigate(event.target.pathname);
      event.preventDefault();
    }
  }, []);

  return <div onClick={handler} dangerouslySetInnerHTML={{ __html: html }} />;
}
