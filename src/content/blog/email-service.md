---
title: Email  Service
description: Design of a scalable email service covering sending, receiving, storage, indexing, and security mechanisms.
tags: ["System Design"]
pubDate: 2026-04-11
heroImage: ../../assets/blogs/email-service.png
---

# Email Service

- Challenge to design large-scale email service like email

> Flow

    1. Defining Requirement (Functional requirements)
    2. Calculating scale
    3. Real time delivery

#### Functional Requirement

1. Sending and receiving email - after authentication
2. send attachments, photes, videos
3. Search items inside mails
4. spam and security

#### Scale and constraints

Estimate how many users will use it ?

eg. 1 billion users, sending 2 mails per day

#### High level architechture

looking at big pictue, like load balancers, mail service and databases

#### Note:

Want to ask emails aren't send like instant msg
SMTP - is used for sending email
POP3/IMAP - for receiving email

---

### SMTP - "Push / Send Protocol"

Your email client -> sends mail using SMTP to mail server
Mail server -> sends mail to recipient mail server via SMTP

- Key Points:
- Only sending mail
- works like relay system
- uses TCP (port 25/ 587 / 465)
- stateless
- does not store or manage inboxes

### POP3 - "Download protocal (dumb client model)"

downlaods emails from server -> local device,
after download -> delete from server , (can be configured to keep a copy)

- no sync
- no folder (server side)
- no state
- open email on phone , laptop has no idea
- send/read status not sync

### IMAP - "Sync protocol (Server first model)"

emails stay on server , client just views and sync states

-- Can go deep in each on on packet lavel ( later )

## Dive Deeper

1. Web / Mobile client
2. Load balancer
3. SMTP server
4. Message queue - RabbitMQ

Attachments in object storage like S3
Metadata - sender , subject, timestamp - in SQL / NoSQL

Search would be done by - elastic search as relational data struggle with full text search
Elasticsarch creates inverted index - documentIds(emails) to word

Use background woker for sending data to elastic search , instead of doing it on air, called evantual consistancy
using Kafka or RabbitMQ

API saves email to db and s3 .
api pushes new email into queue
workers pull from queue and update elastic search and send push notification

From sender side

- it first does dns lookup , ie which server handles email to this domain, looks at MX records
- now connects to sender mail server using SMTP and perform SMTP handshake

From receiver side

- queue the email from server , SMTP connection must be fast
- now bg worker should handle spam filter, virus scan, DKIM / SPF varification
- rate limit

( horizontal scaling problem )

- Store mail in some db
- make it available to user - using IMAP (sync model) or apis (Gmail-style system)

## Clean Architechture

[Sender Mail Server]
↓
(DNS MX lookup)
↓
[Load Balancer]
↓
[SMTP Receiving Cluster]
↓
(Quick accept)
↓
[Message Queue]
↓
[Processing Workers]
↓
[Distributed Mail Storage]
↓
[IMAP / API Layer]

### Spam and security

We check specific records in sender's DNS
Three "security gatekeepers"

1. SPF (Sender Policy Framework):
   - list in DNS that tells, ips which are allowed to send messages
2. DKIM (DomainKeys Identified Mail):
   - adds digitial signature to verify if its correct, and not modified in path. Receiver uses public key to in DNS to check it
     If matches pass
3. DMARC - Its "instruction manual" for receiving server, it tells server what to do in SPF or DKIM fails (Do nothing / Put in spam / Reject)

# Remaing things in this

❓ Where is the source of truth?
Mailbox DB? Object store? Hybrid?
❓ How do you shard users?
By userId? domain? region?
❓ How do you handle:
large attachments?
hot users?
retries?
how to handle temporary failures (4xx vs 5xx)

receiving side

idempotency (duplicate emails)
mailbox write consistency
ordering guarantees (threads)

elastic search

inverted index
indexing pipeline
eventual consistency tradeoff

Security

spam ML filters
IP reputation systems
