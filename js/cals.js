(function () {
  const doc = document,
    html = doc.getElementsByTagName('html')[0];
  const $ = function () {
    return document.getElementById(arguments[0]);
  };

  const cals = {
    initialize: function () {
      const a = doc.createElement('div');
      a.id = 'dkInspect_cals';

      const header = doc.createElement('h1');
      header.appendChild(doc.createTextNode('수동 계산'));
      a.appendChild(header);

      const input = doc.createElement('div');

      const ul = doc.createElement('ul');
      const list = [];
      list[0] =
        "<span class='dkInspect_property'><label for='dkInspect_input_height'>Height</label></span><span><input type='text' id='dkInspect_input_height'> px</span>";
      list[1] =
        "<span class='dkInspect_property'><label for='dkInspect_input_width'>Width</label></span><span><input type='text' id='dkInspect_input_width'> px</span>";
      list[2] =
        "<span style='float:right'><button id='dkInspect_btn_submit' class='btn'>확인</button><button id='dkInspect_btn_close' class='btn'>닫기</buttton></span>";

      list.forEach((item) => {
        const li = doc.createElement('li');
        li.innerHTML = item;
        ul.appendChild(li);
      });

      input.appendChild(ul);
      a.appendChild(input);

      const result = doc.createElement('div');
      result.id = 'dkInspect_cals_result';
      a.appendChild(result);
      window.document.getElementsByTagName('BODY')[0].appendChild(a);
    },
    close: function () {
      const a = $('dkInspect_cals');
      window.document.getElementsByTagName('BODY')[0].removeChild(a);
    },
    submit: function () {
      const h = $('dkInspect_input_height').value,
        w = $('dkInspect_input_width').value;
      cals.setDiagonal(h, w, function (cb) {
        const res = $('dkInspect_cals_result');
        res.textContent = '';
        header = doc.createElement('h2');
        header.appendChild(doc.createTextNode('Results'));
        res.appendChild(header);

        const list = [];
        list[0] =
          "<span class='dkInspect_property'> height : </span><span>" +
          cb.height +
          ' mm (' +
          h +
          'px)</span>';
        list[1] =
          "<span class='dkInspect_property'> width : </span><span>" +
          cb.width +
          ' mm (' +
          w +
          'px)</span>';
        list[2] =
          "<span class='dkInspect_property'> diagonal : </span><span>" +
          cb.diagonal +
          ' mm (' +
          cb.diagonal_px +
          'px)</span>';

        const ul = doc.createElement('ul');
        list.forEach((item) => {
          const li = doc.createElement('li');
          li.innerHTML = item;
          ul.appendChild(li);
        });
        res.appendChild(ul);
        const span = doc.createElement('span');
        span.textContent =
          ' * 기준 : ' + cb.resolution + ' (' + cb.monitor + ' inch)';
        res.appendChild(span);
      });
    },
    setDiagonal: function (h, w, callback) {
      chrome.storage.sync.get('resolutions', function (r) {
        chrome.storage.sync.get('monitors', function (m) {
          const cb = {};
          cb.monitor = m.monitors;
          cb.resolution = r.resolutions;

          const std_res = cb.resolution.split('x');
          const std_diagonal = Math.sqrt(
            Math.pow(parseInt(std_res[0]), 2) +
              Math.pow(parseInt(std_res[1]), 2),
          ).toFixed(2);
          const std_px = 25.4 / (std_diagonal / cb.monitor); // mm 기준

          cb.height = (h * std_px).toFixed(1); // to mm
          cb.width = (w * std_px).toFixed(1); // to mm
          cb.diagonal = Math.sqrt(
            Math.pow(cb.width, 2) + Math.pow(cb.height, 2),
          ).toFixed(1); // to mm
          cb.diagonal_px = Math.sqrt(Math.pow(h, 2) + Math.pow(w, 2)).toFixed(
            1,
          ); // to px

          callback(cb);
        });
      });
    },
  };

  if (!$('dkInspect_cals')) {
    cals.initialize();
  }

  $('dkInspect_btn_close').addEventListener('click', cals.close);
  $('dkInspect_btn_submit').addEventListener('click', cals.submit);
})();
