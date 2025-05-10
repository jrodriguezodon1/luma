#include <Arduino.h>
#include <FastLED.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <time.h>

// LED Config
#define LED_PIN     5      // Change this to your actual data pin
#define NUM_LEDS    30
CRGB leds[NUM_LEDS];

// WiFi Credentials
const char* ssid = "shage";
const char* password = "insanelyhappy";

// Web server setup
WebServer server(80);

// Mode definitions
enum Mode {
  MODE_OFF,
  MODE_SUNRISE,
  MODE_SUNSET,
  MODE_SOLID,
  MODE_RAINBOW
};

// Settings
struct Settings {
  Mode currentMode = MODE_OFF;
  uint8_t brightness = 100;
  uint8_t speed = 5;
  CRGB color = CRGB::White;
  uint32_t duration = 300; // Duration in seconds
  bool active = false;
} settings;

// Animation variables
unsigned long animationStartTime = 0;
unsigned long lastUpdate = 0;

// Send JSON response
void sendJsonResponse(int status, String message) {
  StaticJsonDocument<200> doc;
  doc["status"] = status;
  doc["message"] = message;
  
  String response;
  serializeJson(doc, response);
  
  server.send(200, "application/json", response);
}

// Send settings as JSON
void sendSettings() {
  StaticJsonDocument<400> doc;
  
  doc["mode"] = settings.currentMode;
  doc["brightness"] = settings.brightness;
  doc["speed"] = settings.speed;
  doc["duration"] = settings.duration;
  doc["active"] = settings.active;
  
  JsonObject color = doc.createNestedObject("color");
  color["r"] = settings.color.r;
  color["g"] = settings.color.g;
  color["b"] = settings.color.b;
  
  String response;
  serializeJson(doc, response);
  
  server.send(200, "application/json", response);
}

// Handle root request
void handleRoot() {
  server.send(200, "text/plain", "Luma Controller API\nUse /api endpoints to control the device.");
}

// Handle API status request
void handleStatus() {
  sendSettings();
}

// Handle API control requests
void handleControl() {
  if (server.hasArg("plain")) {
    StaticJsonDocument<400> doc;
    DeserializationError error = deserializeJson(doc, server.arg("plain"));
    
    if (error) {
      sendJsonResponse(400, "Invalid JSON");
      return;
    }
    
    // Update settings based on received JSON
    if (doc.containsKey("mode")) {
      settings.currentMode = doc["mode"];
      settings.active = settings.currentMode != MODE_OFF;
      animationStartTime = millis();
    }
    
    if (doc.containsKey("brightness")) {
      settings.brightness = doc["brightness"];
      FastLED.setBrightness(settings.brightness);
    }
    
    if (doc.containsKey("speed")) {
      settings.speed = doc["speed"];
    }
    
    if (doc.containsKey("duration")) {
      settings.duration = doc["duration"];
    }
    
    if (doc.containsKey("color")) {
      settings.color = CRGB(
        doc["color"]["r"] | 0,
        doc["color"]["g"] | 0,
        doc["color"]["b"] | 0
      );
    }
    
    sendJsonResponse(200, "Settings updated");
  } else {
    sendJsonResponse(400, "No data received");
  }
}

// LED Animation Functions
void runSunrise() {
  unsigned long elapsed = (millis() - animationStartTime) / 1000; // seconds
  uint32_t duration = settings.duration;
  
  if (elapsed > duration) {
    settings.currentMode = MODE_SOLID;
    settings.color = CRGB::White;
    return;
  }
  
  // Map time to brightness and color temperature
  uint8_t progress = map(elapsed, 0, duration, 0, 255);
  uint8_t bright = map(progress, 0, 255, 0, settings.brightness);
  
  // Start with deep red, move to warm yellow, end with white
  CRGB color;
  if (progress < 85) {
    color = CRGB(255, map(progress, 0, 85, 0, 70), 0); // Deep red to red-orange
  } else if (progress < 170) {
    color = CRGB(255, map(progress, 85, 170, 70, 150), map(progress, 85, 170, 0, 40)); // Orange to yellow
  } else {
    color = CRGB(255, map(progress, 170, 255, 150, 255), map(progress, 170, 255, 40, 255)); // Yellow to white
  }
  
  FastLED.setBrightness(bright);
  fill_solid(leds, NUM_LEDS, color);
  FastLED.show();
}

void runSunset() {
  unsigned long elapsed = (millis() - animationStartTime) / 1000; // seconds
  uint32_t duration = settings.duration;
  
  if (elapsed > duration) {
    settings.currentMode = MODE_OFF;
    settings.active = false;
    return;
  }
  
  // Map time to brightness and color temperature (reverse of sunrise)
  uint8_t progress = map(elapsed, 0, duration, 0, 255);
  uint8_t bright = map(progress, 0, 255, settings.brightness, 0);
  
  // Start with white, move to warm yellow, end with deep red
  CRGB color;
  if (progress < 85) {
    color = CRGB(255, map(progress, 0, 85, 255, 150), map(progress, 0, 85, 255, 40)); // White to yellow
  } else if (progress < 170) {
    color = CRGB(255, map(progress, 85, 170, 150, 70), map(progress, 85, 170, 40, 0)); // Yellow to orange
  } else {
    color = CRGB(255, map(progress, 170, 255, 70, 0), 0); // Orange to deep red
  }
  
  FastLED.setBrightness(bright);
  fill_solid(leds, NUM_LEDS, color);
  FastLED.show();
}

void runSolid() {
  FastLED.setBrightness(settings.brightness);
  fill_solid(leds, NUM_LEDS, settings.color);
  FastLED.show();
}

void runRainbow() {
  static uint8_t hue = 0;
  
  FastLED.setBrightness(settings.brightness);
  
  // Fill the LEDs with a rainbow
  fill_rainbow(leds, NUM_LEDS, hue, 255/NUM_LEDS);
  
  // Update the hue for next time through the loop
  hue += settings.speed;
  
  FastLED.show();
}

void setup() {
  Serial.begin(115200);

  // Init LEDs
  FastLED.addLeds<WS2812, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(settings.brightness);
  FastLED.clear();
  FastLED.show();

  // Init WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // Init web server
  server.on("/", handleRoot);
  server.on("/api/status", HTTP_GET, handleStatus);
  server.on("/api/control", HTTP_POST, handleControl);
  server.begin();
  Serial.println("HTTP server started");

  // Light up LEDs on boot
  settings.currentMode = MODE_RAINBOW;
  settings.active = true;
  animationStartTime = millis();
}

void loop() {
  server.handleClient();
  
  unsigned long currentMillis = millis();
  
  // Update animations at appropriate intervals
  if (currentMillis - lastUpdate > 30) { // ~33fps
    lastUpdate = currentMillis;
    
    // Run the appropriate animation based on mode
    if (settings.active) {
      switch (settings.currentMode) {
        case MODE_SUNRISE:
          runSunrise();
          break;
        case MODE_SUNSET:
          runSunset();
          break;
        case MODE_SOLID:
          runSolid();
          break;
        case MODE_RAINBOW:
          runRainbow();
          break;
        default:
          // Turn off if no valid mode
          FastLED.clear();
          FastLED.show();
          break;
      }
    } else {
      // Turn off LEDs if not active
      FastLED.clear();
      FastLED.show();
    }
  }
}
