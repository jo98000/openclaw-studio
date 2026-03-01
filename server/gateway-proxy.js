const { WebSocket, WebSocketServer } = require("ws");

const buildErrorResponse = (id, code, message) => {
  return {
    type: "res",
    id,
    ok: false,
    error: { code, message },
  };
};

const isObject = (value) => Boolean(value && typeof value === "object");

const safeJsonParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const resolvePathname = (url) => {
  const raw = typeof url === "string" ? url : "";
  const idx = raw.indexOf("?");
  return (idx === -1 ? raw : raw.slice(0, idx)) || "/";
};

const injectAuthToken = (params, token) => {
  const next = isObject(params) ? { ...params } : {};
  const auth = isObject(next.auth) ? { ...next.auth } : {};
  auth.token = token;
  next.auth = auth;
  return next;
};

const resolveOriginForUpstream = (upstreamUrl) => {
  const url = new URL(upstreamUrl);
  const proto = url.protocol === "wss:" ? "https:" : "http:";
  const hostname =
    url.hostname === "127.0.0.1" || url.hostname === "::1" || url.hostname === "0.0.0.0"
      ? "localhost"
      : url.hostname;
  const host = url.port ? `${hostname}:${url.port}` : hostname;
  return `${proto}//${host}`;
};

const hasNonEmptyToken = (params) => {
  const raw = params && isObject(params) && isObject(params.auth) ? params.auth.token : "";
  return typeof raw === "string" && raw.trim().length > 0;
};

const hasNonEmptyPassword = (params) => {
  const raw = params && isObject(params) && isObject(params.auth) ? params.auth.password : "";
  return typeof raw === "string" && raw.trim().length > 0;
};

const hasNonEmptyDeviceToken = (params) => {
  const raw = params && isObject(params) && isObject(params.auth) ? params.auth.deviceToken : "";
  return typeof raw === "string" && raw.trim().length > 0;
};

const hasCompleteDeviceAuth = (params) => {
  const device = params && isObject(params) && isObject(params.device) ? params.device : null;
  if (!device) {
    return false;
  }
  const id = typeof device.id === "string" ? device.id.trim() : "";
  const publicKey = typeof device.publicKey === "string" ? device.publicKey.trim() : "";
  const signature = typeof device.signature === "string" ? device.signature.trim() : "";
  const nonce = typeof device.nonce === "string" ? device.nonce.trim() : "";
  const signedAt = device.signedAt;
  return (
    id.length > 0 &&
    publicKey.length > 0 &&
    signature.length > 0 &&
    nonce.length > 0 &&
    Number.isFinite(signedAt) &&
    signedAt >= 0
  );
};

function createGatewayProxy(options) {
  const {
    loadUpstreamSettings,
    allowWs = (req) => resolvePathname(req.url) === "/api/gateway/ws",
    log = () => {},
    logError = (msg, err) => console.error(msg, err),
  } = options || {};

  if (typeof loadUpstreamSettings !== "function") {
    throw new Error("createGatewayProxy requires loadUpstreamSettings().");
  }

  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (browserWs) => {
    let upstreamWs = null;
    let upstreamReady = false;
    let connectRequestId = null;
    let connectResponseSent = false;
    let closed = false;
    let upstreamToken = "";
    const pendingUpstream = [];
    const debugRequestIds = new Set();

    const closeBoth = (code, reason) => {
      if (closed) return;
      closed = true;
      try {
        browserWs.close(code, reason);
      } catch {}
      try {
        upstreamWs?.close(code, reason);
      } catch {}
    };

    const sendToBrowser = (frame) => {
      if (browserWs.readyState !== WebSocket.OPEN) return;
      browserWs.send(JSON.stringify(frame));
    };

    const sendConnectError = (code, message) => {
      if (connectRequestId && !connectResponseSent) {
        connectResponseSent = true;
        sendToBrowser(buildErrorResponse(connectRequestId, code, message));
      }
      closeBoth(1011, "connect failed");
    };

    const forwardToUpstream = (serialized) => {
      if (upstreamReady && upstreamWs && upstreamWs.readyState === WebSocket.OPEN) {
        upstreamWs.send(serialized);
      } else if (upstreamWs) {
        pendingUpstream.push(serialized);
      }
    };

    // --- Register browser handlers synchronously (before async work). ---

    browserWs.on("message", (raw) => {
      const parsed = safeJsonParse(String(raw ?? ""));
      if (!parsed || !isObject(parsed)) {
        closeBoth(1003, "invalid json");
        return;
      }

      // Log all browser requests for debugging.
      if (parsed.type === "req") {
        const id = typeof parsed.id === "string" ? parsed.id : "";
        const method = parsed.method || "?";

        if (method === "connect") {
          if (id) connectRequestId = id;

          const browserHasAuth =
            hasNonEmptyToken(parsed.params) ||
            hasNonEmptyPassword(parsed.params) ||
            hasNonEmptyDeviceToken(parsed.params) ||
            hasCompleteDeviceAuth(parsed.params);

          if (!browserHasAuth && upstreamToken) {
            parsed.params = injectAuthToken(parsed.params, upstreamToken);
          }

          console.log(
            `[gateway-proxy] browser → connect (id=${id}, browserAuth=${browserHasAuth}, tokenInjected=${!browserHasAuth && !!upstreamToken})`
          );
        } else {
          console.log(`[gateway-proxy] browser → ${method} (id=${id})`);
          if (method === "sessions.patch") {
            debugRequestIds.add(id);
            console.log(`[gateway-proxy] sessions.patch params: ${JSON.stringify(parsed.params)}`);
          }
        }
      }

      if (!upstreamWs) {
        console.log("[gateway-proxy] browser message dropped — upstream not created yet");
        return;
      }

      forwardToUpstream(JSON.stringify(parsed));
    });

    browserWs.on("close", () => {
      closeBoth(1000, "client closed");
    });

    browserWs.on("error", (err) => {
      logError("Browser WebSocket error.", err);
      closeBoth(1011, "client error");
    });

    // --- Eagerly load settings and open upstream WebSocket. ---
    // This ensures the gateway's connect.challenge arrives at the browser
    // before its 750ms connect timer fires, allowing the browser to include
    // the challenge nonce in its connect request.

    loadUpstreamSettings()
      .then((settings) => {
        if (closed) return;

        const upstreamUrl = typeof settings?.url === "string" ? settings.url.trim() : "";
        upstreamToken = typeof settings?.token === "string" ? settings.token.trim() : "";

        if (!upstreamUrl) {
          sendConnectError(
            "studio.gateway_url_missing",
            "Upstream gateway URL is not configured on the Studio host."
          );
          return;
        }

        let upstreamOrigin;
        try {
          upstreamOrigin = resolveOriginForUpstream(upstreamUrl);
        } catch {
          sendConnectError(
            "studio.gateway_url_invalid",
            "Upstream gateway URL is invalid on the Studio host."
          );
          return;
        }

        console.log(
          `[gateway-proxy] connecting upstream → ${upstreamUrl} (origin: ${upstreamOrigin})`
        );
        upstreamWs = new WebSocket(upstreamUrl, { origin: upstreamOrigin });

        upstreamWs.on("open", () => {
          upstreamReady = true;
          console.log("[gateway-proxy] upstream open");
          // Flush any browser messages that arrived before upstream was ready.
          for (const msg of pendingUpstream) {
            upstreamWs.send(msg);
          }
          pendingUpstream.length = 0;
        });

        upstreamWs.on("message", (upRaw) => {
          const upParsed = safeJsonParse(String(upRaw ?? ""));

          // Log upstream messages for debugging.
          if (upParsed && isObject(upParsed)) {
            const kind = upParsed.type || "?";
            const detail = upParsed.method || upParsed.event || "";
            if (kind === "res" && upParsed.id) {
              const ok = upParsed.ok !== false;
              const isDebug = debugRequestIds.has(upParsed.id);
              console.log(
                `[gateway-proxy] gateway → res id=${upParsed.id} ok=${ok}${
                  !ok ? " error=" + JSON.stringify(upParsed.error) : ""
                }`
              );
              if (isDebug) {
                console.log(`[gateway-proxy] sessions.patch FULL response: ${JSON.stringify(upParsed)}`);
                debugRequestIds.delete(upParsed.id);
              }
            } else {
              console.log(`[gateway-proxy] gateway → ${kind}/${detail}`);
            }
          }

          // Track connect response for error reporting.
          if (upParsed && isObject(upParsed) && upParsed.type === "res") {
            const resId = typeof upParsed.id === "string" ? upParsed.id : "";
            if (resId && connectRequestId && resId === connectRequestId) {
              connectResponseSent = true;
            }
          }

          // Forward everything to browser transparently (including connect.challenge).
          if (browserWs.readyState === WebSocket.OPEN) {
            browserWs.send(String(upRaw ?? ""));
          }
        });

        upstreamWs.on("close", (code, reason) => {
          const reasonStr = reason ? String(reason) : "";
          console.log(`[gateway-proxy] upstream closed (${code}): ${reasonStr}`);
          if (!connectResponseSent && connectRequestId) {
            sendToBrowser(
              buildErrorResponse(
                connectRequestId,
                "studio.upstream_closed",
                `Upstream gateway closed (${code}): ${reasonStr}`
              )
            );
            connectResponseSent = true;
          }
          closeBoth(1012, "upstream closed");
        });

        upstreamWs.on("error", (err) => {
          logError("Upstream gateway WebSocket error.", err);
          sendConnectError(
            "studio.upstream_error",
            "Failed to connect to upstream gateway WebSocket."
          );
        });
      })
      .catch((err) => {
        logError("Failed to load upstream gateway settings.", err);
        sendConnectError(
          "studio.settings_load_failed",
          "Failed to load Studio gateway settings."
        );
      });

    log("proxy connected");
  });

  const handleUpgrade = (req, socket, head) => {
    if (!allowWs(req)) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  };

  return { wss, handleUpgrade };
}

module.exports = { createGatewayProxy };
