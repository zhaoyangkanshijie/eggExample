module.exports = app => {
    
    const jsonp = app.jsonp();
    const { router, controller, io } = app;

    const gzip = app.middleware.gzip({ threshold: 1024 });
    
    router.get('/', gzip, controller.home.index);
    router.post('/post', gzip, controller.home.post);
    router.get('/api/posts/:id', jsonp, controller.post.show);
    router.get('/user/:id', controller.user.info);
    router.get('/user', controller.user.get);
    router.get('/httpclient', controller.home.httpclient);

    router.resources('topics', '/api/v2/topics', controller.topics);

    //io.of('/').route('server', io.controller.home.server);
    io.of('/').route('exchange', io.controller.nsp.exchange);
};