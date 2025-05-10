# Luma - Smart Wake & Sleep Controller

A Wi-Fi-connected smart alarm system using an ESP32 to control LED lights for simulating sunset wind-downs and sunrise wakeups, all configurable via a progressive web app (PWA).

## Project Structure

- `controller/` - ESP32 firmware (C++ with PlatformIO)
- `app/` - Frontend React app (Vite)

## Features

- **LED Control Modes**:
  - Sunrise simulation: gradually brightens from red to yellow to white
  - Sunset simulation: gradually dims from white to yellow to red
  - Solid color: displays a single user-selected color
  - Rainbow mode: cycles through colors

- **WiFi Connectivity**: Control the system over your local network
- **Responsive Web App**: Configure and control the system from any device

## Setup Instructions

### Hardware Requirements

- ESP32 development board (ESP-WROOM-32)
- WS2812B LED strip (or similar)
- 5V power supply for LEDs
- Basic wiring components

### Controller Setup

1. Clone this repository
2. Open the `controller` folder in PlatformIO
3. Update WiFi credentials in `controller/src/main.cpp`
4. Connect your ESP32:
   - Connect the data pin of the LED strip to GPIO5 (or update the pin in the code)
   - Connect power and ground accordingly
5. Upload the firmware to your ESP32

### Web App Setup

1. Navigate to the `app` directory
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Build for production:
   ```
   npm run build
   ```

## Usage

1. Power on your ESP32 controller
2. Connect to the same WiFi network as the controller
3. Open the web app in your browser
4. Enter the ESP32's IP address (displayed in the serial monitor when the ESP32 boots)
5. Control your lights using the interface

## Future Enhancements

- Sound effects via DFPlayer Mini or I2S
- Time-based scheduling and NTP synchronization
- OTA (Over-The-Air) updates
- Additional animation modes

## License

MIT 