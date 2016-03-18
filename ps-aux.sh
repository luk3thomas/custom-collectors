API=http://localhost:4567/
while (true); do
    data=$(
        ps aux |
        sed 1d |
        sed 's/ [ ]*/|/g' |
          awk -F '|' '{
            _ = "\42"
            cpu    = _ "value"  _ ":" _ $3 / 100 _
            memory = _ "value"  _ ":" _ $4 / 100 _
            source = _ "source" _ ":" _ $2 _

            if ( $3 != "0.0" ) {
                print "{ " _ "mac.process.cpu" _ ":    {" cpu ", " source "} },"
            }
            if ( $4 != "0.0" ) {
                print "{ " _ "mac.process.memory" _ ": {" memory ", " source "} },"
            }
          }' |
          tr -d '\n' |
          sed \
              -e "s/,$/]/" \
              -e "s/^/[/" \
              -e "s/ //g" \
    )
    curl -X POST $API -H 'Content-Type: application/json' -d $data
    echo "Sent ..."
    sleep 30
done
