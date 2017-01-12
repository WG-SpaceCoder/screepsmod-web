var libPath = 'node_modules/screepsmod-web/lib/';

module.exports = function(config) {

    function updateLeaderboards() {
        config.common.storage.db.users.find().then(data => {
            var result = [];
            var users = {};
            for (var user of data) {
                if (!user.gcl) continue;

                // result.push({ username: user.username, gcl: Number(user.gcl) });
                result.push({ username: user.username, gcl: Number(user.gcl), bot: user.bot, cpuAvailable: user.cpuAvailable, cpu: user.cpu, lastUsedCpu: user.lastUsedCpu, active: user.active });
                console.log(Object.keys(user));
                users[user._id] = {
                    username: user.username,
                    badge: user.badge,
                    gcl: user.gcl
                }
            }

            result.sort((a, b) => b.gcl - a.gcl);

            var rank = 1;
            for (var entry of result) {
                entry.rank = rank.toString();
                rank++;
            }

            var data = {
                list: result,
                count: result.length,
                users: users
            };
            io.sockets.emit('broadcast', JSON.stringify(result));
        });
    }

    console.log(JSON.stringify(config.common.storage.pubsub));
    console.log()
    var app = require('express')();
    var http = require('http').Server(app);
    var io = require('socket.io')(http);

    // console.log('SOCKETS: ' + JSON.stringify(agent.freeSockets));

    app.get('/', function(req, res) {
        res.sendfile(libPath + 'index.html');
    });


    io.on('connection', function(socket) {
        console.log('A user connected');


        socket.on('disconnect', function() {
            console.log('A user disconnected');
        });
    });

    http.listen(3000, function() {
        console.log('listening on *:3000');
    });

    // if(config.cli) {
    //     config.common.storage.pubsub.publish(config.common.storage.pubsub.keys.ROOMS_DONE, (gameTime) =>
    //         updateLeaderboards()
    //     );
    // }


    let bootInter = setInterval(() => {
        if (!config.common.storage.pubsub.publish) return;
        clearInterval(bootInter);
        config.common.storage.pubsub.subscribe(config.common.storage.pubsub.keys.ROOMS_DONE, (gameTime) => updateLeaderboards());
    }, 100);

    // setInterval(updateLeaderboards, 1000); // TODO: driver.config.mainLoopCustomStage()
}
