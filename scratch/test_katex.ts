import katex from "katex";

const test1 = "\\frac{W_{\\text{median}}}{160}";
console.log("With double backslash:", katex.renderToString(test1, { displayMode: true, throwOnError: false }));

const test2 = String.raw`W_{\text{hourly}} = \frac{W_{\text{median}}}{160}`;
console.log("With String.raw:", katex.renderToString(test2, { displayMode: true, throwOnError: false }));
