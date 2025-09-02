const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all MDX files in the posts directory
const postsDir = path.join(__dirname, '../content/posts');
const mdxFiles = glob.sync(`${postsDir}/**/*.mdx`);

console.log(`Found ${mdxFiles.length} blog posts to update...`);

mdxFiles.forEach((filePath) => {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if MindockCTA is already present
    if (content.includes('<MindockCTA />')) {
      console.log(`Skipping ${path.basename(filePath)} - MindockCTA already present`);
      return;
    }
    
    // Find the end of frontmatter (---) and add MindockCTA after it
    const frontmatterEndIndex = content.indexOf('---', content.indexOf('---') + 3) + 3;
    
    if (frontmatterEndIndex === 2) {
      console.log(`Warning: Could not find frontmatter in ${path.basename(filePath)}`);
      return;
    }
    
    // Insert MindockCTA after frontmatter
    const beforeContent = content.substring(0, frontmatterEndIndex);
    const afterContent = content.substring(frontmatterEndIndex);
    
    // Add MindockCTA with proper spacing
    const updatedContent = beforeContent + '\n\n<MindockCTA />\n' + afterContent;
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedContent, 'utf-8');
    
    console.log(`✅ Updated ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`❌ Error updating ${path.basename(filePath)}:`, error.message);
  }
});

console.log('\n🎉 Finished updating all blog posts with MindockCTA!');
console.log('\n📝 Note: The MindockCTA component will now appear at the top of all blog post content.');
