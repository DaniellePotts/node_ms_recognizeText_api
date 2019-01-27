const express = require("express");
const rp = require("request-promise");
const fs = require("fs");

const app = express();
const port = 3000;

app.get("/recognizeText", function(req, res) {
  let uri = "";
  let response;
  requestOcr()
    .then(function(result) {
      uri = result.headers["operation-location"];
    })
    .then(function() {
      return requestResult(uri);
    })
    .then(function(result) {
      Promise.resolve(res.send(result));
    });
});

function requestOcr() {
  let options = {
    uri:
      "https://westeurope.api.cognitive.microsoft.com/vision/v2.0/recognizeText?mode=Printed",
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": "my_key",
      "Content-Type": "application/octet-stream"
    },
    body: fs.readFileSync("test.png"),
    resolveWithFullResponse: true
  };

  return rp(options)
    .then(function(result) {
      return Promise.resolve(result);
    })
    .catch(function(err) {
      return Promise.reject(err);
    });
}

function requestResult(uri) {
  let options = {
    uri: uri,
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": "my_key",
      "Content-Type": "application/octet-stream"
    }
  };

  return rp(options)
    .then(function(result) {
      let response = JSON.parse(result);
      if (response.status == "Succeeded") {
        return response;
      } else {
        return requestResult(uri);
      }
    })
    .catch(function(err) {
      return Promise.reject(err);
    });
}
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
