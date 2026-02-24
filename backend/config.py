import pathlib

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/drone_delivery"

    # Nominatim reverse geocoding
    NOMINATIM_URL: str = "https://nominatim.openstreetmap.org/reverse"
    NOMINATIM_USER_AGENT: str = "DroneDeliveryApp/1.0"
    NOMINATIM_TIMEOUT: float = 10.0

    # Tax rates file (absolute path or relative to backend/)
    TAX_RATES_PATH: str = str(pathlib.Path(__file__).parent / "tax_rates.json")

    # Pagination defaults
    DEFAULT_LIMIT: int = 20
    MAX_LIMIT: int = 100

    class Config:
        env_file = ".env"


settings = Settings()
