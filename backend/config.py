import pathlib

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str = "postgresql+asyncpg://postgres:1234@localhost:5432/drone_delivery"
    DB_ECHO: bool = False

    # Nominatim reverse geocoding
    NOMINATIM_URL: str = "https://nominatim.openstreetmap.org/reverse"
    NOMINATIM_USER_AGENT: str = "DroneDeliveryApp/1.0"
    NOMINATIM_TIMEOUT: float = 10.0

    # Tax rates file (absolute path or relative to backend/)
    TAX_RATES_PATH: str = str(pathlib.Path(__file__).parent / "tax_rates.json")

    # Pagination defaults
    DEFAULT_LIMIT: int = 20
    MAX_LIMIT: int = 100

    MAX_UPLOAD_SIZE_MB: int = 10


settings = Settings()
