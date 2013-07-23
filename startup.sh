#!/bin/bash
mkdir ~/mongodata
mongod -dbpath ~/mongodata
node foo.js
curl localhost:8000/starttest
firefox localhost:8000