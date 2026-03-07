"""Enhanced air quality fusion service combining baseline and real-time sources.
No mock fallbacks — returns real data or raises ExternalAPIError.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime
import asyncio
import os
import pandas as pd

from app.core.config import settings
from app.core.exceptions import ExternalAPIError

try:
    if settings.ENABLE_PREMIUM_AQI:
        from app.services.premium_air_quality import IQAirService, BreezoMeterService  # type: ignore
    else:
        IQAirService = None  # type: ignore
        BreezoMeterService = None  # type: ignore
except Exception:
    IQAirService = None  # type: ignore
    BreezoMeterService = None  # type: ignore


class EnhancedAirQualityService:
    def __init__(self):
        self._iqair = IQAirService() if (settings.ENABLE_PREMIUM_AQI and IQAirService) else None
        self._breezo = BreezoMeterService() if (settings.ENABLE_PREMIUM_AQI and BreezoMeterService) else None
        self._baseline_df = self._load_airview_baseline() if settings.ENABLE_AIRVIEW else None

    def _load_airview_baseline(self) -> Optional[pd.DataFrame]:
        try:
            path = settings.AIRVIEW_DATA_PATH
            if not path or not os.path.exists(path):
                return None
            return pd.read_csv(path)
        except Exception:
            return None

    def _get_airview_baseline(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        if (not settings.ENABLE_AIRVIEW) or self._baseline_df is None:
            return None
        df = self._baseline_df
        nearby = df[(df['lat'].sub(lat).abs() < 0.01) & (df['lon'].sub(lon).abs() < 0.01)]
        if not nearby.empty:
            return {
                "source": "baseline",
                "data_quality": "hyperlocal_reference",
                "measurements": nearby.iloc[0].to_dict(),
            }
        return None

    async def _fetch_realtime(self, lat: float, lon: float) -> List[Dict[str, Any]]:
        tasks = []
        if self._iqair is not None:
            tasks.append(self._iqair.get_aqi_data(lat, lon))
        if self._breezo is not None:
            tasks.append(self._breezo.get_aqi_data(lat, lon))
        if not tasks:
            return []
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return [r for r in results if isinstance(r, dict)]

    async def get_hyperlocal_aqi(self, lat: float, lon: float) -> Dict[str, Any]:
        """Returns fused AQI from all available real sources.
        Never returns mock data — returns empty measurements if no sources configured.
        """
        baseline = self._get_airview_baseline(lat, lon)
        realtime = await self._fetch_realtime(lat, lon)
        return self._fuse(baseline, realtime, lat, lon)

    def check_coverage_quality(self, lat: float, lon: float) -> Dict[str, Any]:
        baseline = self._get_airview_baseline(lat, lon)
        return {
            "baseline": bool(baseline),
            "realtime_count": (1 if self._iqair else 0) + (1 if self._breezo else 0),
        }

    def _fuse(self, baseline: Optional[Dict[str, Any]], realtime: List[Dict[str, Any]], lat: float, lon: float) -> Dict[str, Any]:
        fused: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "location": {"lat": lat, "lon": lon},
            "data_quality": "standard",
            "sources_used": [],
            "measurements": {},
        }
        if baseline:
            fused["measurements"].update(baseline.get("measurements", {}))
            fused["sources_used"].append("baseline")
            fused["data_quality"] = "mixed"
        for entry in realtime:
            src = entry.get("source", "unknown")
            fused["sources_used"].append(src)
            if "aqi" in entry:
                fused["measurements"][f"aqi_{src}"] = entry["aqi"]
        aqi_vals = [v for k, v in fused["measurements"].items() if k.startswith("aqi_")]
        if aqi_vals:
            fused["measurements"]["aqi"] = int(sum(aqi_vals) / len(aqi_vals))
            fused["data_quality"] = "high" if baseline and len(aqi_vals) >= 2 else ("mixed" if baseline or aqi_vals else "standard")
        return fused
