(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('prop-types'), require('d3'), require('clone'), require('deep-equal'), require('uuid'), require('react-transition-group')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react', 'prop-types', 'd3', 'clone', 'deep-equal', 'uuid', 'react-transition-group'], factory) :
  (global = global || self, factory(global.ReactD3Tree = {}, global.React, global.PropTypes, global.d3, global.clone, global.deepEqual, global.uuid, global.reactTransitionGroup));
}(this, function (exports, React, T, d3, clone, deepEqual, uuid, reactTransitionGroup) { 'use strict';

  React = React && React.hasOwnProperty('default') ? React['default'] : React;
  T = T && T.hasOwnProperty('default') ? T['default'] : T;
  clone = clone && clone.hasOwnProperty('default') ? clone['default'] : clone;
  deepEqual = deepEqual && deepEqual.hasOwnProperty('default') ? deepEqual['default'] : deepEqual;
  uuid = uuid && uuid.hasOwnProperty('default') ? uuid['default'] : uuid;

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

  var NodeWrapper = function (_React$Component) {
    inherits(NodeWrapper, _React$Component);
    function NodeWrapper() {
      var _ref;
      var _temp, _this, _ret;
      classCallCheck(this, NodeWrapper);
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = NodeWrapper.__proto__ || Object.getPrototypeOf(NodeWrapper)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
        enableTransitions: _this.props.transitionDuration > 0
      }, _temp), possibleConstructorReturn(_this, _ret);
    }
    createClass(NodeWrapper, [{
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        if (nextProps.transitionDuration !== this.props.transitionDuration) {
          this.setState({
            enableTransitions: nextProps.transitionDuration > 0
          });
        }
      }
    }, {
      key: 'render',
      value: function render() {
        if (this.state.enableTransitions) {
          return React.createElement(
            reactTransitionGroup.TransitionGroup,
            {
              component: this.props.component,
              className: this.props.className,
              transform: this.props.transform
            },
            this.props.children
          );
        }
        return React.createElement(
          'g',
          { className: this.props.className, transform: this.props.transform },
          this.props.children
        );
      }
    }]);
    return NodeWrapper;
  }(React.Component);
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
            name = _props.name,
            nodeStyle = _props.nodeStyle,
            textLayout = _props.textLayout,
            attributes = _props.attributes;
        return React.createElement(
          'g',
          null,
          React.createElement(
            'text',
            {
              className: 'nodeNameBase',
              style: nodeStyle.name,
              textAnchor: textLayout.textAnchor,
              x: textLayout.x,
              y: textLayout.y,
              transform: textLayout.transform,
              dy: '.35em'
            },
            name
          ),
          React.createElement(
            'text',
            {
              className: 'nodeAttributesBase',
              y: textLayout.y + 10,
              textAnchor: textLayout.textAnchor,
              transform: textLayout.transform,
              style: nodeStyle.attributes
            },
            attributes && Object.keys(attributes).map(function (labelKey) {
              return React.createElement(
                'tspan',
                { x: textLayout.x, dy: '1.2em', key: uuid.v4() },
                labelKey,
                ': ',
                attributes[labelKey]
              );
            })
          )
        );
      }
    }]);
    return SvgTextElement;
  }(React.PureComponent);
  SvgTextElement.defaultProps = {
    attributes: undefined
  };
  SvgTextElement.propTypes = {
    name: T.string.isRequired,
    attributes: T.object,
    textLayout: T.object.isRequired,
    nodeStyle: T.object.isRequired
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

  var css = ".nodeBase {\n  cursor: pointer;\n  fill: #777;\n  stroke: #000;\n  stroke-width: 2;\n}\n\n.leafNodeBase {\n  cursor: pointer;\n  fill: transparent;\n  stroke: #000;\n  stroke-width: 2;\n}\n\n.nodeNameBase {\n  fill: #000;\n  stroke: #000;\n  stroke-width: 1;\n}\n\n.nodeAttributesBase {\n  fill: #777;\n  stroke: #777;\n  stroke-width: 1;\n  font-size: smaller;\n}\n";
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
      }, _this.renderNodeElement = function (nodeStyle) {
        var _this$props = _this.props,
            circleRadius = _this$props.circleRadius,
            nodeSvgShape = _this$props.nodeSvgShape;
        if (circleRadius) {
          return React.createElement('circle', { r: circleRadius, style: nodeStyle.circle });
        }
        return nodeSvgShape.shape === 'none' ? null : React.createElement(nodeSvgShape.shape, _extends({}, nodeStyle.circle, nodeSvgShape.shapeProps));
      }, _this.handleClick = function (evt) {
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
        var _props = this.props,
            nodeData = _props.nodeData,
            orientation = _props.orientation,
            transitionDuration = _props.transitionDuration;
        var transform = this.setTransform(nodeData, orientation);
        this.applyTransform(transform, transitionDuration);
      }
    }, {
      key: 'componentWillUpdate',
      value: function componentWillUpdate(nextProps) {
        var transform = this.setTransform(nextProps.nodeData, nextProps.orientation);
        this.applyTransform(transform, nextProps.transitionDuration);
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
          var originX = parent ? parent.x : 0;
          var originY = parent ? parent.y : 0;
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
        var _props3 = this.props,
            nodeData = _props3.nodeData,
            nodeSize = _props3.nodeSize,
            nodeLabelComponent = _props3.nodeLabelComponent,
            allowForeignObjects = _props3.allowForeignObjects,
            styles = _props3.styles;
        var nodeStyle = nodeData._children ? _extends({}, styles.node) : _extends({}, styles.leafNode);
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
            onClick: this.handleClick,
            onMouseOver: this.handleOnMouseOver,
            onMouseOut: this.handleOnMouseOut
          },
          this.renderNodeElement(nodeStyle),
          allowForeignObjects && nodeLabelComponent ? React.createElement(ForeignObjectElement, _extends({ nodeData: nodeData, nodeSize: nodeSize }, nodeLabelComponent)) : React.createElement(SvgTextElement, _extends({}, this.props, { nodeStyle: nodeStyle }))
        );
      }
    }]);
    return Node;
  }(React.Component);
  Node.defaultProps = {
    nodeLabelComponent: null,
    attributes: undefined,
    circleRadius: undefined,
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
    nodeSvgShape: T.object.isRequired,
    nodeLabelComponent: T.object,
    nodeSize: T.object.isRequired,
    orientation: T.oneOf(['horizontal', 'vertical']).isRequired,
    transitionDuration: T.number.isRequired,
    onClick: T.func.isRequired,
    onMouseOver: T.func.isRequired,
    onMouseOut: T.func.isRequired,
    name: T.string.isRequired,
    attributes: T.object,
    textLayout: T.object.isRequired,
    subscriptions: T.object.isRequired,
    allowForeignObjects: T.bool.isRequired,
    circleRadius: T.number,
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
          d: this.drawPath()
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
    pathFunc: T.oneOfType([T.oneOf(['diagonal', 'elbow', 'straight']), T.func]).isRequired,
    transitionDuration: T.number.isRequired,
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
        data: _this.assignInternalProperties(clone(_this.props.data)),
        rd3tSvgClassName: '_' + uuid.v4(),
        rd3tGClassName: '_' + uuid.v4()
      }, _this.internalState = {
        initialRender: true,
        targetNode: null,
        isTransitioning: false,
        d3: {
          scale: _this.props.zoom,
          translate: _this.props.translate
        }
      }, _this.handleNodeToggle = function (nodeId, evt) {
        var data = clone(_this.state.data);
        var matches = _this.findNodesById(nodeId, data, []);
        var targetNode = matches[0];
        evt.persist();
        if (_this.props.collapsible && !_this.state.isTransitioning) {
          if (targetNode._collapsed) {
            _this.expandNode(targetNode);
            _this.props.shouldCollapseNeighborNodes && _this.collapseNeighborNodes(targetNode, data);
          } else {
            _this.collapseNode(targetNode);
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
      }, _this.handleOnMouseOverCb = function (nodeId, evt) {
        var onMouseOver = _this.props.onMouseOver;
        if (onMouseOver && typeof onMouseOver === 'function') {
          var data = clone(_this.state.data);
          var matches = _this.findNodesById(nodeId, data, []);
          var targetNode = matches[0];
          evt.persist();
          onMouseOver(clone(targetNode), evt);
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
      }, _temp), possibleConstructorReturn(_this, _ret);
    }
    createClass(Tree, [{
      key: 'componentWillMount',
      value: function componentWillMount() {
        this.internalState.d3 = this.calculateD3Geometry(this.props);
      }
    }, {
      key: 'componentDidMount',
      value: function componentDidMount() {
        this.bindZoomListener(this.props);
        this.internalState.initialRender = false;
      }
    }, {
      key: 'componentDidUpdate',
      value: function componentDidUpdate(prevProps) {
        if (prevProps.transitionDuration !== this.props.transitionDuration) {
          this.bindZoomListener(this.props);
        }
        if (typeof this.props.onUpdate === 'function') {
          this.props.onUpdate({
            node: this.internalState.targetNode ? clone(this.internalState.targetNode) : null,
            zoom: this.internalState.d3.scale,
            translate: this.internalState.d3.translate
          });
          this.internalState.targetNode = null;
        }
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        if (this.props.data !== nextProps.data) {
          this.setState({
            data: this.assignInternalProperties(clone(nextProps.data))
          });
        }
        this.internalState.d3 = this.calculateD3Geometry(nextProps);
        if (!deepEqual(this.props.translate, nextProps.translate) || !deepEqual(this.props.scaleExtent, nextProps.scaleExtent) || this.props.zoom !== nextProps.zoom) {
          this.bindZoomListener(nextProps);
        }
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
              _this2.internalState.d3.scale = d3.event.scale;
              _this2.internalState.d3.translate = { x: d3.event.translate[0], y: d3.event.translate[1] };
            }
          })
          .scale(zoom).translate([translate.x, translate.y]));
        }
      }
    }, {
      key: 'assignInternalProperties',
      value: function assignInternalProperties(data) {
        var _this3 = this;
        var d = Array.isArray(data) ? data : [data];
        return d.map(function (node) {
          node.id = uuid.v4();
          if (node._collapsed === undefined) {
            node._collapsed = false;
          }
          if (node.children && node.children.length > 0) {
            node.children = _this3.assignInternalProperties(node.children);
            node._children = node.children;
          }
          return node;
        });
      }
    }, {
      key: 'findNodesById',
      value: function findNodesById(nodeId, nodeSet, hits) {
        var _this4 = this;
        if (hits.length > 0) {
          return hits;
        }
        hits = hits.concat(nodeSet.filter(function (node) {
          return node.id === nodeId;
        }));
        nodeSet.forEach(function (node) {
          if (node._children && node._children.length > 0) {
            hits = _this4.findNodesById(nodeId, node._children, hits);
          }
        });
        return hits;
      }
    }, {
      key: 'findNodesAtDepth',
      value: function findNodesAtDepth(depth, nodeSet, accumulator) {
        var _this5 = this;
        accumulator = accumulator.concat(nodeSet.filter(function (node) {
          return node.depth === depth;
        }));
        nodeSet.forEach(function (node) {
          if (node._children && node._children.length > 0) {
            accumulator = _this5.findNodesAtDepth(depth, node._children, accumulator);
          }
        });
        return accumulator;
      }
    }, {
      key: 'collapseNode',
      value: function collapseNode(node) {
        var _this6 = this;
        node._collapsed = true;
        if (node._children && node._children.length > 0) {
          node._children.forEach(function (child) {
            _this6.collapseNode(child);
          });
        }
      }
    }, {
      key: 'expandNode',
      value: function expandNode(node) {
        node._collapsed = false;
      }
    }, {
      key: 'collapseNeighborNodes',
      value: function collapseNeighborNodes(targetNode, nodeSet) {
        var _this7 = this;
        var neighbors = this.findNodesAtDepth(targetNode.depth, nodeSet, []).filter(function (node) {
          return node.id !== targetNode.id;
        });
        neighbors.forEach(function (neighbor) {
          return _this7.collapseNode(neighbor);
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
    }, {
      key: 'render',
      value: function render() {
        var _this8 = this;
        var _generateTree = this.generateTree(),
            nodes = _generateTree.nodes,
            links = _generateTree.links;
        var _state2 = this.state,
            rd3tSvgClassName = _state2.rd3tSvgClassName,
            rd3tGClassName = _state2.rd3tGClassName;
        var _props2 = this.props,
            nodeSvgShape = _props2.nodeSvgShape,
            nodeLabelComponent = _props2.nodeLabelComponent,
            orientation = _props2.orientation,
            pathFunc = _props2.pathFunc,
            transitionDuration = _props2.transitionDuration,
            zoomable = _props2.zoomable,
            textLayout = _props2.textLayout,
            nodeSize = _props2.nodeSize,
            depthFactor = _props2.depthFactor,
            initialDepth = _props2.initialDepth,
            separation = _props2.separation,
            circleRadius = _props2.circleRadius,
            allowForeignObjects = _props2.allowForeignObjects,
            styles = _props2.styles;
        var _internalState$d = this.internalState.d3,
            translate = _internalState$d.translate,
            scale = _internalState$d.scale;
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
                  transitionDuration: transitionDuration,
                  styles: styles.links
                });
              }),
              nodes.map(function (nodeData) {
                return React.createElement(Node, {
                  key: nodeData.id,
                  nodeSvgShape: _extends({}, nodeSvgShape, nodeData.nodeSvgShape),
                  nodeLabelComponent: nodeLabelComponent,
                  nodeSize: nodeSize,
                  orientation: orientation,
                  transitionDuration: transitionDuration,
                  nodeData: nodeData,
                  name: nodeData.name,
                  attributes: nodeData.attributes,
                  onClick: _this8.handleNodeToggle,
                  onMouseOver: _this8.handleOnMouseOverCb,
                  onMouseOut: _this8.handleOnMouseOutCb,
                  textLayout: textLayout,
                  circleRadius: circleRadius,
                  subscriptions: subscriptions,
                  allowForeignObjects: allowForeignObjects,
                  styles: styles.nodes
                });
              })
            )
          )
        );
      }
    }]);
    return Tree;
  }(React.Component);
  Tree.defaultProps = {
    nodeSvgShape: {
      shape: 'circle',
      shapeProps: {
        r: 10
      }
    },
    nodeLabelComponent: null,
    onClick: undefined,
    onMouseOver: undefined,
    onMouseOut: undefined,
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
    circleRadius: undefined,
    styles: {}
  };
  Tree.propTypes = {
    data: T.oneOfType([T.array, T.object]).isRequired,
    nodeSvgShape: T.shape({
      shape: T.string,
      shapeProps: T.object
    }),
    nodeLabelComponent: T.object,
    onClick: T.func,
    onMouseOver: T.func,
    onMouseOut: T.func,
    onUpdate: T.func,
    orientation: T.oneOf(['horizontal', 'vertical']),
    translate: T.shape({
      x: T.number,
      y: T.number
    }),
    pathFunc: T.oneOfType([T.oneOf(['diagonal', 'elbow', 'straight']), T.func]),
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
    circleRadius: T.number,
    styles: T.shape({
      nodes: T.object,
      links: T.object
    })
  };

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
