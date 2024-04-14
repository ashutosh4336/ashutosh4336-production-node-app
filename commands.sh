sudo filebeat -e -c /etc/filebeat/filebeat.yml

sudo /usr/share/logstash/bin/logstash --path.settings /etc/logstash -f /etc/logstash/conf.d/my-app-logger.conf