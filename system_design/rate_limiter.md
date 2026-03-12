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
    
    1. Inside each service 
     - Problem:
       - ?? (lack of coordination between servicses)
    2. Global Rate Limiter
      - Problem
        - ?? introduces some excess latency and now every req that comes  to microservice goes to it
            then rate limiter then service
    3. Place it in front of all microservice at the edge ie gateway
      - like  bouncer at the club
      - Problem: 
        - it will be hard to query complex things which it had knowledge in microservice
        - ie increase rate limit for pro accounts, now we have knowlege only from headers
        - we can do it, with JWT 

  How to identiify clients ?
  
   how do you knwo this user is unique
    1. userId in query / jwt
    2. ip
    3. API key
  
  Or Question : Are all users authenticated ? Or Internal / Developer API needing api key etc
  Or combination - ie authenticated users will have high rate limit then unauth ip

  # Rules

  4 rate limit algo

  1. Fixed window counter
    - each user will get n requests per window (100 req per min)
    - reset counter at start of each window 
    - if exceeds - throw 429
    - trivial to implement using pair of hash of userId and counter
    - Problem : boundry effect
    - ie user called service at 11:59- 90 calles and at 12:00 - 100 calles, so service will get 190 call suddenly
    - starvation effect- if called 11:01 - 100 calls , now have to wait 59 sec

  2. Sliding window log 
   - we have sliding window, ie rolling window of 1 min , which maintains rate limit of 100 calls in a min
   - removes burst problem
   - Problem is : its implmented with heap, so would take a lot of memory
  
  3. Sliding window counter
    - it provides approximation of sliding window by assuming we have smooth flow of traffic
    - Working
      - fixed window of 60s
      - two counters - one for previous , and other for current
      - why , as in  burst spikes, problem was we were not considering previous req, so at boundry
        we had 80, + 80 req, at 59 and 1 sec
      - in this we estimate no of req in last 60s
  
        assume 
        window_size = 60s
        limit = 100
        calculate how much of pre window still overlaps with the current rolling window
          overlap_ratio = remaing_time_in_window / window_size
        estimate count
          estimate_count = current_window_count + pre_window_count * overlap_ratio

      - when one req arrives, a weighted count of requests in previous window is added to count   
        in current window to estimate total no of req in rolling time frame

  4. Token Bucket 
      - each client will have a bucket, which will have tokens
      - there is max limit to bucket , which it can hold max tokens (100)
      - we have a stedy rate by which we fill it, ie add tokens in it.
      - now with each req we remove token from it
      - so it handles burt ,ie max it can allow 100 , and also with steady fill rate, smothens req to servers
      - Implement ??

   

   # Implementation
  
    As we can have multiple gateways, we need each one to know bucket_filled_count in each one
    - so what we can do is, take it out from gate ways in redis 
    - 1. request comes in
      2. gateway featch token and last_refill_time from redis (HMGET)
      3. calculate - amount token to add in his/her bucket based on last_refill_time and rate
      4. Respond pass / fail ,if token > 0
      5. Update bucket status

    It has one problem, race condition, what if two gateway get same last_refill_time and token amount,
    and try to update redis, its counter will go up by one only
    So read and update have to be atomic, using lua scripting (like transaction)
        
     