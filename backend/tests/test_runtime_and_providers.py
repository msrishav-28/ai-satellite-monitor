from pathlib import Path
import sqlite3

import pytest
from alembic import command
from alembic.config import Config
from pydantic import ValidationError

import app.core.config
import app.core.database
from app.api.v1.endpoints.data_sources import data_sources_health
from app.core.config import Settings
from app.core.exceptions import ImproperlyConfigured
from app.core.runtime import build_provider_status, validate_runtime_environment
from app.providers.aqicn.client import AQICNClient
from app.providers.gee.auth import get_gee_auth_config
from app.providers.openweather.client import OpenWeatherClient
from app.providers.sentinel_hub.auth import build_token_request


def test_openweather_request_uses_appid() -> None:
    client = OpenWeatherClient(api_key='weather-key')
    url, params = client.build_request('weather', 12.3, 45.6)

    assert url.endswith('/weather')
    assert params['appid'] == 'weather-key'
    assert 'token' not in params


def test_aqicn_request_uses_token() -> None:
    client = AQICNClient(api_key='aqi-token')
    url, params = client.build_geo_request(12.3, 45.6)

    assert url.endswith('/feed/geo:12.3;45.6/')
    assert params == {'token': 'aqi-token'}


def test_sentinel_hub_uses_client_credentials_request() -> None:
    cfg = Settings(
        SENTINEL_HUB_CLIENT_ID='client-id',
        SENTINEL_HUB_CLIENT_SECRET='client-secret',
    )

    url, data = build_token_request(cfg)

    assert url.endswith('/oauth/token')
    assert data['grant_type'] == 'client_credentials'
    assert data['client_id'] == 'client-id'
    assert data['client_secret'] == 'client-secret'


def test_runtime_validation_rejects_mock_flags_in_staging() -> None:
    cfg = Settings(
        RUNTIME_ENV='staging',
        DATABASE_URL='postgresql://user:pass@localhost:5432/testdb',
        REDIS_URL='redis://localhost:6379/0',
        CELERY_BROKER_URL='redis://localhost:6379/0',
        CELERY_RESULT_BACKEND='redis://localhost:6379/1',
        FORCE_MOCK_WEATHER=True,
        FORCE_MOCK_SATELLITE=False,
        FORCE_MOCK_AQI=False,
        FORCE_MOCK_AI=False,
        FORCE_MOCK_IQAIR=False,
        FORCE_MOCK_BREEZOMETER=False,
        FORCE_MOCK_ENHANCED_AQI=False,
        FORCE_MOCK_MODELS=False,
    )

    with pytest.raises(ImproperlyConfigured):
        validate_runtime_environment(cfg)


def test_weather_cache_ttl_must_stay_at_least_ten_minutes() -> None:
    with pytest.raises(ValidationError):
        Settings(WEATHER_CACHE_TTL=599)


def test_provider_status_marks_unverified_providers_blocked() -> None:
    cfg = Settings(
        FORCE_MOCK_SATELLITE=False,
        FORCE_MOCK_WEATHER=False,
        FORCE_MOCK_AQI=False,
        GEE_PROJECT_ID='gee-project',
        GOOGLE_APPLICATION_CREDENTIALS='/tmp/gee.json',
        OPENWEATHER_API_KEY='weather',
        WAQI_API_KEY='aqi',
    )

    providers = build_provider_status(cfg)

    assert providers['openweather']['status'] == 'live'
    assert providers['aqicn']['status'] == 'live'
    assert providers['iqair']['status'] == 'blocked_pending_docs'
    assert providers['arcgis']['status'] == 'blocked_pending_docs'


@pytest.mark.asyncio
async def test_data_sources_health_exposes_provider_matrix() -> None:
    payload = await data_sources_health()

    assert 'providers' in payload
    assert 'google_earth_engine' in payload['providers']
    assert 'mock_flags' in payload


def test_gee_auth_requires_existing_credentials_file(tmp_path: Path) -> None:
    cred_file = tmp_path / 'service-account.json'
    cred_file.write_text('{}')
    cfg = Settings(GEE_PROJECT_ID='gee-project', GOOGLE_APPLICATION_CREDENTIALS=str(cred_file))

    auth = get_gee_auth_config(cfg)

    assert auth.project_id == 'gee-project'
    assert auth.credentials_path == str(cred_file)


def test_alembic_upgrade_creates_schema(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    db_path = tmp_path / 'schema.db'
    database_url = f'sqlite:///{db_path}'
    backend_root = Path(__file__).resolve().parents[1]

    monkeypatch.setattr(app.core.config.settings, 'DATABASE_URL', database_url)
    monkeypatch.setattr(app.core.database.settings, 'DATABASE_URL', database_url)

    alembic_config = Config(str(backend_root / 'alembic.ini'))
    alembic_config.set_main_option('script_location', str(backend_root / 'migrations'))

    command.upgrade(alembic_config, 'head')

    conn = sqlite3.connect(db_path)
    try:
        tables = {row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    finally:
        conn.close()

    assert 'alembic_version' in tables
    assert 'environmental_data' in tables
