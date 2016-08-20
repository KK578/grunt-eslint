'use strict';
const eslint = require('eslint');

module.exports = grunt => {
	grunt.registerMultiTask('eslint', 'Validate files with ESLint', function () {
		const opts = this.options({
			outputFile: false,
			quiet: false,
			maxWarnings: -1
		});

		if (this.filesSrc.length === 0) {
			grunt.log.warn('Could not find any files to validate');
			return true;
		}

		const formatter = eslint.CLIEngine.getFormatter(opts.format);

		if (!formatter) {
			grunt.warn(`Could not find formatter ${opts.format}`);
			return false;
		}

		const engine = new eslint.CLIEngine(opts);

		let report;
		try {
			report = engine.executeOnFiles(this.filesSrc);
		} catch (err) {
			grunt.warn(err);
			return false;
		}

		if (opts.fix) {
			eslint.CLIEngine.outputFixes(report);
		}

		let results = report.results;

		if (opts.quiet) {
			results = eslint.CLIEngine.getErrorResults(results);
		}

		const output = formatter(results);

		if (opts.outputFile) {
			grunt.file.write(opts.outputFile, output);
		} else if (output) {
			console.log(output);
		}

		const tooManyWarnings = opts.maxWarnings >= 0 && report.warningCount > opts.maxWarnings;

		if (report.errorCount === 0) {
			if (tooManyWarnings) {
				grunt.warn(`ESLint found too many warnings (maximum: ${opts.maxWarnings})`);
			} else {
				const fileCount = results.length;
				const fileCountStr = grunt.util.pluralize(fileCount, 'file/files');
				grunt.log.ok(`ESLint found no issues in ${fileCount} ${fileCountStr}`);
			}
		}

		return report.errorCount === 0;
	});
};
