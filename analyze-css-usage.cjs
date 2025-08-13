#!/usr/bin/env node

const { PurgeCSS } = require('purgecss');
const fs = require('fs').promises;
const path = require('path');

// For chalk v5 in CommonJS, we need to use dynamic import
let chalk;
(async () => {
  chalk = (await import('chalk')).default;
})();

async function analyzeCSSUsage() {
  // Ensure chalk is loaded
  if (!chalk) {
    chalk = (await import('chalk')).default;
  }

  console.log(chalk.blue('🔍 Starting CSS Usage Analysis...\n'));

  try {
    // Create output directory
    const outputDir = './css-analysis';
    await fs.mkdir(outputDir, { recursive: true });

    // Run PurgeCSS
    const purgeCSSResult = await new PurgeCSS().purge({
      ...require('./purgecss-analyze.config.cjs'),
      rejected: true,
      rejectedCss: true,
    });

    // Process results
    let totalOriginalSize = 0;
    let totalPurgedSize = 0;
    let totalRejectedSelectors = 0;
    const fileReports = [];

    for (const result of purgeCSSResult) {
      const originalSize = result.file
        ? (await fs.stat(result.file)).size
        : Buffer.byteLength(result.css || '', 'utf8');

      const purgedSize = Buffer.byteLength(result.css || '', 'utf8');
      const rejectedSelectors = result.rejected || [];

      totalOriginalSize += originalSize;
      totalPurgedSize += purgedSize;
      totalRejectedSelectors += rejectedSelectors.length;

      const fileReport = {
        file: result.file || 'inline-css',
        originalSize,
        purgedSize,
        reduction: (((originalSize - purgedSize) / originalSize) * 100).toFixed(2),
        rejectedCount: rejectedSelectors.length,
        rejectedSelectors: rejectedSelectors.slice(0, 50), // First 50 for preview
      };

      fileReports.push(fileReport);

      // Save rejected selectors to file
      if (rejectedSelectors.length > 0) {
        const fileName = path.basename(result.file || 'inline', '.css');
        await fs.writeFile(
          path.join(outputDir, `${fileName}-rejected.json`),
          JSON.stringify(rejectedSelectors, null, 2),
        );
      }

      // Save purged CSS
      if (result.css) {
        const fileName = path.basename(result.file || 'inline', '.css');
        await fs.writeFile(path.join(outputDir, `${fileName}-purged.css`), result.css);
      }
    }

    // Generate summary report
    const summaryReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: fileReports.length,
        totalOriginalSize: `${(totalOriginalSize / 1024).toFixed(2)} KB`,
        totalPurgedSize: `${(totalPurgedSize / 1024).toFixed(2)} KB`,
        totalReduction: `${(((totalOriginalSize - totalPurgedSize) / totalOriginalSize) * 100).toFixed(2)}%`,
        totalRejectedSelectors,
        averageReduction: `${(fileReports.reduce((acc, f) => acc + parseFloat(f.reduction), 0) / fileReports.length).toFixed(2)}%`,
      },
      files: fileReports,
      recommendations: generateRecommendations(fileReports, totalRejectedSelectors),
    };

    // Save summary report
    await fs.writeFile(
      path.join(outputDir, 'css-analysis-report.json'),
      JSON.stringify(summaryReport, null, 2),
    );

    // Generate HTML report
    const htmlReport = generateHTMLReport(summaryReport);
    await fs.writeFile(path.join(outputDir, 'css-analysis-report.html'), htmlReport);

    // Console output
    console.log(chalk.green('✅ Analysis Complete!\n'));
    console.log(chalk.yellow('📊 Summary:'));
    console.log(`   Total CSS Files: ${summaryReport.summary.totalFiles}`);
    console.log(`   Original Size: ${summaryReport.summary.totalOriginalSize}`);
    console.log(`   After Purge: ${summaryReport.summary.totalPurgedSize}`);
    console.log(`   Size Reduction: ${summaryReport.summary.totalReduction}`);
    console.log(`   Unused Selectors: ${summaryReport.summary.totalRejectedSelectors}`);
    console.log('\n' + chalk.blue(`📁 Full report saved to: ${outputDir}/`));
    console.log(`   - css-analysis-report.html (Visual Report)`);
    console.log(`   - css-analysis-report.json (Raw Data)`);
    console.log(`   - *-rejected.json (Unused selectors per file)`);
    console.log(`   - *-purged.css (Cleaned CSS files)`);
  } catch (error) {
    console.error(chalk.red('❌ Error during analysis:'), error);
    process.exit(1);
  }
}

function generateRecommendations(fileReports, totalRejected) {
  const recommendations = [];

  if (totalRejected > 1000) {
    recommendations.push({
      severity: 'high',
      message:
        'Large number of unused selectors detected. Consider removing unused CSS files or components.',
    });
  }

  const highReductionFiles = fileReports.filter((f) => parseFloat(f.reduction) > 70);
  if (highReductionFiles.length > 0) {
    recommendations.push({
      severity: 'medium',
      message: `${highReductionFiles.length} files have >70% unused CSS. Review: ${highReductionFiles.map((f) => path.basename(f.file)).join(', ')}`,
    });
  }

  const largeFiles = fileReports.filter((f) => f.originalSize > 50000);
  if (largeFiles.length > 0) {
    recommendations.push({
      severity: 'medium',
      message: `${largeFiles.length} large CSS files detected (>50KB). Consider splitting or optimizing.`,
    });
  }

  return recommendations;
}

function generateHTMLReport(report) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>CSS Usage Analysis Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .stat { background: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid #4CAF50; }
    .stat-value { font-size: 24px; font-weight: bold; color: #333; }
    .stat-label { color: #666; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 30px; }
    th { background: #4CAF50; color: white; padding: 12px; text-align: left; }
    td { padding: 12px; border-bottom: 1px solid #ddd; }
    tr:hover { background: #f5f5f5; }
    .reduction { font-weight: bold; }
    .high { color: #d32f2f; }
    .medium { color: #f57c00; }
    .low { color: #388e3c; }
    .recommendations { margin-top: 30px; }
    .recommendation { padding: 15px; margin: 10px 0; border-radius: 4px; }
    .recommendation.high { background: #ffebee; border-left: 4px solid #d32f2f; }
    .recommendation.medium { background: #fff3e0; border-left: 4px solid #f57c00; }
    .recommendation.low { background: #e8f5e9; border-left: 4px solid #388e3c; }
    .timestamp { color: #666; font-size: 14px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>CSS Usage Analysis Report</h1>
    <p class="timestamp">Generated: ${new Date(report.timestamp).toLocaleString()}</p>

    <div class="summary">
      <div class="stat">
        <div class="stat-value">${report.summary.totalFiles}</div>
        <div class="stat-label">CSS Files Analyzed</div>
      </div>
      <div class="stat">
        <div class="stat-value">${report.summary.totalOriginalSize}</div>
        <div class="stat-label">Original Size</div>
      </div>
      <div class="stat">
        <div class="stat-value">${report.summary.totalPurgedSize}</div>
        <div class="stat-label">After Optimization</div>
      </div>
      <div class="stat">
        <div class="stat-value">${report.summary.totalReduction}</div>
        <div class="stat-label">Size Reduction</div>
      </div>
      <div class="stat">
        <div class="stat-value">${report.summary.totalRejectedSelectors}</div>
        <div class="stat-label">Unused Selectors</div>
      </div>
      <div class="stat">
        <div class="stat-value">${report.summary.averageReduction}</div>
        <div class="stat-label">Average Reduction</div>
      </div>
    </div>

    <h2>File Analysis</h2>
    <table>
      <thead>
        <tr>
          <th>File</th>
          <th>Original Size</th>
          <th>Optimized Size</th>
          <th>Reduction</th>
          <th>Unused Selectors</th>
        </tr>
      </thead>
      <tbody>
        ${report.files
          .map(
            (file) => `
          <tr>
            <td>${path.basename(file.file)}</td>
            <td>${(file.originalSize / 1024).toFixed(2)} KB</td>
            <td>${(file.purgedSize / 1024).toFixed(2)} KB</td>
            <td class="reduction ${parseFloat(file.reduction) > 70 ? 'high' : parseFloat(file.reduction) > 40 ? 'medium' : 'low'}">
              ${file.reduction}%
            </td>
            <td>${file.rejectedCount}</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>

    ${
      report.recommendations.length > 0
        ? `
      <div class="recommendations">
        <h2>Recommendations</h2>
        ${report.recommendations
          .map(
            (rec) => `
          <div class="recommendation ${rec.severity}">
            ${rec.message}
          </div>
        `,
          )
          .join('')}
      </div>
    `
        : ''
    }

    <div class="footer">
      <p>This report was generated using PurgeCSS analysis. The results show potential CSS optimization opportunities.</p>
      <p>Note: Some selectors may be marked as unused but are actually needed for dynamic content or JavaScript interactions.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Run the analysis
analyzeCSSUsage();
