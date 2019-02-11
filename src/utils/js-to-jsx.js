// It's so easy to forget to use ```jsx instead of ```js.
// This will change every instance of js to jsx in blog posts.
const fs = require('fs');
const glob = require('glob');

glob('src/pages/**/*.md', (err, files) => {
  if (err) {
    throw err;
  }
  files.forEach(file => {
    fs.writeFileSync(
      file,
      fs.readFileSync(file, 'utf8').replace(/```js(?!x)/g, '```jsx')
    );
  });
});
