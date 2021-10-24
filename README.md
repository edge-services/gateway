
# edge-gateway service for Edge Computing

## Requirements

- All devices should be able to connect to the Gateway via BLE, LoRA, XBEE or OpenThread
- It should be able to connect to the Internet
- It should know what all devices it can handle
- It should save all data in raw format in local DB (DB on the Edge Device)
- It should have a Rule-engine service running
- Its API should be accessible via internet (might use NgRok)

## On Gateway Startup / Powered On

- Connect with Internet ( If Available)
- Start Gateway App + Backend DB
- Start NgRok Service 
- Fetch/Synchronize latest configurations for Gateway and Devices from the Cloud

## Gateway Docker

- Build docker image for Edge-Gateway

```

docker build -t sinny777/edge-gateway .

docker run --rm -it --name edge-gateway -p 9000:9000 \
    -e DB_CONNECTOR=mongodb \
    -e DB_HOST=localhost \
    -e DB_PORT=27017 \
    -e DB_USERNAME=admin \
    -e DB_PASSWORD=1SatnamW \
    -e DB_NAME=admin \
    -e SIMULATE=false \
    -v /dev/mem:/dev/mem \
    -v /sys/class/gpio:/sys/class/gpio \
    --privileged \
    sinny777/edge-gateway_arm64:1.0.0

sudo docker run --rm -it --name edge-gateway -p 9000:9000 \
    -e SIMULATE=false \
    -v /dev/mem:/dev/mem \
    -v /sys/class/gpio:/sys/class/gpio \
    --privileged \
    sinny777/edge-gateway_arm64:1.0.0


sudo docker run --privileged --rm -it -p 9000:9000 --name gateway-app -v /opt:/opt -v /tmp:/tmp -e TYPE=GATEWAY -e CLOUDANT_URL=https://34fd0b82-60b8-4d0d-9231-1f03135d4273-bluemix:75ae9c3507534f29ddfd175531aa780f889f4fc858a666dcacf572b097d08849@34fd0b82-60b8-4d0d-9231-1f03135d4273-bluemix.cloudant.com hukam/gateway-app
    
```

## Output Example: 

Radio data received: {"type":"HB_SENSOR","uniqueId":"SB_MICRO-3C71BF4340FC","temp":32.42,"hum":48.93848,"press":973.3259,"alt":337.8273}

## BLUETOOTH

```

hciconfig

sudo hciattach /dev/ttyAMA0 bcm43xx 921600 -

sudo hciconfig hci0 reset

sudo invoke-rc.d bluetooth restart

/etc/init.d/bluetooth restart


sudo hcitool -i hci0 lescan

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
