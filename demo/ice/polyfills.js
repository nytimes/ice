// Add ECMA262-5 string trim if not supported natively
//
if (typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  }
}

// Add ECMA262-5 Array methods if not supported natively
//
if (!('indexOf' in Array.prototype)) {
  Array.prototype.indexOf= function(find, i /*opt*/) {
    if (i===undefined) i= 0;
    if (i<0) i+= this.length;
    if (i<0) i= 0;
    for (var n= this.length; i<n; i++)
      if (i in this && this[i]===find)
        return i;
    return -1;
  };
}
if (!('lastIndexOf' in Array.prototype)) {
  Array.prototype.lastIndexOf= function(find, i /*opt*/) {
    if (i===undefined) i= this.length-1;
    if (i<0) i+= this.length;
    if (i>this.length-1) i= this.length-1;
    for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
      if (i in this && this[i]===find)
        return i;
    return -1;
  };
}
if (!('map' in Array.prototype)) {
  Array.prototype.map= function(mapper, that /*opt*/) {
    var other= new Array(this.length);
    for (var i= 0, n= this.length; i<n; i++)
      if (i in this)
        other[i]= mapper.call(that, this[i], i, this);
    return other;
  };
}
if (!('filter' in Array.prototype)) {
  Array.prototype.filter= function(filter, that /*opt*/) {
    var other= [], v;
    for (var i=0, n= this.length; i<n; i++)
      if (i in this && filter.call(that, v= this[i], i, this))
        other.push(v);
    return other;
  };
}
