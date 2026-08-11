---
title: Load Balancers — the four layers you actually choose between
description: L4 vs L7, DNS/GSLB, client-side and sidecar load balancing — what each one can and cannot see, and the rule for picking one.
pubDate: 2026-08-11
kind: component
tags: ["System Design", "Networking"]
tldr: A load balancer is a scheduler for a queue you cannot see, so the only real question is how much of the request it is allowed to read before it decides.
decisionRule: Pick the lowest layer that can still see the thing you need to route on. Routing on IP:port → L4. Routing on path, header, or cookie → L7. Routing on the user's geography → DNS/GSLB. Routing on live per-server load inside one service → client-side or sidecar.
prerequisites:
  - topic: "HTTP request/response basics"
    why: "An L7 balancer's whole job is reading parts of an HTTP request. If the request is opaque to you, so is the routing."
    check: "Can you name three things in a request a proxy could route on, other than the URL path?"
  - topic: "TCP vs UDP, and what a connection is"
    why: "The L4/L7 split is exactly the line between forwarding a connection and terminating one."
    check: "Can you explain why one TCP connection can carry many HTTP requests?"
  - topic: "Node's net and http modules"
    why: "You build both balancer types below with these two modules and nothing else."
    check: "Can you write an HTTP server in Node without Express?"
  - topic: "Async JS — callbacks, promises, streams"
    why: "A proxy is two streams piped together. Health checks are timers plus promises."
    check: "Do you know what readable.pipe(writable) does to backpressure?"
scope:
  covered:
    - "The four kinds of load balancer and what each can see"
    - "Every selection algorithm you'll meet in a config file, and when each is right"
    - "Health checks, outlier ejection, connection draining"
    - "The common production failure modes and why they happen"
    - "Building an L4 and an L7 balancer by hand in Node"
  notCovered:
    - topic: "Reverse proxy and API gateway — how they differ from a load balancer"
      why: "The same NGINX process can be all three, so the distinction is about role rather than software. It deserves its own comparison instead of a paragraph here."
      where: "A future 'Reverse proxy vs load balancer vs API gateway' entry."
    - topic: "CDNs and edge caching"
      why: "A CDN distributes traffic geographically like GSLB does, but its real job is caching content near users — a different problem with its own failure modes."
      where: "A future 'CDN' entry."
    - topic: "Rate limiting — token bucket and leaky bucket"
      why: "Load balancers commonly enforce rate limits, so this is genuinely adjacent, but it is a separate mechanism with its own algorithms. Folding it in here would make both topics shallow."
      where: "Its own topic — you already have a Rate Limiter write-up in the blog; the token/leaky bucket algorithms belong there."
    - topic: "TLS internals — handshake, cipher suites, cert chains"
      why: "This entry treats TLS termination as a capability, not a protocol. Understanding what the handshake actually does is a full topic."
      where: "A future 'TLS and mTLS' entry."
    - topic: "Service discovery internals — Consul, etcd, DNS SRV"
      why: "Client-side and sidecar balancing assume a discovery system exists. How that system stays consistent is a distributed-systems topic, not a routing one."
      where: "A future 'Service discovery and consistent membership' entry."
    - topic: "Kubernetes ingress, kube-proxy, and Service routing"
      why: "These are specific implementations of the four kinds described here. Learn the concepts first, then the vendor mapping is a quick read."
      where: "A future 'Kubernetes networking' entry."
    - topic: "Queueing theory and the maths of latency under load"
      why: "It explains why p99 blows up before capacity runs out, but it is a modelling topic, not a routing one."
      where: "A future 'Little's Law and queueing' entry."
sources:
  - title: "AWS — Elastic Load Balancing product comparison (ALB vs NLB vs GWLB)"
    url: "https://aws.amazon.com/elasticloadbalancing/features/"
    type: docs
  - title: "NGINX — HTTP Load Balancing guide"
    url: "https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/"
    type: docs
  - title: "Google SRE Book — Load Balancing at the Frontend & in the Datacenter (Ch. 19–20)"
    url: "https://sre.google/sre-book/load-balancing-frontend/"
    type: book
  - title: "Maglev: A Fast and Reliable Software Network Load Balancer (Google, NSDI '16)"
    url: "https://research.google/pubs/pub44824/"
    type: paper
  - title: "The Power of Two Choices in Randomized Load Balancing (Mitzenmacher)"
    url: "https://www.eecs.harvard.edu/~michaelm/postscripts/tpds2001.pdf"
    type: paper
  - title: "Envoy — supported load balancing algorithms"
    url: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers"
    type: docs
mastery:
  - stage: "Foundations"
    topics:
      - "OSI layers 3/4/7 and what a proxy can read at each"
      - "TCP handshake, connection reuse, keep-alive"
      - "TLS termination vs TLS passthrough vs re-encryption"
      - "Forward proxy vs reverse proxy"
      - "Virtual IP (VIP), NAT, and Direct Server Return (DSR)"
  - stage: "The algorithms"
    topics:
      - "Round robin and weighted round robin"
      - "Least connections and least request (peak EWMA)"
      - "Power of two random choices — why it beats least-connections at scale"
      - "Consistent hashing and rendezvous hashing; Maglev hashing"
      - "Session affinity / sticky sessions and why they are a liability"
  - stage: "Keeping it alive"
    topics:
      - "Active vs passive health checks; shallow vs deep probes"
      - "Outlier detection and ejection"
      - "Connection draining / graceful deregistration"
      - "Slow start and warm-up for cold instances"
      - "Retries, hedging, and retry storms; retry budgets"
      - "Circuit breaking and load shedding under overload"
  - stage: "Distribution & scale"
    topics:
      - "DNS load balancing, TTL caching problems, GSLB, anycast"
      - "ECMP and equal-cost multipath at the network layer"
      - "Layer 4 load balancer HA: keepalived, VRRP, BGP announcement"
      - "Client-side load balancing (gRPC, Ribbon-style) and lookaside LB"
      - "Service mesh / sidecar LB (Envoy, xDS control planes)"
      - "Zone-aware routing and cross-AZ traffic cost"
  - stage: "Operating it"
    topics:
      - "The metrics that matter: p99 latency, active connections, surge queue, 5xx by target"
      - "Capacity planning and pre-warming for traffic spikes"
      - "Idle timeout mismatches between LB and origin (the 502 classic)"
      - "Proxy protocol and X-Forwarded-For for real client IPs"
      - "Failure modes: thundering herd, hot shard, cascading failure"
---

## The one idea

Every load balancer is doing the same thing: a request arrives, and something has to
pick which backend gets it. The entire design space comes from **how much of that
request the balancer is allowed to open and read before it decides** — and reading
more costs latency, CPU, and the ability to pass encrypted traffic through untouched.

That is the whole subject. Everything below is a consequence.

---

## The four kinds

### 1. Layer 4 (transport)

Sees IP addresses and ports. It does not know what HTTP is. It picks a backend for a
**connection**, and every packet on that connection goes to the same place.

- Fast — often line-rate, because it forwards packets rather than terminating sessions.
- Protocol-agnostic: works for TCP, UDP, QUIC, MQTT, raw databases, game traffic.
- Can do TLS passthrough: the backend terminates TLS, the balancer never sees plaintext.
- Cannot route on a URL path, cannot retry a failed HTTP request, cannot insert a header.

> AWS NLB, HAProxy in `mode tcp`, IPVS, Maglev, F5 in L4 mode.

### 2. Layer 7 (application)

Terminates the connection, parses HTTP, then makes a **per-request** decision.

- Routes on path, host, method, header, cookie, query param.
- Can retry, rewrite, compress, cache, rate limit, authenticate, and emit rich metrics.
- Multiplexes: one client connection can fan out to many backends over pooled connections.
- Costs a full proxy hop of latency and real CPU (especially TLS termination).

> AWS ALB, NGINX, HAProxy in `mode http`, Envoy, Traefik, Caddy.

### 3. DNS / GSLB (global)

The "balancer" is the DNS answer itself. Different clients resolve the same name to
different IPs based on geography, latency, or health.

- The only mechanism that can move traffic **between regions**.
- Coarse and slow to react: clients and resolvers cache the answer, and TTL is a
  suggestion that many resolvers ignore. Assume minutes, not seconds, for failover.
- Usually paired with anycast so a single IP is announced from many locations.

> Route 53 latency/geo routing, Cloudflare, Akamai GTM.

### 4. Client-side / sidecar

No middlebox. The caller holds the list of backends and picks one itself, or a local
sidecar proxy does it on the caller's behalf.

- Zero extra network hop; the best possible latency.
- The client can see real per-backend health and in-flight request counts, so it can
  use smarter algorithms than a shared balancer can.
- Requires service discovery and a control plane, and every client language needs the
  logic (which is exactly why sidecars exist).

> gRPC built-in LB, Envoy + xDS, Linkerd, Consul.

---

## Picking one

| If you need to… | Use |
| --- | --- |
| Route `/api/*` and `/static/*` to different services | L7 |
| Pass through TLS untouched for compliance | L4 |
| Balance a non-HTTP protocol (Postgres, MQTT, UDP) | L4 |
| Handle millions of connections with minimal latency | L4 |
| Retry a failed request on another backend | L7 or client-side |
| Do canary or blue/green by header or weight | L7 |
| Survive an entire region going down | DNS/GSLB (over regional L4/L7) |
| Keep a static IP for firewall allowlisting | L4 |
| Squeeze out the last hop of latency inside a mesh | Client-side / sidecar |

Real systems stack them: **GSLB → L4 → L7 → sidecar**, each one narrowing the choice
made by the layer above it.

---

## The algorithm matters less than you think — until it doesn't

These are the options in a real config file. The list is short, and picking the
wrong one only hurts once your backends stop being identical.

| Algorithm | Sends the request to | Reach for it when |
| --- | --- | --- |
| Round robin | The next backend in order | Backends are identical and requests cost about the same |
| Weighted round robin | Next in order, but bigger servers get more turns | The fleet is mixed — an 8-CPU box next to a 4-CPU box |
| Random | Any backend, uniformly | You want round robin without coordinating a counter across many balancers |
| Least connections | Whichever has fewest open connections | Request cost varies a lot |
| Least response time | Fewest connections, weighted by observed latency | Backends degrade gradually rather than failing outright |
| Power of two choices | The lighter of two randomly sampled backends | Many independent balancers that can't see each other's state |
| IP hash | A backend chosen by hashing the client IP | You need the same client to land on the same server |
| Consistent hashing | A backend chosen by hashing a key, stable under membership change | The backend holds state for that key |

Round robin is fine when every request costs about the same and every backend is
identical. It falls apart the moment request cost is skewed: one slow backend keeps
receiving its full share of traffic and becomes a latency sink.

**Weighted round robin** is the fix when the *servers* differ rather than the
requests. Give the 8-CPU box a weight of 2 and the 4-CPU box a weight of 1.
Static weights go stale, though — they describe the hardware, not today's load.

**Least connections** fixes the obvious case but has its own trap — a backend that is
failing *fast* has few open connections, so it looks idle and attracts more traffic.
This is the classic "black hole" failure. Pair it with outlier ejection.

**Power of two choices** is the quiet winner at scale: pick two backends at random,
send to the less loaded one. It gets nearly the benefit of global least-connections
without needing global state, which matters when you have many independent balancers
that cannot see each other's decisions.

**Least response time** extends least-connections by weighting on measured
latency, which catches the backend that is still accepting connections but has
become slow — a GC pause, a saturated disk. It costs you a latency estimate per
backend, and it reacts to noise if the window is too short.

**IP hash** and **consistent hashing** both route by hashing, and they get
confused constantly, so keep the purposes separate:

- **IP hash** exists to give you *affinity* — this client, always this server.
  It's the cheap way to keep in-memory sessions working. It also distributes
  badly the moment your users sit behind shared NATs or mobile carrier proxies,
  where thousands of clients share one source IP. Treat it as a workaround for
  state you should have moved to Redis.
- **Consistent hashing** is not about balance at all — it is about *stability*.
  Use it when the backend holds state for a key (a cache shard, a session, a
  stateful stream consumer) and you want adding or removing one node to remap
  `1/N` of keys instead of all of them.

The distinction in one line: IP hash pins a *client*; consistent hashing pins a
*key* and survives the fleet changing size.

---

## The failures that actually page you

- **Idle timeout mismatch.** LB idle timeout is 60s, origin's is 60s. The origin closes
  a pooled connection at the same instant the LB sends a request into it. You get
  intermittent 502s with no error in the app logs. Always set origin keep-alive
  *longer* than the LB idle timeout.
- **Health check too shallow.** `GET /` returns 200 from a process whose database pool
  is exhausted. The check must exercise the dependency path that matters — but not so
  deep that one slow dependency ejects your entire fleet at once.
- **Retry storms.** Every layer retries 3 times; three layers deep that is 27 requests
  for one user action. Under partial failure, retries become the outage. Use a retry
  *budget* (cap retries as a percentage of total traffic), not a retry count.
- **Sticky sessions plus scaling.** Affinity means a scale-in event drops sessions and
  a scale-out event does nothing for the hot instances. Push session state out to a
  store and delete the stickiness.
- **Cross-AZ cost and latency.** A perfectly balanced fleet sends 2/3 of traffic across
  availability zones. Zone-aware routing keeps it local until a zone is actually
  unhealthy.

---

## Build it yourself

You can build both kinds of load balancer with Node's standard library — no
Express, no dependencies. Roughly 40 minutes end to end. Make a folder and
create the files as you go.

> **Setup.** These files use `import`, so run them on Node 22.7 or newer, where
> plain `.js` files with ESM syntax just work. On Node 18 or 20 you'll get
> `Cannot use import statement outside a module` — fix it by adding a
> `package.json` next to your files containing `{ "type": "module" }`.
> Check with `node --version` before you start.

### 0. Three backends to balance

Create `backends.js` and run `node backends.js`. The `/break`, `/heal`, and
`/slow` endpoints exist so you can break things deliberately in step 4.

```js
import http from "node:http";

const PORTS = [5001, 5002, 5003];
const SLOW_REQUEST_MS = 2000;

for (const port of PORTS) {
  let healthy = true;

  http
    .createServer((req, res) => {
      if (req.url === "/health") {
        res.writeHead(healthy ? 200 : 500).end(healthy ? "ok" : "sick");
        return;
      }
      if (req.url === "/break") {
        healthy = false;
        res.end(`:${port} is now unhealthy\n`);
        return;
      }
      if (req.url === "/heal") {
        healthy = true;
        res.end(`:${port} is now healthy\n`);
        return;
      }

      const delay = req.url.startsWith("/slow") ? SLOW_REQUEST_MS : 0;
      setTimeout(() => {
        res.writeHead(200, { "content-type": "text/plain" });
        res.end(`served by :${port}  (path was ${req.url})\n`);
      }, delay);
    })
    .listen(port, () => console.log(`backend listening on :${port}`));
}
```

Check it: `curl localhost:5001/hello`.

### 1. A Layer 4 balancer — 15 lines

It forwards **bytes**. It has no idea HTTP exists. Create `l4.js` and run
`node l4.js` in a second terminal.

```js
import net from "node:net";

const backends = [5001, 5002, 5003];
let roundRobinIndex = 0;

function nextBackendPort() {
  return backends[roundRobinIndex++ % backends.length];
}

net
  .createServer((client) => {
    const upstream = net.connect(nextBackendPort(), "127.0.0.1");

    client.pipe(upstream);
    upstream.pipe(client);

    const closeBoth = () => {
      client.destroy();
      upstream.destroy();
    };
    client.on("error", closeBoth);
    upstream.on("error", closeBoth);
  })
  .listen(8080, () => console.log("L4 balancer on :8080"));
```

The two `pipe` calls are the whole proxy: bytes from the client go upstream,
bytes from the backend come back.

Now prove the two defining properties to yourself:

```bash
# Balances — each new connection lands somewhere else
curl -s localhost:8080/; curl -s localhost:8080/; curl -s localhost:8080/

# But the decision is PER CONNECTION, not per request.
# curl reuses one connection for both URLs → both hit the same backend.
curl -s localhost:8080/one localhost:8080/two
```

That second command is the whole L4 lesson. Notice there is nowhere in `l4.js`
you *could* read the path even if you wanted to — you only have a byte stream.

### 2. A Layer 7 balancer

Now terminate the request, read it, and decide per request.

Stop `l4.js` first — both listen on 8080. Then create `l7.js` and run
`node l7.js`.

```js
import http from "node:http";

const pool = [5001, 5002, 5003].map((port) => ({
  port,
  inflight: 0,
  healthy: true,
}));

function pickPowerOfTwoChoices() {
  const live = pool.filter((backend) => backend.healthy);
  // Fail open: if nothing is healthy, still try rather than 503 everyone.
  const candidates = live.length ? live : pool;

  const first = candidates[Math.floor(Math.random() * candidates.length)];
  const second = candidates[Math.floor(Math.random() * candidates.length)];
  return first.inflight <= second.inflight ? first : second;
}

http
  .createServer((req, res) => {
    if (req.url.startsWith("/admin")) {
      res.writeHead(403).end("nope\n");
      return;
    }

    const target = pickPowerOfTwoChoices();
    target.inflight++;

    const upstream = http.request(
      {
        host: "127.0.0.1",
        port: target.port,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, "x-forwarded-for": req.socket.remoteAddress },
      },
      (upstreamRes) => {
        res.writeHead(upstreamRes.statusCode, upstreamRes.headers);
        upstreamRes.pipe(res);
        upstreamRes.on("end", () => target.inflight--);
      }
    );

    upstream.on("error", () => {
      target.inflight--;
      res.writeHead(502).end("bad gateway\n");
    });

    req.pipe(upstream);
  })
  .listen(8080, () => console.log("L7 balancer on :8080"));

function runHealthChecks() {
  for (const backend of pool) {
    const probe = http.get(
      { host: "127.0.0.1", port: backend.port, path: "/health", timeout: 500 },
      (res) => {
        const wasHealthy = backend.healthy;
        backend.healthy = res.statusCode === 200;
        if (wasHealthy !== backend.healthy) {
          const state = backend.healthy ? "healthy" : "EJECTED";
          console.log(`:${backend.port} → ${state}`);
        }
        res.resume();
      }
    );
    probe.on("timeout", () => probe.destroy());
    probe.on("error", () => {
      backend.healthy = false;
    });
  }
}

setInterval(runHealthChecks, 1000);
```

Now the same reuse test behaves differently — routing happens per request, so
one connection can fan out across backends:

```bash
curl -s localhost:8080/one localhost:8080/two   # can land on different backends
curl -s localhost:8080/admin                    # 403, never reaches a backend
```

### 3. Watch the algorithm actually work

Send ten slow requests at once and watch them spread by in-flight count rather
than by turn order:

```bash
for i in $(seq 1 10); do curl -s localhost:8080/slow & done; wait
```

Change `pick()` to plain round robin and run it again. With uniform backends
you'll barely see a difference — which is the honest lesson: **the algorithm
only matters when the backends are not uniform.** Add `setTimeout` of 5s to
`:5003` only, and re-run. Now round robin keeps feeding the slow one and
power-of-two mostly avoids it.

### 4. Break it on purpose

This is the part that makes the failure list above real.

```bash
# Ejection: kill one backend's health, watch the balancer log EJECTED
curl -s localhost:5002/break
for i in $(seq 1 6); do curl -s localhost:8080/; done   # no more :5002
curl -s localhost:5002/heal
```

**The 502 you'll actually meet in production.** Make the backend close idle
connections sooner than the proxy expects. In `backends.js`, pull the server
out into a variable so you can set the timeout before it listens:

```js
const server = http.createServer((req, res) => {
  // unchanged handler body
});

server.keepAliveTimeout = 500;
server.listen(port, () => console.log(`backend listening on :${port}`));
```

Then make the proxy reuse connections, by adding a keep-alive agent in `l7.js`:

```js
const agent = new http.Agent({ keepAlive: true });
```

and passing `agent` in the options object you already give to `http.request`.
Now fire requests roughly 600ms apart:

```bash
for i in $(seq 1 10); do curl -s -o /dev/null -w "%{http_code}\n" localhost:8080/; sleep 0.6; done
```

You'll see 502s appear among the 200s, with nothing wrong in the backend log.
The proxy is reusing a socket in the instant the backend decides to close it.
Fix it by making the backend's `keepAliveTimeout` *longer* than the proxy's —
that ordering rule is the thing to remember.

---

## Defend your choice

Knowing the components is level one. This is the level you're actually aiming
for — the design review, where every choice gets questioned.

**"Why an L7 balancer here, not L4?"**
Because we route `/api` and `/static` to different services, and we need
per-request retries. If we only needed to spread TCP connections across
identical app servers, L4 would be faster and cheaper — the extra proxy hop
buys nothing when there's nothing to inspect.

**"Why not just use DNS round robin? It's free."**
Because it can't react. Clients and resolvers cache the answer past its TTL,
so a dead server keeps receiving traffic for minutes. DNS is the right tool for
moving traffic *between regions*, where minutes are acceptable and nothing else
can do the job. It's the wrong tool for failing over a single instance.

**"Why least-connections and not round robin?"**
Only because our request costs are skewed — a report endpoint takes 4s while a
health check takes 4ms. If every request cost the same, round robin would give
the same distribution with less state and no black-hole failure mode. The
algorithm is a response to variance, not an upgrade.

**"When is a load balancer the wrong call?"**
When you have one backend. A balancer in front of a single instance adds a hop,
a timeout to misconfigure, and a component that can fail — while providing no
redundancy at all. It's justified the moment you need zero-downtime deploys or
a second instance, and not before. Similarly, reaching for a service mesh at
three services buys you a control plane to operate and latency you can't
explain to anyone.

The pattern in all four answers: **name the condition that makes the choice
correct.** If you can't name a condition, you're repeating a preference.

---

## Test yourself

You can say you know this when you can answer these without looking anything up:

1. Why can't an NLB route based on a URL path?
2. Your service is behind an ALB and you see 502s at exactly a 1% rate. Where do you look first?
3. Why does least-connections make a fast-failing backend *more* dangerous?
4. You add one node to a 10-node cache tier. With modulo hashing, what fraction of keys move? With consistent hashing?
5. Your DNS failover has a 60-second TTL. How long until all traffic actually leaves the dead region, and why is the honest answer "longer"?
