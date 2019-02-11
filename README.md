# [overreacted.io](https://overreacted.io/)

My personal blog. Forked from [Gatsby blog starter](https://github.com/gatsbyjs/gatsby-starter-blog). Syntax theme based on [Sarah Drasner's Night Owl](https://github.com/sdras/night-owl-vscode-theme/) with small tweaks.

To run locally, `yarn`, then `yarn dev`, then open https://localhost:8000.

## Contributing Translations

You can translate any article on the website into your language!

Add a Markdown file with the translation to the corresponding article folder. For example `index.fr.md` in `src/pages/optimized-for-change/`.

If you're the first one to translate a post to your language, you'll need to add it to to the list in `./i18n.js`. See [this PR](https://github.com/gaearon/overreacted.io/pull/159) for an example. If your language needs special font characters, add it to the appropriate place in [this list](https://github.com/gaearon/overreacted.io/blob/5de6c128f798506a54a1a34c32cd5446beecc272/src/utils/i18n.js#L15).

**Please don't send translations for the Russian language — I will be translating into it myself when I find time.**

Before working on your translation, please check the table below to make sure that the article you want to work on has not been translated and is not currently being translated by another developer.

Once you decide to work on a specific translation, please update this table by adding the language you plan to work on under `In-Progress`.

| Blog posts       				      		                    | Completed Translations                                              | In-Progress  |
| ----------------------------------------------------- |---------------------------------------------------------------------|--------------|
| Making setInterval Declarative with React Hooks       | Français                                                            |              |
| React as a UI Runtime                                 | Español • Français                                                  |              |
| Why Isn’t X a Hook?                                   | Deutsch • Español • Français • Italiano •  <br> Português do Brasil • 简体中文 |    |
| The “Bug-O” Notation                                  | Français • 한국어                                                     |              |
| Preparing for a Tech Talk, Part 2: What, Why, and How | Español • Français                                                  |              |
| The Elements of UI Engineering                        | Español • Français • Polski • 日本語 • 简体中文 • <br> 한국어            |              |
| Things I Don’t Know as of 2018                        | Español • Français • Português do Brasil • <br> Svenska • తెలుగు • 日本語 • 简体中文 • 繁體中文 • 한국어 | |
| Preparing for a Tech Talk, Part 1: Motivation         | Español • Français • Português do Brasil • 한국어                     |              |
| Why Do React Hooks Rely on Call Order?                | Español • Français                                                  |              |
| Optimized for Change                                  | Bahasa Indonesia • Deutsch • Español • <br> Français • Polski • Português do Brasil • <br> Български • Українська |       |
| How Does setState Know What to Do?                    | Français • 日本語 • 简体中文                                           |              |
| My Wishlist for Hot Reloading                         | Español • Français                                                   |              |
| Why Do React Elements Have a $$typeof Property?       | Français • Português do Brasil • 日本語                               |              |
| How Does React Tell a Class from a Function?          | Español • Français • Magyar • Slovenčina • <br>  日本語 • 繁體中文     |               |
| Why Do We Write super(props)? | Español • Français • Italiano • Magyar • <br> Nederlands • Norsk • Português do Brasil • <br> Slovenčina •Tiếng Việt • Türkçe • srpski • <br> Čeština • فارسی • ไทย • မြန်မာဘာသာ • <br> 日本語 • 简体中文 • 繁體中文 |        |
