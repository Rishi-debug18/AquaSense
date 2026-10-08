export interface User { id: string; email: string; role: 'admin'|'household'; full_name: string; }
export interface Area { id: string; name: string; description?: string; }
export interface Household { id: string; house_number: string; area_id: string; resident_count: number; area?: Area; }
export interface WaterReading { id: string; household_id: string; flow_rate_lpm: number; volume_litre: number; reading_ts: string; }
export interface SlabBreakdown { range: string; units: number; rate: number; amount: number; }
export interface Bill { id: string; household_id: string; bill_number: string; billing_period: string; total_consumption_litre: number; total_amount: number; status: 'DRAFT'|'GENERATED'|'SENT'|'PAID'|'OVERDUE'|'CANCELLED'; slab_breakdown: SlabBreakdown[]; created_at: string; }
export interface Alert { id: string; household_id?: string; alert_type: string; severity: 'LOW'|'NORMAL'|'HIGH'|'URGENT'; title: string; message: string; is_read: boolean; created_at: string; }
export interface Message { id: string; household_id?: string; title: string; body: string; priority: 'LOW'|'NORMAL'|'HIGH'|'URGENT'; is_read: boolean; created_at: string; }
export interface Device { id: string; device_code: string; household_id?: string; status: 'ONLINE'|'OFFLINE'; last_seen: string; firmware_version: string; }
export interface AuthResponse { access_token: string; token_type: string; user: User; }
export interface Pipeline { id: string; pipeline_code: string; area_id: string; inlet_sensor_id: string; outlet_sensor_id: string; max_difference_threshold: number; }
