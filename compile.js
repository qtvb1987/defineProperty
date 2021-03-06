//遍历dom结构，解析指令和插值表达式

class Compile {
  //el-带编译模板，vm-KVue实例

  constructor(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);

    //把模板中的内容移到片段操作
    this.$fragment = this.node2Fragment(this.$el);

    //执行编译
    this.compile(this.$fragment);

    //放回$el中

    this.$el.appendChild(this.$fragment);

  }


  node2Fragment(el) {
    //创建片段
    const fragment = document.createDocumentFragment();
    //添加每个片段
    let child;
    while (child = el.firstChild) {
      fragment.appendChild(child);
    }
    return fragment;
  }

  compile(el) {
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach(node => {
      if (node.nodeType == 1) {
        //元素
        console.log('编译元素' + node.nodeName);
        this.compileElement(node);
      } else if (this.isInter(node)) {
        //只关心{{xxx}}
        //console.log('编译插值文本' + node.textContent);
        //编译文件
        this.compileText(node);
      }

      //递归子节点
      if (node.children && node.childNodes.length > 0) {
        this.compile(node);
      }
    })
  }

  isInter(node) {
    return node.nodeType == 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }

  //文件替换
  compileText(node) {
    console.log(RegExp.$1);
    console.log(this.$vm);
    console.log(this);
    //表达式
    const exp = RegExp.$1;
    this.update(node, exp, 'text')
    //node.textContent = this.$vm[RegExp.$1];
  }

  update(node, exp, dir) {
    const updator = this[dir + 'Updator'];
    //const value = this.$vm[exp];
    updator && updator(node, this.$vm[exp]); //首次初始化值
    //动态
    new Watcher(this.$vm, exp, function (value) {
      updator && updator(node, value);
    })
  }
  textUpdator(node, value) {
    node.textContent = value;
  }
  compileElement(node) {
    //关心属性
    const nodeAttrs = node.attributes;
    Array.from(nodeAttrs).forEach(attr => {
      //规定: k-xxx="yyy"
      const arrtName = attr.name; //k-xxx
      const exp = attr.value; //yyy
      if (arrtName.indexOf('k-') == 0) {
        //指令
        const dir = arrtName.substring(2); //xxx

        //执行
        this[dir] && this[dir](node, exp);

      } else if (arrtName.indexOf('@') == 0) {
        const dir = arrtName.substring(1); //事件名称
        //事件监听处理
        this.eventHandler(node, this.$vm, exp, dir);
      }
    })
  }


  //事件处理:给node添加事件监听，dir-事件名称
  //通过vm.$options.methods[exp]可获得回调函数
  eventHandler(node, vm, exp, dir) {
    let fn = vm.$options.methods && vm.$options.methods[exp];
    if (dir && fn) {
      node.addEventListener(dir, fn.bind(vm));
    }
  }
  text(node, exp) {
    this.update(node, exp, 'text')
  }
  html(node, exp) {
    this.update(node, exp, 'html');
  }
  htmlUpdator(node, value) {
    console.log('html更新了' + value);
    node.innerHTML = value;
  }
  model(node, exp) {
    this.update(node, exp, 'model');
    node.addEventListener('input', e => {
      this.$vm[exp] = e.target.value;
    })
  }
  modelUpdator(node, value) {
    node.value = value;
  }



}