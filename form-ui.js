/* UI only: form completion progress. Does not touch submit / calculation logic. */
(function () {
  var form = document.getElementById('marksForm');
  if (!form) return;
  var fill = document.getElementById('progFill');
  var txt = document.getElementById('progText');
  var ids = ['fullname', 'Boards', 'Ben', 'Eng', 'Phy', 'Math', 'Chem', 'Bio'];
  var total = 10;

  function update() {
    var n = 0;
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && String(el.value).trim() !== '') n++;
    });
    if (form.querySelector('input[name="Class"]:checked')) n++;
    if (form.querySelector('input[name="ops"]:checked')) n++;
    fill.style.transform = 'scaleX(' + (n / total) + ')';
    txt.textContent = n + ' of ' + total + ' completed';
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
})();
