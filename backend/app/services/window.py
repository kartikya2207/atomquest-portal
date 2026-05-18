from datetime import date
from typing import Optional
from app.models.cycle import Cycle

def get_current_quarter_window(cycle: Cycle, current_date: date) -> Optional[str]:
    """Returns 'q1', 'q2', 'q3', or 'q4' if today is within an open window, else None."""
    if cycle.q1_open <= current_date <= cycle.q1_close:
        return "q1"
    if cycle.q2_open <= current_date <= cycle.q2_close:
        return "q2"
    if cycle.q3_open <= current_date <= cycle.q3_close:
        return "q3"
    if cycle.q4_open <= current_date <= cycle.q4_close:
        return "q4"
    return None
