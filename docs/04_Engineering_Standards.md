# Engineering Standards & Team Onboarding Guide

To maintain code quality and scale the engineering team smoothly, we enforce the following development standards.

---

## 1. Pull Request (PR) & Code Review Standards
* **PR Size:** PRs must be under 300 lines of code changes to ensure thorough review capability.
* **Test Requirement:** Every PR adding or modifying features must include corresponding Jest unit/integration tests.
* **Approval Gate:** Require at least 1 peer approval before merging into `main`.

## 2. Automated Quality Gates (CI/CD)
* **Pre-commit Hooks:** Enforce Husky + lint-staged to run ESLint and Prettier locally before commits.
* **Automated CI Pipelines:** Pull Requests automatically trigger GitHub Actions to run `npm test` and build checks.

## 3. Team Alignment Strategy
To onboard resistant or less experienced team members:
* **Pair Programming:** Conduct weekly pair programming sessions during migration phases.
* **Non-blocking Guidelines:** Introduce new linting rules gradually as non-blocking warnings before making them strict CI errors.
* **Demonstrate Value:** Show how automated tests reduce manual QA time and prevent late-night deployment hotfixes.