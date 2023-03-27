"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, catch: function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
(function () {
  // document 객체와 html 요소를 변수에 할당합니다.
  var doc = document;

  // $ 함수를 정의합니다. 이 함수는 ID를 인자로 받아 해당 ID를 가진 요소를 반환합니다.
  var $ = function $() {
    return document.getElementById(arguments[0]);
  };

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
  var cals = {
    // "dkInspect_cals" ID를 가진 "div" 요소를 생성하고, 이를 화면에 추가하는 함수를 정의합니다.
    initialize: function initialize() {
      // "div" 요소를 생성하고, 이 요소의 ID를 "dkInspect_cals"로 설정합니다.
      var a = doc.createElement('div');
      a.id = 'dkInspect_cals';

      // "h1" 요소를 생성하고, 이 요소에 "수동 계산"이라는 텍스트 노드를 추가합니다.
      var header = doc.createElement('h1');
      header.appendChild(doc.createTextNode('수동 계산'));
      a.appendChild(header);

      // "div" 요소를 하나 더 생성하고, 이 요소에 "ul" 요소를 추가합니다.
      var input = doc.createElement('div');
      var ul = doc.createElement('ul');
      var list = [
      // 높이
      "<span class='dkInspect_property'><label for='dkInspect_input_height'>Height</label></span><span><input type='text' id='dkInspect_input_height'> px</span>",
      // 너비
      "<span class='dkInspect_property'><label for='dkInspect_input_width'>Width</label></span><span><input type='text' id='dkInspect_input_width'> px</span>",
      // 하단 버튼
      "<span style='float:right'><button id='dkInspect_btn_submit' class='btn'>확인</button><button id='dkInspect_btn_close' class='btn'>닫기</buttton></span>"];

      // "li" 요소를 생성하고, "ul" 요소에 추가합니다.
      list.forEach(function (item) {
        var li = doc.createElement('li');
        li.innerHTML = item;
        ul.appendChild(li);
      });

      // "ul" 요소를 "div" 요소에 추가합니다.
      input.appendChild(ul);
      a.appendChild(input);

      // 결과를 출력할 "div" 요소를 생성하고, 이 요소의 ID를 "dkInspect_cals_result"로 설정합니다.
      var result = doc.createElement('div');
      result.id = 'dkInspect_cals_result';
      a.appendChild(result);

      // 새로 생성한 "div" 요소를 "body" 요소에 추가합니다.
      window.document.getElementsByTagName('BODY')[0].appendChild(a);
    },
    // "dkInspect_cals" ID를 가진 "div" 요소를 제거하는 함수를 정의합니다.
    close: function close() {
      // "dkInspect_cals" ID를 가진 "div" 요소를 가져와 "a" 변수에 할당합니다.
      var a = $('dkInspect_cals');

      // "body" 요소에서 "a" 요소를 제거합니다.
      window.document.getElementsByTagName('BODY')[0].removeChild(a);
    },
    // 입력 필드에서 값을 가져와 계산을 수행한 다음, 결과를 "dkInspect_cals_result" ID를 가진 요소에 출력하는 함수를 정의합니다.
    submit: function () {
      var _submit = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var h, w;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              // "dkInspect_input_height"와 "dkInspect_input_width" ID를 가진 입력 필드의 값을 가져와 "h"와 "w" 변수에 할당합니다.
              h = $('dkInspect_input_height').value, w = $('dkInspect_input_width').value; // "setDiagonal" 함수를 호출하여 계산을 수행합니다.
              _context.next = 3;
              return cals.setDiagonal(h, w, function (cb) {
                // 결과를 출력하기 위해 "dkInspect_cals_result" ID를 가진 요소를 찾아 가져옵니다.
                var res = $('dkInspect_cals_result');

                // 이전 내용을 모두 지우고, "h2" 요소를 추가하여 "Results"라는 텍스트 노드를 출력합니다.
                res.textContent = '';
                var header = doc.createElement('h2');
                header.appendChild(doc.createTextNode('Results'));
                res.appendChild(header);

                // 입력값과 계산 결과를 "ul" 요소에 추가하여 "dkInspect_cals_result" 요소에 출력합니다.
                var list = ["<span class='dkInspect_property'> height : </span><span>".concat(cb.height, " mm (").concat(h, "px)</span>"), "<span class='dkInspect_property'> width : </span><span>".concat(cb.width, " mm (").concat(w, "px)</span>"), "<span class='dkInspect_property'> diagonal : </span><span>".concat(cb.diagonal, " mm (").concat(cb.diagonal_px, "px)</span>")];

                // "list" 배열에 저장된 값들을 이용하여 "ul" 요소를 생성하고, 이 요소에 "li" 요소들을 추가하는 함수를 정의합니다.
                var ul = doc.createElement('ul');
                list.forEach(function (item) {
                  // "li" 요소를 생성하고, 해당 요소에 "innerHTML" 속성을 이용하여 값을 할당합니다.
                  var li = doc.createElement('li');
                  li.innerHTML = item;

                  // 생성된 "li" 요소를 "ul" 요소에 추가합니다.
                  ul.appendChild(li);
                });

                // "ul" 요소를 "dkInspect_cals_result" 요소에 추가합니다.
                res.appendChild(ul);

                // 해상도와 모니터 크기 정보를 "span" 요소에 추가하여 "dkInspect_cals_result" 요소에 출력합니다.
                var span = doc.createElement('span');
                span.textContent = ' * 기준 : ' + cb.resolution + ' (' + cb.monitor + ' inch)';
                res.appendChild(span);
              });
            case 3:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      function submit() {
        return _submit.apply(this, arguments);
      }
      return submit;
    }(),
    // 입력받은 높이와 너비를 사용하여, 모니터의 대각선 길이, 해상도, 그리고 픽셀당 mm 길이를 계산하는 함수를 정의합니다.
    setDiagonal: function () {
      var _setDiagonal = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(h, w, callback) {
        var _yield$readData, resolutions, _yield$readData2, monitors, cb, std_res, std_diagonal, std_px;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return readData('resolutions');
            case 2:
              _yield$readData = _context2.sent;
              resolutions = _yield$readData.resolutions;
              _context2.next = 6;
              return readData('monitors');
            case 6:
              _yield$readData2 = _context2.sent;
              monitors = _yield$readData2.monitors;
              // 계산 결과를 저장할 객체를 생성합니다.
              cb = {};
              cb.monitor = monitors;
              cb.resolution = resolutions;

              // 해상도의 가로 세로 값을 구합니다.
              std_res = cb.resolution.split('x'); // 가로 세로 값을 이용하여 표준 대각선 길이를 구합니다.
              std_diagonal = Math.sqrt(Math.pow(parseInt(std_res[0]), 2) + Math.pow(parseInt(std_res[1]), 2)).toFixed(2); // 표준 대각선 길이를 이용하여 픽셀당 mm 길이를 구합니다.
              std_px = 25.4 / (std_diagonal / cb.monitor); // mm 기준
              // 입력받은 높이와 너비를 이용하여, 실제 높이와 너비를 구합니다.
              cb.height = (h * std_px).toFixed(1); // to mm
              cb.width = (w * std_px).toFixed(1); // to mm
              cb.diagonal = Math.sqrt(Math.pow(cb.width, 2) + Math.pow(cb.height, 2)).toFixed(1); // to mm

              // 입력받은 높이와 너비를 이용하여 대각선 길이(px)를 구합니다.
              cb.diagonal_px = Math.sqrt(Math.pow(h, 2) + Math.pow(w, 2)).toFixed(1); // to px

              // 계산 결과를 콜백 함수에 전달합니다.
              callback(cb);
            case 19:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      function setDiagonal(_x, _x2, _x3) {
        return _setDiagonal.apply(this, arguments);
      }
      return setDiagonal;
    }()
  };

  // "dkInspect_cals" 요소가 없을 경우에만 "cals.initialize()" 함수를 호출하여 계산기 UI를 초기화합니다.
  if (!$('dkInspect_cals')) {
    cals.initialize();
  }

  // "dkInspect_btn_close" 요소와 "dkInspect_btn_submit" 요소에 이벤트 리스너를 추가합니다.
  $('dkInspect_btn_close').addEventListener('click', cals.close);
  $('dkInspect_btn_submit').addEventListener('click', cals.submit);
})();