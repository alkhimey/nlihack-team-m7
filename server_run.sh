#! /bin/sh

until node server.js; do
	sleep 1;
done	
