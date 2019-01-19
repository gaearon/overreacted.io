import React from 'react';
import { codeToLanguage, createLanguageLink } from '../utils/i18n';
import { Link, StaticQuery, graphql } from 'gatsby';
import './post-meta.css';

const PostMeta = ({ post, slug, editUrl, originalTitle }) => {
  const lang = post.fields.langKey;
  const languageLink = createLanguageLink(slug, lang);

  const langs = (post.frontmatter.langs || []).filter(l => l !== 'en');
  const translations = langs
    .filter(l => l !== lang)
    .map((l, i, arr) => (
      <React.Fragment key={l}>
        {l === lang ? (
          <b>{codeToLanguage(l)}</b>
        ) : (
          <Link to={languageLink(l)}>{codeToLanguage(l)}</Link>
        )}
        {i === arr.length - 1
          ? ''
          : i === arr.length - 2
          ? i === 0
            ? ' and '
            : ', and '
          : ', '}
      </React.Fragment>
    ));

  return (
    langs.length > 0 && (
      <p className="post-meta">
        {lang !== 'en' && (
          <React.Fragment>
            This is a <b>community translation</b> of “<i>{originalTitle}</i>”
            into {codeToLanguage(lang)}.
          </React.Fragment>
        )}{' '}
        {(translations.length > 1 || lang === 'en') && (
          <React.Fragment>
            {lang === 'en' ? 'This article has been' : 'It was also'} translated
            by readers into {translations}.
          </React.Fragment>
        )}
        {lang !== 'en' && (
          <React.Fragment>
            <br />
            You can {translations.length > 0 ? 'also ' : ''}
            <Link to={languageLink('en')}>
              read the original in English
            </Link> or{' '}
            <a href={editUrl} target="_blank" rel="noopener noreferrer">
              improve the translation
            </a>
            , if you’d like.
          </React.Fragment>
        )}
      </p>
    )
  );
};

export default PostMeta;
