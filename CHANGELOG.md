# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-09-30

### Added
- Initial release — microfrontend built from scratch to manage microfrontend-based plugins for the infrastructure management product.
- Gateway UI to display, enable, and disable pluggable microfrontends used by `saltbox-frontend-core`.
- Plugin registry view with status indicators and basic metadata (name, description, version).
- Enable/disable toggle with immediate visual feedback and persistence via API.
- Filtering and basic search for plugins list.
- Internationalization setup (EN/RU) and loading of locale files.
- Integration with Single-SPA for dynamic plugin lifecycle management.
- Base routing, layout, and navigation entry for the gateway module.
- Build and development configuration (webpack, dev server, production bundling).

### Changed
- Adjusted menu and navigation to include the Gateway entry with appropriate priority.

### Fixed
- Minor UI and localization issues discovered during initial setup.

---

This gateway microfrontend provides a centralized interface for managing pluggable microfrontends ("plugins") that extend `saltbox-frontend-core`. It focuses on visibility and control of plugins, including their discovery, display, and activation state.
