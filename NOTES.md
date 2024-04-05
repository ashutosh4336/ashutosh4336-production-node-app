```bash
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  --network prometheus-net \
  -v prometheus-data:/prometheus \
  -v ./prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

```yaml
     image: prom/alertmanager
   alertmanager:
     container_name: alertmanager
     command:
       - '--config.file=/etc/alertmanager/config.yml' # Specify the configuration file
     ports:
       - '9093:9093' # Expose Alertmanager port
     volumes:
       - './alertmanager/config.yml:/etc/alertmanager/config.yml' # Mount Alertmanager configuration file
       - './alertmanager/data:/alertmanager' # Mount Alertmanager data directory for persistence
     restart: always
```
