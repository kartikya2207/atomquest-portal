from datetime import date
from typing import Optional

def compute_score(uom_type: str, target: float, actual: Optional[float], target_date: Optional[date] = None, actual_date: Optional[date] = None) -> float:
    """Returns score percentage 0-100."""
    if actual is None and uom_type != "timeline":
        return 0.0

    if uom_type in ("numeric_min", "percent_min"):
        # Higher is better. e.g. Sales Revenue.
        if target == 0: return 0.0
        return min(100.0, (float(actual) / float(target)) * 100.0)

    if uom_type in ("numeric_max", "percent_max"):
        # Lower is better. e.g. Defect Rate, TAT, Cost.
        if actual == 0: return 100.0
        return min(100.0, (float(target) / float(actual)) * 100.0)

    if uom_type == "timeline":
        if actual_date is None or target_date is None:
            return 0.0
        if actual_date <= target_date:
            return 100.0
        return 0.0

    if uom_type == "zero":
        # Zero = success. e.g. Safety incidents.
        return 100.0 if float(actual) == 0 else 0.0

    return 0.0
