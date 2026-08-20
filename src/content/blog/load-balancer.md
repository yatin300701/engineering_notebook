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

eg Route 53 Latency Based Routing ( it chooses the AWS region that has least latency for user - how does it know - AWS maintains latency measurements between user networks and AWS regions ),
Route 53 Geolocation Routing ( you tell it, users from this geography should go to this endpoint, how does it know user position ??), cloudflare (it considers , endpoint health, pool health, geography, latency, proximity etc), Cloudflare also have geo steering ( clouldflare has explicit geo steering ),
Akamai GTM (it makes decision based on data center health and global internet conditions)

4. Client-side / sidecar
  No middlebox. Caller have list of backends it can pick from or it calls local sidecar proxy to pick it.

  Yes it does make another hop for it, but its local not network call to get healthy servers, so is quite fast.

  eg gRPC built-in LB, (gRPC has built in load balancing ie can choose BE using round_robin or pick_first) Envoy + xDS, Linkerd (lighweight fast service mesh for Kubernetes that automatically detects and load balances gRPC/HTTP2 across pods) , Consul (mesh platform that tracks healthy service instances and  can integrate with Envoy)

  ### Algoes

  Round Robin - Backend are identical and requests cost same ( cons: falls apart when request cost is skewed - one slow backend becomes latency sink )
  Weighted round robin - ( its good initially but weights are static so does not represent real time utility of server, ie if after some time server 1 which have weight of 2 , has 95% cpu usage, and server 2 which have weight of 1 with 10% of cpu usage , it will still send more requests to server 1 )
  Random -
  Least Connection - which has fewest open connections ( cons: backend that is failing fast has few open connections, so it look idle and attracts more traffic)
  Least Response Time - Fewest connections, weighted by observed latency
  Power of two choices - Lighter of two randomly sampled backend ( winner of slace in which we choose any two server and send request to less loaded one)
  IP hash - backend chosen by hashing the client IP ( workaround or cheap way of storing users session, it failes when many people are behind shared NATs)
  Consistant hashing - backend choosen by hashing a key , stable under membership change ( used for scalability , use it when backend holds state for a key , a cache, session etc and you want to keep adding or remoing one node to remap 1/N of keys then all)


  (IP hash pins a client, consistent hashing pins a key and servives the fleet chaning size)


  ### The failures that actully page you

  > Idle timeout mismatch
  


