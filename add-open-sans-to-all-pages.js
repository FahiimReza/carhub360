const fs = require('fs');
const path = require('path');

// Get all HTML files in the current directory
const htmlFiles = fs.readdirSync('.')
  .filter(file => file.endsWith('.html'))
  .filter(file => !file.startsWith('test-') && !file.includes('theme-test'));

console.log('Adding Open Sans font to HTML files...');

htmlFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if Open Sans font is already included
    if (content.includes('fonts.googleapis.com/css2?family=Open+Sans')) {
      console.log(`✓ ${file} already includes Open Sans font`);
      return;
    }
    
    // Add Open Sans font after the last CSS link
    const lastCssLinkRegex = /(<link href="[^"]*\.css"[^>]*>)/;
    const matches = content.match(lastCssLinkRegex);
    
    if (matches && matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      const fontLinks = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">`;
      
      content = content.replace(lastMatch, lastMatch + fontLinks);
      fs.writeFileSync(file, content);
      console.log(`✓ Added Open Sans font to ${file}`);
    } else {
      console.log(`⚠ Could not find CSS links in ${file}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log('Done!');