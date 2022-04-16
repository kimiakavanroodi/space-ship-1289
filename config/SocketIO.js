
module.exports = function(io) {

    io.on('connection', function(socket) {

        socket.on('chats', function(data) {
            socket.join(data);            
        });

    })
}