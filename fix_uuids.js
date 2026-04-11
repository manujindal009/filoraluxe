const fs = require('fs');

const fixUUIDs = (file) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/'s([1-9a])00-0/g, "'1$100-0");
    content = content.replace(/"s([1-9a])00-0/g, "\"1$100-0");
    fs.writeFileSync(file, content);
  }
};

fixUUIDs('supabase_full_catalog.sql');
fixUUIDs('lib/data/catalog.json');
