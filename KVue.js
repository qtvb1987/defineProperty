//定义KVue的构造函数
class KVue {
  constructor(options) {
    //保存选项
    this.$options = options;

    //传入的data

    this.$data = options.data;

    //响应化处理

    this.observe(this.$data);

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
    //给obj的每一个key定义拦截

    Object.defineProperty(obj, key, {
      get() {
        return val;
      },
      set(newVal) {
        if (newVal !== val) {
          val = newVal;
          console.log(key + '属性更新了');
        }
      }
    })
  }

}