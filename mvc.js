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
    // console.log(this._listeners);
  },
  notify: function(objs){
    for(var i = 0,ilen = this._listeners.length; i < ilen; i+=1) {
      // console.log(this._listeners[i]);
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

  // 绑定模型监听器
  this.model.changeSphere.attach(function () {
    view.changeView();
  }),

  // 把监听器绑定到HTML事件上
  this.elements.radius.change(function (e) {
    view.changeSphere.notify({'valueName': 'radius', 'value' :e.target.value});
  });
  this.elements.volume.change(function (e) {
    view.changeSphere.notify({'valueName': 'volume', 'value' :e.target.value});
  });
  this.elements.suArea.change(function (e) {
    view.changeSphere.notify({'valueName': 'suArea', 'value' :e.target.value});
  });
  this.elements.graphView.click(function (e) {
    // 获取点击位置和调整后的半径数据
    var x = e.clientX - view.elements.graphView.offset().left,
        y = e.clientY - view.elements.graphView.offset().top;
    var width = 600, height = 600;
    var r = Math.sqrt(Math.pow(width / 2 - x, 2) + Math.pow(height / 2 - y, 2));
    // console.log(typeof view.elements.graphView.offset().top);
    // console.log("graphView", view.elements.graphView.offset());
    // console.log("client", e.clientX, e.clientY);
    // console.log("absolute", x, y, r
    //             // e.clientX - view.elements.graphView.offset().left,
    //             // e.clientY - view.elements.graphView.offset().top
    //            );
    // 
    view.changeSphere.notify({'valueName': 'radius', 'value' :r});
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
    switch(argument.valueName){
      case 'radius': this.model.setRadius(argument.value); break;
      case 'volume': this.model.setVolume(argument.value); break;
      case 'suArea': this.model.setSuArea(argument.value); break;
    }
  }
}


var model;
var view;
var controller;
$(function () {
  model = new Model(0);
  view = new View(model, {
    'radius': $('#radius'),
    'volume': $('#volume'),
    'suArea': $('#suArea'),
    'graphView': $('#graphView')
  });
  controller = new Controller(model, view);
})