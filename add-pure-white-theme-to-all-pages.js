const fs = require('fs');
const path = require('path');

// Get all HTML files in the current directory
const htmlFiles = fs.readdirSync('.')
  .filter(file => file.endsWith('.html'))
  .filter(file => !file.startsWith('test-') && !file.includes('theme-test'));

console.log('Adding pure-white-theme.css to HTML files...');

htmlFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if pure-white-theme.css is already included
    if (content.includes('pure-white-theme.css')) {
      console.log(`✓ ${file} already includes pure-white-theme.css`);
      return;
    }
    
    // Add pure-white-theme.css after dark-theme.css
    const darkThemeRegex = /(<link href="dark-theme\.css" rel="stylesheet">)/;
    if (darkThemeRegex.test(content)) {
      content = content.replace(darkThemeRegex, '$1\n    <link href="pure-white-theme.css" rel="stylesheet">');
      fs.writeFileSync(file, content);
      console.log(`✓ Added pure-white-theme.css to ${file}`);
    } else {
      console.log(`⚠ Could not find dark-theme.css in ${file}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log('Done!');