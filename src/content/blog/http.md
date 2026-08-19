---
title: Everything about 'Load balancers'
description: All important cases, and interview preparations for js 'this' keyword
tags: ["System Design"]
pubDate: 2026-05-9
heroImage: ../../assets/blogs/this.png
---

Request is of type :

POST /api/orders HTTP/1.1
Host: api.example.com
Auth: Bearer ...
Content-type: application/json
User Agent: Mozzila/5.0
X-Regin: india

{
    ....
}

L7 proxy / load balancer can read these HTTP level fields and make routing decisions

eg:

If host / domain is:

api.example.com -> API servers
admin.example.com -> Admin servers

called host based routing

If http headers

- using x-country: india  or usa route to diffrent server
- using content-type: application/json - to service handling json data
  
If HTTP methods:
- using get, put, patch, delete etc

L4 load balancer only understands

- Source IP
- Destination IP
- Source Port 
- Destination Port
- TCP / UDP
  
  Does not understand 
  GET /users HTTP/1.1

  # Node net vs http

  Http is a protocol carried over TCP

  HTTP
  |
  TCP
  |
  IP

  Node exposes these seperately
  
    node:http
    |
    HTTP parsing + HTTP response/request APIs
    |
    TCP
    |
    node:net
    |
    raw TCP connections


## Load Balancers ( 4 kinds )

1. Layer 4 (transport)

sees ip only and not http.
- fast
- protocol agnostic
- can do tls passthrough - mean it passes data and does not decript it for server
- can't route on a url path, can't retry a failed HTTP request, can't insert a header

eg AWS NLB (Network Load Balancer) - miantians itself, HAProxy in `mode tcp` 

2. Layer 7 (application)
   
terminates the connection, parses HTTP, then makes a per request decision
- routes on path, host, method, header, cookie, query params
- can retry,....
- one client can fan out to many backends over pooled connections
- "Costs a full proxy hop of latency" - means it receives , processes and creates another connection/ request toward the backend

eg AWS ALB (Application Load Balancer) , Nginx (Web server + reverse proxy + L7 LB) (Highly configurable HTTP server/proxy), HAProxy HTTP (Dedicated high performance proxy) (Serious traffic control),  Envoy (Designed for destributed systems, mainly like - service A -> Envoy -> Service B, it has sidecar architecture , can sit next to every service)
               Envoy
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
    Service A  Service B  Service C
,
Traefik (If docker kubernetes services appear and disappear, Traefik watches the platform and updates routing)

3. DNS / GSLB (global server load balancing)

It answers which client will resolve to which IP based on geography, latency or health.

                 GSLB
              /    |    \
             ▼     ▼     ▼
         Mumbai  Singapore  US
            │       │       │
           ALB     ALB     ALB


like 
            GLOBAL LEVEL
                 │
                GSLB
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
      Mumbai  Singapore   US
        │        │         │
       ALB      ALB       ALB
        │        │         │
      servers  servers   servers

GSLB - load balancing between locations
ALB - load balancing between  servers/ services within a location

Use dns as it can influence which IP the client resolves and get user location by  approx of user location from DNS query ( But it can come from ISP DNS, Google Public DNS therefore it uses EDNS client subnet - a dns extention - ECS)
- geneally slow to change as clients cache the ans, so ttl is used

eg 



