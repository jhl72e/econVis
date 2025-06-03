// cogscale.js

const cogScale = (() => {
    // 1. Prospect Theory Scaling Function
    function prospectTheory(x, alpha = 0.88, beta = 0.88, lambda = 2.25) {
      if (x >= 0) {
        return Math.pow(x, alpha);
      } else {
        return -lambda * Math.pow(-x, beta);
      }
    }
  
    // 2. Area Visualization Power Law Interpolation (normalize to 1)
    // Assumes input domain is [0, 1], compensates for perceived underestimation with exponent < 1
    function powerAreaScale(x, a = 0.6) {
      const normalized = Math.pow(x, a);
      const maxVal = Math.pow(1, a);  // always 1
      return normalized / maxVal;
    }
  
    // 3. Weber–Fechner Law Scaling (logarithmic scaling)
    function weberFechner(x, k = 1) {
      return k * Math.log(x + 1); // +1 to avoid log(0)
    }
  
    return {
      prospectTheory,
      powerAreaScale,
      weberFechner
    };
  })();
  