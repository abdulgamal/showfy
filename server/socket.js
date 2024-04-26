let io;

module.exports = {
    init: httpServer =>{
        io = require("socket.io")(httpServer, {path: `${process.env.subFolder}socket.io`});
        return io;
    }, 
    getIO: () => {
        if(!io){
            throw new Error("Soket.io not defined");
        }
        return io;
    }
}