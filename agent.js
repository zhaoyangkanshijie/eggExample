module.exports = agent => {
    class ClusterStrategy extends agent.ScheduleStrategy {
        start() {
            // 订阅其他的分布式调度服务发送的消息，收到消息后让一个进程执行定时任务
            // 用户在定时任务的 schedule 配置中来配置分布式调度的场景（scene）
            agent.mq.subscribe(this.schedule.scene, () => this.sendOne());
        }
    }
    agent.schedule.use('cluster', ClusterStrategy);
};

// class AppBootHook {
//     constructor(app) {
//       this.app = app;
//     }
  
//     configWillLoad() {
//       // Ready to call configDidLoad,
//       // Config, plugin files are referred,
//       // this is the last chance to modify the config.
//     }
  
//     configDidLoad() {
//       // Config, plugin files have been loaded.
//     }
  
//     async didLoad() {
//       // All files have loaded, start plugin here.
//     }
  
//     async willReady() {
//       // All plugins have started, can do some thing before app ready
//     }
  
//     async didReady() {
//       // Worker is ready, can do some things
//       // don't need to block the app boot.
//     }
  
//     async serverDidReady() {
//       // Server is listening.
//     }
  
//     async beforeClose() {
//       // Do some thing before app close.
//     }
//   }
  
//   module.exports = AppBootHook;