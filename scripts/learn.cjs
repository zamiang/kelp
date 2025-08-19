#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class LearningCapture {
  constructor() {
    this.projectRoot = process.cwd();
    this.learningsDir = path.join(this.projectRoot, 'memory-bank');
    this.learningsFile = path.join(this.learningsDir, 'learnings.json');
    this.ensureLearningsDirectory();
  }

  ensureLearningsDirectory() {
    if (!fs.existsSync(this.learningsDir)) {
      fs.mkdirSync(this.learningsDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.learningsFile)) {
      fs.writeFileSync(this.learningsFile, JSON.stringify({
        version: "1.0",
        created: new Date().toISOString(),
        learnings: []
      }, null, 2));
    }
  }

  loadLearnings() {
    try {
      const data = fs.readFileSync(this.learningsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading learnings:', error.message);
      return { learnings: [] };
    }
  }

  saveLearnings(data) {
    try {
      fs.writeFileSync(this.learningsFile, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving learnings:', error.message);
      return false;
    }
  }

  run(command, ...args) {
    switch (command) {
      case 'capture':
      case 'add':
        return this.capture(args.join(' '));
      case 'list':
      case 'ls':
        return this.list(args[0]);
      case 'search':
        return this.search(args.join(' '));
      case 'categories':
      case 'cats':
        return this.listCategories();
      case 'recent':
        return this.showRecent(parseInt(args[0]) || 5);
      case 'export':
        return this.export(args[0]);
      case 'stats':
        return this.showStats();
      default:
        this.showHelp();
    }
  }

  capture(text) {
    if (!text.trim()) {
      console.log('📝 Learning Capture');
      console.log('');
      console.log('Usage: /learn capture "Your insight here"');
      console.log('');
      console.log('Tips:');
      console.log('- Be specific about what you learned');
      console.log('- Include context about when/why it matters');
      console.log('- Add category with [category] prefix');
      console.log('');
      console.log('Examples:');
      console.log('/learn capture "[testing] Vitest coverage thresholds should be set in vitest.config.ts"');
      console.log('/learn capture "[performance] Bundle analysis showed MUI is 40% of extension size"');
      return;
    }

    const data = this.loadLearnings();
    
    // Parse category and content
    let category = 'general';
    let content = text;
    
    const categoryMatch = text.match(/^\[([^\]]+)\]\s*(.+)/);
    if (categoryMatch) {
      category = categoryMatch[1].toLowerCase();
      content = categoryMatch[2];
    }

    const learning = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      category,
      content,
      project: path.basename(this.projectRoot)
    };

    data.learnings.unshift(learning);
    
    if (this.saveLearnings(data)) {
      console.log('✅ Learning captured!');
      console.log('');
      console.log(`📂 Category: ${category}`);
      console.log(`📝 Content: ${content}`);
      console.log(`🕐 Time: ${new Date().toLocaleString()}`);
    }
  }

  list(category) {
    const data = this.loadLearnings();
    let learnings = data.learnings;

    if (category) {
      learnings = learnings.filter(l => l.category === category.toLowerCase());
      console.log(`📚 Learnings - Category: ${category}`);
    } else {
      console.log('📚 All Learnings');
    }
    
    console.log('='.repeat(50));
    console.log('');

    if (learnings.length === 0) {
      console.log('No learnings found' + (category ? ` in category "${category}"` : '') + '.');
      console.log('');
      console.log('Capture your first learning with:');
      console.log('/learn capture "Your insight here"');
      return;
    }

    learnings.forEach((learning, index) => {
      const date = new Date(learning.timestamp).toLocaleDateString();
      console.log(`${index + 1}. [${learning.category}] ${learning.content}`);
      console.log(`   📅 ${date} • 🏷️ #${learning.id}`);
      console.log('');
    });

    console.log(`Total: ${learnings.length} learning${learnings.length === 1 ? '' : 's'}`);
  }

  search(query) {
    if (!query.trim()) {
      console.log('🔍 Search Learnings');
      console.log('');
      console.log('Usage: /learn search "search terms"');
      console.log('');
      console.log('Searches through all learning content and categories.');
      return;
    }

    const data = this.loadLearnings();
    const searchTerms = query.toLowerCase();
    
    const matches = data.learnings.filter(learning => 
      learning.content.toLowerCase().includes(searchTerms) ||
      learning.category.toLowerCase().includes(searchTerms)
    );

    console.log(`🔍 Search Results for: "${query}"`);
    console.log('='.repeat(50));
    console.log('');

    if (matches.length === 0) {
      console.log('No matches found.');
      console.log('');
      console.log('Try:');
      console.log('- Different keywords');
      console.log('- /learn categories (to see available categories)');
      console.log('- /learn list (to see all learnings)');
      return;
    }

    matches.forEach((learning, index) => {
      const date = new Date(learning.timestamp).toLocaleDateString();
      console.log(`${index + 1}. [${learning.category}] ${learning.content}`);
      console.log(`   📅 ${date}`);
      console.log('');
    });

    console.log(`Found ${matches.length} match${matches.length === 1 ? '' : 'es'}`);
  }

  listCategories() {
    const data = this.loadLearnings();
    const categories = {};
    
    data.learnings.forEach(learning => {
      categories[learning.category] = (categories[learning.category] || 0) + 1;
    });

    console.log('📂 Learning Categories');
    console.log('='.repeat(30));
    console.log('');

    if (Object.keys(categories).length === 0) {
      console.log('No categories found yet.');
      console.log('');
      console.log('Start categorizing with:');
      console.log('/learn capture "[category] your learning"');
      return;
    }

    Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`${category.padEnd(15)} ${count} learning${count === 1 ? '' : 's'}`);
      });

    console.log('');
    console.log(`Total: ${Object.keys(categories).length} categories`);
    console.log('');
    console.log('View specific category: /learn list [category]');
  }

  showRecent(count = 5) {
    const data = this.loadLearnings();
    const recent = data.learnings.slice(0, count);

    console.log(`🕐 Recent Learnings (${count})`);
    console.log('='.repeat(30));
    console.log('');

    if (recent.length === 0) {
      console.log('No learnings captured yet.');
      console.log('');
      console.log('Start with: /learn capture "Your first insight"');
      return;
    }

    recent.forEach((learning, index) => {
      const timeAgo = this.getTimeAgo(learning.timestamp);
      console.log(`${index + 1}. [${learning.category}] ${learning.content}`);
      console.log(`   ⏰ ${timeAgo}`);
      console.log('');
    });
  }

  getTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  }

  showStats() {
    const data = this.loadLearnings();
    const total = data.learnings.length;
    
    if (total === 0) {
      console.log('📊 Learning Statistics');
      console.log('='.repeat(25));
      console.log('');
      console.log('No learnings captured yet!');
      console.log('');
      console.log('Start building your knowledge base:');
      console.log('/learn capture "Your first insight"');
      return;
    }

    const categories = {};
    const byDay = {};
    
    data.learnings.forEach(learning => {
      // Category stats
      categories[learning.category] = (categories[learning.category] || 0) + 1;
      
      // Day stats
      const day = new Date(learning.timestamp).toDateString();
      byDay[day] = (byDay[day] || 0) + 1;
    });

    const mostActiveDay = Object.entries(byDay).reduce((a, b) => byDay[a[0]] > byDay[b[0]] ? a : b);
    const topCategory = Object.entries(categories).reduce((a, b) => categories[a[0]] > categories[b[0]] ? a : b);

    console.log('📊 Learning Statistics');
    console.log('='.repeat(25));
    console.log('');
    console.log(`Total learnings: ${total}`);
    console.log(`Categories: ${Object.keys(categories).length}`);
    console.log(`Most active day: ${mostActiveDay[0]} (${mostActiveDay[1]} learnings)`);
    console.log(`Top category: ${topCategory[0]} (${topCategory[1]} learnings)`);
    console.log('');
    
    const recent = data.learnings[0];
    if (recent) {
      console.log(`Latest: ${this.getTimeAgo(recent.timestamp)}`);
      console.log(`"${recent.content.substring(0, 60)}${recent.content.length > 60 ? '...' : ''}"`);
    }
  }

  export(format = 'md') {
    const data = this.loadLearnings();
    const filename = `learnings-export-${new Date().toISOString().split('T')[0]}.${format}`;
    const filepath = path.join(this.learningsDir, filename);

    let content = '';
    
    if (format === 'md') {
      content = `# Learning Export\n\nGenerated: ${new Date().toISOString()}\nTotal Learnings: ${data.learnings.length}\n\n`;
      
      const categories = {};
      data.learnings.forEach(learning => {
        if (!categories[learning.category]) categories[learning.category] = [];
        categories[learning.category].push(learning);
      });

      Object.entries(categories).forEach(([category, learnings]) => {
        content += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
        learnings.forEach(learning => {
          content += `- **${new Date(learning.timestamp).toLocaleDateString()}**: ${learning.content}\n`;
        });
        content += '\n';
      });
    } else {
      content = JSON.stringify(data, null, 2);
    }

    fs.writeFileSync(filepath, content);
    console.log(`📄 Exported ${data.learnings.length} learnings to: ${filename}`);
    console.log(`Location: ${filepath}`);
  }

  showHelp() {
    console.log('📚 Learning Capture System');
    console.log('');
    console.log('Commands:');
    console.log('  capture "text"  - Capture a new learning');
    console.log('  list [category] - List all learnings (or by category)');
    console.log('  search "query"  - Search through learnings');
    console.log('  categories      - Show all categories');
    console.log('  recent [count]  - Show recent learnings (default: 5)');
    console.log('  stats           - Show learning statistics');
    console.log('  export [format] - Export learnings (md/json)');
    console.log('');
    console.log('Examples:');
    console.log('  /learn capture "[testing] Use --coverage flag for Vitest coverage"');
    console.log('  /learn list testing');
    console.log('  /learn search "webpack"');
    console.log('  /learn recent 10');
    console.log('');
    console.log('Categories are auto-created with [category] prefix.');
    console.log(`Storage: ${this.learningsFile}`);
  }
}

// Run the script
const capture = new LearningCapture();
const [,, command, ...args] = process.argv;

if (!command) {
  capture.showHelp();
} else {
  capture.run(command, ...args);
}