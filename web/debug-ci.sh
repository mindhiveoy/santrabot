#!/bin/sh
OUTPUT="$(git rev-parse HEAD)"
echo "${OUTPUT}"

curl --user ${CIRCLE_TOKEN}: \
    --request POST \
    --form revision="${OUTPUT}"\
    --form config=../.circleci/config.yml \
    --form notify=false \
        https://circleci.com/api/v1.1/project/github.com/mindhivefi/seoppi/tree/staging