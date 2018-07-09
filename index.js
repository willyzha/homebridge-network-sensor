var Service, Characteristic;

var sys = require('sys')
var exec = require('child_process').exec;

module.exports = function(homebridge) {
  console.log("homebridge API version: " + homebridge.version);

  // Service and Characteristic are from hap-nodejs
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
 
  // For platform plugin to be considered as dynamic platform plugin,
  // registerPlatform(pluginName, platformName, constructor, dynamic), dynamic must be true
  homebridge.registerAccessory("homebridge-networkSensor", "NetworkSensor", NetworkSensorAccessory);
}

function NetworkSensorAccessory(log, config) {
  this.log = log;

  this.name = config["name"];
  this.mac = config["mac"];
  this.iface = config["iface"];
  this.updateInterval = config["update_interval"];
  this.detection_timeout = config["detection_timeout"];
  if (this.updateInterval > this.detection_timeout)
  {
      this.detection_timeout = this.updateInterval;
  }
  this.detectedOccupancyValue = false
  this.outputOccupancyValue = false
  this.timeSinceLastSeen = 0
}

//function puts(error, stdout, stderr) { sys.puts(stdout) }

NetworkSensorAccessory.prototype = {
  
  puts: function(error, stdout, stderr) { 
    //console.log(stdout)
    if (!stdout) {
      this.detectedOccupancyValue = false
      //console.log(this.detectedOccupancyValue)
      this.timeSinceLastSeen = this.timeSinceLastSeen + this.updateInterval
    } else {
      this.detectedOccupancyValue = true
      //console.log(this.detectedOccupancyValue)
      this.timeSinceLastSeen = 0
    }

    if ((this.detectedOccupancyValue == false && this.timeSinceLastSeen >= this.detection_timeout) || this.detectedOccupancyValue == true) {
        this.outputOccupancyValue = this.detectedOccupancyValue;
    }
    
    this.occupancyService.getCharacteristic(Characteristic.OccupancyDetected)
                          .setValue(this.outputOccupancyValue ? Characteristic.OccupancyDetected.OCCUPANCY_DETECTED : Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED);
    this.log.debug("Detected: " + this.detectedOccupancyValue + " Output: " + this.outputOccupancyValue + " timeSinceLastSeen: " + this.timeSinceLastSeen)
  },

  updateState: function () {
    // CODE TO CHECK IF MAC ADDRESS IS ON NETWORK

    exec("sudo arp-scan --interface="+ this.iface +" -l| grep -i " + this.mac, this.puts.bind(this));

    //this.log(this.detectedOccupancyValue )

    //this.occupancyService.getCharacteristic(Characteristic.OccupancyDetected)
    //                      .setValue(this.detectedOccupancyValue ? Characteristic.OccupancyDetected.OCCUPANCY_DETECTED : Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED);
  },

  getServices: function() {

    // you can OPTIONALLY create an information service if you wish to override
    // the default values for things like serial number, model, etc.
    this.informationService = new Service.AccessoryInformation();

    this.informationService
      .setCharacteristic(Characteristic.Name, this.name)
      .setCharacteristic(Characteristic.Manufacturer, "Homebridge")
      .setCharacteristic(Characteristic.Model, "Network Sensor")
      .setCharacteristic(Characteristic.SerialNumber, "WZ-18");
    
    this.occupancyService = new Service.OccupancySensor();
    
    if (this.updateInterval > 0) {
      this.timer = setInterval(this.updateState.bind(this), this.updateInterval);
    }
    
    return [this.informationService, this.occupancyService];
  }
};
