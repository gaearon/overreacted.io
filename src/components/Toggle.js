/*
 * Copyright (c) 2015 instructure-react
 * Forked from https://github.com/aaronshaf/react-toggle/
 * + applied https://github.com/aaronshaf/react-toggle/pull/90
 **/

import './Toggle.css';

import React from 'react';

// Copyright 2015-present Drifty Co.
// http://drifty.com/
// from: https://github.com/driftyco/ionic/blob/master/src/util/dom.ts
function pointerCoord(event) {
  // get coordinates for either a mouse click
  // or a touch depending on the given event
  if (event) {
    const changedTouches = event.changedTouches;
    if (changedTouches && changedTouches.length > 0) {
      const touch = changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
    const pageX = event.pageX;
    if (pageX !== undefined) {
      return { x: pageX, y: event.pageY };
    }
  }
  return { x: 0, y: 0 };
}

const Toggle = props => {
  const inputRef = React.useRef();
  const instanceStateRef = React.useRef({
    previouslyChecked: !!(props.checked || props.defaultChecked),
  });
  const [focused, setFocused] = React.useState(false);
  const [checked, setChecked] = React.useState(
    !!(props.checked || props.defaultChecked)
  );

  React.useEffect(() => {
    if ('checked' in props) {
      setChecked(!!props.checked);
      instanceStateRef.current.previouslyChecked = !!props.checked;
    }
  }, [props]);

  const handleClick = event => {
    const checkbox = inputRef.current;
    instanceStateRef.current.previouslyChecked = checkbox.checked;
    if (event.target !== checkbox && !instanceStateRef.current.moved) {
      event.preventDefault();
      checkbox.focus();
      checkbox.click();
      return;
    }
    setChecked(checkbox.checked);
  };

  const handleTouchStart = event => {
    instanceStateRef.current.startX = pointerCoord(event).x;
    instanceStateRef.current.touchStarted = true;
    instanceStateRef.current.hadFocusAtTouchStart = focused;
    setFocused(true);
  };

  const handleTouchMove = event => {
    if (!instanceStateRef.current.touchStarted) return;
    instanceStateRef.current.touchMoved = true;

    if (instanceStateRef.current.startX != null) {
      let currentX = pointerCoord(event).x;
      if (checked && currentX + 15 < instanceStateRef.current.startX) {
        setChecked(false);
        instanceStateRef.current.startX = currentX;
      } else if (!checked && currentX - 15 > instanceStateRef.current.startX) {
        setChecked(true);
        instanceStateRef.current.startX = currentX;
      }
    }
  };

  const handleTouchEnd = event => {
    if (!instanceStateRef.current.touchMoved) return;
    const checkbox = inputRef.current;
    event.preventDefault();

    if (instanceStateRef.current.startX != null) {
      if (instanceStateRef.current.previouslyChecked !== checked) {
        checkbox.click();
      }

      instanceStateRef.current.touchStarted = false;
      instanceStateRef.current.startX = null;
      instanceStateRef.current.touchMoved = false;
    }

    if (!instanceStateRef.current.hadFocusAtTouchStart) {
      setFocused(false);
    }
  };

  const handleTouchCancel = event => {
    if (instanceStateRef.current.startX != null) {
      instanceStateRef.current.touchStarted = false;
      instanceStateRef.current.startX = null;
      instanceStateRef.current.touchMoved = false;
    }

    if (!instanceStateRef.current.hadFocusAtTouchStart) {
      setFocused(false);
    }
  };

  const handleFocus = event => {
    const { onFocus } = props;

    if (onFocus) {
      onFocus(event);
    }

    instanceStateRef.current.hadFocusAtTouchStart = true;
    setFocused(true);
  };

  const handleBlur = event => {
    const { onBlur } = props;

    if (onBlur) {
      onBlur(event);
    }

    instanceStateRef.current.hadFocusAtTouchStart = false;
    setFocused(false);
  };

  const getIcon = type => {
    const { icons } = props;
    if (!icons) {
      return null;
    }
    return icons[type] === undefined
      ? Toggle.defaultProps.icons[type]
      : icons[type];
  };

  const { className, icons: _icons, ...inputProps } = props;
  const classes =
    'react-toggle' +
    (checked ? ' react-toggle--checked' : '') +
    (focused ? ' react-toggle--focus' : '') +
    (props.disabled ? ' react-toggle--disabled' : '') +
    (className ? ' ' + className : '');

  return (
    <div
      className={classes}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <div className="react-toggle-track">
        <div className="react-toggle-track-check">{getIcon('checked')}</div>
        <div className="react-toggle-track-x">{getIcon('unchecked')}</div>
      </div>
      <div className="react-toggle-thumb" />

      <input
        {...inputProps}
        ref={inputRef}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="react-toggle-screenreader-only"
        type="checkbox"
        aria-label="Switch between Dark and Light mode"
      />
    </div>
  );
};

export default Toggle;
