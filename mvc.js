/*
 * 观察者模式类
 *  
 */
function Event(observer) {
  this._observer = observer;
  this._listeners = [];
}
Event.prototype = {
  constaructor: 'Event',
  attach : function(listeners) {
    this._listeners.push(listeners);
  },
  notify: function(objs){
    for(var i = 0,ilen = this._listeners.length; i < ilen; i+=1) {
      this._listeners[i](this._observer,objs);
    }
  }
};

/*
 * 模型
 * 作为被观察者（当Model发生变化时通知视图）
 */
function Model(_radius) {  
  this.radius = _radius;
  this.volume = (4 * Math.PI * Math.pow(_radius, 3)) / 3;
  this.suArea = 4 * Math.PI * Math.pow(_radius, 2);  

  this.changeSphere = new Event(this);
}

Model.prototype = {
  constructor: "Model",

  getRadius: function () {
    return this.radius;
  },

  getVolume: function () {
    return this.volume;
  },

  getSuArea: function () {
    return this.suArea;
  },

  setRadius: function (_radius) {
    this.radius = _radius;
    this.volume = (4 * Math.PI * Math.pow(this.radius, 3)) / 3;
    this.suArea = 4 * Math.PI * Math.pow(this.radius, 2);  
    this.changeSphere.notify();
  },

  setVolume: function (_volume) {
    this.volume = _volume;
    this.radius = Math.pow(3 * this.volume / (4 * Math.PI), 1 / 3.0);  
    this.suArea = 3 * this.volume / this.radius;
    this.changeSphere.notify();
  },

  setSuArea: function (_suArea) {
    this.suArea = _suArea;     
    this.radius = Math.pow(this.suArea / (4 * Math.PI), 1 / 2.0);  
    this.volume = this.suArea * this.radius /3;
    this.changeSphere.notify();
  }
}

/*
 * 视图
 * 作为观察者（当Model发生变化时接收到来自Event的通知）
 */
function View(_model, _elements) {
  this.model = _model;
  this.elements = _elements;

  this.changeSphere = new Event(this);

  var view = this;
  this.isMouseDown = false;

  // 绑定模型监听器
  this.model.changeSphere.attach(function () {
    view.changeView();
  }),

  // 把监听器绑定到HTML事件上
  this.elements.radius.bind('input', function (e) {
    view.changeSphere.notify({'valueName': 'radius', 'value': e.target.value});
  });
  this.elements.volume.bind('input', function (e) {
    view.changeSphere.notify({'valueName': 'volume', 'value': e.target.value});
  });
  this.elements.suArea.bind('input', function (e) {
    view.changeSphere.notify({'valueName': 'suArea', 'value': e.target.value});
  });

  this.elements.graphView.click(function (e) {
    view.changeSphere.notify({'valueName': 'radius', 'value': view.getR(e)});
  });
  this.elements.graphView.mousedown(function (e) {
    view.isMouseDown = true;
    view.changeSphere.notify({'valueName': 'radius', 'value': view.getR(e)});
  });
  this.elements.graphView.mouseup(function (e) {
    view.isMouseDown = false;
    view.changeSphere.notify({'valueName': 'radius', 'value': view.getR(e)});
  });
  this.elements.graphView.mousemove(function (e) {
    if(view.isMouseDown)
    view.changeSphere.notify({'valueName': 'radius', 'value': view.getR(e)});
  });
}

View.prototype = {
  constructor: 'View',

  changeView: function () {
    this.elements.radius.val(this.model.getRadius());
    this.elements.volume.val(this.model.getVolume());
    this.elements.suArea.val(this.model.getSuArea());

    // 更改图形
    this.elements.graphView.find("#graph").css("height", this.model.getRadius() * 2 + "px");
    this.elements.graphView.find("#graph").css("width", this.model.getRadius() * 2 + "px");
  },

  getR: function (e) {
    // 获取点击/拖动时鼠标当前位置和调整后的半径数据
    var x = e.clientX - this.elements.graphView.offset().left,
        y = e.clientY - this.elements.graphView.offset().top;
    var width = 600, height = 600;
    return Math.sqrt(Math.pow(width / 2 - x, 2) + Math.pow(height / 2 - y, 2));
  }
}


/*
 * 控制器
 * 响应用户请求，随后调用Model上的变化函数
 */
function Controller(_model, _view) {
  this.model = _model;
  this.view = _view;

  var controller = this;
  this.view.changeSphere.attach(function (sender, args) {
    controller.updateModel(args);
  });
}

Controller.prototype = {
  constructor: 'Controller',

  updateModel: function (argument) {
    var reg = /^((0{0,1}|[1-9][0-9]*)|(0|[1-9][0-9]*)+(.[0-9]+))$/;
    if(!reg.test(argument.value)){
      return;
    }
    switch(argument.valueName){
      case 'radius': this.model.setRadius(argument.value); break;
      case 'volume': this.model.setVolume(argument.value); break;
      case 'suArea': this.model.setSuArea(argument.value); break;
    }
  }
}


// var model;
// var view;
// var controller;
$(function () {
  var model = new Model(0);
  var view = new View(model, {
    'radius': $('#radius'),
    'volume': $('#volume'),
    'suArea': $('#suArea'),
    'graphView': $('#graphView')
  });
  var controller = new Controller(model, view);
})