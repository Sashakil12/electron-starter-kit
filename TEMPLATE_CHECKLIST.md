# GitHub Template Repository Checklist

Use this checklist to ensure your repository is properly configured as a GitHub template.

## Required Files

- [x] README.md (with template usage instructions)
- [x] LICENSE file
- [x] CONTRIBUTING.md
- [x] CODE_OF_CONDUCT.md
- [x] .github/PULL_REQUEST_TEMPLATE.md
- [x] .github/ISSUE_TEMPLATE/ (with issue templates)
- [x] .github/workflows/ (with GitHub Actions workflows)
- [x] .gitignore

## Package Configuration

- [x] package.json includes "template" keyword
- [x] package.json includes repository information
- [x] package.json includes author and license fields

## Template-Specific Files

- [x] TEMPLATE_README.md (for users to replace their README with)
- [x] SECURITY.md
- [x] .npmrc (for consistent package installation)

## Testing

- [x] Run `node tools/template-check.js` to verify configuration
- [x] Run `node tools/test-template-usage.js` to test template usage

## GitHub Configuration

After pushing to GitHub:

- [ ] Go to repository Settings
- [ ] Scroll to "Template repository" section
- [ ] Check the box "Template repository"

## Additional Considerations

- [ ] Ensure all links in documentation are valid
- [ ] Test the template with a fresh clone
- [ ] Verify GitHub Actions workflows run correctly
- [ ] Check that issue templates work properly
