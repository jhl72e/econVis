// cogscale.js

const cogScale = (() => {
  function prospectTheory(x, alpha = 0.88, beta = 0.88, lambda = 2.25) {
    if (x >= 0) {
      return x;
    } else {
      const perceived = -lambda * Math.pow(-x, beta);
      const compensation = x / perceived;
      return x * compensation;
    }
  }

  function powerAreaScale(x, a = 0.6) {
    const normalized = Math.pow(x, a);
    const maxVal = Math.pow(1, a);
    return normalized / maxVal;
  }

  function weberFechner(x, k = 1) {
    return k * Math.log(x + 1);
  }

  return {
    prospectTheory,
    powerAreaScale,
    weberFechner,
  };
})();
