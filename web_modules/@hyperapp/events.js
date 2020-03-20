var fx = function(a) {
  return function(b) {
    return [a, b]
  }
};

var rawEvent = function(name) {
  return (function(fx) {
    return function(action) {
      return [fx, { action: action }]
    }
  })(function(dispatch, props) {
    var listener = function(event) {
      dispatch(props.action, event);
    };
    addEventListener(name, listener);
    return function() {
      removeEventListener(name, listener);
    }
  })
};

// CustomEvents
var dispatchCustomEvent = fx(function(_, props) {
  dispatchEvent(
    new CustomEvent(props.name, {
      detail: props
    })
  );
});

var createOnCustomEvent = function(eventName) {
  return rawEvent(eventName)
};

var eventDetail = function(event) {
  return event.detail
};

// AnimationFrame
var onAnimationFrame = (function(fx) {
  return function(action) {
    return [fx, { action: action }]
  }
})(function(dispatch, props) {
  var id = requestAnimationFrame(function frame(timestamp) {
    id = requestAnimationFrame(frame);
    dispatch(props.action, timestamp);
  });
  return function() {
    cancelAnimationFrame(id);
  }
});

// Mouse
var onMouseUp = rawEvent("mouseup");
var onMouseDown = rawEvent("mousedown");
var onMouseEnter = rawEvent("mouseenter");
var onMouseLeave = rawEvent("mouseleave");
var onMouseMove = rawEvent("mousemove");
var onMouseOver = rawEvent("mouseover");
var onMouseOut = rawEvent("mouseout");

// Touch
var onTouchStart = rawEvent("touchstart");
var onTouchMove = rawEvent("touchmove");
var onTouchEnd = rawEvent("touchend");

// Keyboard
var onKeyDown = rawEvent("keydown");
var onKeyUp = rawEvent("keyup");

// Window
var onFocus = rawEvent("focus");
var onBlur = rawEvent("blur");

// Event options
var eventOptions = (function(fx) {
  return function(props) {
    return [fx, props]
  }
})(function(dispatch, props) {
  if (props.preventDefault) props.event.preventDefault();
  if (props.stopPropagation) props.event.stopPropagation();
  if (props.action != undefined) dispatch(props.action, props.event);
});

var preventDefault = function(action) {
  return function(state, event) {
    return [
      state,
      eventOptions({ preventDefault: true, action: action, event: event })
    ]
  }
};

var stopPropagation = function(action) {
  return function(state, event) {
    return [
      state,
      eventOptions({ stopPropagation: true, action: action, event: event })
    ]
  }
};

// Other
var eventKey = function(event) {
  return event.key
};

var targetValue = function(event) {
  return event.target.value
};

var targetChecked = function(event) {
  return event.target.checked
};

export { createOnCustomEvent, dispatchCustomEvent, eventDetail, eventKey, eventOptions, onAnimationFrame, onBlur, onFocus, onKeyDown, onKeyUp, onMouseDown, onMouseEnter, onMouseLeave, onMouseMove, onMouseOut, onMouseOver, onMouseUp, onTouchEnd, onTouchMove, onTouchStart, preventDefault, stopPropagation, targetChecked, targetValue };
