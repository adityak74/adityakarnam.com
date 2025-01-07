const fs = require('fs');
const Parser = require('rss-parser');

(async () => {
    const parser = new Parser();
    const feed = await parser.parseURL('https://medium.com/@adityakarnam/feed');

    const formattedPosts = feed.items.map(post => `- #### [${post.title}](${post.link})`).join('\n');

    const markdownContent = `# Articles\n\n${formattedPosts}`;

    fs.writeFile('articles.md', markdownContent, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Markdown file created successfully as articles.md');
        }
    });
})();
