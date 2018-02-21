var Service, Characteristic;

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
  this.updateInterval = config["update_interval"];
}

NetworkSensorAccessory.prototype = {
  updateState: function () {
    var newOccupancyValue = True;
    // CODE TO CHECK IF MAC ADDRESS IS ON NETWORK
    this.occupancyService.getCharacteristic(Characteristic.OccupancyDetected)
                          .setValue(newOccupancyValue ? Characteristic.OccupancyDetected.OCCUPANCY_DETECTED : Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED);
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
