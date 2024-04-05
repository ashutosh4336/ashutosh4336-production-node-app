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

```
ssh-keygen -t rsa -b 4096 -C "ashu.juga99@gmail.com" -f ~/.ssh/id_rsa_ashutosh4336

Host github.com-ashutosh4336
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa_ashutosh4336

# GitHub account 2
Host github.com-ashutosh43361
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa_ashutosh43361
```
