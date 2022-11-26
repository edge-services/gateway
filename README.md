
# edge-gateway service for Edge Computing

### Pre-requisites
    
This edge service (Gateway) depends on [flows](https://github.com/edge-services/flows) and [InfluxDB](https://github.com/edge-services/Influxdb) edge services, so make sure all are registered with IEAM Agent before hand.

## Register Gateway Service with IBM Edge Application Manager

    - Make sure IEAM Agent is installed and can access IEAM Hub
    - Go inside "horizon" folder
    - run following commands (CLI for openhorsizon)

```

export HZN_ORG_ID=myorg
export HZN_EXCHANGE_USER_AUTH=admin:HjWsfSKGB9XY3XhLQPOmqpJ6eLWN3U

export ARCH=arm64
eval $(hzn util configconv -f hzn.json) 

$hzn exchange service publish -f service.definition.json -P 
<!-- $hzn exchange service list -->
<!-- $hzn exchange service remove ${HZN_ORG_ID}/${SERVICE_NAME}_${SERVICE_VERSION}_${ARCH} -->

$hzn exchange service addpolicy -f service.policy.json ${HZN_ORG_ID}/${SERVICE_NAME}_${SERVICE_VERSION}_${ARCH}
<!-- $hzn exchange service listpolicy ${HZN_ORG_ID}/${SERVICE_NAME}_${SERVICE_VERSION}_${ARCH} -->
<!-- $hzn exchange service removepolicy ${HZN_ORG_ID}/${SERVICE_NAME}_${SERVICE_VERSION}_${ARCH} -->

$hzn exchange deployment addpolicy -f deployment.policy.json ${HZN_ORG_ID}/policy-${SERVICE_NAME}_${SERVICE_VERSION}
<!-- $hzn exchange deployment listpolicy ${HZN_ORG_ID}/policy-${SERVICE_NAME}_${SERVICE_VERSION} -->
<!-- $hzn exchange deployment removepolicy ${HZN_ORG_ID}/policy-${SERVICE_NAME}_${SERVICE_VERSION} -->

```



## Register the Edge Node

```

export HZN_ORG_ID=myorg
export HZN_EXCHANGE_USER_AUTH=admin:HjWsfSKGB9XY3XhLQPOmqpJ6eLWN3U

$hzn register --policy gateway.policy.json

$hzn eventlog list -f

$hzn service log -f gateway
 
$hzn unregister -f

$ hzn version
$ hzn agreement list
$ hzn node list -v
$ hzn exchange user list

hzn --help
hzn node --help
hzn exchange pattern --help

```

## Gateway Docker (Standalone - for testing)

- Create an .env file 
- Run docker image for Edge-Gateway

```

sudo docker run --rm -it --name edge-gateway -p 9000:9000 \
    --env-file .env \
    --net host \
    -v /dev/mem:/dev/mem \
    -v /sys/class/gpio:/sys/class/gpio \
    --privileged \
    sinny777/edge-gateway_arm64:1.0.0

sudo docker run --rm -it --name edge-gateway -p 9000:9000 \
    --env-file .env \
    --net host \
    -v /dev/mem:/dev/mem \
    -v /sys/class/gpio:/sys/class/gpio \
    --privileged \
    2ce13247dee6    
    
```

## Output Example: 

Radio data received: {"type":"HB_SENSOR","uniqueId":"SB_MICRO-3C71BF4340FC","temp":32.42,"hum":48.93848,"press":973.3259,"alt":337.8273}

## BLUETOOTH

To fix issue connecting to BLE devices
You can install it with:

  - [download file](https://drive.google.com/file/d/1DVOtBjrsoR2NhwEBVn3ei0sv-xTIBCxR/view)

```

$ sudo mv /lib/firmware/brcm/BCM4345C0.hcd{,.bak}
$ sudo cp BCM4345C0_003.001.025.0171.0339.hcd /lib/firmware/brcm/BCM4345C0.hcd

```

Reverting to the original is simply a case of:

```
$ sudo mv /lib/firmware/brcm/BCM4345C0.hcd{.bak,}

```

    - Other references (thhat may help)

```

sudo nano /etc/bluetooth/main.conf
# Restricts all controllers to the specified transport. Default value
# is "dual", i.e. both BR/EDR and LE enabled (when supported by the HW).
# Possible values: "dual", "bredr", "le"
ControllerMode = dual


sudo setcap cap_net_raw+eip $(eval readlink -f $(which node))

hciconfig

sudo hciattach /dev/ttyAMA0 bcm43xx 921600 -

sudo hciconfig hci0 reset

sudo invoke-rc.d bluetooth restart

/etc/init.d/bluetooth restart


sudo hcitool -i hci0 lescan

sudo systemctl status bluetooth
sudo busctl monitor org.bluez

```

## InfluxDB

```
docker run -p 8086:8086 \
      --name influxdb2 \
      -v influxdb2:/var/lib/influxdb2 \
      -v $PWD/influxdb2:/var/lib/influxdb2 \
      -v $PWD/config:/etc/influxdb2 \
      -e DOCKER_INFLUXDB_INIT_MODE=upgrade \
      -e DOCKER_INFLUXDB_INIT_USERNAME=sinny777 \
      -e DOCKER_INFLUXDB_INIT_PASSWORD=1SatnamW \
      -e DOCKER_INFLUXDB_INIT_ORG=IBM \
      -e DOCKER_INFLUXDB_INIT_BUCKET=smartthings \
      influxdb:2.0

```

'/var/lib/influxdb/meta/meta.db' does not exist


## Refrences

- [Edge Computing](https://github.com/sinny777/edge-computing)
- [Rule Engine](https://github.com/cachecontrol/json-rules-engine)
