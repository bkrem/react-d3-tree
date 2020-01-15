(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('react-lifecycles-compat'), require('prop-types'), require('d3'), require('clone'), require('deep-equal'), require('uuid'), require('react-transition-group')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react', 'react-lifecycles-compat', 'prop-types', 'd3', 'clone', 'deep-equal', 'uuid', 'react-transition-group'], factory) :
  (global = global || self, factory(global.ReactD3Tree = {}, global.React, global.reactLifecyclesCompat, global.PropTypes, global.d3, global.clone, global.deepEqual, global.uuid, global.reactTransitionGroup));
}(this, function (exports, React, reactLifecyclesCompat, T, d3, clone, deepEqual, uuid, reactTransitionGroup) { 'use strict';

  React = React && React.hasOwnProperty('default') ? React['default'] : React;
  T = T && T.hasOwnProperty('default') ? T['default'] : T;
  clone = clone && clone.hasOwnProperty('default') ? clone['default'] : clone;
  deepEqual = deepEqual && deepEqual.hasOwnProperty('default') ? deepEqual['default'] : deepEqual;
  uuid = uuid && uuid.hasOwnProperty('default') ? uuid['default'] : uuid;

  var NodeWrapper = function NodeWrapper(props) {
    return props.transitionDuration > 0 ? React.createElement(
      reactTransitionGroup.TransitionGroup,
      {
        component: props.component,
        className: props.className,
        transform: props.transform
      },
      props.children
    ) : React.createElement(
      'g',
      { className: props.className, transform: props.transform },
      props.children
    );
  };
  NodeWrapper.defaultProps = {
    component: 'g'
  };
  NodeWrapper.propTypes = {
    transitionDuration: T.number.isRequired,
    component: T.string,
    className: T.string.isRequired,
    transform: T.string.isRequired,
    children: T.array.isRequired
  };

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var SvgTextElement = function (_React$PureComponent) {
    inherits(SvgTextElement, _React$PureComponent);
    function SvgTextElement() {
      classCallCheck(this, SvgTextElement);
      return possibleConstructorReturn(this, (SvgTextElement.__proto__ || Object.getPrototypeOf(SvgTextElement)).apply(this, arguments));
    }
    createClass(SvgTextElement, [{
      key: 'render',
      value: function render() {
        var _props = this.props,
            labelNameProps = _props.labelNameProps,
            labelAttributeProps = _props.labelAttributeProps,
            nameData = _props.nameData,
            attributesData = _props.attributesData;
        return React.createElement(
          'g',
          null,
          React.createElement(
            'text',
            _extends({ className: 'labelNameBase' }, labelNameProps),
            nameData
          ),
          React.createElement(
            'text',
            { className: 'labelAttributesBase' },
            attributesData && Object.entries(attributesData).map(function (_ref) {
              var _ref2 = slicedToArray(_ref, 2),
                  labelKey = _ref2[0],
                  labelValue = _ref2[1];
              return React.createElement(
                'tspan',
                _extends({}, labelAttributeProps, { key: uuid.v4() }),
                labelKey,
                ': ',
                labelValue
              );
            })
          )
        );
      }
    }]);
    return SvgTextElement;
  }(React.PureComponent);
  SvgTextElement.defaultProps = {
    attributesData: undefined
  };
  SvgTextElement.propTypes = {
    nameData: T.string.isRequired,
    attributesData: T.object,
    labelNameProps: T.object.isRequired,
    labelAttributeProps: T.object.isRequired
  };

  var BASE_MARGIN = 24;
  var ForeignObjectElement = function (_React$PureComponent) {
    inherits(ForeignObjectElement, _React$PureComponent);
    function ForeignObjectElement() {
      classCallCheck(this, ForeignObjectElement);
      return possibleConstructorReturn(this, (ForeignObjectElement.__proto__ || Object.getPrototypeOf(ForeignObjectElement)).apply(this, arguments));
    }
    createClass(ForeignObjectElement, [{
      key: 'render',
      value: function render() {
        var _props = this.props,
            nodeData = _props.nodeData,
            nodeSize = _props.nodeSize,
            render = _props.render,
            foreignObjectWrapper = _props.foreignObjectWrapper;
        return React.createElement(
          'foreignObject',
          _extends({
            width: nodeSize.x - BASE_MARGIN,
            height: nodeSize.y - BASE_MARGIN
          }, foreignObjectWrapper),
          React.cloneElement(render, { nodeData: nodeData })
        );
      }
    }]);
    return ForeignObjectElement;
  }(React.PureComponent);
  ForeignObjectElement.defaultProps = {
    foreignObjectWrapper: {}
  };
  ForeignObjectElement.propTypes = {
    render: T.oneOfType([T.element, T.node]).isRequired,
    nodeData: T.object.isRequired,
    nodeSize: T.shape({
      x: T.number,
      y: T.number
    }).isRequired,
    foreignObjectWrapper: T.object
  };

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;
    if (!css || typeof document === 'undefined') { return; }
    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';
    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css = ".nodeBase {\n  cursor: pointer;\n  fill: #777;\n  stroke: #000;\n  stroke-width: 2;\n}\n\n.leafNodeBase {\n  cursor: pointer;\n  fill: transparent;\n  stroke: #000;\n  stroke-width: 2;\n}\n\n.labelNameBase {\n  stroke: #000;\n  stroke-width: 1;\n}\n\n.labelAttributesBase {\n  stroke: #777;\n  stroke-width: 1;\n  font-size: smaller;\n}\n";
  styleInject(css);

  var Node = function (_React$Component) {
    inherits(Node, _React$Component);
    function Node() {
      var _ref;
      var _temp, _this, _ret;
      classCallCheck(this, Node);
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = Node.__proto__ || Object.getPrototypeOf(Node)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
        transform: _this.setTransform(_this.props.nodeData, _this.props.orientation, true),
        initialStyle: {
          opacity: 0
        }
      }, _this.shouldNodeTransform = function (ownProps, nextProps) {
        return nextProps.subscriptions !== ownProps.subscriptions || nextProps.nodeData.x !== ownProps.nodeData.x || nextProps.nodeData.y !== ownProps.nodeData.y || nextProps.orientation !== ownProps.orientation;
      }, _this.renderNodeElement = function () {
        var _this$props = _this.props,
            nodeElement = _this$props.nodeElement,
            nodeData = _this$props.nodeData;
        var shape = nodeElement.shape,
            baseProps = nodeElement.baseProps,
            leafNodeProps = nodeElement.leafNodeProps,
            branchNodeProps = nodeElement.branchNodeProps;
        var elemProps = nodeData._children ? _extends({}, baseProps, branchNodeProps) : _extends({}, baseProps, leafNodeProps);
        return shape === 'none' ? null : React.createElement(shape, elemProps);
      }, _this.renderNodeLabelElement = function () {
        var _this$props2 = _this.props,
            allowForeignObjects = _this$props2.allowForeignObjects,
            nodeLabelComponent = _this$props2.nodeLabelComponent,
            nodeData = _this$props2.nodeData,
            nodeSize = _this$props2.nodeSize,
            nodeLabelProps = _this$props2.nodeLabelProps;
        return allowForeignObjects && nodeLabelComponent ? React.createElement(ForeignObjectElement, _extends({ nodeData: nodeData, nodeSize: nodeSize }, nodeLabelComponent)) : React.createElement(SvgTextElement, _extends({
          nameData: nodeData.name,
          attributesData: nodeData.attributes
        }, nodeLabelProps));
      }, _this.handleOnClick = function (evt) {
        _this.props.onClick(_this.props.nodeData.id, evt);
      }, _this.handleOnMouseOver = function (evt) {
        _this.props.onMouseOver(_this.props.nodeData.id, evt);
      }, _this.handleOnMouseOut = function (evt) {
        _this.props.onMouseOut(_this.props.nodeData.id, evt);
      }, _temp), possibleConstructorReturn(_this, _ret);
    }
    createClass(Node, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        this.commitTransform();
      }
    }, {
      key: 'componentDidUpdate',
      value: function componentDidUpdate() {
        this.commitTransform();
      }
    }, {
      key: 'shouldComponentUpdate',
      value: function shouldComponentUpdate(nextProps) {
        return this.shouldNodeTransform(this.props, nextProps);
      }
    }, {
      key: 'setTransform',
      value: function setTransform(nodeData, orientation) {
        var shouldTranslateToOrigin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var x = nodeData.x,
            y = nodeData.y,
            parent = nodeData.parent;
        if (shouldTranslateToOrigin) {
          var hasParent = (typeof parent === 'undefined' ? 'undefined' : _typeof(parent)) === 'object';
          var originX = hasParent ? parent.x : 0;
          var originY = hasParent ? parent.y : 0;
          return orientation === 'horizontal' ? 'translate(' + originY + ',' + originX + ')' : 'translate(' + originX + ',' + originY + ')';
        }
        return orientation === 'horizontal' ? 'translate(' + y + ',' + x + ')' : 'translate(' + x + ',' + y + ')';
      }
    }, {
      key: 'applyTransform',
      value: function applyTransform(transform, transitionDuration) {
        var opacity = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
        var done = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};
        if (transitionDuration === 0) {
          d3.select(this.node).attr('transform', transform).style('opacity', opacity);
          done();
        } else {
          d3.select(this.node).transition().duration(transitionDuration).attr('transform', transform).style('opacity', opacity).each('end', done);
        }
      }
    }, {
      key: 'commitTransform',
      value: function commitTransform() {
        var _props = this.props,
            nodeData = _props.nodeData,
            orientation = _props.orientation,
            transitionDuration = _props.transitionDuration;
        var transform = this.setTransform(nodeData, orientation);
        this.applyTransform(transform, transitionDuration);
      }
    }, {
      key: 'componentWillLeave',
      value: function componentWillLeave(done) {
        var _props2 = this.props,
            nodeData = _props2.nodeData,
            orientation = _props2.orientation,
            transitionDuration = _props2.transitionDuration;
        var transform = this.setTransform(nodeData, orientation, true);
        this.applyTransform(transform, transitionDuration, 0, done);
      }
    }, {
      key: 'render',
      value: function render() {
        var _this2 = this;
        var nodeData = this.props.nodeData;
        return React.createElement(
          'g',
          {
            id: nodeData.id,
            ref: function ref(n) {
              _this2.node = n;
            },
            style: this.state.initialStyle,
            className: nodeData._children ? 'nodeBase' : 'leafNodeBase',
            transform: this.state.transform,
            onClick: this.handleOnClick,
            onMouseOver: this.handleOnMouseOver,
            onMouseOut: this.handleOnMouseOut
          },
          this.renderNodeElement(),
          this.renderNodeLabelElement()
        );
      }
    }]);
    return Node;
  }(React.Component);
  Node.defaultProps = {
    nodeLabelComponent: null,
    styles: {
      node: {
        circle: {},
        name: {},
        attributes: {}
      },
      leafNode: {
        circle: {},
        name: {},
        attributes: {}
      }
    }
  };
  Node.propTypes = {
    nodeData: T.object.isRequired,
    nodeElement: T.object.isRequired,
    nodeLabelProps: T.object.isRequired,
    nodeLabelComponent: T.object,
    nodeSize: T.object.isRequired,
    orientation: T.oneOf(['horizontal', 'vertical']).isRequired,
    transitionDuration: T.number.isRequired,
    onClick: T.func.isRequired,
    onMouseOver: T.func.isRequired,
    onMouseOut: T.func.isRequired,
    textLayout: T.object.isRequired,
    subscriptions: T.object.isRequired,
    allowForeignObjects: T.bool.isRequired,
    styles: T.object
  };

  var css$1 = ".linkBase {\n  fill: none;\n  stroke: #000;\n}";
  styleInject(css$1);

  var Link = function (_React$PureComponent) {
    inherits(Link, _React$PureComponent);
    function Link() {
      var _ref;
      var _temp, _this, _ret;
      classCallCheck(this, Link);
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = Link.__proto__ || Object.getPrototypeOf(Link)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
        initialStyle: {
          opacity: 0
        }
      }, _this.handleOnClick = function (evt) {
        _this.props.onClick(_this.props.linkData.source, _this.props.linkData.target, evt);
      }, _this.handleOnMouseOver = function (evt) {
        _this.props.onMouseOver(_this.props.linkData.source, _this.props.linkData.target, evt);
      }, _this.handleOnMouseOut = function (evt) {
        _this.props.onMouseOut(_this.props.linkData.source, _this.props.linkData.target, evt);
      }, _temp), possibleConstructorReturn(_this, _ret);
    }
    createClass(Link, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        this.applyOpacity(1, this.props.transitionDuration);
      }
    }, {
      key: 'componentWillLeave',
      value: function componentWillLeave(done) {
        this.applyOpacity(0, this.props.transitionDuration, done);
      }
    }, {
      key: 'applyOpacity',
      value: function applyOpacity(opacity, transitionDuration) {
        var done = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
        if (transitionDuration === 0) {
          d3.select(this.link).style('opacity', opacity);
          done();
        } else {
          d3.select(this.link).transition().duration(transitionDuration).style('opacity', opacity).each('end', done);
        }
      }
    }, {
      key: 'drawStepPath',
      value: function drawStepPath(linkData, orientation) {
        var source = linkData.source,
            target = linkData.target;
        var deltaY = target.y - source.y;
        return orientation === 'horizontal' ? 'M' + source.y + ',' + source.x + ' H' + (source.y + deltaY / 2) + ' V' + target.x + ' H' + target.y : 'M' + source.x + ',' + source.y + ' V' + (source.y + deltaY / 2) + ' H' + target.x + ' V' + target.y;
      }
    }, {
      key: 'drawDiagonalPath',
      value: function drawDiagonalPath(linkData, orientation) {
        var diagonal = d3.svg.diagonal().projection(function (d) {
          return orientation === 'horizontal' ? [d.y, d.x] : [d.x, d.y];
        });
        return diagonal(linkData);
      }
    }, {
      key: 'drawStraightPath',
      value: function drawStraightPath(linkData, orientation) {
        var straight = d3.svg.line().interpolate('basis').x(function (d) {
          return d.x;
        }).y(function (d) {
          return d.y;
        });
        var data = [{ x: linkData.source.x, y: linkData.source.y }, { x: linkData.target.x, y: linkData.target.y }];
        if (orientation === 'horizontal') {
          data = [{ x: linkData.source.y, y: linkData.source.x }, { x: linkData.target.y, y: linkData.target.x }];
        }
        return straight(data);
      }
    }, {
      key: 'drawElbowPath',
      value: function drawElbowPath(d, orientation) {
        return orientation === 'horizontal' ? 'M' + d.source.y + ',' + d.source.x + 'V' + d.target.x + 'H' + d.target.y : 'M' + d.source.x + ',' + d.source.y + 'V' + d.target.y + 'H' + d.target.x;
      }
    }, {
      key: 'drawPath',
      value: function drawPath() {
        var _props = this.props,
            linkData = _props.linkData,
            orientation = _props.orientation,
            pathFunc = _props.pathFunc;
        if (typeof pathFunc === 'function') {
          return pathFunc(linkData, orientation);
        }
        if (pathFunc === 'elbow') {
          return this.drawElbowPath(linkData, orientation);
        }
        if (pathFunc === 'straight') {
          return this.drawStraightPath(linkData, orientation);
        }
        if (pathFunc === 'step') {
          return this.drawStepPath(linkData, orientation);
        }
        return this.drawDiagonalPath(linkData, orientation);
      }
    }, {
      key: 'render',
      value: function render() {
        var _this2 = this;
        var styles = this.props.styles;
        return React.createElement('path', {
          ref: function ref(l) {
            _this2.link = l;
          },
          style: _extends({}, this.state.initialStyle, styles),
          className: 'linkBase',
          d: this.drawPath(),
          onClick: this.handleOnClick,
          onMouseOver: this.handleOnMouseOver,
          onMouseOut: this.handleOnMouseOut,
          'data-source-id': this.props.linkData.source.id,
          'data-target-id': this.props.linkData.target.id
        });
      }
    }]);
    return Link;
  }(React.PureComponent);
  Link.defaultProps = {
    styles: {}
  };
  Link.propTypes = {
    linkData: T.object.isRequired,
    orientation: T.oneOf(['horizontal', 'vertical']).isRequired,
    pathFunc: T.oneOfType([T.oneOf(['diagonal', 'elbow', 'straight', 'step']), T.func]).isRequired,
    transitionDuration: T.number.isRequired,
    onClick: T.func.isRequired,
    onMouseOver: T.func.isRequired,
    onMouseOut: T.func.isRequired,
    styles: T.object
  };

  var css$2 = ".rd3t-tree-container {\n  width: 100%;\n  height: 100%;\n}\n\n.rd3t-grabbable {\n  cursor: move; /* fallback if grab cursor is unsupported */\n  cursor: grab;\n  cursor: -moz-grab;\n  cursor: -webkit-grab;\n}\n.rd3t-grabbable:active {\n    cursor: grabbing;\n    cursor: -moz-grabbing;\n    cursor: -webkit-grabbing;\n}\n";
  styleInject(css$2);

  var Tree = function (_React$Component) {
    inherits(Tree, _React$Component);
    function Tree() {
      var _ref;
      var _temp, _this, _ret;
      classCallCheck(this, Tree);
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = Tree.__proto__ || Object.getPrototypeOf(Tree)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
        dataRef: _this.props.data,
        data: Tree.assignInternalProperties(clone(_this.props.data)),
        d3: Tree.calculateD3Geometry(_this.props),
        rd3tSvgClassName: '_' + uuid.v4(),
        rd3tGClassName: '_' + uuid.v4()
      }, _this.internalState = {
        initialRender: true,
        targetNode: null,
        isTransitioning: false
      }, _this.handleNodeToggle = function (nodeId, evt) {
        var data = clone(_this.state.data);
        var matches = _this.findNodesById(nodeId, data, []);
        var targetNode = matches[0];
        evt.persist();
        if (_this.props.collapsible && !_this.state.isTransitioning) {
          if (targetNode._collapsed) {
            Tree.expandNode(targetNode);
            _this.props.shouldCollapseNeighborNodes && _this.collapseNeighborNodes(targetNode, data);
          } else {
            Tree.collapseNode(targetNode);
          }
          _this.setState({ data: data, isTransitioning: true }, function () {
            return _this.handleOnClickCb(targetNode, evt);
          });
          setTimeout(function () {
            return _this.setState({ isTransitioning: false });
          }, _this.props.transitionDuration + 10);
          _this.internalState.targetNode = targetNode;
        } else {
          _this.handleOnClickCb(targetNode, evt);
        }
      }, _this.handleOnClickCb = function (targetNode, evt) {
        var onClick = _this.props.onClick;
        if (onClick && typeof onClick === 'function') {
          onClick(clone(targetNode), evt);
        }
      }, _this.handleOnLinkClickCb = function (linkSource, linkTarget, evt) {
        var onLinkClick = _this.props.onLinkClick;
        if (onLinkClick && typeof onLinkClick === 'function') {
          evt.persist();
          onLinkClick(clone(linkSource), clone(linkTarget), evt);
        }
      }, _this.handleOnMouseOverCb = function (nodeId, evt) {
        var onMouseOver = _this.props.onMouseOver;
        if (onMouseOver && typeof onMouseOver === 'function') {
          var data = clone(_this.state.data);
          var matches = _this.findNodesById(nodeId, data, []);
          var targetNode = matches[0];
          evt.persist();
          onMouseOver(clone(targetNode), evt);
        }
      }, _this.handleOnLinkMouseOverCb = function (linkSource, linkTarget, evt) {
        var onLinkMouseOver = _this.props.onLinkMouseOver;
        if (onLinkMouseOver && typeof onLinkMouseOver === 'function') {
          evt.persist();
          onLinkMouseOver(clone(linkSource), clone(linkTarget), evt);
        }
      }, _this.handleOnMouseOutCb = function (nodeId, evt) {
        var onMouseOut = _this.props.onMouseOut;
        if (onMouseOut && typeof onMouseOut === 'function') {
          var data = clone(_this.state.data);
          var matches = _this.findNodesById(nodeId, data, []);
          var targetNode = matches[0];
          evt.persist();
          onMouseOut(clone(targetNode), evt);
        }
      }, _this.handleOnLinkMouseOutCb = function (linkSource, linkTarget, evt) {
        var onLinkMouseOut = _this.props.onLinkMouseOut;
        if (onLinkMouseOut && typeof onLinkMouseOut === 'function') {
          evt.persist();
          onLinkMouseOut(clone(linkSource), clone(linkTarget), evt);
        }
      }, _temp), possibleConstructorReturn(_this, _ret);
    }
    createClass(Tree, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        this.bindZoomListener(this.props);
        this.internalState.initialRender = false;
      }
    }, {
      key: 'componentDidUpdate',
      value: function componentDidUpdate(prevProps) {
        if (!deepEqual(this.props.translate, prevProps.translate) || !deepEqual(this.props.scaleExtent, prevProps.scaleExtent) || this.props.zoom !== prevProps.zoom || this.props.transitionDuration !== prevProps.transitionDuration) {
          this.bindZoomListener(this.props);
        }
        if (typeof this.props.onUpdate === 'function') {
          this.props.onUpdate({
            node: this.internalState.targetNode ? clone(this.internalState.targetNode) : null,
            zoom: this.state.d3.scale,
            translate: this.state.d3.translate
          });
        }
        this.internalState.targetNode = null;
      }
    }, {
      key: 'setInitialTreeDepth',
      value: function setInitialTreeDepth(nodeSet, initialDepth) {
        nodeSet.forEach(function (n) {
          n._collapsed = n.depth >= initialDepth;
        });
      }
    }, {
      key: 'bindZoomListener',
      value: function bindZoomListener(props) {
        var _this2 = this;
        var zoomable = props.zoomable,
            scaleExtent = props.scaleExtent,
            translate = props.translate,
            zoom = props.zoom,
            onUpdate = props.onUpdate;
        var _state = this.state,
            rd3tSvgClassName = _state.rd3tSvgClassName,
            rd3tGClassName = _state.rd3tGClassName;
        var svg = d3.select('.' + rd3tSvgClassName);
        var g = d3.select('.' + rd3tGClassName);
        if (zoomable) {
          svg.call(d3.behavior.zoom().scaleExtent([scaleExtent.min, scaleExtent.max]).on('zoom', function () {
            g.attr('transform', 'translate(' + d3.event.translate + ') scale(' + d3.event.scale + ')');
            if (typeof onUpdate === 'function') {
              onUpdate({
                node: null,
                zoom: d3.event.scale,
                translate: { x: d3.event.translate[0], y: d3.event.translate[1] }
              });
              _this2.state.d3.scale = d3.event.scale;
              _this2.state.d3.translate = { x: d3.event.translate[0], y: d3.event.translate[1] };
            }
          })
          .scale(zoom).translate([translate.x, translate.y]));
        }
      }
    }, {
      key: 'findNodesById',
      value: function findNodesById(nodeId, nodeSet, hits) {
        var _this3 = this;
        if (hits.length > 0) {
          return hits;
        }
        hits = hits.concat(nodeSet.filter(function (node) {
          return node.id === nodeId;
        }));
        nodeSet.forEach(function (node) {
          if (node._children && node._children.length > 0) {
            hits = _this3.findNodesById(nodeId, node._children, hits);
          }
        });
        return hits;
      }
    }, {
      key: 'findNodesAtDepth',
      value: function findNodesAtDepth(depth, nodeSet, accumulator) {
        var _this4 = this;
        accumulator = accumulator.concat(nodeSet.filter(function (node) {
          return node.depth === depth;
        }));
        nodeSet.forEach(function (node) {
          if (node._children && node._children.length > 0) {
            accumulator = _this4.findNodesAtDepth(depth, node._children, accumulator);
          }
        });
        return accumulator;
      }
    }, {
      key: 'collapseNeighborNodes',
      value: function collapseNeighborNodes(targetNode, nodeSet) {
        var neighbors = this.findNodesAtDepth(targetNode.depth, nodeSet, []).filter(function (node) {
          return node.id !== targetNode.id;
        });
        neighbors.forEach(function (neighbor) {
          return Tree.collapseNode(neighbor);
        });
      }
    }, {
      key: 'generateTree',
      value: function generateTree() {
        var _props = this.props,
            initialDepth = _props.initialDepth,
            useCollapseData = _props.useCollapseData,
            depthFactor = _props.depthFactor,
            separation = _props.separation,
            nodeSize = _props.nodeSize,
            orientation = _props.orientation;
        var tree = d3.layout.tree().nodeSize(orientation === 'horizontal' ? [nodeSize.y, nodeSize.x] : [nodeSize.x, nodeSize.y]).separation(function (a, b) {
          return a.parent.id === b.parent.id ? separation.siblings : separation.nonSiblings;
        }).children(function (d) {
          return d._collapsed ? null : d._children;
        });
        var rootNode = this.state.data[0];
        var nodes = tree.nodes(rootNode);
        if (useCollapseData === false && initialDepth !== undefined && this.internalState.initialRender) {
          this.setInitialTreeDepth(nodes, initialDepth);
          nodes = tree.nodes(rootNode);
        }
        if (depthFactor) {
          nodes.forEach(function (node) {
            node.y = node.depth * depthFactor;
          });
        }
        var links = tree.links(nodes);
        return { nodes: nodes, links: links };
      }
    }, {
      key: 'render',
      value: function render() {
        var _this5 = this;
        var _generateTree = this.generateTree(),
            nodes = _generateTree.nodes,
            links = _generateTree.links;
        var _state2 = this.state,
            rd3tSvgClassName = _state2.rd3tSvgClassName,
            rd3tGClassName = _state2.rd3tGClassName;
        var _props2 = this.props,
            commonNodeElement = _props2.commonNodeElement,
            nodeLabelComponent = _props2.nodeLabelComponent,
            nodeLabelProps = _props2.nodeLabelProps,
            orientation = _props2.orientation,
            pathFunc = _props2.pathFunc,
            transitionDuration = _props2.transitionDuration,
            zoomable = _props2.zoomable,
            textLayout = _props2.textLayout,
            nodeSize = _props2.nodeSize,
            depthFactor = _props2.depthFactor,
            initialDepth = _props2.initialDepth,
            separation = _props2.separation,
            allowForeignObjects = _props2.allowForeignObjects,
            styles = _props2.styles;
        var _state$d = this.state.d3,
            translate = _state$d.translate,
            scale = _state$d.scale;
        var subscriptions = _extends({}, nodeSize, separation, { depthFactor: depthFactor, initialDepth: initialDepth });
        return React.createElement(
          'div',
          { className: 'rd3t-tree-container ' + (zoomable ? 'rd3t-grabbable' : undefined) },
          React.createElement(
            'svg',
            { className: rd3tSvgClassName, width: '100%', height: '100%' },
            React.createElement(
              NodeWrapper,
              {
                transitionDuration: transitionDuration,
                component: 'g',
                className: rd3tGClassName,
                transform: 'translate(' + translate.x + ',' + translate.y + ') scale(' + scale + ')'
              },
              links.map(function (linkData) {
                return React.createElement(Link, {
                  key: uuid.v4(),
                  orientation: orientation,
                  pathFunc: pathFunc,
                  linkData: linkData,
                  onClick: _this5.handleOnLinkClickCb,
                  onMouseOver: _this5.handleOnLinkMouseOverCb,
                  onMouseOut: _this5.handleOnLinkMouseOutCb,
                  transitionDuration: transitionDuration,
                  styles: styles.links
                });
              }),
              nodes.map(function (nodeData) {
                return React.createElement(Node, {
                  key: nodeData.id,
                  nodeElement: nodeData.nodeElement ? nodeData.nodeElement : commonNodeElement,
                  nodeLabelProps: nodeLabelProps,
                  nodeLabelComponent: nodeLabelComponent,
                  nodeSize: nodeSize,
                  orientation: orientation,
                  transitionDuration: transitionDuration,
                  nodeData: nodeData,
                  onClick: _this5.handleNodeToggle,
                  onMouseOver: _this5.handleOnMouseOverCb,
                  onMouseOut: _this5.handleOnMouseOutCb,
                  textLayout: nodeData.textLayout || textLayout,
                  subscriptions: subscriptions,
                  allowForeignObjects: allowForeignObjects,
                  styles: styles.nodes
                });
              })
            )
          )
        );
      }
    }], [{
      key: 'getDerivedStateFromProps',
      value: function getDerivedStateFromProps(nextProps, prevState) {
        var derivedState = null;
        if (nextProps.data !== prevState.dataRef) {
          derivedState = {
            dataRef: nextProps.data,
            data: Tree.assignInternalProperties(clone(nextProps.data))
          };
        }
        var d3$$1 = Tree.calculateD3Geometry(nextProps);
        if (!deepEqual(d3$$1, prevState.d3)) {
          derivedState = derivedState || {};
          derivedState.d3 = d3$$1;
        }
        return derivedState;
      }
    }, {
      key: 'assignInternalProperties',
      value: function assignInternalProperties(data) {
        var d = Array.isArray(data) ? data : [data];
        return d.map(function (node) {
          node.id = uuid.v4();
          if (node._collapsed === undefined) {
            node._collapsed = false;
          }
          if (node.children && node.children.length > 0) {
            node.children = Tree.assignInternalProperties(node.children);
            node._children = node.children;
          }
          return node;
        });
      }
    }, {
      key: 'collapseNode',
      value: function collapseNode(node) {
        node._collapsed = true;
        if (node._children && node._children.length > 0) {
          node._children.forEach(function (child) {
            Tree.collapseNode(child);
          });
        }
      }
    }, {
      key: 'expandNode',
      value: function expandNode(node) {
        node._collapsed = false;
      }
    }, {
      key: 'calculateD3Geometry',
      value: function calculateD3Geometry(nextProps) {
        var scale = void 0;
        if (nextProps.zoom > nextProps.scaleExtent.max) {
          scale = nextProps.scaleExtent.max;
        } else if (nextProps.zoom < nextProps.scaleExtent.min) {
          scale = nextProps.scaleExtent.min;
        } else {
          scale = nextProps.zoom;
        }
        return {
          translate: nextProps.translate,
          scale: scale
        };
      }
    }]);
    return Tree;
  }(React.Component);
  Tree.defaultProps = {
    commonNodeElement: {
      shape: 'circle',
      baseProps: {
        r: 10
      }
    },
    nodeLabelProps: {
      labelNameProps: {
        textAnchor: 'start',
        x: 10,
        y: -10,
        style: { stroke: 'green' }
      },
      labelAttributeProps: {
        x: 10,
        dy: '1.2em',
        style: { stroke: 'purple' }
      }
    },
    nodeLabelComponent: null,
    onClick: undefined,
    onMouseOver: undefined,
    onMouseOut: undefined,
    onLinkClick: undefined,
    onLinkMouseOver: undefined,
    onLinkMouseOut: undefined,
    onUpdate: undefined,
    orientation: 'horizontal',
    translate: { x: 0, y: 0 },
    pathFunc: 'diagonal',
    transitionDuration: 500,
    depthFactor: undefined,
    collapsible: true,
    useCollapseData: false,
    initialDepth: undefined,
    zoomable: true,
    zoom: 1,
    scaleExtent: { min: 0.1, max: 1 },
    nodeSize: { x: 140, y: 140 },
    separation: { siblings: 1, nonSiblings: 2 },
    textLayout: {
      textAnchor: 'start',
      x: 10,
      y: -10,
      transform: undefined
    },
    allowForeignObjects: false,
    shouldCollapseNeighborNodes: false,
    styles: {}
  };
  Tree.propTypes = {
    data: T.oneOfType([T.array, T.object]).isRequired,
    commonNodeElement: T.shape({
      shape: T.string,
      baseProps: T.object,
      branchNodeProps: T.object,
      leafNodeProps: T.object
    }),
    nodeLabelProps: T.object,
    nodeLabelComponent: T.object,
    onClick: T.func,
    onMouseOver: T.func,
    onMouseOut: T.func,
    onLinkClick: T.func,
    onLinkMouseOver: T.func,
    onLinkMouseOut: T.func,
    onUpdate: T.func,
    orientation: T.oneOf(['horizontal', 'vertical']),
    translate: T.shape({
      x: T.number,
      y: T.number
    }),
    pathFunc: T.oneOfType([T.oneOf(['diagonal', 'elbow', 'straight', 'step']), T.func]),
    transitionDuration: T.number,
    depthFactor: T.number,
    collapsible: T.bool,
    useCollapseData: T.bool,
    initialDepth: T.number,
    zoomable: T.bool,
    zoom: T.number,
    scaleExtent: T.shape({
      min: T.number,
      max: T.number
    }),
    nodeSize: T.shape({
      x: T.number,
      y: T.number
    }),
    separation: T.shape({
      siblings: T.number,
      nonSiblings: T.number
    }),
    textLayout: T.object,
    allowForeignObjects: T.bool,
    shouldCollapseNeighborNodes: T.bool,
    styles: T.shape({
      nodes: T.object,
      links: T.object
    })
  };
  reactLifecyclesCompat.polyfill(Tree);

  function _transformToHierarchy(links, attributeFields) {
    var nodesByName = {};
    var assignNode = function assignNode(name) {
      if (!nodesByName[name]) {
        nodesByName[name] = { name: name };
      }
      return nodesByName[name];
    };
    var assignNodeWithAttributes = function assignNodeWithAttributes(name, attributes) {
      if (!nodesByName[name]) {
        nodesByName[name] = {
          name: name,
          attributes: attributes
        };
      }
      return nodesByName[name];
    };
    links.forEach(function (link) {
      if (attributeFields) {
        var customAttributes = {};
        attributeFields.forEach(function (field) {
          customAttributes[field] = link[field];
        });
        link.attributes = customAttributes;
      }
      link.source = assignNode(link.parent);
      link.target = assignNodeWithAttributes(link.child, link.attributes);
      var parent = link.source;
      var child = link.target;
      parent.id = uuid.v4();
      child.id = uuid.v4();
      child.parent = parent.name || null;
      parent._collapsed = child._collapsed = false;
      parent._children ? parent._children.push(child) : parent._children = [child];
    });
    var rootLinks = links.filter(function (link) {
      return !link.source.parent;
    });
    return [rootLinks[0].source];
  }
  function parseCSV(csvFilePath, attributeFields) {
    return new Promise(function (resolve, reject) {
      try {
        d3.csv(csvFilePath, function (data) {
          return resolve(_transformToHierarchy(data, attributeFields));
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  function parseJSON(jsonFilePath) {
    return new Promise(function (resolve, reject) {
      try {
        d3.json(jsonFilePath, function (data) {
          return resolve([data]);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  function parseFlatJSON(jsonFilePath, attributeFields) {
    return new Promise(function (resolve, reject) {
      try {
        d3.json(jsonFilePath, function (data) {
          return resolve(_transformToHierarchy(data, attributeFields));
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  function generateHierarchy(flatArray) {
    return _transformToHierarchy(flatArray);
  }

  var index = /*#__PURE__*/Object.freeze({
    parseCSV: parseCSV,
    parseJSON: parseJSON,
    parseFlatJSON: parseFlatJSON,
    generateHierarchy: generateHierarchy
  });

  exports.Tree = Tree;
  exports.treeUtil = index;
  exports.default = Tree;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
