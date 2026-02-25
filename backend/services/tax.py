import json
from typing import Any

import httpx

from config import settings

NYC_COUNTIES = {"Kings", "Queens", "New York", "Bronx", "Richmond"}

_TAX_RATES: dict[str, float] | None = None


def _load_tax_rates() -> dict[str, float]:
    global _TAX_RATES
    if _TAX_RATES is None:
        with open(settings.TAX_RATES_PATH, encoding="utf-8") as f:
            _TAX_RATES = json.load(f)
    return _TAX_RATES


async def get_county(lat: float, lon: float) -> str:
    """Call Nominatim reverse geocoding and return county name."""
    async with httpx.AsyncClient(timeout=settings.NOMINATIM_TIMEOUT) as client:
        response = await client.get(
            settings.NOMINATIM_URL,
            params={"lat": lat, "lon": lon, "format": "json"},
            headers={"User-Agent": settings.NOMINATIM_USER_AGENT},
        )
        response.raise_for_status()
        data = response.json()

    address: dict = data.get("address", {})
    county: str = (
        address.get("county", "")
        or address.get("state_district", "")
    )
    # Strip " County" suffix if present (e.g. "Albany County" -> "Albany")
    county = county.removesuffix(" County").strip()
    if not county:
        raise ValueError(
            f"Could not determine county for coordinates lat={lat}, lon={lon}. "
            "Location may be outside New York State."
        )
    return county


def get_tax_rate(county: str) -> tuple[str, float]:
    """
    Map county to a tax key and return (tax_key, rate).
    NYC boroughs are mapped to 'New York City'.
    """
    rates = _load_tax_rates()

    if county in NYC_COUNTIES:
        tax_key = "New York City"
        return tax_key, rates[tax_key]

    if county in rates:
        return county, rates[county]

    raise ValueError(f"Tax rate not found for county: '{county}'")


def calculate_tax(subtotal: float, rate: float) -> tuple[float, float]:
    """Return (tax_amount, total_amount) rounded to 2 decimal places."""
    tax_amount = round(subtotal * rate, 2)
    total_amount = round(subtotal + tax_amount, 2)
    return tax_amount, total_amount


async def calculate_order_tax(
    start_lat: float,
    start_lon: float,
    end_lat: float,
    end_lon: float,
    subtotal: float,
) -> dict[str, Any]:
    """
    Full pipeline: end coordinates -> county -> rate -> totals.
    Tax is calculated based on delivery location (end_lat/end_lon).
    Returns a dict ready to be stored in the DB.
    """
    county = await get_county(end_lat, end_lon)
    tax_key, rate = get_tax_rate(county)
    tax_amount, total_amount = calculate_tax(subtotal, rate)

    return {
        "start_lat": start_lat,
        "start_lon": start_lon,
        "end_lat": end_lat,
        "end_lon": end_lon,
        "subtotal": subtotal,
        "tax_amount": tax_amount,
        "total_amount": total_amount,
        "breakdown": {
            "county": county,
            "tax_key": tax_key,
            "rate": rate,
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "total_amount": total_amount,
        },
    }
