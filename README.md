# homebridge-network-sensor

[HomeBridge](http://github.com/nfarina/homebridge) module to detect if a device is connected to the network.

### Requires arp-scan to be installed

Sample config:

```
{
    "accessories": [
        {
            "accessory": "NetworkSensor",
            "name": "iPhoneX",
            "mac": "B0:19:C6:C5:AC:1E",
            "iface": "wlan0",
            "update_interval": 10000,
            "detection_timeout": 120000 
        }
    ]
}
```
