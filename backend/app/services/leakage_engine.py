"""
Leakage Detection Engine — AquaSense
Dual flow-sensor pipeline leakage analysis.

Two sensors are placed at different points in a pipeline:
  Sensor 1: INLET (upstream)
  Sensor 2: OUTLET (downstream)

Water Loss = Inlet Volume − Outlet Volume

IMPORTANT: Small differences are NORMAL due to:
  - Sensor measurement tolerance (±2–5%)
  - Calibration drift
  - Measurement timing offsets

The configurable threshold accounts for these tolerances.
"""


def check_leakage(
    inlet_volume: float,
    outlet_volume: float,
    threshold_percent: float = 5.0,
    minimum_flow_litres: float = 1.0,
) -> dict:
    """
    Evaluate pipeline reading for possible leakage.

    Args:
        inlet_volume: Volume measured at inlet sensor (litres)
        outlet_volume: Volume measured at outlet sensor (litres)
        threshold_percent: Loss % above which a possible leak is flagged
        minimum_flow_litres: Minimum flow to avoid false positives at near-zero flow

    Returns:
        {
            difference: float,
            difference_percent: float,
            possible_leak: bool,
            status: "normal" | "possible_leak" | "critical_leak",
            note: str,
        }
    """
    difference = inlet_volume - outlet_volume

    # Guard: avoid division by zero and false positives at near-zero flow
    if inlet_volume < minimum_flow_litres:
        return {
            "difference": round(difference, 4),
            "difference_percent": 0.0,
            "possible_leak": False,
            "status": "normal",
            "note": "Flow below minimum threshold — no analysis performed",
        }

    difference_percent = (difference / inlet_volume) * 100

    # Determine status
    if difference_percent < 0:
        # Outlet > Inlet — measurement noise, treat as normal
        status = "normal"
        possible_leak = False
        note = "Outlet slightly exceeds inlet — within sensor tolerance"
    elif difference_percent < threshold_percent:
        status = "normal"
        possible_leak = False
        note = f"Difference {difference_percent:.1f}% is within tolerance ({threshold_percent}%)"
    elif difference_percent < 15.0:
        status = "possible_leak"
        possible_leak = True
        note = (
            f"Difference {difference_percent:.1f}% exceeds threshold ({threshold_percent}%). "
            "Possible leakage — inspect pipeline."
        )
    else:
        status = "critical_leak"
        possible_leak = True
        note = (
            f"Difference {difference_percent:.1f}% is critically high. "
            "Significant leakage likely — immediate inspection required."
        )

    return {
        "difference": round(difference, 4),
        "difference_percent": round(difference_percent, 2),
        "possible_leak": possible_leak,
        "status": status,
        "note": note,
    }
