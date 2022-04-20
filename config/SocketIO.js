
module.exports = function(io) {

    io.on('connection', function(socket) {

        socket.on('chats', function(data) {
            console.log('olk')
            socket.join(data);            
        });

    })
}