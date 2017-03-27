#!/bin/bash
arg1=${1:-'n/a'}

function fix-swagger() {
    SERVICE_HOST=$(sls info --verbose| grep -Po "(?<=^ServiceEndpoint: https://).*")

    if [ -z "$SERVICE_HOST" ]
    then
        echo "Service hasn't been deployed yet, you'll need to redeploy one more time to get the correct service URL into the swagger schema."
    else
        sed -i -e 's~localhost:3000~'$SERVICE_HOST'~g' _gen/swagger/swagger.json
        sed -i -e 's/\"basePath\"/\"schemes\":\[\"https\"\], \"basePath\"/g' _gen/swagger/swagger.json
    fi
}

case $arg1 in
'fix-swagger')
    fix-swagger
    ;;

*)
  echo "scripts.sh will require some arguments"
  echo "fix-swagger - makes some tweaks to the swagger.json for deployment"
esac