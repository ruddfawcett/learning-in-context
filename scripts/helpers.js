// Helpers

var Log = function(obj) {
  if (typeof obj === 'string') {
    console.log(`[LIC] ${obj}`);
    return;
  }
  console.log('[LIC]', obj);
}

var LS = {
  prepend: 'lic-',
  get: function(k) {
    var self = this;
    return $.parseJSON(window.localStorage.getItem(this.prepend+k));
    // return window.localStorage.getItem(this.prepend+k);
  },
  set: function(k, v) {
    // if (typeof v === 'string') {
    //   return window.localStorage.setItem(this.prepend+k.toString(), v);
    // }
    return window.localStorage.setItem(this.prepend+k.toString(), JSON.stringify(v));
  }
};
