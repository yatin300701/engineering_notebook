Design a Rate Limiter

how many requests a cliet can make within given time frame
like traffic controller

- excess requests are send as HTTP 429 "Too Many Requirest"
- prevent abuse and protect servers
  

Requirements:
    functional / quality and non funcational

    - Funcational
      - identify type of request and send to required server
      -  Prevent api abuse by throwing error 429 -  based on certain rule
         -  can be one ip only send 100 req
      -  also be able to block user based on ip 


    Ask scale ?
        - is it user facing application / intramicro service / developer 
        - 100M DAU ( Daily active user)
        - 1M rps
  
  Non funcational requiremnt
    - how will it be able to it ?
    - scalability , durability, security , low latency, fault tolerant
    - not write it down, just think about it before designing your system

    - CAP theorem - consistancy , availability and partition tolerance
        - genrally partition tolenrance is must ? to be able to scale
        - so question is should it be strongly consitant (read be reading latest write) or always available (eventual consistancy)
  
    - we are choosing availability
      - meaning - if some new rule is added it will be applied in some time 
      - otherwise we would have to make it go offline till all nodes have rules applied
  
    -  low latency rate limit checks ie low latency ( will try <  10ms ) as its adding additional time to any request from a user

    -  scalability to 1M rps


    # Core Entities

    - Request
    - who is making the req ( client, ip, userId, api key)
    - rules (100r/s)

    # System Interface

    isRequestAllowed(clientId,rulesId) -> { passes:boolen, remainging: number, resetTime: timestamp}

    # High level design 

    1. where to place it in our architechtre
    2. How should we identify clients
   
    Where ?
    
    1. 

     