// AquaSense ESP32 Firmware Example
// Smart Water Management System - Flow Sensor Interface
//
// This is a REFERENCE IMPLEMENTATION for future hardware integration.
// The API endpoint used here is the SAME endpoint used by the demo simulator.
// Replace WIFI_SSID, WIFI_PASS, and API_HOST with your actual values.
//
// Hardware:
//   - ESP32 DevKit (any variant)
//   - YF-S201 Hall-Effect Flow Sensor (main + optional outlet for leak detection)
//   - Pull-up resistors on sensor signal pins
//
// Libraries required:
//   - WiFi.h (built-in)
//   - HTTPClient.h (built-in)
//   - ArduinoJson (install via Library Manager)

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ─────────────────────────────────────────────
// CONFIGURATION — Replace with your values
// ─────────────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASS     = "YOUR_WIFI_PASSWORD";
const char* API_HOST      = "http://YOUR_SERVER_IP:8000";
const char* DEVICE_ID     = "ESP32-H102";   // Must match device registered in AquaSense
const char* DEVICE_TOKEN  = "your-device-token-from-admin";

// ─────────────────────────────────────────────
// SENSOR PINS
// ─────────────────────────────────────────────
#define FLOW_SENSOR_1_PIN 18   // Inlet / Main sensor
#define FLOW_SENSOR_2_PIN 19   // Outlet sensor (for leakage detection)

// ─────────────────────────────────────────────
// SENSOR CALIBRATION
// YF-S201: ~7.5 pulses per litre (calibrate for your specific sensor)
// ─────────────────────────────────────────────
const float PULSES_PER_LITRE = 7.5;

// ─────────────────────────────────────────────
// GLOBALS
// ─────────────────────────────────────────────
volatile long pulseCount1 = 0;
volatile long pulseCount2 = 0;
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL_MS = 30000; // Send every 30 seconds

float totalLitres1 = 0.0;
float totalLitres2 = 0.0;

// ─────────────────────────────────────────────
// ISR — Interrupt Service Routines
// ─────────────────────────────────────────────
void IRAM_ATTR pulseISR1() { pulseCount1++; }
void IRAM_ATTR pulseISR2() { pulseCount2++; }

// ─────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  Serial.println("AquaSense ESP32 Firmware Starting...");

  // Sensor pins
  pinMode(FLOW_SENSOR_1_PIN, INPUT_PULLUP);
  pinMode(FLOW_SENSOR_2_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_1_PIN), pulseISR1, FALLING);
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_2_PIN), pulseISR2, FALLING);

  // Connect WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected. IP: " + WiFi.localIP().toString());
}

// ─────────────────────────────────────────────
// MAIN LOOP
// ─────────────────────────────────────────────
void loop() {
  unsigned long now = millis();

  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = now;

    // Capture pulse counts (disable interrupts briefly for atomic read)
    noInterrupts();
    long p1 = pulseCount1;
    long p2 = pulseCount2;
    pulseCount1 = 0;
    pulseCount2 = 0;
    interrupts();

    // Calculate flow
    float litres1 = (float)p1 / PULSES_PER_LITRE;
    float litres2 = (float)p2 / PULSES_PER_LITRE;
    float flowRate1 = (litres1 / (SEND_INTERVAL_MS / 1000.0)) * 60.0; // L/min

    totalLitres1 += litres1;
    totalLitres2 += litres2;

    Serial.printf("Sensor1: %.2f L (%.2f L/min) | Sensor2: %.2f L\n",
                  litres1, flowRate1, litres2);

    // Send main reading to AquaSense API
    sendReading(p1 + p2, flowRate1, totalLitres1, "MAIN");

    // Send pipeline reading (inlet + outlet) if using dual sensors
    if (FLOW_SENSOR_2_PIN >= 0) {
      sendPipelineReading(totalLitres1, totalLitres2);
    }
  }
}

// ─────────────────────────────────────────────
// SEND MAIN WATER READING
// POST /api/v1/readings
// ─────────────────────────────────────────────
void sendReading(long totalPulses, float flowRate, float volumeLitre, const char* sensorType) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected — skipping send");
    return;
  }

  HTTPClient http;
  String url = String(API_HOST) + "/api/v1/readings";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", DEVICE_TOKEN);

  StaticJsonDocument<256> doc;
  doc["device_id"]     = DEVICE_ID;
  doc["pulse_count"]   = totalPulses;
  doc["flow_rate_lpm"] = flowRate;
  doc["volume_litre"]  = volumeLitre;
  doc["sensor_type"]   = sensorType;

  String body;
  serializeJson(doc, body);

  int httpCode = http.POST(body);
  if (httpCode == 200 || httpCode == 201) {
    Serial.println("Reading sent successfully");
  } else {
    Serial.printf("Send failed, HTTP code: %d\n", httpCode);
  }
  http.end();
}

// ─────────────────────────────────────────────
// SEND PIPELINE READING (Dual Sensor / Leak Detection)
// POST /api/v1/pipeline-readings
// ─────────────────────────────────────────────
void sendPipelineReading(float inletVolume, float outletVolume) {
  HTTPClient http;
  String url = String(API_HOST) + "/api/v1/pipeline-readings";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", DEVICE_TOKEN);

  StaticJsonDocument<256> doc;
  doc["device_id"]      = DEVICE_ID;
  doc["inlet_volume"]   = inletVolume;
  doc["outlet_volume"]  = outletVolume;

  String body;
  serializeJson(doc, body);

  int httpCode = http.POST(body);
  Serial.printf("Pipeline reading: HTTP %d\n", httpCode);
  http.end();
}
