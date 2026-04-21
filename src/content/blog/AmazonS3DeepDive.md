---
title: Object Storage
description: Design of a scalable email service covering sending, receiving, storage, indexing, and security mechanisms.
tags: ["System Design"]
pubDate: 2026-04-11
heroImage: ../../assets/blogs/storages.png
---

# Notes from Neo Kim System Desgin Substack

## What is Object storage

1. Block Storage
   - oldest and lowest ( ssd and harddrives are seen as block of storage)
   - OS determines how to do file operations on it
   - Can also connect it via network, like Fiber Channel or iSCSI
   - Fiber Channel and iSCSI are technologies designed to connect servers to storage arrays, createing SAN (storage area network), providing block level access to data
   - SAN is not just storage over network, its dedicated high performance network where servers don't see files but raw disks (block storage)
   - like not: /files/report.pdf but /dev/sda

   #### Fiber Channel (FC)
   - specialized, high speed network protocol + hardware build for storage
   - need didicated hardware - Fiber channel switches, HBAs(Host Bus Adapters)
   - Not normal Ethernet
   - low latency + high throughput
   - used in banks, data centers
   - Ethernet used to be too slow / unreliable for storage => FC

   #### iSCSI
   - protocol - runs SCSI cmds over IP (TCP/IP network) ( sends disk cmds over network )
   - using existing ethernet
   - cheaper , easier to deploy
   - slightly higher latency than Fibre Channel
   - This is how cloud providers offer EBS (Elastic Block Store), attach network drive to your VM, and behaves like a local disk
   - fast and flexible but expensive

2. File Storage
   - built on top of block storage
   - adds a layer that handles the complexity of managing blocks, and gives you familiar directory hierarchy: folders, subfolders and files
   - usefull when many servers need to share the same file
   -
