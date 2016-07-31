/**
 * @fileoverview mbot framework for runner instances.
 *
 * @license Copyright 2016 Shenzhen Maker Works Co, Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author wangyu@makeblock.cc (Yu Wang)
 * @author mbordihn@google.com (Markus Bordihn)
 */
goog.provide('cwc.framework.mBot');

goog.require('cwc.framework.Runner');



/**
 * @constructor
 * @param {!Function} code
 * @struct
 * @final
 * @export
 */
cwc.framework.mBot = function(code) {
  /** @type {string} */
  this.name = 'mbot Framework';

  /** @type {Function} */
  this.code = function() {code(this);}.bind(this);

  /** @private {!function(?)} */
  this.emptyFunction_ = function() {};

  /** @type {!function(?)} */
  this.ultrasonicSensorEvent = this.emptyFunction_;

  /** @type {!function(?)} */
  this.lightnessSensorEvent = this.emptyFunction_;

  /** @type {!cwc.framework.Runner} */
  this.runner = new cwc.framework.Runner(this.code, this);

  /** @type {float} [description] */
  this.ultrasonicSensorValue = 99999;

  /** @type {float} [description] */
  this.lightnessSensorValue = 99999;

  /** @type {!number} */
  this.motorSpeed = 60 / 60;

  // External commands
  this.runner.addCommand('updateUltrasonicSensor',
    this.handleUpdateUltrasonicSensorValue_);
  this.runner.addCommand('updateLightnessSensor',
    this.handleUpdateLightnessSensorValue_);
};


/**
 * beep the buzzer on mbot
 * @export
 */
cwc.framework.mBot.prototype.beepBuzzer = function() {
  this.runner.send('beepBuzzer');
};


/**
 * Set the on-board LED color of the mBOt
 * @param {string} position
 *   position of the on-board LED: 0-both, 1-left, 2-right
 * @param {string} color css color of the color (#rrggbb)
 * @param {void} opt_delay
 * @export
 */
cwc.framework.mBot.prototype.setLEDColor = function(position, color,
    opt_delay) {
  console.log('pos: ' + position + ' color: ' + color);
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  var red = parseInt(result[1], 16);
  var green = parseInt(result[2], 16);
  var blue = parseInt(result[3], 16);

  var positionId = 0;
  if (position == 'left') {
    positionId = 1;
  } else if (position == 'right') {
    positionId = 2;
  }

  this.runner.send('setLEDColor', {
    'position': positionId, 'red': red, 'green': green, 'blue': blue
  }, opt_delay);
};


/**
 * play a music note through the buzzer
 * @param  {int} frequency frequency of the note
 * @param  {int} duration  duration in milliseconds
 * @param  {null} opt_delay
 * @export
 */
cwc.framework.mBot.prototype.playNote = function(frequency, duration,
    opt_delay) {
  this.runner.send('playNote', {
    'frequency': frequency, 'duration': duration}, opt_delay);
};


/**
 * get values from ultrasonic sensors
 * @return {void}
 * @export
 */
cwc.framework.mBot.prototype.getUltrasonicSensorValue = function() {
  console.log('read ultrasonic sensor and get ' + this.ultrasonicSensorValue);
  return this.ultrasonicSensorValue;
};


/**
 * get values from lightness sensors
 * @return {void}
 * @export
 */
cwc.framework.mBot.prototype.getLightnessSensorValue = function() {
  return this.lightnessSensorValue;
};


/**
 * @param {!number} steps
 * @param {!number} opt_speed
 * @return {!number} Calculated delay + buffer.
 * @export
 */
cwc.framework.mBot.prototype.getDelay = function(steps, opt_speed) {
  var buffer = 250;
  var motorSpeed = this.motorSpeed;
  var speed = opt_speed || 50;
  var delay = Math.floor(
    (((steps / 360) * Math.abs(100 / speed)) / motorSpeed) * 1000 + buffer);
  return delay;
};


/**
 * Turn mBot at a speed
 * @param  {int} steps how long should the mBot rotate
 * @param {number=} opt_speed 0 - 255
 * @param {number=} opt_delay in msec
 * @export
 */
cwc.framework.mBot.prototype.turn = function(steps, opt_speed, opt_delay) {
  var speed = opt_speed || 50;
  var delay = opt_delay === true ? this.getDelay(steps, opt_speed) : opt_delay;
  this.runner.send('turn', {
    'steps': steps,
    'speed': speed}, delay);
};


/**
 * Move mBot for certain speeds
 * @param {number} steps how long should the mBot walk
 * @param {number=} opt_speed 0 - 255
 * @param {number=} opt_delay in msec
 * @export
 */
cwc.framework.mBot.prototype.moveSteps = function(steps, opt_speed, opt_delay) {
  var speed = opt_speed || 50;
  var delay = opt_delay === true ? this.getDelay(steps, opt_speed) : opt_delay;
  this.runner.send('moveSteps', {
    'steps': steps,
    'speed': speed}, delay);
};


/**
 * Waits for the given time.
 * @param {!number} time in msec
 * @export
 */
cwc.framework.mBot.prototype.wait = function(time) {
  this.runner.send('wait', null, time);
};


/**
 * Stop the mBot
 * @param {number=} opt_delay in msec
 * @export
 */
cwc.framework.mBot.prototype.stop = function(opt_delay) {
  this.runner.send('stop', null, opt_delay);
};


/**
 * @param {!Function} func
 * @export
 */
cwc.framework.mBot.prototype.onUltrasonicSensorChange = function(func) {
  if (goog.isFunction(func)) {
    this.ultrasonicSensorEvent = func;
  }
};


/**
 * @param {!Function} func
 * @export
 */
cwc.framework.mBot.prototype.onLightnessSensorChange = function(func) {
  if (goog.isFunction(func)) {
    this.lightnessSensorEvent = func;
  }
};


/**
 * @param {!number} data
 * @private
 */
cwc.framework.mBot.prototype.handleUpdateUltrasonicSensorValue_ = function(
    data) {
  this.ultrasonicSensorValue = data;
  this.ultrasonicSensorEvent(data);
};


/**
 * @param {!number} data
 * @private
 */
cwc.framework.mBot.prototype.handleUpdateLightnessSensorValue_ = function(
    data) {
  this.lightnessSensorValue = data;
  this.lightnessSensorEvent(data);
};
