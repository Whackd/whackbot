module.exports = {
  parseRange: function (in1, in2, ribs) {
    let a, b;
    if (in1 > in2) {
      a = in2;
      b = in1;
    } else {
      a = in1;
      b = in2;
    }

    // only works if less than 1
    let digA = digits(a);
    // console.log("DigitsX: " + digA);

    let digB = digits(b);
    // console.log("DigitsY: " + digB);

    ribs -= 1;

    const diff = a - b;
    let z = diff / ribs * -1;

    let rng = range(a, b, z); // rng.r, rng.step

    rng.r.push(b);

    // console.log("rng: " + a + b + z + ": " + rng);

    let clean = [];
    let string = [];

    rng.r.forEach(function (ov) {
      let dec = round10(ov, -8);
      clean.push(dec);
      string.push(dec.toFixed(8));
    });
    return {num: clean, string: string, ll: clean[0], hh: clean[clean.length - 1], step: rng.step};
  },
  isExponential,
  getExponentialParts,
  noExponents,
  findPrecision,
  formatFloatAsNumber,
  formatFloatForDisplay,
  round
};

function digits(n) {
  return Math.floor(Math.log(n) / Math.log(10));
}

function round10(value, exp) {
  return decimalAdjust('round', value, exp);
}

function decimalAdjust(type, value, exp) {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  // If the value is not a number or the exp is not an integer...
  if (value === null || isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // Shift
  value = value.toString().split('e');
  value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

function range(a, b, step) {
  if (arguments.length === 1) {
    b = a;
    a = 0;
  }
  step = step || 1;

  let x, r = [];

  for (x = a; (b - x) * step > 0; x += step) {
    r.push(x);
  }

  return {r: r, step: step};
}

function isExponential(num) {
  const eParts = getExponentialParts(num);
  return !Number.isNaN(Number(eParts[1]));
}

function getExponentialParts(num) {
  return Array.isArray(num) ? num : String(num).split(/[eE]/);
}

function noExponents(exponent) {
  var data = String(exponent).split(/[eE]/);
  if (data.length === 1) return data[0];
  var z = '', sign = this < 0 ? '-' : '',
    str = data[0].replace('.', ''),
    mag = Number(data[1]) + 1;
  if (mag < 0) {
    z = sign + '0.';
    while (mag++) z += '0';
    return z + str.replace(/^\-/, '');
  }
  mag -= str.length;
  while (mag--) z += '0';
  return str + z;
}

function findPrecision(array) {
  let pHigh = 0;
  for (let i = 0; i < array.length; i++) {
    x = noExponents(parseFloat(array[i]));
    const y = String(x).split(".");
    p = 0;
    if (y.length > 1) {
      p = y[1].length;
    } else {
      p = 0;
    }
    if (p > pHigh) {
      pHigh = p;
    }
  }
  return pHigh;
}

function formatFloatAsNumber(value) {
  let error;
  let precision;
  let num;
  if (typeof (value) === 'undefined') error = 'error: undefined object';
  try {
    num = Number(value);
    precision = findPrecision([num]);
    if (isNaN(parseFloat(num))) {
      error = 'parseDecimal - could not format input - ' + e;
    }
  } catch (e) {
    error = 'parseDecimal - could not format input - ' + e;
  }
  return {value: num, precision: precision, error: error}
}

function formatFloatForDisplay(value) {
  let error;
  let precision;
  let num;
  if (typeof (value) === 'undefined') error = 'error: undefined object';
  try {
    num = Number(value);
    precision = findPrecision([num]);
    num = noExponents(num);
  } catch (e) {
    error = 'could not format input - ' + e;
  }
  return {value: num, precision: precision, error: error}
}

function round(value, decimals) {
  if (isExponential(value)) {
    const noE = noExponents(value);
    return (round(noE, decimals));
  } else {
    const sol = Number(Math.floor(value + 'e' + decimals) + 'e-' + decimals);
    return noExponents(sol);
  }
}