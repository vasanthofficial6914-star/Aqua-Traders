#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <HX711.h> // Include HX711 library

// Replace with your network credentials for the Access Point
const char* ssid = "SmartNet_Device";
const char* password = "smartnetpassword";

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

// HX711 circuit wiring
const int LOADCELL_DOUT_PIN = 16;
const int LOADCELL_SCK_PIN = 4;

// Buzzer wiring
const int BUZZER_PIN = 5;

HX711 scale;

// Calibration factor for the load cell (you will need to calibrate this in reality)
const float CALIBRATION_FACTOR = 420.5;

unsigned long lastTime = 0;
unsigned long timerDelay = 1000;

void notifyClients() {
  float weight = 0.0;
  float temperature = 28.5; 
  float salinity = 31.0;

  if (scale.is_ready()) {
    weight = scale.get_units(5);
    if (weight < 0) weight = 0;
  }
  
  // Real implemention would read from DS18B20 and Salinity sensor
  // For demo:
  temperature = 28.0 + (random(0, 20) / 10.0);
  salinity = 30.0 + (random(0, 50) / 10.0);

  // Create JSON document (Matches fisherman dashboard structure)
  StaticJsonDocument<200> doc;
  doc["weight"] = weight;
  doc["temperature"] = temperature;
  doc["salinity"] = salinity;
  doc["timestamp"] = "2026-03-07T10:00:00"; // Real implemention should use NTP client

  char jsonString[200];
  serializeJson(doc, jsonString);

  ws.textAll(jsonString);
  Serial.print("Broadcast: ");
  Serial.println(jsonString);
}


void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type,
             void *arg, uint8_t *data, size_t len) {
  switch (type) {
    case WS_EVT_CONNECT:
      Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
      break;
    case WS_EVT_DISCONNECT:
      Serial.printf("WebSocket client #%u disconnected\n", client->id());
      break;
    case WS_EVT_DATA:
    case WS_EVT_PONG:
    case WS_EVT_ERROR:
      break;
  }
}

void initWebSocket() {
  ws.onEvent(onEvent);
  server.addHandler(&ws);
}

void setup() {
  Serial.begin(115200);

  // Initialize HX711
  Serial.println("Initializing the scale");
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(CALIBRATION_FACTOR);
  scale.tare(); // Reset the scale to 0

  // Initialize Buzzer
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // Initialize Access Point
  Serial.println("Setting up Access Point...");
  WiFi.softAP(ssid, password);
  
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP); // This is usually 192.168.4.1

  initWebSocket();

  // Start server
  server.begin();
}

void loop() {
  ws.cleanupClients();
  
  if ((millis() - lastTime) > timerDelay) {
    notifyClients();
    lastTime = millis();
  }
}
