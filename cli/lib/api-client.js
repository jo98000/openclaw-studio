const http = require("node:http");
const https = require("node:https");

const DEFAULT_BASE_URL = "http://localhost:3000";

const getBaseUrl = () => process.env.OPENCLAW_STUDIO_URL || DEFAULT_BASE_URL;

/**
 * Make an HTTP request to the Studio API.
 */
const request = (method, path, body) => {
  return new Promise((resolve, reject) => {
    const base = getBaseUrl();
    const url = new URL(path, base);
    const isHttps = url.protocol === "https:";
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: { "Content-Type": "application/json" },
    };

    const req = lib.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(json.error || `HTTP ${res.statusCode}`));
          } else {
            resolve(json);
          }
        } catch {
          reject(new Error(`Invalid JSON response: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on("error", (err) => {
      reject(new Error(`Could not connect to Studio at ${base}. Is it running?\n${err.message}`));
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
};

module.exports = { api, getBaseUrl };
