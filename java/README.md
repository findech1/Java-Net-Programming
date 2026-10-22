# Bachelor of Information Technology (BIT)
## Network Programming Coursework - Java Client-Server Lab Suite

This project contains complete, production-grade, and thoroughly documented Java Client-Server programs implementing the core curriculum for university-level Network Programming.

---

### Directory Structure & Lab Catalog

```
java/
├── tcp/
│   ├── EchoServer.java              # Lab 1: Core single-client TCP ServerSocket
│   └── EchoClient.java              # Lab 1: TCP Socket client with stream I/O
├── multithreaded/
│   ├── MultiThreadedServer.java     # Lab 2: Concurrent server with ExecutorService ThreadPool
│   └── WorkerClient.java            # Lab 2: Client for testing simultaneous connections
├── chat/
│   ├── ChatServer.java              # Lab 3: Multi-user broadcast chat server (ConcurrentHashMap)
│   └── ChatClient.java              # Lab 3: Dual-threaded client (background listener + keyboard)
├── udp/
│   ├── UDPEchoServer.java           # Lab 4: Connectionless DatagramSocket & DatagramPacket
│   └── UDPEchoClient.java           # Lab 4: UDP client with timeout recovery (setSoTimeout)
├── student_records/
│   ├── StudentRecordsServer.java    # Lab 5: Application-layer query protocol for BIT Registrar
│   └── StudentRecordsClient.java    # Lab 5: Formatted terminal response parser (200_OK, 404)
├── http/
│   ├── MiniHttpServer.java          # Lab 6: Pure Java HTTP/1.1 Web Server on raw sockets
│   └── HttpClientTest.java          # Lab 6: Raw socket HTTP GET client
└── nio/
    ├── NioEchoServer.java           # Lab 7: Non-blocking I/O with Selector and SocketChannels
    └── NioTestClient.java           # Lab 7: NIO ByteBuffer client
```

---

### Quick Start: How to Compile and Run

#### 1. Compile All Labs
Open your terminal in the root directory and run:
```bash
javac java/*/*.java
```

#### 2. Running Lab 1 (TCP Echo Server & Client)
In Terminal 1 (Start Server):
```bash
cd java/tcp
java EchoServer
```

In Terminal 2 (Start Client):
```bash
cd java/tcp
java EchoClient
```
*Type any message to see it echoed back. Type `BYE` to close.*

#### 3. Running Lab 2 (Multi-Threaded Server)
In Terminal 1:
```bash
cd java/multithreaded
java MultiThreadedServer
```
In Terminal 2, 3, 4 (Multiple concurrent clients):
```bash
cd java/multithreaded
java WorkerClient
```
*Notice how each client is assigned a unique Client ID and handled by a separate pool worker thread.*

#### 4. Running Lab 3 (Multi-User Chat Room)
In Terminal 1:
```bash
cd java/chat
java ChatServer
```
In Terminal 2 (User 1 - Alice):
```bash
cd java/chat
java ChatClient
# Enter: Alice
```
In Terminal 3 (User 2 - Bob):
```bash
cd java/chat
java ChatClient
# Enter: Bob
```
*Messages typed by Alice are broadcast in real-time to Bob and vice versa!*

#### 5. Running Lab 4 (UDP Datagram Sockets)
In Terminal 1:
```bash
cd java/udp
java UDPEchoServer
```
In Terminal 2:
```bash
cd java/udp
java UDPEchoClient
```

#### 6. Running Lab 5 (University Student Records Protocol)
In Terminal 1:
```bash
cd java/student_records
java StudentRecordsServer
```
In Terminal 2:
```bash
cd java/student_records
java StudentRecordsClient
```
*Commands to try in the client:*
- `LIST_IDS`
- `GET_STUDENT BIT-2024-001`
- `GET_STUDENT BIT-2024-042`
- `GET_STUDENT BIT-2024-999` (triggers 404 NOT FOUND)
- `EXIT`

#### 7. Running Lab 6 (HTTP/1.1 Web Server)
In Terminal 1:
```bash
cd java/http
java MiniHttpServer
```
Open your web browser and visit:
```
http://127.0.0.1:8000/
http://127.0.0.1:8000/api/status
```

---

### Core Java Networking Classes Reference

| Class | Package | Purpose |
| :--- | :--- | :--- |
| `ServerSocket` | `java.net` | Listens for incoming TCP connections and returns client `Socket` |
| `Socket` | `java.net` | Two-way stream connection between client and server |
| `DatagramSocket` | `java.net` | Connectionless UDP sending/receiving endpoint |
| `DatagramPacket` | `java.net` | Self-contained byte container with destination IP/Port |
| `InetAddress` | `java.net` | Represents IP addresses (IPv4 / IPv6) |
| `BufferedReader` | `java.io` | Efficient character reading (wraps `InputStreamReader`) |
| `PrintWriter` | `java.io` | Formatted character output with optional auto-flush |
| `Selector` | `java.nio.channels` | Multiplexes non-blocking I/O events on a single thread |
