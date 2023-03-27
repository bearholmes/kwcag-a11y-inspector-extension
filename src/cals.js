(function () {
  // document 객체와 html 요소를 변수에 할당합니다.
  const doc = document;

  // $ 함수를 정의합니다. 이 함수는 ID를 인자로 받아 해당 ID를 가진 요소를 반환합니다.
  const $ = function () {
    return document.getElementById(arguments[0]);
  };

  // "chrome.storage.sync" API를 이용하여, 저장된 데이터를 읽어오는 함수를 정의합니다.
  function readData(myKey) {
    // Promise 객체를 생성합니다.
    return new Promise((resolve) => {
      // "chrome.storage.sync.get" 함수를 호출하여 데이터를 읽어옵니다.
      chrome.storage.sync.get(myKey, function (data) {
        // 읽어온 데이터를 Promise 객체를 통해 반환합니다.
        resolve(data);
      });
    });
  }

  const cals = {
    // "dkInspect_cals" ID를 가진 "div" 요소를 생성하고, 이를 화면에 추가하는 함수를 정의합니다.
    initialize: function () {
      // "div" 요소를 생성하고, 이 요소의 ID를 "dkInspect_cals"로 설정합니다.
      const a = doc.createElement('div');
      a.id = 'dkInspect_cals';

      // "h1" 요소를 생성하고, 이 요소에 "수동 계산"이라는 텍스트 노드를 추가합니다.
      const header = doc.createElement('h1');
      header.appendChild(doc.createTextNode('수동 계산'));
      a.appendChild(header);

      // "div" 요소를 하나 더 생성하고, 이 요소에 "ul" 요소를 추가합니다.
      const input = doc.createElement('div');
      const ul = doc.createElement('ul');
      const list = [
        // 높이
        "<span class='dkInspect_property'><label for='dkInspect_input_height'>Height</label></span><span><input type='text' id='dkInspect_input_height'> px</span>",
        // 너비
        "<span class='dkInspect_property'><label for='dkInspect_input_width'>Width</label></span><span><input type='text' id='dkInspect_input_width'> px</span>",
        // 하단 버튼
        "<span style='float:right'><button id='dkInspect_btn_submit' class='btn'>확인</button><button id='dkInspect_btn_close' class='btn'>닫기</buttton></span>",
      ];

      // "li" 요소를 생성하고, "ul" 요소에 추가합니다.
      list.forEach((item) => {
        const li = doc.createElement('li');
        li.innerHTML = item;
        ul.appendChild(li);
      });

      // "ul" 요소를 "div" 요소에 추가합니다.
      input.appendChild(ul);
      a.appendChild(input);

      // 결과를 출력할 "div" 요소를 생성하고, 이 요소의 ID를 "dkInspect_cals_result"로 설정합니다.
      const result = doc.createElement('div');
      result.id = 'dkInspect_cals_result';
      a.appendChild(result);

      // 새로 생성한 "div" 요소를 "body" 요소에 추가합니다.
      window.document.getElementsByTagName('BODY')[0].appendChild(a);
    },

    // "dkInspect_cals" ID를 가진 "div" 요소를 제거하는 함수를 정의합니다.
    close: function () {
      // "dkInspect_cals" ID를 가진 "div" 요소를 가져와 "a" 변수에 할당합니다.
      const a = $('dkInspect_cals');

      // "body" 요소에서 "a" 요소를 제거합니다.
      window.document.getElementsByTagName('BODY')[0].removeChild(a);
    },

    // 입력 필드에서 값을 가져와 계산을 수행한 다음, 결과를 "dkInspect_cals_result" ID를 가진 요소에 출력하는 함수를 정의합니다.
    submit: async function () {
      // "dkInspect_input_height"와 "dkInspect_input_width" ID를 가진 입력 필드의 값을 가져와 "h"와 "w" 변수에 할당합니다.
      const h = $('dkInspect_input_height').value,
        w = $('dkInspect_input_width').value;

      // "setDiagonal" 함수를 호출하여 계산을 수행합니다.
      await cals.setDiagonal(h, w, function (cb) {
        // 결과를 출력하기 위해 "dkInspect_cals_result" ID를 가진 요소를 찾아 가져옵니다.
        const res = $('dkInspect_cals_result');

        // 이전 내용을 모두 지우고, "h2" 요소를 추가하여 "Results"라는 텍스트 노드를 출력합니다.
        res.textContent = '';
        const header = doc.createElement('h2');
        header.appendChild(doc.createTextNode('Results'));
        res.appendChild(header);

        // 입력값과 계산 결과를 "ul" 요소에 추가하여 "dkInspect_cals_result" 요소에 출력합니다.
        const list = [
          `<span class='dkInspect_property'> height : </span><span>${cb.height} mm (${h}px)</span>`,
          `<span class='dkInspect_property'> width : </span><span>${cb.width} mm (${w}px)</span>`,
          `<span class='dkInspect_property'> diagonal : </span><span>${cb.diagonal} mm (${cb.diagonal_px}px)</span>`,
        ];

        // "list" 배열에 저장된 값들을 이용하여 "ul" 요소를 생성하고, 이 요소에 "li" 요소들을 추가하는 함수를 정의합니다.
        const ul = doc.createElement('ul');
        list.forEach((item) => {
          // "li" 요소를 생성하고, 해당 요소에 "innerHTML" 속성을 이용하여 값을 할당합니다.
          const li = doc.createElement('li');
          li.innerHTML = item;

          // 생성된 "li" 요소를 "ul" 요소에 추가합니다.
          ul.appendChild(li);
        });

        // "ul" 요소를 "dkInspect_cals_result" 요소에 추가합니다.
        res.appendChild(ul);

        // 해상도와 모니터 크기 정보를 "span" 요소에 추가하여 "dkInspect_cals_result" 요소에 출력합니다.
        const span = doc.createElement('span');
        span.textContent =
          ' * 기준 : ' + cb.resolution + ' (' + cb.monitor + ' inch)';
        res.appendChild(span);
      });
    },

    // 입력받은 높이와 너비를 사용하여, 모니터의 대각선 길이, 해상도, 그리고 픽셀당 mm 길이를 계산하는 함수를 정의합니다.
    setDiagonal: async function (h, w, callback) {
      // "chrome.storage.sync" API를 이용하여 저장된 "resolutions"와 "monitors" 값을 가져옵니다.
      const { resolutions } = await readData('resolutions');
      const { monitors } = await readData('monitors');

      // 계산 결과를 저장할 객체를 생성합니다.
      const cb = {};
      cb.monitor = monitors;
      cb.resolution = resolutions;

      // 해상도의 가로 세로 값을 구합니다.
      const std_res = cb.resolution.split('x');

      // 가로 세로 값을 이용하여 표준 대각선 길이를 구합니다.
      const std_diagonal = Math.sqrt(
        Math.pow(parseInt(std_res[0]), 2) + Math.pow(parseInt(std_res[1]), 2),
      ).toFixed(2);

      // 표준 대각선 길이를 이용하여 픽셀당 mm 길이를 구합니다.
      const std_px = 25.4 / (std_diagonal / cb.monitor); // mm 기준

      // 입력받은 높이와 너비를 이용하여, 실제 높이와 너비를 구합니다.
      cb.height = (h * std_px).toFixed(1); // to mm
      cb.width = (w * std_px).toFixed(1); // to mm
      cb.diagonal = Math.sqrt(
        Math.pow(cb.width, 2) + Math.pow(cb.height, 2),
      ).toFixed(1); // to mm

      // 입력받은 높이와 너비를 이용하여 대각선 길이(px)를 구합니다.
      cb.diagonal_px = Math.sqrt(Math.pow(h, 2) + Math.pow(w, 2)).toFixed(1); // to px

      // 계산 결과를 콜백 함수에 전달합니다.
      callback(cb);
    },
  };

  // "dkInspect_cals" 요소가 없을 경우에만 "cals.initialize()" 함수를 호출하여 계산기 UI를 초기화합니다.
  if (!$('dkInspect_cals')) {
    cals.initialize();
  }

  // "dkInspect_btn_close" 요소와 "dkInspect_btn_submit" 요소에 이벤트 리스너를 추가합니다.
  $('dkInspect_btn_close').addEventListener('click', cals.close);
  $('dkInspect_btn_submit').addEventListener('click', cals.submit);
})();
