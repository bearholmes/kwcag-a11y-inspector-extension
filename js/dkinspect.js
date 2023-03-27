"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, catch: function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
/*!
 * BASE on CSSViewer, CSSViewer 기반으로 작성되었습니다.
 * CSSViewer, A Google Chrome Extension for fellow web developers, web designers, and hobbyists.
 *
 * https://github.com/miled/cssviewer
 * https://chrome.google.com/webstore/detail/cssviewer/ggfgijbpiheegefliciemofobhmofgce
 *
 * Copyright (c) 2006, 2008 Nicolas Huon
 *
 * This source code is licensed under the GNU General Public License,
 * Version 2. See the file COPYING for more details.
 */

// "chrome.storage.sync" API를 이용하여, 저장된 데이터를 읽어오는 함수를 정의합니다.
function readData(myKey) {
  // Promise 객체를 생성합니다.
  return new Promise(function (resolve) {
    // "chrome.storage.sync.get" 함수를 호출하여 데이터를 읽어옵니다.
    chrome.storage.sync.get(myKey, function (data) {
      // 읽어온 데이터를 Promise 객체를 통해 반환합니다.
      resolve(data);
    });
  });
}
function myApp() {
  return _myApp.apply(this, arguments);
}
function _myApp() {
  _myApp = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var _yield$readData, ccshow, _yield$readData2, resolutions, _yield$readData3, monitors, _yield$readData4, linkmode, _yield$readData5, bgmode, _yield$readData6, linetype, _yield$readData7, colortype, _yield$readData8, trackingmode, _yield$readData9, _yield$readData9$bord, bordersize, _resolutions$split, _resolutions$split2, width, height, diagonal, std_px, opt, dkInspect_pColorBg, dkInspect_pLength, dkInspect_pBox, dkInspect_categories, dkInspect_categoriesTitle, dkInspect_hexa, GetCurrentDocument, DecToHex, RGBToHex, RGBToHexStr, RemoveExtraFloat, getL, getRGB, getsRGB, GetCSSProperty, SetCSSProperty, SetCSSPropertyIf, getLeft, getTop, getWidth, getHeight, SetCSSDiagonal, SetCSSColorContrast, SetCSSPropertyValue, SetCSSPropertyValueIf, HideCSSProperty, HideCSSCategory, ShowCSSCategory, UpdateColorBg, UpdateLength, UpdateBox, dkInspectMouseOver, dkInspectMouseOut, dkInspectMouseMove, dkInspectIsElementInViewport, DkInspect, tracking, dkInspectInsertMessage, dkInspectRemoveElement, dkInspectPause, shortcut, dkInspect;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          dkInspectRemoveElement = function _dkInspectRemoveEleme(divId) {
            var element = document.getElementById(divId);
            if (element) {
              document.getElementsByTagName('BODY')[0].removeChild(element);
            }
          };
          dkInspectInsertMessage = function _dkInspectInsertMessa(msg) {
            var oNewP = document.createElement('p'); // 새로운 p 태그 생성
            var oText = document.createTextNode(msg); // 전달받은 메시지로 text 노드 생성

            // p 태그 속성 설정
            oNewP.appendChild(oText); // p 태그에 text 노드 추가
            oNewP.id = 'dkInspectInsertMessage';
            oNewP.style.backgroundColor = '#3c77eb';
            oNewP.style.color = '#ffffff';
            oNewP.style.position = 'fixed';
            oNewP.style.top = '10px';
            oNewP.style.left = '10px';
            oNewP.style.zIndex = '99999999';
            oNewP.style.padding = '5px';
            oNewP.style.fontSize = '14px';
            oNewP.style.fontWeight = 'bold';
            document.getElementsByTagName('BODY')[0].appendChild(oNewP); // BODY에 p 태그 추가
          };
          DkInspect = function _DkInspect() {
            // dkInspect_block을 생성하는 함수
            this.CreateBlock = function () {
              // 현재 문서(document)를 가져옴
              var document = GetCurrentDocument();
              var block;
              if (document) {
                // div 요소를 생성하고 id를 'dkInspect_block'로 설정함
                block = document.createElement('div');
                block.id = 'dkInspect_block';

                // CSS 선택자를 위한 제목(title)을 추가함
                var header = document.createElement('h1');
                header.appendChild(document.createTextNode(''));
                block.appendChild(header);

                // 모든 속성을 추가함
                var center = document.createElement('div');
                center.id = 'dkInspect_center';

                // dkInspect_categories 객체의 속성을 반복함
                for (var cat in dkInspect_categories) {
                  var div = document.createElement('div');
                  div.id = "dkInspect_".concat(cat);
                  div.className = 'dkInspect_category';

                  // 카테고리 제목을 추가함
                  var h2 = document.createElement('h2');
                  h2.appendChild(document.createTextNode(dkInspect_categoriesTitle[cat]));

                  // 속성 목록을 추가함
                  var ul = document.createElement('ul');
                  var properties = dkInspect_categories[cat];

                  // 속성을 반복하면서 각각의 요소(li)를 생성함
                  var _iterator2 = _createForOfIteratorHelper(properties),
                    _step2;
                  try {
                    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                      var item = _step2.value;
                      var li = document.createElement('li');
                      li.id = "dkInspect_".concat(item);

                      // 속성 이름과 값에 대한 span 요소를 생성함
                      var spanName = document.createElement('span');
                      spanName.className = 'dkInspect_property';
                      var spanValue = document.createElement('span');
                      spanName.appendChild(document.createTextNode(item));
                      li.appendChild(spanName);
                      li.appendChild(spanValue);
                      ul.appendChild(li);
                    }
                  } catch (err) {
                    _iterator2.e(err);
                  } finally {
                    _iterator2.f();
                  }
                  div.appendChild(h2);
                  div.appendChild(ul);
                  center.appendChild(div);
                }

                // dkInspect_block에 추가함
                block.appendChild(center);
              }

              // '이 페이지에서 검사 할 요소 위로 포인터를 올려주세요.' 메시지를 출력함
              dkInspectInsertMessage('이 페이지에서 검사 할 요소 위로 포인터를 올려주세요.');

              // 생성된 dkInspect_block을 반환함
              return block;
            };

            // 현재 문서의 모든 요소를 반환하는 함수
            this.GetAllElements = function (element) {
              var elements = [];
              if (element && element.hasChildNodes()) {
                // 현재 요소가 자식 요소를 가지고 있을 경우, 현재 요소를 elements 배열에 추가한다.
                elements.push(element);
                // 현재 요소의 모든 자식 요소를 가져와서 재귀적으로 GetAllElements 함수를 호출한다.
                var child = element.childNodes;
                for (var i = 0; i < child.length; i++) {
                  if (child[i].hasChildNodes()) {
                    // 자식 요소가 또 자식 요소를 가지고 있는 경우, 재귀 호출을 통해 해당 요소의 모든 자식 요소를 가져온다.
                    elements = elements.concat(this.GetAllElements(child[i]));
                  } else if (child[i].nodeType === 1) {
                    // 자식 요소가 텍스트 노드가 아닌 요소인 경우, elements 배열에 추가한다.
                    elements.push(child[i]);
                  }
                }
              }
              // 모든 요소를 포함하는 elements 배열을 반환한다.
              return elements;
            };

            // Add event listeners for all elements in the current document
            // 모든 요소에 이벤트 리스너를 추가하는 함수
            this.AddEventListeners = function () {
              var document = GetCurrentDocument();
              // 문서의 모든 요소를 가져온다.
              var elements = this.GetAllElements(document.body);

              // FRAMESET 요소가 포함되어 있는 경우, 진단이 불가능하므로 경고 메시지를 출력하고 함수를 종료한다.
              if (window.frames.document.body.nodeName === 'FRAMESET') {
                alert('크롬 브라우저에서는 FRAMESET의 진단이 불가능합니다.');
                dkInspectRemoveElement('dkInspectInsertMessage');
                return false;
              } else {
                // 모든 요소에 대해 이벤트 리스너를 추가한다.
                elements.forEach(function (item) {
                  item.addEventListener('mouseover', dkInspectMouseOver, false);
                  item.addEventListener('mouseout', dkInspectMouseOut, false);
                  item.addEventListener('mousemove', dkInspectMouseMove, false);
                });
                // 만약 프레임이 존재하는 경우, 모든 프레임 내의 요소에 대해 이벤트 리스너를 추가한다.
                if (window.frames.length > 0) {
                  for (var k = 0; k < window.frames.length; k++) {
                    var frameEl = window.frames[k].document.body;
                    var frameEls = this.GetAllElements(frameEl);
                    frameEls.forEach(function (item) {
                      item.addEventListener('mouseover', dkInspectMouseOver, false);
                      item.addEventListener('mouseout', dkInspectMouseOut, false);
                      item.addEventListener('mousemove', dkInspectMouseMove, false);
                    });
                  }
                }
              }
            };

            // 모든 요소의 이벤트 리스너를 제거하는 함수
            this.RemoveEventListeners = function () {
              var document = GetCurrentDocument();
              // 문서의 모든 요소를 가져온다.
              var elements = this.GetAllElements(document.body);

              // 모든 요소에 대해 이벤트 리스너를 제거한다.
              elements.forEach(function (item) {
                item.removeEventListener('mouseover', dkInspectMouseOver, false);
                item.removeEventListener('mouseout', dkInspectMouseOut, false);
                item.removeEventListener('mousemove', dkInspectMouseMove, false);
              });

              // 만약 프레임이 존재하는 경우, 모든 프레임 내의 요소에 대해 이벤트 리스너를 제거한다.
              if (window.frames.length > 0) {
                for (var k = 0; k < window.frames.length; k++) {
                  var frameEl = window.frames[k].document.body;
                  if (frameEl) {
                    var frameEls = this.GetAllElements(frameEl);
                    frameEls.forEach(function (item) {
                      item.removeEventListener('mouseover', dkInspectMouseOver, false);
                      item.removeEventListener('mouseout', dkInspectMouseOut, false);
                      item.removeEventListener('mousemove', dkInspectMouseMove, false);
                    });
                  }
                }
              }
            };
          };
          dkInspectIsElementInViewport = function _dkInspectIsElementIn(el) {
            // 요소의 위치와 크기 정보를 구한다.
            var rect = el.getBoundingClientRect();

            // 요소가 현재 화면 안에 포함되어 있는지를 반환한다.
            // 요소의 top과 left 값이 모두 0 이상이고, bottom 값이 현재 화면의 높이 이하이며,
            // right 값이 현재 화면의 넓이 이하일 경우에 true를 반환한다.
            return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
          };
          dkInspectMouseMove = function _dkInspectMouseMove(e) {
            var document = GetCurrentDocument();
            var block = document.getElementById('dkInspect_block');
            var trackingEl = document.getElementById('dkInspect_tracking');
            // 'dkInspect_block' 요소가 없으면 함수를 종료한다.
            if (!block) {
              return;
            }
            if (opt.trackingmode) {
              if (this.tagName.toLowerCase() === 'a' || this.tagName.toLowerCase() === 'button' || this.tagName.toLowerCase() === 'input' || this.tagName.toLowerCase() === 'area') {
                trackingEl.style.display = 'block';
              } else {
                if (this.id === 'dkInspect_tracking') {
                  trackingEl.style.display = 'block';
                } else if (this.parentElement.nodeName.toLowerCase() === 'a' || this.parentElement.nodeName.toLowerCase() === 'button' || this.parentElement.nodeName.toLowerCase() === 'input') {
                  trackingEl.style.display = 'block';
                } else {
                  trackingEl.style.display = 'none';
                }
              }
            } else if (opt.linkmode === 1) {
              if (this.tagName.toLowerCase() === 'a' || this.tagName.toLowerCase() === 'button' || this.tagName.toLowerCase() === 'input' || this.tagName.toLowerCase() === 'area') {
                block.style.display = 'block';
              } else if (this.parentElement.nodeName.toLowerCase() === 'a' || this.parentElement.nodeName.toLowerCase() === 'button' || this.parentElement.nodeName.toLowerCase() === 'input') {
                block.style.display = 'block';
              } else {
                this.style.outlineWidth = '';
                this.style.outlineColor = '';
                this.style.outlineStyle = '';
                this.style.outlineOffset = '';
              }
            } else {
              block.style.display = 'block';
            }
            if (this.tagName.toLowerCase() === 'body' || this.tagName.toLowerCase() === 'frame') {
              if (opt.trackingmode) {
                trackingEl.style.display = 'none';
              }
            }

            // dkInspect_block의 위치를 설정하는 코드
            var pageWidth = window.innerWidth;
            var pageHeight = window.innerHeight;
            var blockWidth = 332;

            // dkInspect_block의 높이를 가져옴
            var blockHeight = parseInt(document.defaultView.getComputedStyle(block, null).height);

            // dkInspect_block이 페이지 너비를 벗어나는 경우
            if (e.pageX + blockWidth > pageWidth) {
              // dkInspect_block을 왼쪽으로 이동시킴
              if (e.pageX - blockWidth - 10 > 0) block.style.left = "".concat(e.pageX - blockWidth - 40, "px");else block.style.left = "0px";
            } else block.style.left = "".concat(e.pageX + 20, "px");

            // dkInspect_block이 페이지 높이를 벗어나는 경우
            if (e.pageY + blockHeight > pageHeight) {
              // dkInspect_block을 위쪽으로 이동시킴
              if (e.pageY - blockHeight - 10 > 0) block.style.top = "".concat(e.pageY - blockHeight - 20, "px");else block.style.top = "0px";
            } else block.style.top = "".concat(e.pageY + 20, "px");

            // dkInspect_block의 위치를 스크롤 위치에 맞게 조정하는 코드
            var inView = dkInspectIsElementInViewport(block);

            // dkInspect_block이 화면에 보이지 않는 경우
            if (!inView) block.style.top = "".concat(window.scrollY + 20, "px");

            // 이벤트 전파 방지
            e.stopPropagation();
          };
          dkInspectMouseOut = function _dkInspectMouseOut(e) {
            if (opt.trackingmode) {
              // 트래킹 모드가 활성화되어 있으면
              var trackingEl = document.getElementById('dkInspect_tracking');
              if (this.id === 'dkInspect_tracking') {
                // 마우스가 'dkInspect_tracking' 요소에서 벗어나지 않았으면 해당 요소를 보이게 한다.
                trackingEl.style.display = 'block';
              } else {
                // 마우스가 'dkInspect_tracking' 요소에서 벗어났으면 해당 요소를 숨긴다.
                if (trackingEl) trackingEl.style.display = 'none';
              }
            } else {
              // 트래킹 모드가 비활성화되어 있으면 outline 속성을 초기화한다.
              this.style.outlineWidth = '';
              this.style.outlineColor = '';
              this.style.outlineStyle = '';
              this.style.outlineOffset = '';
            }
            // 이벤트 전파를 중단한다.
            e.stopPropagation();
          };
          dkInspectMouseOver = function _dkInspectMouseOver(e) {
            var _this = this;
            // 필요한 변수들을 선언합니다.
            var document = GetCurrentDocument();
            var block = document.getElementById('dkInspect_block');
            var trackingEl = document.getElementById('dkInspect_tracking');
            if (!block) {
              return;
            }
            if (this.tagName.toLowerCase() !== 'body') {
              // 만약 추적 모드가 활성화되어 있다면
              if (opt.trackingmode) {
                // 클릭된 요소의 id가 'dkInspect_tracking'이 아니라면
                if (e.target.id !== 'dkInspect_tracking') {
                  // 요소를 아웃라인으로 강조하기
                  trackingEl.style.width = "".concat(parseInt(getWidth(this)), "px");
                  trackingEl.style.height = "".concat(parseInt(getHeight(this)), "px");
                  trackingEl.style.left = "".concat(parseInt(getLeft(this)), "px");
                  trackingEl.style.top = "".concat(parseInt(getTop(this)), "px");
                  trackingEl.style.display = 'block';
                }
              } else {
                // 아웃라인으로 요소를 강조하지 않는다면, 대신 다른 스타일 속성을 사용한다.
                this.style.setProperty('outline-width', "".concat(opt.bordersize, "px"), 'important');
                this.style.setProperty('outline-color', opt.colortype, 'important');
                this.style.setProperty('outline-style', opt.linetype, 'important');
                this.style.setProperty('outline-offset', '-' + opt.bordersize + 'px', 'important');
              }
            }
            var type1 = function type1() {
              var tit = "<".concat(_this.tagName);
              if (_this.type) {
                tit += " [".concat(_this.type, "]");
              }
              // 요소의 id와 클래스 이름을 제목에 추가한다.
              tit += ">".concat(_this.id === '' ? '' : " #".concat(_this.id)).concat(_this.className === '' ? '' : " .".concat(_this.className));
              block.firstChild.textContent = tit;
              // CSS 속성 업데이트
              var element = document.defaultView.getComputedStyle(_this, null);
              UpdateLength(element, opt, _this);
              UpdateBox(element);

              // 배경색 관련 CSS 카테고리 업데이트
              if (opt.ccshow === 1) {
                UpdateColorBg(element);
              } else {
                HideCSSCategory('pColorBg');
              }

              // 블록을 보여준다.
              block.style.display = 'block';
            };
            var type2 = function type2() {
              var tit = "<".concat(_this.parentElement.nodeName);
              if (_this.parentElement.type) {
                tit += " [".concat(_this.parentElement.type, "]");
              }
              // 요소를 포함하는 요소의 id와 클래스 이름을 제목에 추가한다.
              tit += ">".concat(_this.parentElement.id === '' ? '' : " #".concat(_this.parentElement.id)).concat(_this.parentElement.className === '' ? '' : " .".concat(_this.parentElement.className));
              block.firstChild.textContent = tit;
              // CSS 속성 업데이트
              var element = document.defaultView.getComputedStyle(_this.parentElement, null);
              UpdateLength(element, opt, _this.parentElement);
              UpdateBox(element);

              // 배경색 관련 CSS 카테고리 업데이트
              if (opt.ccshow === 1) {
                UpdateColorBg(element);
              } else {
                HideCSSCategory('pColorBg');
              }
              // 블록을 보여준다.
              block.style.display = 'block';
            };
            if (opt.trackingmode) {
              if (this.id !== 'dkInspect_tracking') {
                var _this$parentElement;
                var tagName = this.tagName.toLowerCase();
                var parentTagName = (_this$parentElement = this.parentElement) === null || _this$parentElement === void 0 ? void 0 : _this$parentElement.nodeName.toLowerCase();
                // 링크(a), 버튼(button), 입력란(input), 이미지 맵(area) 요소의 태그 이름과 유형(type)을 제목에 추가한다.
                if (tagName === 'a' || tagName === 'button' || tagName === 'input' || tagName === 'area') {
                  type1();
                } else {
                  // 블록을 숨긴다.
                  block.style.display = 'none';
                }

                // 요소를 포함하는 링크(a), 버튼(button), 입력란(input) 요소의 태그 이름과 유형(type)을 제목에 추가한다.
                if (parentTagName === 'a' || parentTagName === 'button' || parentTagName === 'input') {
                  type2();
                  trackingEl.style.display = 'block';
                }
              }
            } else if (opt.linkmode === 1) {
              var _this$parentElement2;
              var _tagName = this.tagName.toLowerCase();
              var _parentTagName = (_this$parentElement2 = this.parentElement) === null || _this$parentElement2 === void 0 ? void 0 : _this$parentElement2.nodeName.toLowerCase();

              // 링크(a), 버튼(button), 입력란(input), 이미지 맵(area) 요소의 태그 이름과 유형(type)을 제목에 추가한다.
              if (_tagName === 'a' || _tagName === 'button' || _tagName === 'input' || _tagName === 'area') {
                type1();
              }
              // 요소를 포함하는 링크(a), 버튼(button), 입력란(input) 요소의 태그 이름과 유형(type)을 제목에 추가한다.
              else if (_parentTagName === 'a' || _parentTagName === 'button' || _parentTagName === 'input') {
                type2();
              } else {
                // 블록을 숨긴다.
                block.style.display = 'none';
              }
            } else {
              type1();
            }

            // 'dkInspectInsertMessage' 요소를 삭제한다.
            dkInspectRemoveElement('dkInspectInsertMessage');

            // 이벤트 전파를 중단한다.
            e.stopPropagation();
          };
          UpdateBox = function _UpdateBox(element) {
            // Height와 Width 속성 값이 auto가 아닌 경우에만 height와 width 속성 값을 li 엘리먼트에 표시합니다.
            SetCSSPropertyIf(element, 'height', RemoveExtraFloat(GetCSSProperty(element, 'height')) !== 'auto');
            SetCSSPropertyIf(element, 'width', RemoveExtraFloat(GetCSSProperty(element, 'width')) !== 'auto');

            // Border 정보를 가져와 각각의 속성 값에 따라 border-top, border-bottom, border-right, border-left 또는 border 속성에 값을 할당하고 표시합니다.
            var borderTop = RemoveExtraFloat(GetCSSProperty(element, 'border-top-width')) + ' ' + GetCSSProperty(element, 'border-top-style') + ' ' + RGBToHex(GetCSSProperty(element, 'border-top-color'));
            var borderBottom = RemoveExtraFloat(GetCSSProperty(element, 'border-bottom-width')) + ' ' + GetCSSProperty(element, 'border-bottom-style') + ' ' + RGBToHex(GetCSSProperty(element, 'border-bottom-color'));
            var borderRight = RemoveExtraFloat(GetCSSProperty(element, 'border-right-width')) + ' ' + GetCSSProperty(element, 'border-right-style') + ' ' + RGBToHex(GetCSSProperty(element, 'border-right-color'));
            var borderLeft = RemoveExtraFloat(GetCSSProperty(element, 'border-left-width')) + ' ' + GetCSSProperty(element, 'border-left-style') + ' ' + RGBToHex(GetCSSProperty(element, 'border-left-color'));
            if (borderTop === borderBottom && borderBottom === borderRight && borderRight === borderLeft && GetCSSProperty(element, 'border-top-style') !== 'none') {
              SetCSSPropertyValue(element, 'border', borderTop);
              HideCSSProperty('border-top');
              HideCSSProperty('border-bottom');
              HideCSSProperty('border-right');
              HideCSSProperty('border-left');
            } else {
              SetCSSPropertyValueIf(element, 'border-top', borderTop, GetCSSProperty(element, 'border-top-style') !== 'none');
              SetCSSPropertyValueIf(element, 'border-bottom', borderBottom, GetCSSProperty(element, 'border-bottom-style') !== 'none');
              SetCSSPropertyValueIf(element, 'border-right', borderRight, GetCSSProperty(element, 'border-right-style') !== 'none');
              SetCSSPropertyValueIf(element, 'border-left', borderLeft, GetCSSProperty(element, 'border-left-style') !== 'none');
              HideCSSProperty('border');
            }

            // Margin 값과 padding 값 정보를 가져와 각각 li 엘리먼트에 표시합니다.
            var marginTop = RemoveExtraFloat(GetCSSProperty(element, 'margin-top'));
            var marginBottom = RemoveExtraFloat(GetCSSProperty(element, 'margin-bottom'));
            var marginRight = RemoveExtraFloat(GetCSSProperty(element, 'margin-right'));
            var marginLeft = RemoveExtraFloat(GetCSSProperty(element, 'margin-left'));
            var margin = "".concat(marginTop === '0px' ? '0' : marginTop, " ").concat(marginRight === '0px' ? '0' : marginRight, " ").concat(marginBottom === '0px' ? '0' : marginBottom, " ").concat(marginLeft === '0px' ? '0' : marginLeft);
            SetCSSPropertyValueIf(element, 'margin', margin, margin !== '0 0 0 0');

            // padding
            var paddingTop = RemoveExtraFloat(GetCSSProperty(element, 'padding-top'));
            var paddingBottom = RemoveExtraFloat(GetCSSProperty(element, 'padding-bottom'));
            var paddingRight = RemoveExtraFloat(GetCSSProperty(element, 'padding-right'));
            var paddingLeft = RemoveExtraFloat(GetCSSProperty(element, 'padding-left'));
            var padding = "".concat(paddingTop === '0px' ? '0' : paddingTop, " ").concat(paddingRight === '0px' ? '0' : paddingRight, " ").concat(paddingBottom === '0px' ? '0' : paddingBottom, " ").concat(paddingLeft === '0px' ? '0' : paddingLeft);
            SetCSSPropertyValueIf(element, 'padding', padding, padding !== '0 0 0 0');
            SetCSSPropertyIf(element, 'min-height', GetCSSProperty(element, 'min-height') !== '0px');
            SetCSSPropertyIf(element, 'max-height', GetCSSProperty(element, 'max-height') !== 'none');
            SetCSSPropertyIf(element, 'min-width', GetCSSProperty(element, 'min-width') !== '0px');
            SetCSSPropertyIf(element, 'max-width', GetCSSProperty(element, 'max-width') !== 'none');
          };
          UpdateLength = function _UpdateLength(element, opt, e) {
            // height 속성 값이 숫자로 파싱 가능한 경우와 width 속성 값이 숫자로 파싱 가능한 경우에만 대각선 길이를 계산하고 li 엘리먼트에 표시
            SetCSSDiagonal(element, opt, e, !isNaN(parseFloat(GetCSSProperty(element, 'height'))), !isNaN(parseFloat(GetCSSProperty(element, 'width'))));
          };
          UpdateColorBg = function _UpdateColorBg(element) {
            // 요소의 color 속성 값을 li 엘리먼트에 표시
            SetCSSPropertyValue(element, 'color', RGBToHex(GetCSSProperty(element, 'color')));
            // 배경색이 투명하지 않은 경우 background-color 속성 값을 li 엘리먼트에 표시
            SetCSSPropertyValueIf(element, 'background-color', RGBToHex(GetCSSProperty(element, 'background-color')), GetCSSProperty(element, 'background-color') !== 'transparent');

            // 배경색이 투명하지 않은 경우 대비 비율을 계산하여 li 엘리먼트에 표시
            SetCSSColorContrast(element, GetCSSProperty(element, 'background-color') !== 'transparent');
          };
          ShowCSSCategory = function _ShowCSSCategory(category) {
            var document = GetCurrentDocument();
            // div 엘리먼트 가져오기
            var div = document.getElementById("dkInspect_".concat(category));
            // div 엘리먼트를 보여주기
            if (div) div.style.display = 'block';
          };
          HideCSSCategory = function _HideCSSCategory(category) {
            var document = GetCurrentDocument();
            // div 엘리먼트 가져오기
            var div = document.getElementById("dkInspect_".concat(category));

            // div 엘리먼트를 숨기기
            if (div) div.style.display = 'none';
          };
          HideCSSProperty = function _HideCSSProperty(property) {
            var document = GetCurrentDocument();
            // li 엘리먼트 가져오기
            var li = document.getElementById("dkInspect_".concat(property));
            // li 엘리먼트를 숨기기
            if (li) li.style.display = 'none';
          };
          SetCSSPropertyValueIf = function _SetCSSPropertyValueI(element, property, value, condition) {
            var document = GetCurrentDocument();
            // li 엘리먼트 가져오기
            var li = document.getElementById("dkInspect_".concat(property));
            // 조건이 참일 경우 li 엘리먼트의 텍스트 변경 및 보여주기
            if (condition) {
              li.lastChild.innerHTML = " : ".concat(value);
              li.style.display = 'block';
              return 1;
            }
            // 조건이 거짓일 경우 li 엘리먼트를 숨기고 0 반환
            else {
              li.style.display = 'none';
              return 0;
            }
          };
          SetCSSPropertyValue = function _SetCSSPropertyValue(element, property, value) {
            var document = GetCurrentDocument();
            // li 엘리먼트 가져오기
            var li = document.getElementById("dkInspect_".concat(property));
            // li 엘리먼트의 텍스트 변경 및 보여주기
            li.lastChild.innerHTML = " : ".concat(value);
            li.style.display = 'block';
          };
          SetCSSColorContrast = function _SetCSSColorContrast(element, condition) {
            var document = GetCurrentDocument();
            // li 엘리먼트 가져오기
            var li = document.getElementById('dkInspect_contrast');
            // 전경색과 배경색 추출하여 L값 계산
            var foreground_color = RGBToHexStr(GetCSSProperty(element, 'color')); // 전경색 값 추출
            var background_color = RGBToHexStr(GetCSSProperty(element, 'background-color')); // 배경색 값 추출
            var L1 = getL(foreground_color); // 전경색의 L값 계산
            var L2 = getL(background_color); // 배경색의 L값 계산

            // 대비 비율 계산
            var ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);

            // 조건이 참일 경우 li 엘리먼트에 대비 비율 값을 넣고 보여주기
            if (condition) {
              li.lastChild.innerHTML = " : ".concat(Math.round(ratio * 100) / 100, ":1");
              li.style.display = 'block';
              return 1;
            }
            // 조건이 거짓일 경우 li 엘리먼트를 숨기고 0 반환
            else {
              li.style.display = 'none';
              return 0;
            }
          };
          SetCSSDiagonal = function _SetCSSDiagonal(element, opt, e, w_condition, h_condition) {
            var document = GetCurrentDocument();
            // li 엘리먼트 가져오기
            var li_h = document.getElementById('dkInspect_h');
            var li_w = document.getElementById('dkInspect_w');
            var li_d = document.getElementById('dkInspect_diagonal');

            // 표준 픽셀 값 가져오기
            var std_px = opt.stdpx;
            var h_px, w_px;

            // 너비 조건과 높이 조건이 모두 참일 경우
            if (w_condition && h_condition) {
              // 패딩과 보더 값을 포함한 높이 값 계산
              var paddingTop = parseFloat(element.getPropertyValue('padding-top')); // 요소의 상단 패딩 값 가져오기
              var paddingBottom = parseFloat(element.getPropertyValue('padding-bottom')); // 요소의 하단 패딩 값 가져오기
              var borderTop = parseFloat(element.getPropertyValue('border-top')); // 요소의 상단 보더 값 가져오기
              var borderBottom = parseFloat(element.getPropertyValue('border-bottom')); // 요소의 하단 보더 값 가져오기
              h_px = parseFloat(element.getPropertyValue('height')) +
              // 요소의 높이 값 가져오기
              paddingTop +
              // 상단 패딩 값을 더함
              paddingBottom +
              // 하단 패딩 값을 더함
              borderTop +
              // 상단 보더 값을 더함
              borderBottom; // 하단 보더 값을 더함

              // 패딩과 보더 값을 포함한 너비 값 계산
              var paddingLeft = parseFloat(element.getPropertyValue('padding-left')); // 요소의 왼쪽 패딩 값 가져오기
              var paddingRight = parseFloat(element.getPropertyValue('padding-right')); // 요소의 오른쪽 패딩 값 가져오기
              var borderLeft = parseFloat(element.getPropertyValue('border-left')); // 요소의 왼쪽 보더 값 가져오기
              var borderRight = parseFloat(element.getPropertyValue('border-right')); // 요소의 오른쪽 보더 값 가져오기
              w_px = parseFloat(element.getPropertyValue('width')) +
              // 요소의 너비 값 가져오기
              paddingLeft +
              // 왼쪽 패딩 값을 더함
              paddingRight +
              // 오른쪽 패딩 값을 더함
              borderLeft +
              // 왼쪽 보더 값을 더함
              borderRight; // 오른쪽 보더 값을 더함
            }
            // 너비 조건과 높이 조건이 모두 거짓일 경우
            else {
              // 요소의 너비와 높이 값 가져오기
              h_px = getWidth(e);
              w_px = getHeight(e);
            }

            // 높이 값과 너비 값이 존재할 경우
            if (h_px && w_px) {
              // 대각선 길이, 대각선 길이의 픽셀 값, 너비, 높이 값을 계산
              var h = h_px * std_px;
              var w = w_px * std_px;
              var d = Math.sqrt(w * w + h * h);
              var d_px = Math.sqrt(w_px * w_px + h_px * h_px);

              // li 엘리먼트에 값을 넣고 보여주기
              li_h.lastChild.textContent = " : ".concat(h.toFixed(1), "mm (").concat(h_px.toFixed(1), "px)");
              li_w.lastChild.textContent = " : ".concat(w.toFixed(1), "mm (").concat(w_px.toFixed(1), "px)");
              li_d.lastChild.textContent = " : ".concat(d.toFixed(1), "mm (").concat(d_px.toFixed(1), "px)");
              li_h.style.display = 'block';
              li_w.style.display = 'block';
              li_d.style.display = 'block';
              return 1;
            }
            // 높이 값 또는 너비 값이 없는 경우
            else {
              // li_d 엘리먼트를 숨기고 0 반환
              li_d.style.display = 'none';
              return 0;
            }
          };
          getHeight = function _getHeight(e) {
            // 요소 e의 boundingRect 가져오기
            var boundingRect = e.getBoundingClientRect();
            // boundingRect에서 높이 값을 가져오기. 만약 없으면 0으로 설정
            return boundingRect.height || 0;
          };
          getWidth = function _getWidth(e) {
            // 요소 e의 boundingRect 가져오기
            var boundingRect = e.getBoundingClientRect();
            // boundingRect에서 너비 값을 가져오기. 만약 없으면 0으로 설정
            return boundingRect.width || 0;
          };
          getTop = function _getTop(e) {
            // 요소 e의 boundingRect 가져오기
            var boundingRect = e.getBoundingClientRect();
            // boundingRect에서 top값 가져오기. 만약 없으면 0으로 설정
            var top = boundingRect.top || 0;
            // 문서의 페이지 Y축 오프셋 값 가져오기
            var documentOffsetTop = document.body.ownerDocument.defaultView.scrollY;
            // 요소의 offsetTop 값 가져오기
            var offsetTop = document.body.getBoundingClientRect().top + window.scrollY - document.documentElement.clientTop;
            // top값, 페이지 Y축 오프셋 값, 요소의 offsetTop 값 합쳐서 반환
            return top + documentOffsetTop - offsetTop;
          };
          getLeft = function _getLeft(e) {
            // 요소 e의 boundingRect 가져오기
            var boundingRect = e.getBoundingClientRect();
            // boundingRect에서 left값 가져오기. 만약 없으면 0으로 설정
            var left = boundingRect.left || 0;
            // 문서의 스크롤 X축 오프셋 값 가져오기
            var documentOffsetLeft = document.body.ownerDocument.defaultView.scrollX;
            // 요소의 offsetLeft 값 가져오기
            var offsetLeft = document.body.getBoundingClientRect().left + window.scrollX - document.documentElement.clientLeft;
            // left값, 스크롤 X축 오프셋 값, 요소의 offsetLeft 값 합쳐서 반환
            return left + documentOffsetLeft - offsetLeft;
          };
          SetCSSPropertyIf = function _SetCSSPropertyIf(element, property, condition) {
            // 현재 문서 가져오기
            var document = GetCurrentDocument();
            // 해당 property의 ID를 가진 엘리먼트 가져오기
            var li = document.getElementById("dkInspect_".concat(property));

            // 조건이 참일 경우
            if (condition) {
              // li의 마지막 자식에 해당 property의 값을 넣어줌
              li.lastChild.innerHTML = " : ".concat(element.getPropertyValue(property));
              // li 엘리먼트 보여주기
              li.style.display = 'block';
              return 1;
            }
            // 조건이 거짓일 경우
            else {
              // li 엘리먼트 숨기기
              li.style.display = 'none';
              return 0;
            }
          };
          SetCSSProperty = function _SetCSSProperty(element, property) {
            var document = GetCurrentDocument();
            var li = document.getElementById("dkInspect_".concat(property));
            li.lastChild.innerHTML = " : ".concat(element.getPropertyValue(property));
          };
          GetCSSProperty = function _GetCSSProperty(element, property) {
            return element.getPropertyValue(property);
          };
          getsRGB = function _getsRGB(color) {
            var tmp = getRGB(color);
            if (tmp === false) {
              return false;
            }
            var sRGB = tmp / 255;
            return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
          };
          getRGB = function _getRGB(color) {
            var tmp = parseInt(color, 16);
            return isNaN(tmp) ? false : tmp;
          };
          getL = function _getL(color) {
            var R, G, B;
            if (color.length === 3) {
              R = getsRGB(color.substring(0, 1) + color.substring(0, 1));
              G = getsRGB(color.substring(1, 2) + color.substring(1, 2));
              B = getsRGB(color.substring(2, 3) + color.substring(2, 3));
            } else if (color.length === 6) {
              R = getsRGB(color.substring(0, 2));
              G = getsRGB(color.substring(2, 4));
              B = getsRGB(color.substring(4, 6));
            } else {
              return false;
            }
            // Luminance 값 계산하여 반환
            return 0.2126 * R + 0.7152 * G + 0.0722 * B;
          };
          RemoveExtraFloat = function _RemoveExtraFloat(nb) {
            nb = nb.substr(0, nb.length - 2);
            return Math.round(nb) + 'px';
          };
          RGBToHexStr = function _RGBToHexStr(str) {
            // 문자열에서 괄호 안의 값만 추출합니다.
            var hexValues = str.match(/\((.*?)\)/)[1].split(', ');
            var hexStr = '';

            // RGB 값을 16진수 문자열로 변환합니다.
            var _iterator = _createForOfIteratorHelper(hexValues),
              _step;
            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                var item = _step.value;
                hexStr += DecToHex(item);
              }

              // 만약 hexStr이 '00000000'이라면, 'FFFFFF'으로 대체합니다.
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
            if (hexStr === '00000000') {
              hexStr = 'FFFFFF';
            }
            return hexStr;
          };
          RGBToHex = function _RGBToHex(str) {
            // RGB 색상 값을 추출하여 10진수에서 16진수로 변환한 배열을 만듭니다.
            var hexValues = str.match(/\d+/g).map(function (val) {
              return DecToHex(parseInt(val));
            });
            // 각각의 16진수 값을 조합하여 최종 16진수 색상 값을 만듭니다.
            var hexStr = "#".concat(hexValues.join(''));

            // 만약 hexStr이 #00000000이라면, #FFFFFF으로 대체합니다.
            if (hexStr === '#00000000') {
              hexStr = '#FFFFFF';
            }

            // 생성된 16진수 색상 값을 포함한 HTML 요소를 반환합니다.
            return "<span style='border: 1px solid #000000 !important;width: 8px !important;height: 8px !important;display: inline-block !important;background-color:".concat(hexStr, " !important;'></span> ").concat(hexStr);
          };
          DecToHex = function _DecToHex(nb) {
            return dkInspect_hexa[Math.floor(nb / 16)] + dkInspect_hexa[nb % 16];
          };
          GetCurrentDocument = function _GetCurrentDocument() {
            return window.document;
          };
          _context.next = 34;
          return readData('ccshow');
        case 34:
          _yield$readData = _context.sent;
          ccshow = _yield$readData.ccshow;
          _context.next = 38;
          return readData('resolutions');
        case 38:
          _yield$readData2 = _context.sent;
          resolutions = _yield$readData2.resolutions;
          _context.next = 42;
          return readData('monitors');
        case 42:
          _yield$readData3 = _context.sent;
          monitors = _yield$readData3.monitors;
          _context.next = 46;
          return readData('linkmode');
        case 46:
          _yield$readData4 = _context.sent;
          linkmode = _yield$readData4.linkmode;
          _context.next = 50;
          return readData('bgmode');
        case 50:
          _yield$readData5 = _context.sent;
          bgmode = _yield$readData5.bgmode;
          _context.next = 54;
          return readData('linetype');
        case 54:
          _yield$readData6 = _context.sent;
          linetype = _yield$readData6.linetype;
          _context.next = 58;
          return readData('colortype');
        case 58:
          _yield$readData7 = _context.sent;
          colortype = _yield$readData7.colortype;
          _context.next = 62;
          return readData('trackingmode');
        case 62:
          _yield$readData8 = _context.sent;
          trackingmode = _yield$readData8.trackingmode;
          _context.next = 66;
          return readData('bordersize');
        case 66:
          _yield$readData9 = _context.sent;
          _yield$readData9$bord = _yield$readData9.bordersize;
          bordersize = _yield$readData9$bord === void 0 ? 2 : _yield$readData9$bord;
          _resolutions$split = resolutions.split('x'), _resolutions$split2 = _slicedToArray(_resolutions$split, 2), width = _resolutions$split2[0], height = _resolutions$split2[1];
          diagonal = Math.sqrt(Math.pow(parseInt(width), 2) + Math.pow(parseInt(height), 2)).toFixed(2);
          std_px = 25.4 / (diagonal / monitors); // "opt" 객체에 각 값을 저장합니다.
          opt = {
            ccshow: ccshow,
            stdpx: std_px,
            linkmode: linkmode,
            bgmode: bgmode,
            linetype: linetype,
            colortype: "#".concat(colortype),
            trackingmode: trackingmode,
            bordersize: bordersize
          }; // CSS Properties
          // 텍스트의 색상, 배경색, 명도(contrast)관련 문자열 배열
          dkInspect_pColorBg = ['color', 'background-color', 'contrast']; // 길이 단위(px) 관련 문자열 배열
          dkInspect_pLength = ['h', 'w', 'diagonal']; // 박스 모델(Box Model)과 관련된 CSS 속성을 나타내는 문자열 배열
          dkInspect_pBox = ['height', 'width', 'border', 'border-top', 'border-right', 'border-bottom', 'border-left', 'margin', 'padding', 'max-height', 'min-height', 'max-width', 'min-width']; // CSS Property 카테고리
          dkInspect_categories = {
            pLength: dkInspect_pLength,
            pBox: dkInspect_pBox,
            pColorBg: dkInspect_pColorBg
          }; // CSS Property 카테고리 제목
          dkInspect_categoriesTitle = {
            pLength: 'Length',
            pBox: 'Box',
            pColorBg: 'Color Contrast'
          }; // Hexadecimal
          dkInspect_hexa = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
          /*
           ** Utils
           */
          // 현재 문서 객체를 반환하는 함수
          // tracking 객체 정의
          tracking = {
            // trackingEl 엘리먼트 생성 함수
            generate: function generate() {
              var document = GetCurrentDocument();
              var trackingEl;
              if (document) {
                // trackingEl 생성 및 속성 설정
                trackingEl = document.createElement('div');
                trackingEl.id = 'dkInspect_tracking';
                this.setColor(trackingEl, opt.colortype);
                trackingEl.style.setProperty('outline-style', opt.linetype, 'important');
              }
              return trackingEl;
            },
            // 테두리 색상 설정 함수
            setColor: function setColor(e, hex) {
              if (e) {
                e.style.setProperty('outline-color', hex, 'important');
                // 배경색 설정 옵션에 따라 배경색 설정
                if (opt.bgmode) {
                  e.style.setProperty('background-color', this.hexToRGB(hex, 0.2), 'important');
                }
              }
            },
            // 16진수 색상코드를 rgba 색상값으로 변환하는 함수
            hexToRGB: function hexToRGB(hex, alpha) {
              alpha = alpha || 1;
              var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
              hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                return r + r + g + g + b + b;
              });
              var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex),
                r = parseInt(result[1], 16),
                g = parseInt(result[2], 16),
                b = parseInt(result[3], 16);
              return "rgba(".concat(r, ", ").concat(g, ", ").concat(b, ", ").concat(alpha, ")");
            }
          };
          DkInspect.prototype.IsEnabled = function () {
            // 현재 페이지의 document 객체를 가져옵니다.
            var document = GetCurrentDocument();

            // 만약 dkInspect_block 요소가 존재하면 true를, 존재하지 않으면 false를 반환합니다.
            return !!document.getElementById('dkInspect_block');
          };

          // DkInspect 객체의 Enable 메소드
          DkInspect.prototype.Enable = function () {
            // 현재 문서 객체 가져오기
            var document = GetCurrentDocument();
            // dkInspect_block 요소 가져오기
            var block = document.getElementById('dkInspect_block');
            // 블록이 존재하지 않으면 새로운 블록을 생성
            if (!block) {
              // BODY 요소가 없으면 새로 생성
              if (!document.getElementsByTagName('BODY')[0]) {
                var body = document.createElement('BODY');
                document.documentElement.appendChild(body);
              }

              // 블록 생성 후 BODY 요소에 추가
              block = this.CreateBlock();
              document.getElementsByTagName('BODY')[0].appendChild(block);

              // 트래킹 모드가 활성화되어 있으면, 트래킹 요소 생성 후 BODY 요소에 추가
              if (opt.trackingmode) {
                var trackingEl = tracking.generate();
                document.getElementsByTagName('BODY')[0].appendChild(trackingEl);
              }

              // 마우스 이벤트 리스너 추가
              dkInspect.AddEventListeners();
              return true;
            }
            return false;
          };

          // DkInspect의 Disable 메서드
          DkInspect.prototype.Disable = function () {
            var document = GetCurrentDocument();
            var block = document.getElementById('dkInspect_block'); // 블록 엘리먼트 가져오기
            var trackingEl = document.getElementById('dkInspect_tracking'); // 트래킹 엘리먼트 가져오기

            if (block) {
              // 블록 엘리먼트가 존재하면
              document.getElementsByTagName('BODY')[0].removeChild(block); // body에서 블록 엘리먼트 제거
              if (opt.trackingmode) {
                // 트래킹 모드가 켜져 있으면
                document.getElementsByTagName('BODY')[0].removeChild(trackingEl); // body에서 트래킹 엘리먼트 제거
              }

              this.RemoveEventListeners(); // 이벤트 리스너 제거
              return true; // 제거 성공 반환
            }

            return false; // 제거할 블록 엘리먼트가 없으면 실패 반환
          };

          // 메시지를 삽입하는 함수
          // dkInspect 멈춤 상태
          dkInspectPause = false; // Chrome 브라우저 확장프로그램에서 단축키를 설정하여 dkInspect의 이벤트 리스너를 일시정지 혹은 다시 시작하는 기능을 구현
          shortcut = {
            // 초기화 함수
            // 단축키를 설정하고, 해당 단축키를 눌렀을 때 dkInspect 이벤트 리스너 일시정지 혹은 다시 시작하는 함수를 호출
            initialize: function initialize() {
              // 백그라운드 스크립트에 pause 메시지를 보냄
              chrome.runtime.sendMessage({
                cmd: 'pause'
              },
              // 응답 받은 후 실행될 콜백 함수
              function (response) {
                // window 객체에 keyup 이벤트 리스너를 추가함
                window.addEventListener('keyup', function (e) {
                  // 응답으로 받은 값과 눌린 키가 같은지 비교함
                  if (e.key === response) {
                    // dkInspectPause 변수가 true일 경우, shortcut을 재개하고 그렇지 않을 경우 일시정지함
                    if (dkInspectPause) {
                      shortcut.resume();
                    } else {
                      shortcut.pause();
                    }
                  }
                }, false);
              });
            },
            // 일시정지 함수
            // dkInspect 이벤트 리스너를 일시정지합니다. 이 때, '일시정지' 메시지를 추가로 출력하고 3초 후에 메시지를 제거
            pause: function pause() {
              console.log('pause');

              // 현재 문서(document)를 가져옴
              var document = GetCurrentDocument();

              // id가 'dkInspect_block'인 요소를 가져옴
              var block = document.getElementById('dkInspect_block');

              // 'dkInspect_block' 요소가 존재하는 경우
              if (block) {
                // 이벤트 리스너 제거 및 dkInspectPause 변수 값을 true로 변경
                dkInspect.RemoveEventListeners();
                dkInspectPause = true;
                // '일시정지' 메시지를 출력하고 일정 시간 후에 제거
                dkInspectInsertMessage('일시정지');
                setTimeout(function () {
                  dkInspectRemoveElement('dkInspectInsertMessage');
                }, 3000);

                // 함수 실행을 종료하고 true 반환
                return true;
              }

              // 'dkInspect_block' 요소가 존재하지 않는 경우, false 반환
              return false;
            },
            // 재개 함수
            // dkInspect 이벤트 리스너를 다시 시작합니다. 이 때, '재개' 메시지를 추가로 출력하고 3초 후에 메시지를 제거
            resume: function resume() {
              console.log('resume');

              // 현재 문서(document)를 가져옴
              var document = GetCurrentDocument();

              // id가 'dkInspect_block'인 요소를 가져옴
              var block = document.getElementById('dkInspect_block');

              // 'dkInspect_block' 요소가 존재하는 경우
              if (block) {
                // 이벤트 리스너 추가 및 dkInspectPause 변수 값을 false로 변경
                dkInspect.AddEventListeners();
                dkInspectPause = false;
                // '재개' 메시지를 출력하고 일정 시간 후에 제거
                dkInspectInsertMessage('재개');
                setTimeout(function () {
                  dkInspectRemoveElement('dkInspectInsertMessage');
                }, 3000);

                // 함수 실행을 종료하고 true 반환
                return true;
              }

              // 'dkInspect_block' 요소가 존재하지 않는 경우, false 반환
              return false;
            }
          };
          /*
           * dkInspect entry-point
           */
          dkInspect = new DkInspect();
          shortcut.initialize();
          if (dkInspect.IsEnabled()) {
            dkInspect.Disable();
          } else {
            dkInspect.Enable();
          }
        case 88:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _myApp.apply(this, arguments);
}
myApp().then(function () {
  return console.log('Load');
});