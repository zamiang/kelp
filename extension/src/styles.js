// Dedicated CSS entry point to ensure styles.css is generated
// This file imports all CSS that should be extracted to styles.css

// Import the main CSS architecture
import './app.css';

// Ensure this module has side effects to prevent tree shaking
console.log('CSS loaded');
