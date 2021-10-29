module.exports = app => {
    return async (ctx, next) => {
        ctx.socket.emit('res', 'connected!');
        await next();
        // execute when disconnect.
        console.log('disconnection!');
    };
};

const tick = (id, msg) => {
    logger.debug('#tick', id, msg);
    socket.emit(id, msg);
    app.io.of('/').adapter.remoteDisconnect(id, true, err => {
        logger.error(err);
    });
};