const T = require("tesseract.js")
T.recognize("img/receipt.jpg", "eng")
    .then(out => console.log(out.data.text))            