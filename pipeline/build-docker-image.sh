docker build -t data-ingestion-agent:latest .

docker tag data-ingestion-agent:latest adastradev/data-ingestion-agent:latest
docker push adastradev/data-ingestion-agent:latest
