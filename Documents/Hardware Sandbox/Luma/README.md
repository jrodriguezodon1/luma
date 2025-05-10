# Luma - Smart Wake and Sleep Controller

Luma is a smart wake and sleep controller using an ESP32 microcontroller with LED control capabilities. It helps create a natural sunrise/sunset effect to improve your sleep quality and waking experience.

## Project Components

### ESP32 Controller Firmware
- Built with C++ and PlatformIO
- Multiple LED animation modes (sunrise, sunset, solid color, rainbow)
- JSON-based API for remote control via WiFi
- Gradual color transitions for sunrise/sunset effects
- Web server for handling API requests

### Frontend Web App
- Built with React/Vite
- Premium, mobile-first UI design
- 4-tab navigation (Sunset, Wake, Presets, Settings)
- Sophisticated animations and visual effects
- Local storage for persisting settings
- Support for color sequence presets with preview functionality
- PWA support for mobile installation

## Development Mode
The app includes a "dev mode" that allows testing without connecting to physical hardware.

## Getting Started

### Controller Setup
1. Open the controller folder in PlatformIO
2. Update WiFi credentials in `main.cpp`
3. Flash to your ESP32 device

### Web App Setup
1. Navigate to the app directory
2. Run `npm install`
3. Run `npm run dev` for development
4. Run `npm run build` for production

## Connect to the Device
1. Find your ESP32's IP address from your router or serial monitor
2. Enter the IP in the app's connection settings
3. Control your lights!

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