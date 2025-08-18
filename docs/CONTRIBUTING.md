## Contributing Guidelines

### Principles
1. Mock-first stability: Never break existing endpoints if a new external source fails—provide a fallback.
2. Incremental PRs: Prefer small, focused changes (single service enhancement / dataset integration per PR).
3. Consistent schemas: Changing response shapes is a breaking change—version or extend instead.
4. Observability: Add logging around new external calls; avoid silent failures.
5. Security: No secrets in code or commits; use `.env` entries and update docs where needed.

### Branch & Commit Style
* Branch naming: `feat/<area>-<short-description>` or `fix/<area>-<issue>`
* Conventional commits recommended (e.g., `feat: add worldcover land cover histogram`)

### Adding a New Data Source
1. Create or extend a service module in `backend/app/services/`.
2. Add any new env vars to `Settings` in `core/config.py` with sane defaults (`None` / `False`).
3. Implement live logic guarded by availability + graceful exception handling.
4. Provide `_get_mock_*` fallback returning schema-aligned data.
5. Expose health info additions via `/api/v1/data-sources/health` (if applicable).
6. Update `docs/DATA_SOURCES.md` with dataset, env vars, and decision logic.

### Adding a Hazard Model
1. Implement inference function or wrapper in `app/ml/`.
2. Register it inside `model_manager` (if a registry pattern emerges).
3. Add a feature flag or reuse `FORCE_MOCK_MODELS` to allow disabling.
4. Extend `hazard_models.py` to include new hazard; update schemas if needed (avoid breaking existing fields).
5. Document in README and Architecture docs.

### Testing (Roadmap)
While tests are not yet present, preferred future layout:
```
backend/tests/
	services/test_environmental.py
	services/test_satellite.py
	api/test_health.py
	fixtures/
```
* Use flags to force mocks for deterministic assertions.

### Performance Considerations
* Limit Earth Engine reduceRegion scale to minimal acceptable resolution.
* Cache expensive computations when consistent across similar AOIs / short time spans.

### Code Style
* Python: Follow PEP8 (black/ruff can be introduced later).
* TypeScript: Use existing ESLint / tsconfig defaults.

### Logging
* Use `logger.info` for mode changes (mock→live), `logger.warning` for fallbacks, `logger.error` with context (include dataset, AOI size) for failures.

### PR Checklist (Self-Review)
- [ ] Fallback provided for any external call
- [ ] Docs updated (DATA_SOURCES / README if user-visible)
- [ ] Health endpoint updated (if new source)
- [ ] No secrets committed
- [ ] Flags respected (if applicable)

### Getting Help
Open a GitHub issue with label `question` or `data-source` for integration discussions.

---
Thanks for contributing to a resilient, extensible environmental intelligence platform.
