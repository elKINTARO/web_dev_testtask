import math


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on Earth using the Haversine formula.
    
    Args:
        lat1, lon1: Starting point coordinates (degrees)
        lat2, lon2: Ending point coordinates (degrees)
    
    Returns:
        Distance in kilometers (rounded to 2 decimal places)
    """

    R = 6371.0
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    
    distance = R * c
    return round(distance, 2)


def estimate_flight_time(distance_km: float, speed_kmh: float = 60.0) -> float:
    """
    Calculate estimated flight time based on distance and drone speed.
    
    Args:
        distance_km: Distance in kilometers
        speed_kmh: Average drone speed in km/h (default: 60 km/h)
    
    Returns:
        Estimated flight time in minutes (rounded to 2 decimal places)
    """
    if distance_km <= 0:
        return 0.0
    
    time_hours = distance_km / speed_kmh
    time_minutes = time_hours * 60
    return round(time_minutes, 2)
