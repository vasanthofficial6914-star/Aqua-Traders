/*
  FisherMan Hardware Bridge - Arduino Uno + HC-06 Bluetooth
  Sensors: Load Cell (HX711), Temperature (DS18B20), Salinity
  
  Format: W:4.2,T:29.5,S:31.0
  Baud Rate: 9600
*/

#include "HX711.h"

// HX711 wiring
const int LOADCELL_DOUT_PIN = 3;
const int LOADCELL_SCK_PIN = 2;

HX711 scale;
float calibration_factor = 420.5; 

void setup() {
  Serial.begin(9600);
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(calibration_factor);
  scale.tare(); 
}

void loop() {
  float weight = 0;
  float temperature = 28.5; // Default/Mock if sensor missing
  float salinity = 30.0;    // Default/Mock if sensor missing

  // 1. Read Weight (HX711)
  if (scale.is_ready()) {
    weight = scale.get_units(5);
    if (weight < 0) weight = 0;
  }

  // 2. Read Temperature / Salinity (Simulated for example)
  // In real hardware, use OneWire for DS18B20 or AnalogRead for Salinity
  temperature = 28.0 + (random(0, 20) / 10.0);
  salinity = 30.0 + (random(0, 50) / 10.0);

  // 3. Send formatted data: W:X,T:Y,S:Z
  Serial.print("W:");
  Serial.print(weight, 2);
  Serial.print(",T:");
  Serial.print(temperature, 1);
  Serial.print(",S:");
  Serial.println(salinity, 1);

  delay(1000); // 1 second update interval
}
