#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class TDDWorkflow {
  constructor() {
    this.projectRoot = process.cwd();
    this.testFramework = this.detectTestFramework();
    this.testCommand = this.getTestCommand();
  }

  detectTestFramework() {
    const packagePath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      if (pkg.devDependencies?.vitest || pkg.dependencies?.vitest) {
        return 'vitest';
      }
      if (pkg.devDependencies?.jest || pkg.dependencies?.jest) {
        return 'jest';
      }
      if (pkg.devDependencies?.mocha || pkg.dependencies?.mocha) {
        return 'mocha';
      }
    }
    return 'npm test';
  }

  getTestCommand() {
    switch (this.testFramework) {
      case 'vitest':
        return 'npm run test';
      case 'jest':
        return 'npm run test';
      case 'mocha':
        return 'npx mocha';
      default:
        return 'npm test';
    }
  }

  run(command, ...args) {
    switch (command) {
      case 'start':
        return this.start(args[0]);
      case 'test':
        return this.runTests();
      case 'implement':
        return this.implement();
      case 'refactor':
        return this.refactor();
      case 'demo':
        return this.demo();
      default:
        this.showHelp();
    }
  }

  start(feature) {
    console.log('🚀 Starting TDD workflow for:', feature || 'new feature');
    console.log('');
    console.log('TDD Cycle:');
    console.log('1. 🔴 RED: Write a failing test');
    console.log('2. 🟢 GREEN: Write minimal code to pass');
    console.log('3. 🔄 REFACTOR: Improve with confidence');
    console.log('');
    console.log('Next steps:');
    console.log('- Write your test first');
    console.log('- Run: /tdd test (to see it fail)');
    console.log('- Run: /tdd implement (let Claude make it pass)');
    console.log('');
    
    if (feature) {
      console.log(`💡 Feature: ${feature}`);
      console.log('Consider what the public API should look like.');
      console.log('Write tests for your ideal interface first!');
    }
  }

  runTests() {
    console.log('🧪 Running tests...');
    console.log('');
    
    try {
      const output = execSync(this.testCommand, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log(output);
      
      if (output.includes('FAIL') || output.includes('failed')) {
        console.log('🔴 RED: Tests failing - perfect for TDD!');
        console.log('Next: /tdd implement');
      } else {
        console.log('🟢 GREEN: All tests passing!');
        console.log('Next: /tdd refactor or write more tests');
      }
      
    } catch (error) {
      console.log(error.stdout || error.message);
      console.log('🔴 RED: Tests failing - perfect for TDD!');
      console.log('Next: /tdd implement');
    }
  }

  implement() {
    console.log('🟢 Implementation phase:');
    console.log('');
    console.log('Tell Claude:');
    console.log('"Please implement the minimal code needed to make these tests pass."');
    console.log('');
    console.log('TDD Rules for Claude:');
    console.log('- Write ONLY enough code to pass the tests');
    console.log('- No extra features or "nice-to-haves"');
    console.log('- Focus on the simplest solution that works');
    console.log('');
    console.log('After implementation: /tdd test');
  }

  refactor() {
    console.log('🔄 Refactor phase:');
    console.log('');
    console.log('Tests are passing! Safe to refactor.');
    console.log('');
    console.log('Tell Claude:');
    console.log('"Please refactor this code while keeping all tests green."');
    console.log('');
    console.log('Focus areas:');
    console.log('- Extract common patterns');
    console.log('- Improve readability');
    console.log('- Remove duplication');
    console.log('- Better naming');
    console.log('');
    console.log('After refactoring: /tdd test');
  }

  demo() {
    console.log('🎭 TDD Demo - Watch the Magic!');
    console.log('');
    console.log('Let\'s create a simple utility function using TDD:');
    console.log('');
    
    // Create a demo test file
    const demoTest = `
// demo.test.js
describe('calculateTip', () => {
  it('calculates 20% tip correctly', () => {
    expect(calculateTip(100, 20)).toBe(20);
  });
  
  it('handles decimal amounts', () => {
    expect(calculateTip(23.50, 18)).toBe(4.23);
  });
  
  it('throws error for invalid percentage', () => {
    expect(() => calculateTip(100, -5)).toThrow('Invalid percentage');
  });
});
`;

    console.log('📝 Sample test file:');
    console.log(demoTest);
    console.log('');
    console.log('Now run:');
    console.log('1. Save this as demo.test.js');
    console.log('2. /tdd test (watch it fail - RED)');
    console.log('3. /tdd implement (Claude writes minimal code - GREEN)');
    console.log('4. /tdd refactor (improve the code - REFACTOR)');
    console.log('');
    console.log('✨ You\'ll see Claude become incredibly focused and precise!');
  }

  showHelp() {
    console.log('🚀 TDD Command - Your Development Superpower');
    console.log('');
    console.log('Usage:');
    console.log('  /tdd start [feature]  - Begin TDD workflow');
    console.log('  /tdd test            - Run tests and see results');
    console.log('  /tdd implement       - Guide for implementation phase');
    console.log('  /tdd refactor        - Guide for refactoring phase');
    console.log('  /tdd demo            - See a quick demo');
    console.log('');
    console.log('The TDD Cycle:');
    console.log('🔴 RED → 🟢 GREEN → 🔄 REFACTOR → 🎉 COMMIT');
    console.log('');
    console.log('Detected test framework:', this.testFramework);
    console.log('Test command:', this.testCommand);
  }
}

// Run the script
const workflow = new TDDWorkflow();
const [,, command, ...args] = process.argv;

workflow.run(command, ...args);