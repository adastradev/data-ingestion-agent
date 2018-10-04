#!/bin/bash

docker_tag=$1

function refreshDockerImageDate {
    echo "Fetching docker image last update date..."
    # echo 'Fetching docker last updated value...'
    raw_image_date=`curl -s $docker_tag_uri | jq -r '.last_updated'`
    
    echo "Latest Docker Publish Date: $raw_image_date"

    # echo "Docker Image Last Updated: $raw_image_date"
    image_date=$(date -u -d "$raw_image_date" "+%s")
}

# Discover the initial dates of the commit and pub date of the tagged image in dockerhub
function prep {
    docker_tag_uri=https://registry.hub.docker.com/v2/repositories/adastradev/data-ingestion-agent/tags/$docker_tag/
    
    refreshDockerImageDate

    # Parse out the git image publish date and git commit date
    echo "Fetching Git Commit Date..."
    raw_git_date=`TZ=UTC git log -n 1 --date=iso-local --pretty=format:%cd | sed -e "s| |T|"`
    echo "Git Commit Date: $raw_git_date"

    # Couldn't figure out how to pipe to a formatter...
    raw_git_date=${raw_git_date::-6}
    git_date=$(date -u -d "$raw_git_date" "+%s")
}

function waitForNewImageToBuild {
    prep
    wait_interval_sec=5    
    
    # Wait until docker has a newer image
    echo "Checking for new image..."
    while [ $image_date -lt $git_date ]; 
    do        
        sleep 5
        # Check the latest change date of the image to see if the build's done
        refreshDockerImageDate
    done

    echo "A new image was published as of $raw_image_date"
}

waitForNewImageToBuild