-> Google vision api is used to create backend
-> Need to add database and caching using redis.

To make project work

1) Clone the project
2) Open mongod shell and the connection should start on 127.0.0.1 i.e localhost.
3) Move insider project directory
run 
export GOOGLE_APPLICATION_CREDENTIALS="[PATH to credentials.json]"

then run 
node index.js