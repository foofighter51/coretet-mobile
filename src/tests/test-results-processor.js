/**
 * CoreTet Design System - Test Results Processor
 * Custom processor for design consistency test results
 */

const fs = require('fs');
const path = require('path');

module.exports = (testResults) => {
  // Extract design consistency test results
  const designTests = testResults.testResults.filter(result => 
    result.testFilePath.includes('design-consistency.test')
  );

  if (designTests.length === 0) {
    return testResults;
  }

  const designTest = designTests[0];
  const checklistResults = {
    visualConsistency: {
      trackCardDimensions: false,
      buttonHeight: false,
      typography: false,
      colors: false,
      spacing: false,
      shadows: false,
    },
    componentStates: {
      default: false,
      active: false,
      disabled: false,
      loading: false,
      error: false,
      empty: false,
    },
    responsiveBehavior: {
      scaling: false,
      textTruncation: false,
      aspectRatio: false,
      touchTargets: false,
      safeAreas: false,
    },
    interactions: {
      animations: false,
      transitions: false,
      gestures: false,
      loadingIndicators: false,
      errorMessages: false,
    },
    accessibility: {
      colorContrast: false,
      touchTargets: false,
      screenReaders: false,
      focusStates: false,
      textScaling: false,
      violations: false,
    },
  };

  // Parse test results and map to checklist items
  designTest.assertionResults.forEach(assertion => {
    const testName = assertion.title;
    const passed = assertion.status === 'passed';

    // Visual Consistency
    if (testName.includes('track cards exactly 343x64px')) {
      checklistResults.visualConsistency.trackCardDimensions = passed;
    }
    if (testName.includes('primary buttons exactly 44px height')) {
      checklistResults.visualConsistency.buttonHeight = passed;
    }
    if (testName.includes('text uses exact typography scales')) {
      checklistResults.visualConsistency.typography = passed;
    }
    if (testName.includes('colors match hex values exactly')) {
      checklistResults.visualConsistency.colors = passed;
    }
    if (testName.includes('spacing follows 8px grid')) {
      checklistResults.visualConsistency.spacing = passed;
    }
    if (testName.includes('shadows consistent')) {
      checklistResults.visualConsistency.shadows = passed;
    }

    // Component States
    if (testName.includes('Default state implemented')) {
      checklistResults.componentStates.default = passed;
    }
    if (testName.includes('Active/pressed state implemented')) {
      checklistResults.componentStates.active = passed;
    }
    if (testName.includes('Disabled state implemented')) {
      checklistResults.componentStates.disabled = passed;
    }
    if (testName.includes('Loading state implemented')) {
      checklistResults.componentStates.loading = passed;
    }
    if (testName.includes('Error state implemented')) {
      checklistResults.componentStates.error = passed;
    }
    if (testName.includes('Empty state implemented')) {
      checklistResults.componentStates.empty = passed;
    }

    // Responsive Behavior
    if (testName.includes('Components scale properly')) {
      checklistResults.responsiveBehavior.scaling = passed;
    }
    if (testName.includes('Text truncates with ellipsis')) {
      checklistResults.responsiveBehavior.textTruncation = passed;
    }
    if (testName.includes('Images maintain aspect ratio')) {
      checklistResults.responsiveBehavior.aspectRatio = passed;
    }
    if (testName.includes('Touch targets minimum 44x44px')) {
      checklistResults.responsiveBehavior.touchTargets = passed;
    }
    if (testName.includes('Safe area insets respected')) {
      checklistResults.responsiveBehavior.safeAreas = passed;
    }

    // Interactions
    if (testName.includes('Press animations smooth')) {
      checklistResults.interactions.animations = passed;
    }
    if (testName.includes('Transitions 300ms ease-out')) {
      checklistResults.interactions.transitions = passed;
    }
    if (testName.includes('Gesture feedback immediate')) {
      checklistResults.interactions.gestures = passed;
    }
    if (testName.includes('Loading indicators visible')) {
      checklistResults.interactions.loadingIndicators = passed;
    }
    if (testName.includes('Error messages clear')) {
      checklistResults.interactions.errorMessages = passed;
    }

    // Accessibility
    if (testName.includes('Color contrast passes WCAG AA')) {
      checklistResults.accessibility.colorContrast = passed;
    }
    if (testName.includes('Touch targets accessible')) {
      checklistResults.accessibility.touchTargets = passed;
    }
    if (testName.includes('Screen reader labels added')) {
      checklistResults.accessibility.screenReaders = passed;
    }
    if (testName.includes('Focus states visible')) {
      checklistResults.accessibility.focusStates = passed;
    }
    if (testName.includes('Text scalable')) {
      checklistResults.accessibility.textScaling = passed;
    }
    if (testName.includes('No accessibility violations')) {
      checklistResults.accessibility.violations = passed;
    }
  });

  // Generate checklist report
  const generateChecklist = (results) => {
    const sections = [
      {
        title: 'VISUAL CONSISTENCY',
        items: [
          { label: 'All track cards exactly 343x64px', passed: results.visualConsistency.trackCardDimensions },
          { label: 'All primary buttons exactly 44px height', passed: results.visualConsistency.buttonHeight },
          { label: 'All text uses exact typography scales', passed: results.visualConsistency.typography },
          { label: 'All colors match hex values exactly', passed: results.visualConsistency.colors },
          { label: 'All spacing follows 8px grid', passed: results.visualConsistency.spacing },
          { label: 'All shadows consistent', passed: results.visualConsistency.shadows },
        ]
      },
      {
        title: 'COMPONENT STATES',
        items: [
          { label: 'Default state implemented', passed: results.componentStates.default },
          { label: 'Active/pressed state implemented', passed: results.componentStates.active },
          { label: 'Disabled state implemented', passed: results.componentStates.disabled },
          { label: 'Loading state implemented', passed: results.componentStates.loading },
          { label: 'Error state implemented', passed: results.componentStates.error },
          { label: 'Empty state implemented', passed: results.componentStates.empty },
        ]
      },
      {
        title: 'RESPONSIVE BEHAVIOR',
        items: [
          { label: 'Components scale properly', passed: results.responsiveBehavior.scaling },
          { label: 'Text truncates with ellipsis', passed: results.responsiveBehavior.textTruncation },
          { label: 'Images maintain aspect ratio', passed: results.responsiveBehavior.aspectRatio },
          { label: 'Touch targets minimum 44x44px', passed: results.responsiveBehavior.touchTargets },
          { label: 'Safe area insets respected', passed: results.responsiveBehavior.safeAreas },
        ]
      },
      {
        title: 'INTERACTIONS',
        items: [
          { label: 'Press animations smooth', passed: results.interactions.animations },
          { label: 'Transitions 300ms ease-out', passed: results.interactions.transitions },
          { label: 'Gesture feedback immediate', passed: results.interactions.gestures },
          { label: 'Loading indicators visible', passed: results.interactions.loadingIndicators },
          { label: 'Error messages clear', passed: results.interactions.errorMessages },
        ]
      },
      {
        title: 'ACCESSIBILITY',
        items: [
          { label: 'Color contrast passes WCAG AA', passed: results.accessibility.colorContrast },
          { label: 'Touch targets accessible', passed: results.accessibility.touchTargets },
          { label: 'Screen reader labels added', passed: results.accessibility.screenReaders },
          { label: 'Focus states visible', passed: results.accessibility.focusStates },
          { label: 'Text scalable', passed: results.accessibility.textScaling },
          { label: 'No accessibility violations', passed: results.accessibility.violations },
        ]
      }
    ];

    let report = '# CoreTet Design System - QA Checklist Results\n\n';
    
    sections.forEach(section => {
      report += `## ${section.title}:\n`;
      section.items.forEach(item => {
        const checkbox = item.passed ? '☑️' : '❌';
        report += `${checkbox} ${item.label}\n`;
      });
      report += '\n';
    });

    // Summary
    const totalTests = sections.reduce((sum, section) => sum + section.items.length, 0);
    const passedTests = sections.reduce((sum, section) => 
      sum + section.items.filter(item => item.passed).length, 0
    );
    const passRate = Math.round((passedTests / totalTests) * 100);

    report += `## Summary\n`;
    report += `**${passedTests}/${totalTests} tests passed (${passRate}%)**\n\n`;

    if (passRate === 100) {
      report += '🎉 **All design consistency checks passed!**\n';
    } else {
      report += `⚠️  **${totalTests - passedTests} design consistency issues need attention**\n`;
    }

    report += `\nGenerated: ${new Date().toISOString()}\n`;

    return report;
  };

  // Write checklist results to file
  const checklistReport = generateChecklist(checklistResults);
  const outputDir = path.join(process.cwd(), 'test-results');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, 'design-checklist.md'),
    checklistReport
  );

  // Write JSON results for programmatic access
  fs.writeFileSync(
    path.join(outputDir, 'design-checklist.json'),
    JSON.stringify(checklistResults, null, 2)
  );

  console.log('\n📋 Design consistency checklist generated in test-results/');
  console.log(`📊 Overall pass rate: ${Math.round((Object.values(checklistResults).reduce((acc, section) => 
    acc + Object.values(section).filter(Boolean).length, 0) / 
    Object.values(checklistResults).reduce((acc, section) => 
      acc + Object.values(section).length, 0)) * 100)}%`);

  return testResults;
};