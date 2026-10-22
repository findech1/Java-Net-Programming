import { StudyQuestion } from '../types/network';

export interface SocketBug {
  id: string;
  title: string;
  symptom: string;
  cause: string;
  badSnippet: string;
  fixedSnippet: string;
  explanation: string;
}

export const DEADLY_SOCKET_BUGS: SocketBug[] = [
  {
    id: 'unflushed-buffers',
    title: '1. The Unflushed Buffer Freeze',
    symptom: 'Client sends data, but Server hangs indefinitely on in.readLine() waiting for bytes that never arrive.',
    cause: 'PrintWriter or BufferedWriter buffers characters in memory until the buffer fills up (~8KB). If you don\'t flush, bytes never leave the OS network buffer.',
    badSnippet: `// ❌ BUG: autoFlush is false by default in PrintWriter(OutputStream)
PrintWriter out = new PrintWriter(socket.getOutputStream());
out.println("Hello Server");
// Data is stuck in memory buffer! Server hangs!`,
    fixedSnippet: `// ✅ FIX: Pass 'true' as second parameter to enable autoFlush
PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
out.println("Hello Server"); // Automatically flushed on println()
// OR explicitly:
out.print("Hello Server\\n");
out.flush();`,
    explanation: 'Always enable autoFlush on PrintWriter when working with interactive line-based protocols, or call out.flush() immediately after critical command transmission.'
  },
  {
    id: 'blocking-readline-missing-newline',
    title: '2. readLine() Deadlock due to Missing Newline',
    symptom: 'Server or client hangs on readLine() despite out.print() being called.',
    cause: 'BufferedReader.readLine() continues waiting until it encounters a newline character (\'\\n\' or \'\\r\\n\') or EOF. If the sender uses print() instead of println(), readLine() never unblocks.',
    badSnippet: `// ❌ BUG: print() does NOT append a newline character
out.print("USER_LOGIN_TOKEN");
out.flush(); // Flushed, but readLine() on peer still waits forever!`,
    fixedSnippet: `// ✅ FIX: Always send newline when using readLine()
out.println("USER_LOGIN_TOKEN"); // Appends \\n and triggers autoFlush
// OR:
out.print("USER_LOGIN_TOKEN\\n");
out.flush();`,
    explanation: 'Lines in Java network streams require explicit termination. Pair BufferedReader.readLine() with PrintWriter.println().'
  },
  {
    id: 'address-already-in-use',
    title: '3. java.net.BindException: Address already in use',
    symptom: 'Server fails to start immediately after restart, throwing BindException.',
    cause: 'When a TCP socket closes, it enters TIME_WAIT state (typically 30-120 seconds) to ensure delayed packets clear the network. The OS refuses to bind another socket to the same port during TIME_WAIT.',
    badSnippet: `// ❌ BUG: Direct binding without SO_REUSEADDR
ServerSocket server = new ServerSocket(8080);`,
    fixedSnippet: `// ✅ FIX: Enable SO_REUSEADDR before binding
ServerSocket server = new ServerSocket();
server.setReuseAddress(true); // Allows immediate rebinding in TIME_WAIT
server.bind(new InetSocketAddress(8080));`,
    explanation: 'Always set SO_REUSEADDR on server sockets or kill any lingering background Java processes holding the port (`lsof -i :8080` / `kill -9 <PID>`).'
  },
  {
    id: 'stream-closing-closes-socket',
    title: '4. Stream Close Cascade (Closing Stream Closes Socket)',
    symptom: 'Closing an InputStream or OutputStream throws SocketException: Socket is closed on subsequent socket operations.',
    cause: 'In Java, closing any stream wrapper associated with a socket automatically closes the underlying Socket object!',
    badSnippet: `// ❌ BUG: Closing input stream early closes the entire socket
BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
in.close(); // Underlying socket is now CLOSED!
// The following line throws SocketException!
PrintWriter out = new PrintWriter(socket.getOutputStream(), true);`,
    fixedSnippet: `// ✅ FIX: Use shutdownInput() / shutdownOutput() for half-closes
// Or close everything at the very end when finished
socket.shutdownOutput(); // Sends TCP FIN, but allows socket to still read
// ... read final responses ...
socket.close(); // Clean full close at end`,
    explanation: 'Use socket.shutdownOutput() to signal End-Of-Transmission while keeping the input stream open to receive a final response.'
  },
  {
    id: 'infinite-blocking-timeout',
    title: '5. Infinite Hang on socket.receive() or read()',
    symptom: 'Client application freezes and never returns when peer crashes or network cable drops.',
    cause: 'By default, Java sockets have a timeout of 0 (infinite timeout). If the peer silently disappears without sending FIN or RST, read() or receive() waits forever.',
    badSnippet: `// ❌ BUG: Default timeout is 0 (infinite block)
DatagramSocket udpSocket = new DatagramSocket();
udpSocket.receive(packet); // Blocks forever if packet dropped!`,
    fixedSnippet: `// ✅ FIX: Set socket timeout in milliseconds
socket.setSoTimeout(5000); // 5000ms = 5 seconds
try {
    socket.receive(packet);
} catch (SocketTimeoutException e) {
    System.err.println("Request timed out! Retrying...");
}`,
    explanation: 'Always configure setSoTimeout() on client sockets and UDP datagram sockets to recover gracefully from network partitions.'
  },
  {
    id: 'tcp-stream-framing-delusion',
    title: '6. Assuming TCP Preserves Message Boundaries',
    symptom: 'Sending two small messages in rapid succession causes the receiver to get them concatenated into one, or split across chunks.',
    cause: 'TCP is a STREAM-oriented protocol, not a packet/message protocol. The OS Nagle algorithm combines small writes (packet coalescing) or fragments large buffers.',
    badSnippet: `// ❌ BUG: Assuming 1 write = 1 read on receiver
out.write("MESSAGE1".getBytes());
out.write("MESSAGE2".getBytes());
// Receiver might read "MESSAGE1MESSAGE2" in a single read() call!`,
    fixedSnippet: `// ✅ FIX: Implement explicit application-level framing!
// Option A: Delimiter framing (e.g. newline \\n)
out.println("MESSAGE1");
out.println("MESSAGE2");

// Option B: Length-prefixed framing (DataOutputStream)
DataOutputStream dos = new DataOutputStream(socket.getOutputStream());
dos.writeInt(bytes1.length);
dos.write(bytes1);`,
    explanation: 'Never rely on TCP packet boundaries. Use delimiter-based framing (newlines, null bytes) or length-prefix framing (4-byte integer length header).'
  },
  {
    id: 'thread-explosion',
    title: '7. Unbounded Thread Spawning (Out of Memory)',
    symptom: 'Server crashes with java.lang.OutOfMemoryError: unable to create new native thread under moderate load.',
    cause: 'Spawning new Thread(new Handler(socket)).start() for every connection consumes ~1MB stack memory per thread. 1,000 connections = 1GB just in thread stacks!',
    badSnippet: `// ❌ BUG: Unbounded thread creation
while (true) {
    Socket s = serverSocket.accept();
    new Thread(new Handler(s)).start(); // Crashes JVM at scale!
}`,
    fixedSnippet: `// ✅ FIX: Use bounded thread pool
ExecutorService pool = Executors.newFixedThreadPool(50);
while (true) {
    Socket s = serverSocket.accept();
    pool.execute(new Handler(s)); // Reuses worker threads
}`,
    explanation: 'Always use ExecutorService with a bounded pool (or Java Virtual Threads in modern Java 21+) to prevent resource exhaustion.'
  }
];

export const EXAM_QUIZ_QUESTIONS: StudyQuestion[] = [
  {
    id: 1,
    category: 'Socket API',
    question: 'In Java TCP programming, which method call on the server side blocks execution until a client establishes a connection?',
    options: [
      'serverSocket.bind()',
      'serverSocket.accept()',
      'serverSocket.listen()',
      'socket.connect()'
    ],
    correctIndex: 1,
    explanation: 'serverSocket.accept() is a blocking call that waits for an incoming TCP connection from a client, completes the 3-way handshake, and returns a new Socket object for communication.'
  },
  {
    id: 2,
    category: 'TCP vs UDP',
    question: 'Which of the following classes is used to represent an individual data packet in Java UDP network programming?',
    options: [
      'java.net.Socket',
      'java.net.DatagramPacket',
      'java.net.PacketBuffer',
      'java.net.ServerSocket'
    ],
    correctIndex: 1,
    explanation: 'DatagramPacket encapsulates the raw byte array data, length, destination IP address (InetAddress), and port number for connectionless UDP transmission.'
  },
  {
    id: 3,
    category: 'Streams & Buffers',
    question: 'Why is it critical to pass true as the second argument to new PrintWriter(socket.getOutputStream(), true)?',
    options: [
      'It encrypts the communication with TLS.',
      'It enables auto-flush, flushing the output buffer automatically whenever println(), printf(), or format() is called.',
      'It enables non-blocking asynchronous socket mode.',
      'It converts Unicode strings directly to EBCDIC encoding.'
    ],
    correctIndex: 1,
    explanation: 'Without autoFlush=true, characters remain buffered in memory until the buffer is full. The receiver hangs waiting on readLine(), causing a protocol deadlock.'
  },
  {
    id: 4,
    category: 'Socket API',
    question: 'What does a return value of null from BufferedReader.readLine() signify on a socket input stream?',
    options: [
      'The network cable was unplugged.',
      'A timeout occurred on the socket.',
      'The peer closed their end of the TCP connection (End-Of-File reached).',
      'The client sent an empty string with no characters.'
    ],
    correctIndex: 2,
    explanation: 'readLine() returns null when the stream reaches End-Of-File (EOF), which indicates that the remote peer closed the socket cleanly.'
  },
  {
    id: 5,
    category: 'Concurrency',
    question: 'Why is an iterative (single-threaded) TCP server generally unsuitable for real-world multi-client network applications?',
    options: [
      'Java does not allow ServerSocket in a single thread.',
      'While the server is serving one client in a blocking loop, all other clients cannot connect or are blocked waiting in the OS backlog.',
      'Single-threaded servers cannot use ports above 1024.',
      'TCP requires at least 4 threads per socket by specification.'
    ],
    correctIndex: 1,
    explanation: 'An iterative server handles one client at a time. If that client stays connected, other clients are queued or rejected once the listen backlog is full.'
  },
  {
    id: 6,
    category: 'TCP vs UDP',
    question: 'What happens in UDP if a DatagramPacket sent over the internet is lost or corrupted in transit?',
    options: [
      'Java automatically retransmits the packet after 200ms.',
      'The DatagramSocket throws an IOException on the sender.',
      'The packet is simply discarded; UDP provides no inherent retransmission or acknowledgment.',
      'The router stores the packet in persistent flash memory.'
    ],
    correctIndex: 2,
    explanation: 'UDP is unreliable and connectionless. If retransmission or delivery guarantees are required, they must be implemented at the application layer or by switching to TCP.'
  },
  {
    id: 7,
    category: 'Socket API',
    question: 'Which socket option allows a server application to immediately rebind to a local port that is currently in the TCP TIME_WAIT state?',
    options: [
      'SO_TIMEOUT',
      'SO_REUSEADDR',
      'TCP_NODELAY',
      'SO_KEEPALIVE'
    ],
    correctIndex: 1,
    explanation: 'serverSocket.setReuseAddress(true) enables the SO_REUSEADDR socket option, preventing java.net.BindException when restarting a server immediately.'
  },
  {
    id: 8,
    category: 'Streams & Buffers',
    question: 'What happens if you invoke in.close() on a BufferedReader wrapping a Socket\'s InputStream?',
    options: [
      'Only the stream closes; the underlying Socket remains open for output.',
      'The underlying Socket is also immediately closed.',
      'Java throws an UnsupportedOperationException.',
      'The JVM initiates a garbage collection cycle.'
    ],
    correctIndex: 1,
    explanation: 'Closing any stream wrapper around a socket\'s input or output stream will close the underlying Socket. Use socket.shutdownInput() / shutdownOutput() instead.'
  },
  {
    id: 9,
    category: 'TCP vs UDP',
    question: 'Which of the following port ranges is designated as "Well-Known Ports" reserved for standardized system services (e.g. HTTP 80, SSH 22)?',
    options: [
      '0 to 1023',
      '1024 to 49151',
      '49152 to 65535',
      '8000 to 9000'
    ],
    correctIndex: 0,
    explanation: 'Ports 0–1023 are Well-Known (reserved for system services like HTTP, DNS, SSH, FTP). Ports 1024–49151 are Registered, and 49152–65535 are Dynamic/Ephemeral.'
  },
  {
    id: 10,
    category: 'Concurrency',
    question: 'In Java NIO (Non-blocking I/O), which component is responsible for monitoring multiple channels for I/O events (such as OP_ACCEPT, OP_READ)?',
    options: [
      'ThreadPoolExecutor',
      'Selector',
      'Pipe',
      'DatagramChannel'
    ],
    correctIndex: 1,
    explanation: 'java.nio.channels.Selector multiplexes non-blocking channels using native OS readiness polling (epoll, kqueue, select), allowing a single thread to service thousands of sockets.'
  }
];
