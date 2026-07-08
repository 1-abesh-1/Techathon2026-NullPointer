#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>

#define DATABASE_URL ""

const char* ssid = "Wokwi-GUEST";
const char* password = "";

// GST is UTC + 4 hours. 4 hours * 3600 seconds = 14400 seconds offset
const long gmtOffset_sec = 14400;
const int daylightOffset_sec = 0; 

struct Device {
  int id;
  const char* name;
  const char* room;
  float maxWattage;
  int physicalPin;
  bool isSwitchedOn;
  String lastChanged; 
};

// 15 Devices organized by room structure
Device networkDevices[15] = {
  // Living Room 
  {1, "Fan 1", "Living Room", 60.0, 2, false, "Never"},
  {2, "Fan 2", "Living Room", 60.0, 4, false, "Never"},
  {3, "Light 1", "Living Room", 15.0, 5, false, "Never"},
  {4, "Light 2", "Living Room", 15.0, 12, false, "Never"},
  {5, "Light 3", "Living Room", 15.0, 13, false, "Never"},
  
  // WorkRoom1 
  {6, "Fan 1", "WorkRoom1", 60.0, 14, false, "Never"},
  {7, "Fan 2", "WorkRoom1", 60.0, 25, false, "Never"},
  {8, "Light 1", "WorkRoom1", 15.0, 26, false, "Never"},
  {9, "Light 2", "WorkRoom1", 15.0, 27, false, "Never"},
  {10, "Light 3", "WorkRoom1", 15.0, 32, false, "Never"},

  // WorkRoom2
  {11, "Fan 1", "WorkRoom2", 60.0, 33, false, "Never"},
  {12, "Fan 2", "WorkRoom2", 60.0, 15, false, "Never"},
  {13, "Light 1", "WorkRoom2", 15.0, 18, false, "Never"}, 
  {14, "Light 2", "WorkRoom2", 15.0, 19, false, "Never"}, 
  {15, "Light 3", "WorkRoom2", 15.0, 21, false, "Never"}  
};

HTTPClient httpClient;

// --- Energy Tracking Variables (Fixed for Precision) ---
double totalDailyEnergyWh = 0.0;             // Changed from float to double
unsigned long lastEnergyCalcTime = 0;
unsigned long lastFirebaseEnergyUpdate = 0;

const unsigned long energyCalcInterval = 1000; // Calculate energy exactly once every 1000ms (1 second)
const unsigned long energyUpdateInterval = 10000; 
int lastResetDay = -1;

void printDashboard();
void sendDataToFirebaseFast(String nodePath, String jsonPayload);
String getGSTTimestamp();
void calculateEnergyUsage();
void checkAndResetAt9AM();
void syncEnergyToFirebase();

void setup() {
  Serial.begin(115200);

  // Initialize all device GPIO pins as INPUT_PULLUP
  for (int i = 0; i < 15; i++) {
    pinMode(networkDevices[i].physicalPin, INPUT_PULLUP);
  }

  // Connect to the network
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500); 
  }
  Serial.println("\nConnected to Wi-Fi successfully!");

  // Initialize and fetch real time from network pool
  Serial.print("Synchronizing real-world time (GST)...");
  configTime(gmtOffset_sec, daylightOffset_sec, "pool.ntp.org", "time.nist.gov");
  
  struct tm timeinfo;
  while(!getLocalTime(&timeinfo)){
     Serial.print(".");
     delay(500);
  }
  Serial.println("\nTime Synced Successfully!");
  
  // --- INITIAL DATABASE RESET FOR ALL NODES ---
  Serial.println("\nInitializing Firebase Database nodes to standard OFF configurations...");
  for(int i = 0; i < 15; i++) {
    String applianceType = String(networkDevices[i].name).startsWith("Fan") ? "fans" : "lights";
    String nodePath = "rooms/" + String(networkDevices[i].room) + "/" + applianceType + "/" + String(networkDevices[i].name);
    
    String jsonPayload = "{\"isSwitchedOn\":false,\"watts\":0.0,\"lastChanged\":\"InitializationReset\"}";
    sendDataToFirebaseFast(nodePath, jsonPayload);
  }

  // Initialize daily energy node to 0.0 Wh on boot
  sendDataToFirebaseFast("dashboard/totalDailyEnergyWh", String(totalDailyEnergyWh, 2));
  
  lastEnergyCalcTime = millis();
  lastFirebaseEnergyUpdate = millis();
  
  printDashboard();
}

void loop() {
 // 1. Calculate dynamic energy consumption once every second (Prevents precision loss)
  if (millis() - lastEnergyCalcTime >= energyCalcInterval) {
    calculateEnergyUsage();
  }

  // 2. Check if it's 9:00 AM to reset the counter
  checkAndResetAt9AM();

  bool stateChanged = false;
  int changedDeviceIndex = -1;

  // Monitor physical inputs exclusively
  for (int i = 0; i < 15; i++) {
    bool currentPinState = (digitalRead(networkDevices[i].physicalPin) == HIGH);
    
    if (currentPinState != networkDevices[i].isSwitchedOn) {
      networkDevices[i].isSwitchedOn = currentPinState;
      networkDevices[i].lastChanged = getGSTTimestamp(); 
      stateChanged = true;
      changedDeviceIndex = i;
    }
  }

  // Process manual updates dynamically
  if (stateChanged && changedDeviceIndex != -1) {
    printDashboard();
    
    Device d = networkDevices[changedDeviceIndex];
    String applianceType = String(d.name).startsWith("Fan") ? "fans" : "lights";
    String nodePath = "rooms/" + String(d.room) + "/" + applianceType + "/" + String(d.name);
    
    float runtimeWatts = d.isSwitchedOn ? d.maxWattage : 0.0;
    
    String jsonPayload = "{";
    jsonPayload += "\"isSwitchedOn\":" + String(d.isSwitchedOn ? "true" : "false") + ",";
    jsonPayload += "\"watts\":" + String(runtimeWatts, 1) + ",";
    jsonPayload += "\"lastChanged\":\"" + d.lastChanged + "\"";
    jsonPayload += "}";
    
    sendDataToFirebaseFast(nodePath, jsonPayload);

    // Also immediately update the total energy reading when an event happens
    syncEnergyToFirebase();
  }
  
  // Periodic background update for energy accumulation if no devices are switching
  if (millis() - lastFirebaseEnergyUpdate >= energyUpdateInterval) {
    syncEnergyToFirebase();
  }

  delay(30); 
}

// Computes Wh consumption based on time delta passed since last check
// Computes Wh consumption based on a stable 1-second time delta
// Computes Wh consumption based on a stable 1-second time delta
void calculateEnergyUsage() {
  unsigned long currentMillis = millis();
  unsigned long elapsedTimeMs = currentMillis - lastEnergyCalcTime;
  lastEnergyCalcTime = currentMillis; // Update checkpoint immediately

  float currentTotalLoadW = 0.0;
  
  // Check the physical pins directly: LOW means the appliance is physically drawing power
  for (int i = 0; i < 15; i++) {
    if (digitalRead(networkDevices[i].physicalPin) == LOW) { 
      currentTotalLoadW += networkDevices[i].maxWattage;
    }
  }

  // High precision double math ensures the values actually pile up in the database
  double hoursElapsed = (double)elapsedTimeMs / 3600000.0;
  totalDailyEnergyWh += (currentTotalLoadW * hoursElapsed);
}

// Checks if the clock hit 9:00 AM to wipe the metric clean
void checkAndResetAt9AM() {
  struct tm timeinfo;
  if (getLocalTime(&timeinfo)) {
    // Mirroring your time offset strategy from getGSTTimestamp()
    time_t rawTime = mktime(&timeinfo);
    rawTime += 2 * 3600; 
    struct tm* adjustedTime = localtime(&rawTime);

    // If it is 9 AM and we haven't reset today yet
    if (adjustedTime->tm_hour == 9 && adjustedTime->tm_mday != lastResetDay) {
      totalDailyEnergyWh = 0.0;
      lastResetDay = adjustedTime->tm_mday;
      Serial.println("\n[SYSTEM] 9:00 AM Reached. Resetting daily Wh usage data.");
      syncEnergyToFirebase();
    }
  }
}

// Pushes the exact current Wh calculation value to Firebase
void syncEnergyToFirebase() {
  lastFirebaseEnergyUpdate = millis();
  sendDataToFirebaseFast("dashboard/totalDailyEnergyWh", String(totalDailyEnergyWh, 3));
}

String getGSTTimestamp() {
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    return "Error getting time";
  }
  
  time_t rawTime = mktime(&timeinfo);
  rawTime += 2*3600; 
  
  struct tm* adjustedTimeinfo = localtime(&rawTime);
  
  char timeStringBuff[30];
  strftime(timeStringBuff, sizeof(timeStringBuff), "%Y-%m-%d %H:%M:%S", adjustedTimeinfo);
  return String(timeStringBuff);
}

void sendDataToFirebaseFast(String nodePath, String jsonPayload) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Error: Connection lost");
    return;
  }
  
  String formattedPath = nodePath;
  formattedPath.replace(" ", "%20");
  String url = String(DATABASE_URL) + formattedPath + ".json";
  
  httpClient.begin(url);
  httpClient.addHeader("Content-Type", "application/json");
  httpClient.addHeader("Connection", "keep-alive"); 

  int httpResponseCode = httpClient.PUT(jsonPayload);

  if (httpResponseCode > 0) {
    Serial.print("[" + nodePath + "] Synced Node State Successfully. Code: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("[" + nodePath + "] Sync Error -> ");
    Serial.println(httpClient.errorToString(httpResponseCode).c_str());
  }

  httpClient.end();
}

void printDashboard() {
  float totalLoad = 0.0;
  Serial.println("\n============================================ LIVE DASHBOARD GRID (15 NODES) ============================================");
  Serial.println("   LIVING ROOM                  |   WorkRoom1                           |   WorkRoom2                        ");

  for (int row = 0; row < 5; row++) {
    Device lr = networkDevices[row];      
    Device bd = networkDevices[row + 5];  
    Device kt = networkDevices[row + 10]; 

    totalLoad += (lr.isSwitchedOn ? lr.maxWattage : 0) + 
                 (bd.isSwitchedOn ? bd.maxWattage : 0) + 
                 (kt.isSwitchedOn ? kt.maxWattage : 0);

    Serial.print("  "); Serial.print(lr.name); Serial.print(strlen(lr.name) < 6 ? "  : " : " : ");
    Serial.print(lr.isSwitchedOn ? "ON " : "OFF");
    Serial.print(" ("); Serial.print(lr.isSwitchedOn ? lr.maxWattage : 0.0, 0); Serial.print("W) ");
    Serial.print("\t      |   ");

    Serial.print(bd.name); Serial.print(strlen(bd.name) < 6 ? "  : " : " : ");
    Serial.print(bd.isSwitchedOn ? "ON " : "OFF");
    Serial.print(" ("); Serial.print(bd.isSwitchedOn ? bd.maxWattage : 0.0, 0); Serial.print("W) ");
    Serial.print("\t      |   ");

    Serial.print(kt.name); Serial.print(strlen(kt.name) < 6 ? "  : " : " : ");
    Serial.print(kt.isSwitchedOn ? "ON " : "OFF");
    Serial.print(" ("); Serial.print(kt.isSwitchedOn ? kt.maxWattage : 0.0, 0); Serial.println("W)");
  }
  Serial.println("--------------------------------------+---------------------------------------+---------------------------------------");
  Serial.print(" >> AGGREGATED SYSTEM LOAD DEMAND: "); Serial.print(totalLoad, 1); Serial.println(" W");
  Serial.print(" >> ACCUMULATED ENERGY (SINCE 9AM): "); Serial.print(totalDailyEnergyWh, 3); Serial.println(" Wh");
  Serial.println("========================================================================================================================");
}
