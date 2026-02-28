import math


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Great-circle distance between two GPS points (Haversine formula).
    Returns distance in kilometers, rounded to 2 decimal places.
    """
    R = 6371.0

    lat1_r = math.radians(lat1)
    lon1_r = math.radians(lon1)
    lat2_r = math.radians(lat2)
    lon2_r = math.radians(lon2)

    dlat = lat2_r - lat1_r
    dlon = lon2_r - lon1_r

    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))

    return round(R * c, 2)


def estimate_flight_time(distance_km: float, speed_kmh: float = 60.0) -> float:
    """
    Estimated drone flight time in minutes at given speed (default 60 km/h).
    Returns 0.0 for non-positive distances.
    """
    if distance_km <= 0:
        return 0.0
    return round((distance_km / speed_kmh) * 60, 2)
