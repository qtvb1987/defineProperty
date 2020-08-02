//定义KVue的构造函数
class KVue {
  constructor(options) {
    //保存选项
    this.$options = options;

    //传入的data

    this.$data = options.data;

    //响应化处理

    this.observe(this.$data);

    new Watcher(this, 'foo');
    this.foo; //读一次，触发依赖收集
    new Watcher(this, 'bar.mua');
    this.bar.mua; //读一次，触发依赖收集

  }

  observe(value) {

    if (!value || typeof value !== 'object') {
      return;
    }

    //遍历value
    Object.keys(value).forEach(key => {
      //响应式处理
      this.defineReactive(value, key, value[key]);
      //代理data中的属性到KVue根上
      this.proxyData(key);
    })
  }

  //在KVue根上定义属性代理data中的数据
  proxyData(key) {
    //this 指的KVue实例
    Object.defineProperty(this, key, {
      get() {
        return this.$data[key];
      },
      set(newVal) {
        this.$data[key] = newVal;
      }
    })
  }
  defineReactive(obj, key, val) {
    //遍历递归
    this.observe(val);

    //定义了一个Dep
    const dep = new Dep(); //每个dep实例和data中每个Key有一对一关系


    //给obj的每一个key定义拦截

    Object.defineProperty(obj, key, {
      get() {
        //依赖收集
        Dep.target && dep.addDep(Dep.target);
        return val;
      },
      set(newVal) {
        if (newVal !== val) {
          val = newVal;
          // console.log(key + '属性更新了');
          dep.notify();
        }
      }
    })
  }

}

//创建Dep：管理所有Watcher

class Dep {
  constructor() {
    //存储所有依赖
    this.watchers = []
  }

  addDep(watcher) {
    this.watchers.push(watcher);
  }

  notify() {
    this.watchers.forEach(watcher => watcher.update())
  }
}

//创建Watcher:保存data中数值和页面中的挂钩关系
class Watcher {
  constructor(vm, key) {
    //创建实例时立刻将该实例指向Dep.target便于依赖收集
    Dep.target = this;
    this.vm = vm;
    this.key = key;
  }

  //更新
  update() {
    console.log(this.key + "更新了！");
  }
}