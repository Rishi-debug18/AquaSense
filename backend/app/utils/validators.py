def validate_reading_values(pulse_count, flow_rate, volume):
    if pulse_count < 0 or flow_rate < 0 or volume < 0:
        raise ValueError("Values cannot be negative")
    return True
