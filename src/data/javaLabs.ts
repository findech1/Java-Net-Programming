import { JavaLab } from '../types/network';

export const JAVA_LABS: JavaLab[] = [
  {
    id: 'tcp-echo',
    title: 'Lab 1: Classic TCP Echo Client-Server',
    category: 'Fundamentals',
    difficulty: 'Beginner',
    protocol: 'TCP',
    description: 'The fundamental entry point for BIT Network Programming: ServerSocket listening on a port, accepting a connection, and using buffered I/O streams to echo messages back to the client.',
    objective: 'Understand the TCP connection lifecycle, ServerSocket.accept(), InputStreamReader, BufferedReader, and PrintWriter auto-flush.',
    serverFileName: 'EchoServer.java',
    serverCode: `import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * EchoServer: Listens on port 5000, accepts an incoming TCP connection,
 * and echoes back any string sent by the client until client sends 'BYE'.
 * 
 * Course: BIT Network Programming - Lab 1
 */
public class EchoServer {
    public static final int PORT = 5000;

    public static void main(String[] args) {
        System.out.println("=== Java TCP Echo Server ===");
        System.out.println("Starting server on port " + PORT + "...");

        // Try-with-resources automatically closes ServerSocket when done
        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            System.out.println("Server is listening on port " + PORT);
            System.out.println("Waiting for a client to connect...");

            // Blocking call: halts execution until a client establishes TCP connection
            try (Socket clientSocket = serverSocket.accept()) {
                String clientAddress = clientSocket.getRemoteSocketAddress().toString();
                System.out.println("Connected to client: " + clientAddress);

                // Set up character stream wrappers around socket byte streams
                BufferedReader in = new BufferedReader(
                    new InputStreamReader(clientSocket.getInputStream())
                );
                // Second parameter 'true' enables auto-flush on println()
                PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);

                // Send a welcome greeting to the connected client
                out.println("SERVER: Connected to EchoServer v1.0. Type 'BYE' to disconnect.");

                String clientMessage;
                // Read lines from client until stream ends (EOF / disconnect)
                while ((clientMessage = in.readLine()) != null) {
                    System.out.println("Received from " + clientAddress + ": " + clientMessage);

                    // Check for termination signal
                    if ("BYE".equalsIgnoreCase(clientMessage.trim())) {
                        out.println("SERVER: Goodbye! Closing connection.");
                        System.out.println("Client initiated disconnect. Exiting session.");
                        break;
                    }

                    // Echo back the uppercase or decorated response
                    String response = "ECHO: " + clientMessage;
                    out.println(response);
                }
            } // clientSocket closes here automatically

            System.out.println("Client disconnected. Server shut down cleanly.");

        } catch (IOException e) {
            System.err.println("Server exception: " + e.getMessage());
            e.printStackTrace();
        }
    }
}`,
    clientFileName: 'EchoClient.java',
    clientCode: `import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.UnknownHostException;

/**
 * EchoClient: Connects to EchoServer at localhost:5000,
 * sends user input from keyboard, and prints server response.
 * 
 * Course: BIT Network Programming - Lab 1
 */
public class EchoClient {
    public static final String SERVER_HOST = "127.0.0.1";
    public static final int SERVER_PORT = 5000;

    public static void main(String[] args) {
        System.out.println("=== Java TCP Echo Client ===");
        System.out.println("Connecting to server at " + SERVER_HOST + ":" + SERVER_PORT + "...");

        try (
            // Establish TCP connection (performs 3-way handshake: SYN -> SYN-ACK -> ACK)
            Socket socket = new Socket(SERVER_HOST, SERVER_PORT);
            // Socket output stream to send data to server
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            // Socket input stream to receive data from server
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            // Standard keyboard input reader
            BufferedReader stdIn = new BufferedReader(new InputStreamReader(System.in))
        ) {
            System.out.println("Successfully connected! Local port: " + socket.getLocalPort());

            // Read welcome message from server
            String welcomeMessage = in.readLine();
            System.out.println(welcomeMessage);

            String userInput;
            System.out.print("> ");
            
            // Loop while user enters commands
            while ((userInput = stdIn.readLine()) != null) {
                // Send text line to server
                out.println(userInput);

                // Receive echoed response from server
                String serverResponse = in.readLine();
                if (serverResponse == null) {
                    System.out.println("Server closed connection unexpectedly.");
                    break;
                }

                System.out.println("< " + serverResponse);

                if ("BYE".equalsIgnoreCase(userInput.trim())) {
                    System.out.println("Disconnected from server.");
                    break;
                }

                System.out.print("> ");
            }

        } catch (UnknownHostException e) {
            System.err.println("Unknown host: " + SERVER_HOST);
        } catch (IOException e) {
            System.err.println("I/O error: " + e.getMessage());
        }
    }
}`,
    keyConcepts: [
      {
        methodOrClass: 'ServerSocket(int port)',
        description: 'Binds a socket to an OS port and listens for incoming TCP client connection requests with an OS backlog queue.'
      },
      {
        methodOrClass: 'serverSocket.accept()',
        description: 'Blocks the calling thread until a client connects. Completes the TCP 3-way handshake and returns a dedicated Socket for client communication.'
      },
      {
        methodOrClass: 'PrintWriter(out, true)',
        description: 'The second boolean argument sets autoFlush to true. Without auto-flush, buffered data stays in memory and the client hangs on readLine().'
      },
      {
        methodOrClass: 'in.readLine() == null',
        description: 'Signals End-Of-File (EOF) on the TCP stream, indicating the peer closed their end of the connection gracefully.'
      }
    ],
    terminalRunInstructions: {
      compile: 'javac EchoServer.java EchoClient.java',
      runServer: 'java EchoServer',
      runClient: 'java EchoClient'
    }
  },
  {
    id: 'tcp-multithreaded',
    title: 'Lab 2: Multi-Threaded Concurrent Server',
    category: 'Concurrency',
    difficulty: 'Intermediate',
    protocol: 'TCP',
    description: 'An iterative server can only serve one client at a time! This lab implements a multi-threaded architecture using Java ExecutorService Thread Pool to handle dozens of concurrent clients simultaneously.',
    objective: 'Master concurrency in network programming, thread per connection vs thread pools, and race conditions.',
    serverFileName: 'MultiThreadedServer.java',
    serverCode: `import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * MultiThreadedServer: Uses an ExecutorService ThreadPool to handle
 * multiple simultaneous client connections concurrently.
 * 
 * Course: BIT Network Programming - Lab 2
 */
public class MultiThreadedServer {
    public static final int PORT = 8080;
    private static final int THREAD_POOL_SIZE = 10;
    // Thread-safe atomic counter for tracking client IDs
    private static final AtomicInteger clientCounter = new AtomicInteger(1);

    public static void main(String[] args) {
        System.out.println("=== Multi-Threaded TCP Server ===");
        System.out.println("Initializing thread pool of size " + THREAD_POOL_SIZE + "...");

        // Create a bounded pool of reusable worker threads
        ExecutorService threadPool = Executors.newFixedThreadPool(THREAD_POOL_SIZE);

        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            System.out.println("Server listening on port " + PORT);

            // Continuously accept connections in an infinite loop
            while (true) {
                // Blocks until any client connects
                Socket clientSocket = serverSocket.accept();
                int clientId = clientCounter.getAndIncrement();

                System.out.println("[Main Thread] Client #" + clientId + " connected from " + 
                                   clientSocket.getRemoteSocketAddress());

                // Dispatch handling to an idle worker thread in the thread pool
                threadPool.execute(new ClientHandler(clientSocket, clientId));
            }

        } catch (IOException e) {
            System.err.println("Server error: " + e.getMessage());
        } finally {
            threadPool.shutdown();
        }
    }

    /**
     * Runnable task executed by a worker thread for a specific client socket
     */
    static class ClientHandler implements Runnable {
        private final Socket socket;
        private final int clientId;

        public ClientHandler(Socket socket, int clientId) {
            this.socket = socket;
            this.clientId = clientId;
        }

        @Override
        public void run() {
            String threadName = Thread.currentThread().getName();
            System.out.println("[" + threadName + "] Serving Client #" + clientId);

            try (
                BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                PrintWriter out = new PrintWriter(socket.getOutputStream(), true)
            ) {
                out.println("SERVER: Welcome Client #" + clientId + "! You are handled by " + threadName);

                String line;
                while ((line = in.readLine()) != null) {
                    System.out.println("[Client #" + clientId + "] says: " + line);

                    if ("QUIT".equalsIgnoreCase(line.trim())) {
                        out.println("SERVER: Connection terminating. Bye!");
                        break;
                    }

                    // Process input (e.g. word count, reversal, upper-casing)
                    String reply = "PROCESSED [Len=" + line.length() + "]: " + line.toUpperCase();
                    out.println(reply);
                }

            } catch (IOException e) {
                System.err.println("Error handling Client #" + clientId + ": " + e.getMessage());
            } finally {
                try {
                    socket.close();
                    System.out.println("[Client #" + clientId + "] Disconnected and socket closed.");
                } catch (IOException e) {
                    // Ignored on close
                }
            }
        }
    }
}`,
    clientFileName: 'WorkerClient.java',
    clientCode: `import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

/**
 * WorkerClient: Tests connecting to the multi-threaded server.
 * Can be run in multiple terminal tabs simultaneously to verify concurrency.
 */
public class WorkerClient {
    public static void main(String[] args) {
        String host = "127.0.0.1";
        int port = 8080;

        try (
            Socket socket = new Socket(host, port);
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            BufferedReader stdIn = new BufferedReader(new InputStreamReader(System.in))
        ) {
            System.out.println("Connected to Multi-Threaded Server on port " + port);
            System.out.println(in.readLine()); // Server banner

            String input;
            System.out.print("Enter text (or QUIT): ");
            while ((input = stdIn.readLine()) != null) {
                out.println(input);
                String response = in.readLine();
                System.out.println("Server response: " + response);

                if ("QUIT".equalsIgnoreCase(input.trim())) {
                    break;
                }
                System.out.print("Enter text (or QUIT): ");
            }

        } catch (Exception e) {
            System.err.println("Client error: " + e.getMessage());
        }
    }
}`,
    keyConcepts: [
      {
        methodOrClass: 'Executors.newFixedThreadPool(int n)',
        description: 'Creates a fixed pool of threads that re-uses a fixed number of threads operating off a shared unbounded queue, preventing resource exhaustion from thread explosion.'
      },
      {
        methodOrClass: 'threadPool.execute(Runnable task)',
        description: 'Submits the client communication task for execution by a worker thread in the background, freeing the main thread to immediately return to serverSocket.accept().'
      },
      {
        methodOrClass: 'AtomicInteger',
        description: 'Provides atomic operations for counters accessed by multiple concurrent client connection threads without explicit synchronized blocks.'
      }
    ],
    terminalRunInstructions: {
      compile: 'javac MultiThreadedServer.java WorkerClient.java',
      runServer: 'java MultiThreadedServer',
      runClient: 'java WorkerClient'
    }
  },
  {
    id: 'tcp-chat-room',
    title: 'Lab 3: Real-Time Multi-User Chat Server',
    category: 'Concurrency',
    difficulty: 'Intermediate',
    protocol: 'TCP',
    description: 'A university favorite: a centralized chat server where multiple clients join with a username, exchange messages, receive live broadcasts from other users, and handle graceful leaving.',
    objective: 'Implement shared state synchronization with thread-safe collections (CopyOnWriteArrayList or Collections.synchronizedSet) and dual-threaded client architecture.',
    serverFileName: 'ChatServer.java',
    serverCode: `import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * ChatServer: Central hub broadcasting incoming messages to all connected clients.
 * Maintains a thread-safe registry of active user sockets.
 * 
 * Course: BIT Network Programming - Lab 3
 */
public class ChatServer {
    public static final int PORT = 7777;

    // Thread-safe map tracking username -> PrintWriter output stream
    private static final Map<String, PrintWriter> activeClients = new ConcurrentHashMap<>();

    public static void main(String[] args) {
        System.out.println("=== Java Multi-User Chat Server ===");
        System.out.println("Listening on port " + PORT + "...");

        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            while (true) {
                Socket clientSocket = serverSocket.accept();
                // Spawn a new thread for each client
                new Thread(new ClientSession(clientSocket)).start();
            }
        } catch (IOException e) {
            System.err.println("Server exception: " + e.getMessage());
        }
    }

    /**
     * Broadcasts a message to all connected clients
     */
    public static void broadcast(String message, String senderUsername) {
        System.out.println("[BROADCAST] " + message);
        for (Map.Entry<String, PrintWriter> entry : activeClients.entrySet()) {
            // Send to everyone (or conditionally skip sender if senderUsername matches)
            entry.getValue().println(message);
        }
    }

    static class ClientSession implements Runnable {
        private final Socket socket;
        private String username;
        private PrintWriter out;
        private BufferedReader in;

        public ClientSession(Socket socket) {
            this.socket = socket;
        }

        @Override
        public void run() {
            try {
                in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                out = new PrintWriter(socket.getOutputStream(), true);

                // Protocol handshake: request a unique username
                out.println("PROTOCOL_REQ_USERNAME: Enter your chat username:");
                while (true) {
                    username = in.readLine();
                    if (username == null) return;
                    username = username.trim();

                    if (!username.isEmpty() && !activeClients.containsKey(username)) {
                        activeClients.put(username, out);
                        out.println("PROTOCOL_JOIN_OK: Welcome to the BIT Chat Room, " + username + "!");
                        broadcast(">>> [SYSTEM] " + username + " has joined the room. (Total: " + activeClients.size() + ")", username);
                        break;
                    } else {
                        out.println("PROTOCOL_ERR: Username taken or invalid. Try another:");
                    }
                }

                // Main message loop
                String message;
                while ((message = in.readLine()) != null) {
                    if ("/quit".equalsIgnoreCase(message.trim())) {
                        break;
                    } else if ("/users".equalsIgnoreCase(message.trim())) {
                        out.println(">>> Online users: " + String.join(", ", activeClients.keySet()));
                    } else {
                        broadcast("[" + username + "]: " + message, username);
                    }
                }

            } catch (IOException e) {
                System.out.println("Connection dropped for " + username);
            } finally {
                // Client cleanup
                if (username != null && activeClients.containsKey(username)) {
                    activeClients.remove(username);
                    broadcast("<<< [SYSTEM] " + username + " has left the room.", username);
                }
                try {
                    socket.close();
                } catch (IOException e) {
                    // Socket cleanup
                }
            }
        }
    }
}`,
    clientFileName: 'ChatClient.java',
    clientCode: `import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

/**
 * ChatClient: Runs TWO concurrent threads:
 * Thread 1: Listens for incoming server broadcast messages in background.
 * Thread 2 (Main): Reads user typing from keyboard and sends to server.
 * 
 * Course: BIT Network Programming - Lab 3
 */
public class ChatClient {
    public static void main(String[] args) {
        String host = "127.0.0.1";
        int port = 7777;

        try {
            Socket socket = new Socket(host, port);
            System.out.println("Connected to Chat Server at " + host + ":" + port);

            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            BufferedReader stdIn = new BufferedReader(new InputStreamReader(System.in));

            // Background thread to continuously listen for broadcasts from the server
            Thread listenerThread = new Thread(() -> {
                try {
                    String serverMsg;
                    while ((serverMsg = in.readLine()) != null) {
                        System.out.println(serverMsg);
                    }
                } catch (IOException e) {
                    System.out.println("Connection to server closed.");
                }
            });
            listenerThread.setDaemon(true);
            listenerThread.start();

            // Main thread: reads user console and sends out messages
            String userInput;
            while ((userInput = stdIn.readLine()) != null) {
                out.println(userInput);
                if ("/quit".equalsIgnoreCase(userInput.trim())) {
                    break;
                }
            }

            socket.close();
            System.out.println("Chat session ended.");

        } catch (IOException e) {
            System.err.println("Chat client error: " + e.getMessage());
        }
    }
}`,
    keyConcepts: [
      {
        methodOrClass: 'ConcurrentHashMap<K, V>',
        description: 'Thread-safe map implementation allowing concurrent reads and safe synchronized writes without throwing ConcurrentModificationException during broadcast iterations.'
      },
      {
        methodOrClass: 'listenerThread.setDaemon(true)',
        description: 'Marks background network listening thread as a daemon thread so the JVM can exit cleanly when the user terminates the main console thread.'
      },
      {
        methodOrClass: 'Two-Thread Client Architecture',
        description: 'Crucial BIT concept: a single-threaded client would freeze waiting for user input and never receive incoming server messages in real-time!'
      }
    ],
    terminalRunInstructions: {
      compile: 'javac ChatServer.java ChatClient.java',
      runServer: 'java ChatServer',
      runClient: 'java ChatClient'
    }
  },
  {
    id: 'udp-datagram',
    title: 'Lab 4: UDP Datagram Client-Server',
    category: 'Protocols',
    difficulty: 'Intermediate',
    protocol: 'UDP',
    description: 'Connectionless network programming using UDP (User Datagram Protocol). Learn DatagramSocket, DatagramPacket, byte array buffers, packet addresses, and handling timeouts on unreliable networks.',
    objective: 'Contrast connection-oriented TCP streams with discrete UDP datagram packets; implement socket timeout via setSoTimeout().',
    serverFileName: 'UDPEchoServer.java',
    serverCode: `import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;

/**
 * UDPEchoServer: Connectionless UDP server listening on port 9876.
 * Receives independent DatagramPackets, extracts payload and sender IP/port,
 * and echoes back a response datagram.
 * 
 * Course: BIT Network Programming - Lab 4
 */
public class UDPEchoServer {
    public static final int PORT = 9876;
    public static final int BUFFER_SIZE = 1024;

    public static void main(String[] args) {
        System.out.println("=== Java UDP Datagram Echo Server ===");

        // Create a DatagramSocket bound to port 9876
        try (DatagramSocket socket = new DatagramSocket(PORT)) {
            System.out.println("UDP Server listening on UDP port " + PORT + " (no handshake required)...");

            byte[] receiveBuffer = new byte[BUFFER_SIZE];

            while (true) {
                // Prepare an empty packet container to receive data
                DatagramPacket receivePacket = new DatagramPacket(receiveBuffer, receiveBuffer.length);

                // Blocking call: waits for an incoming UDP datagram packet
                socket.receive(receivePacket);

                String receivedText = new String(
                    receivePacket.getData(), 
                    0, 
                    receivePacket.getLength()
                ).trim();

                InetAddress clientAddress = receivePacket.getAddress();
                int clientPort = receivePacket.getPort();

                System.out.println("Received " + receivePacket.getLength() + " bytes from " + 
                                   clientAddress.getHostAddress() + ":" + clientPort + " -> '" + receivedText + "'");

                // Prepare reply payload
                String replyText = "UDP-REPLY: " + receivedText.toUpperCase();
                byte[] sendBuffer = replyText.getBytes();

                // Build reply packet addressing the exact sender IP and port
                DatagramPacket sendPacket = new DatagramPacket(
                    sendBuffer,
                    sendBuffer.length,
                    clientAddress,
                    clientPort
                );

                // Send the reply datagram packet
                socket.send(sendPacket);
                System.out.println("Sent reply datagram back to client.");
            }

        } catch (IOException e) {
            System.err.println("UDP Server error: " + e.getMessage());
        }
    }
}`,
    clientFileName: 'UDPEchoClient.java',
    clientCode: `import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketTimeoutException;

/**
 * UDPEchoClient: Sends discrete datagrams to UDPEchoServer.
 * Sets a socket timeout to guard against lost UDP packets.
 * 
 * Course: BIT Network Programming - Lab 4
 */
public class UDPEchoClient {
    public static final String SERVER_HOST = "localhost";
    public static final int SERVER_PORT = 9876;
    public static final int TIMEOUT_MS = 3000;

    public static void main(String[] args) {
        System.out.println("=== Java UDP Datagram Client ===");

        // Create socket on an available ephemeral port
        try (DatagramSocket socket = new DatagramSocket()) {
            // Set 3-second timeout for receive() calls (crucial for UDP reliability)
            socket.setSoTimeout(TIMEOUT_MS);

            InetAddress serverAddress = InetAddress.getByName(SERVER_HOST);
            BufferedReader stdIn = new BufferedReader(new InputStreamReader(System.in));

            System.out.println("Ready to send datagrams. Enter message (or 'exit'):");

            String input;
            while (true) {
                System.out.print("> ");
                input = stdIn.readLine();
                if (input == null || "exit".equalsIgnoreCase(input.trim())) {
                    break;
                }

                byte[] sendData = input.getBytes();
                DatagramPacket sendPacket = new DatagramPacket(
                    sendData,
                    sendData.length,
                    serverAddress,
                    SERVER_PORT
                );

                // Transmit datagram packet
                socket.send(sendPacket);
                System.out.println("Datagram sent (" + sendData.length + " bytes). Waiting for reply...");

                try {
                    byte[] receiveData = new byte[1024];
                    DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);

                    // Wait for reply packet or timeout
                    socket.receive(receivePacket);

                    String response = new String(receivePacket.getData(), 0, receivePacket.getLength());
                    System.out.println("< " + response);

                } catch (SocketTimeoutException e) {
                    System.err.println("Warning: Socket timed out! UDP packet may have been dropped or server is down.");
                }
            }

            System.out.println("UDP Client closed.");

        } catch (Exception e) {
            System.err.println("UDP Client error: " + e.getMessage());
        }
    }
}`,
    keyConcepts: [
      {
        methodOrClass: 'DatagramSocket()',
        description: 'A socket for sending and receiving datagram packets over UDP. Does not establish or maintain a persistent connection.'
      },
      {
        methodOrClass: 'DatagramPacket(byte[] buf, int len, InetAddress addr, int port)',
        description: 'Represents a self-contained network packet with its own destination IP and port included in every single packet.'
      },
      {
        methodOrClass: 'socket.setSoTimeout(int timeout)',
        description: 'Prevents infinite blocking on socket.receive(). If no datagram arrives within timeout ms, a SocketTimeoutException is raised.'
      }
    ],
    terminalRunInstructions: {
      compile: 'javac UDPEchoServer.java UDPEchoClient.java',
      runServer: 'java UDPEchoServer',
      runClient: 'java UDPEchoClient'
    }
  },
  {
    id: 'student-records',
    title: 'Lab 5: University Student Records Query Server (BIT Coursework Model)',
    category: 'Protocols',
    difficulty: 'Intermediate',
    protocol: 'TCP',
    description: 'Realistic BIT university assignment: Design and implement a client-server query protocol for querying student academic records, GPA, degree program, and tuition clearance.',
    objective: 'Implement custom application-layer protocols, command parsing, record lookups, and structured response codes (200 OK, 404 NOT_FOUND, 400 BAD_REQUEST).',
    serverFileName: 'StudentRecordsServer.java',
    serverCode: `import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.HashMap;
import java.util.Map;

/**
 * StudentRecordsServer: Implements an Application-Layer Protocol for
 * querying university student database records.
 * 
 * Protocol specification:
 * Client Request:  GET_STUDENT <STUDENT_ID>
 * Server Response: 200_OK|<NAME>|<DEGREE>|<GPA>|<STATUS>
 * or               404_NOT_FOUND|Record does not exist
 * 
 * Course: BIT Network Programming - Coursework Model
 */
public class StudentRecordsServer {
    public static final int PORT = 6543;

    // In-memory student record representation
    record Student(String id, String name, String program, double gpa, String financialStatus) {}

    private static final Map<String, Student> database = new HashMap<>();

    static {
        database.put("BIT-2024-001", new Student("BIT-2024-001", "Alex Chen", "Bachelor of Information Tech", 3.85, "CLEARED"));
        database.put("BIT-2024-042", new Student("BIT-2024-042", "Sarah Jenkins", "Bachelor of Information Tech", 3.92, "CLEARED"));
        database.put("BIT-2024-108", new Student("BIT-2024-108", "David O'Connor", "BSc Computer Networks", 3.40, "PENDING_FEE"));
        database.put("BIT-2024-215", new Student("BIT-2024-215", "Fatima Al-Mansoor", "BSc Cybersecurity", 3.96, "CLEARED"));
    }

    public static void main(String[] args) {
        System.out.println("=== BIT Student Records Server ===");
        System.out.println("Database loaded with " + database.size() + " student records.");

        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            System.out.println("Listening on port " + PORT + "...");

            while (true) {
                Socket socket = serverSocket.accept();
                new Thread(() -> handleClient(socket)).start();
            }

        } catch (IOException e) {
            System.err.println("Server exception: " + e.getMessage());
        }
    }

    private static void handleClient(Socket socket) {
        try (
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true)
        ) {
            out.println("PROTOCOL_READY: BIT University Database v2.1. Commands: GET_STUDENT <ID>, LIST_IDS, EXIT");

            String line;
            while ((line = in.readLine()) != null) {
                line = line.trim();
                System.out.println("[QUERY] " + line);

                if ("EXIT".equalsIgnoreCase(line)) {
                    out.println("200_BYE: Session ended.");
                    break;
                } else if ("LIST_IDS".equalsIgnoreCase(line)) {
                    out.println("200_OK|" + String.join(",", database.keySet()));
                } else if (line.toUpperCase().startsWith("GET_STUDENT ")) {
                    String studentId = line.substring("GET_STUDENT ".length()).trim().toUpperCase();
                    Student student = database.get(studentId);

                    if (student != null) {
                        out.println("200_OK|" + student.id() + "|" + student.name() + "|" + 
                                    student.program() + "|GPA:" + student.gpa() + "|" + student.financialStatus());
                    } else {
                        out.println("404_NOT_FOUND|No student record found with ID " + studentId);
                    }
                } else {
                    out.println("400_BAD_SYNTAX|Unrecognized command. Usage: GET_STUDENT <ID> or LIST_IDS");
                }
            }

        } catch (IOException e) {
            System.err.println("Client handler error: " + e.getMessage());
        } finally {
            try {
                socket.close();
            } catch (IOException ignored) {}
        }
    }
}`,
    clientFileName: 'StudentRecordsClient.java',
    clientCode: `import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

/**
 * StudentRecordsClient: Interactive console client that queries
 * the BIT Student Records Database server and formats the responses.
 */
public class StudentRecordsClient {
    public static void main(String[] args) {
        String host = "127.0.0.1";
        int port = 6543;

        try (
            Socket socket = new Socket(host, port);
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            BufferedReader stdIn = new BufferedReader(new InputStreamReader(System.in))
        ) {
            System.out.println("Connected to Student Records Server.");
            System.out.println(in.readLine()); // Server banner

            String userInput;
            System.out.print("query> ");
            while ((userInput = stdIn.readLine()) != null) {
                out.println(userInput);

                String response = in.readLine();
                if (response == null) break;

                // Pretty format server protocol response
                if (response.startsWith("200_OK|")) {
                    String[] parts = response.split("\\\\|");
                    if (parts.length >= 6) {
                        System.out.println("----------------------------------------------");
                        System.out.println("Student ID : " + parts[1]);
                        System.out.println("Full Name  : " + parts[2]);
                        System.out.println("Program    : " + parts[3]);
                        System.out.println("Academic   : " + parts[4]);
                        System.out.println("Financial  : " + parts[5]);
                        System.out.println("----------------------------------------------");
                    } else {
                        System.out.println("Server: " + response);
                    }
                } else {
                    System.out.println("Server: " + response);
                }

                if ("EXIT".equalsIgnoreCase(userInput.trim())) break;
                System.out.print("query> ");
            }

        } catch (Exception e) {
            System.err.println("Client query error: " + e.getMessage());
        }
    }
}`,
    keyConcepts: [
      {
        methodOrClass: 'Application Layer Protocol Design',
        description: 'Designing custom request-response framing with verbs (GET_STUDENT, LIST_IDS), status codes (200, 404, 400), and delimiter-separated values (|).'
      },
      {
        methodOrClass: 'Socket Stream Parsing',
        description: 'Splitting tokens safely on the server side and validating user input against injection or malformed payload crashes.'
      }
    ],
    terminalRunInstructions: {
      compile: 'javac StudentRecordsServer.java StudentRecordsClient.java',
      runServer: 'java StudentRecordsServer',
      runClient: 'java StudentRecordsClient'
    }
  },
  {
    id: 'mini-http-server',
    title: 'Lab 6: Mini HTTP/1.1 Web Server in Pure Java',
    category: 'Protocols',
    difficulty: 'Intermediate',
    protocol: 'TCP',
    description: 'Learn how the World Wide Web works at the socket layer! Build a genuine HTTP/1.1 web server from scratch using ServerSocket. Handles GET requests, parses HTTP headers, and responds with valid HTTP status codes and HTML/JSON payloads.',
    objective: 'Understand RFC HTTP specification, request line parsing (GET /path HTTP/1.1), Content-Length, Content-Type, and raw TCP streaming to web browsers.',
    serverFileName: 'MiniHttpServer.java',
    serverCode: `import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/**
 * MiniHttpServer: A lightweight, standards-compliant HTTP/1.1 Web Server
 * implemented directly on raw Java TCP Sockets.
 * 
 * Point any browser to http://localhost:8000/ to view!
 * 
 * Course: BIT Network Programming - Lab 6
 */
public class MiniHttpServer {
    public static final int PORT = 8000;

    public static void main(String[] args) {
        System.out.println("=== Pure Java HTTP/1.1 Server ===");
        System.out.println("Point your web browser to http://127.0.0.1:" + PORT);

        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            while (true) {
                Socket clientSocket = serverSocket.accept();
                new Thread(() -> handleHttpRequest(clientSocket)).start();
            }
        } catch (IOException e) {
            System.err.println("HTTP Server error: " + e.getMessage());
        }
    }

    private static void handleHttpRequest(Socket socket) {
        try (
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            OutputStream rawOut = socket.getOutputStream()
        ) {
            // Read HTTP Request line: e.g. "GET /index.html HTTP/1.1"
            String requestLine = in.readLine();
            if (requestLine == null || requestLine.isEmpty()) return;

            System.out.println("[HTTP Request] " + requestLine);
            String[] tokens = requestLine.split(" ");
            String method = tokens.length > 0 ? tokens[0] : "";
            String path = tokens.length > 1 ? tokens[1] : "/";

            // Consume incoming request headers until empty blank line
            String headerLine;
            while ((headerLine = in.readLine()) != null && !headerLine.isEmpty()) {
                // Header parsing: Host, User-Agent, etc.
            }

            // Route request
            String htmlContent;
            int statusCode = 200;
            String statusText = "OK";

            if ("/".equals(path) || "/index.html".equals(path)) {
                htmlContent = "<!DOCTYPE html>\\n" +
                    "<html>\\n" +
                    "<head><title>BIT Java Web Server</title></head>\\n" +
                    "<body style=\\"font-family: sans-serif; padding: 40px; background: #0f172a; color: #f8fafc;\\">\\n" +
                    "    <h1>BIT Network Programming Lab</h1>\\n" +
                    "    <p>This page was served by a raw Java ServerSocket implementation!</p>\\n" +
                    "    <div style=\\"background: #1e293b; padding: 20px; border-radius: 8px;\\">\\n" +
                    "        <p><strong>Method:</strong> " + method + "</p>\\n" +
                    "        <p><strong>Path:</strong> " + path + "</p>\\n" +
                    "        <p><strong>Server Time:</strong> " + ZonedDateTime.now().format(DateTimeFormatter.RFC_1123_DATE_TIME) + "</p>\\n" +
                    "    </div>\\n" +
                    "</body>\\n" +
                    "</html>\\n";
            } else if ("/api/status".equals(path)) {
                htmlContent = "{\"status\":\"healthy\",\"course\":\"BIT-Network-Programming\",\"port\":" + PORT + "}";
            } else {
                statusCode = 404;
                statusText = "Not Found";
                htmlContent = "<h1>404 Not Found</h1><p>Resource " + path + " does not exist on this Java server.</p>";
            }

            byte[] bodyBytes = htmlContent.getBytes(StandardCharsets.UTF_8);

            // Construct HTTP/1.1 Response Headers
            StringBuilder headers = new StringBuilder();
            headers.append("HTTP/1.1 ").append(statusCode).append(" ").append(statusText).append("\r\n");
            headers.append("Date: ").append(DateTimeFormatter.RFC_1123_DATE_TIME.format(ZonedDateTime.now())).append("\r\n");
            headers.append("Server: JavaMiniHttp/1.0\r\n");
            headers.append("Content-Type: ").append(path.startsWith("/api") ? "application/json" : "text/html; charset=UTF-8").append("\r\n");
            headers.append("Content-Length: ").append(bodyBytes.length).append("\r\n");
            headers.append("Connection: close\r\n");
            headers.append("\r\n"); // Blank line separates HTTP headers from body payload

            // Transmit headers and body over TCP stream
            rawOut.write(headers.toString().getBytes(StandardCharsets.US_ASCII));
            rawOut.write(bodyBytes);
            rawOut.flush();

        } catch (IOException e) {
            System.err.println("HTTP handling error: " + e.getMessage());
        } finally {
            try {
                socket.close();
            } catch (IOException ignored) {}
        }
    }
}`,
    clientFileName: 'HttpClientTest.java',
    clientCode: `import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

/**
 * HttpClientTest: Sends a raw HTTP GET request to MiniHttpServer
 * and prints the raw HTTP response headers and body.
 */
public class HttpClientTest {
    public static void main(String[] args) {
        String host = "127.0.0.1";
        int port = 8000;

        try (
            Socket socket = new Socket(host, port);
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))
        ) {
            // Write HTTP/1.1 Request
            out.println("GET / HTTP/1.1");
            out.println("Host: " + host + ":" + port);
            out.println("User-Agent: JavaRawSocketClient/1.0");
            out.println("Connection: close");
            out.println(); // Blank line signals end of headers

            // Read response
            String line;
            System.out.println("=== Server Response ===");
            while ((line = in.readLine()) != null) {
                System.out.println(line);
            }

        } catch (Exception e) {
            System.err.println("HTTP test client error: " + e.getMessage());
        }
    }
}`,
    keyConcepts: [
      {
        methodOrClass: 'HTTP Request Line Parsing',
        description: 'HTTP 1.1 requires METHOD URI VERSION followed by key-value headers terminated by CRLF (\\r\\n) and a blank line before the optional payload.'
      },
      {
        methodOrClass: 'Content-Length & Raw Byte Streaming',
        description: 'Crucial for binary & UTF-8 integrity: Content-Length must reflect the byte count of the UTF-8 payload, not string character length.'
      }
    ],
    terminalRunInstructions: {
      compile: 'javac MiniHttpServer.java HttpClientTest.java',
      runServer: 'java MiniHttpServer',
      runClient: 'java HttpClientTest'
    }
  },
  {
    id: 'java-nio',
    title: 'Lab 7: Java Non-blocking I/O (NIO) with Selector',
    category: 'Advanced I/O',
    difficulty: 'Advanced',
    protocol: 'TCP',
    description: 'High-performance network programming in Java without threads per client! Uses java.nio channels, Selector multiplexing, and ByteBuffers to service thousands of concurrent sockets on a single thread.',
    objective: 'Master java.nio.channels.Selector, ServerSocketChannel, SocketChannel, and ByteBuffer flip/compact operations.',
    serverFileName: 'NioEchoServer.java',
    serverCode: `import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;
import java.util.Set;

/**
 * NioEchoServer: Single-threaded event-driven non-blocking TCP server.
 * Uses Selector multiplexing to handle multiple concurrent clients.
 * 
 * Course: BIT Network Programming - Lab 7 (Advanced NIO)
 */
public class NioEchoServer {
    public static final int PORT = 9000;
    private static final int BUFFER_CAPACITY = 256;

    public static void main(String[] args) {
        System.out.println("=== Java NIO Selector Non-Blocking Server ===");

        try (
            Selector selector = Selector.open();
            ServerSocketChannel serverChannel = ServerSocketChannel.open()
        ) {
            // Configure server channel to NON-BLOCKING mode
            serverChannel.configureBlocking(false);
            serverChannel.bind(new InetSocketAddress(PORT));

            // Register server channel with selector to listen for incoming connections
            serverChannel.register(selector, SelectionKey.OP_ACCEPT);
            System.out.println("NIO Server listening on port " + PORT + " using event multiplexing...");

            ByteBuffer buffer = ByteBuffer.allocate(BUFFER_CAPACITY);

            // Single-threaded event loop
            while (true) {
                // Blocks until at least one registered channel has an I/O event ready
                selector.select();

                Set<SelectionKey> selectedKeys = selector.selectedKeys();
                Iterator<SelectionKey> keyIterator = selectedKeys.iterator();

                while (keyIterator.hasNext()) {
                    SelectionKey key = keyIterator.next();
                    keyIterator.remove(); // Remove key so it isn't processed twice

                    if (!key.isValid()) continue;

                    // Event 1: New incoming client connection
                    if (key.isAcceptable()) {
                        ServerSocketChannel srv = (ServerSocketChannel) key.channel();
                        SocketChannel client = srv.accept();
                        if (client != null) {
                            client.configureBlocking(false);
                            // Register client channel with selector for READ readiness
                            client.register(selector, SelectionKey.OP_READ);
                            System.out.println("NIO Accepted client: " + client.getRemoteAddress());
                        }
                    } 
                    // Event 2: Client data ready to be read
                    else if (key.isReadable()) {
                        SocketChannel client = (SocketChannel) key.channel();
                        buffer.clear();
                        int bytesRead = client.read(buffer);

                        if (bytesRead == -1) { // Client disconnected
                            System.out.println("NIO Client closed connection: " + client.getRemoteAddress());
                            client.close();
                            key.cancel();
                            continue;
                        }

                        // Flip buffer from write mode to read mode
                        buffer.flip();
                        // Echo data directly back to client channel
                        client.write(buffer);
                    }
                }
            }

        } catch (IOException e) {
            System.err.println("NIO Server exception: " + e.getMessage());
        }
    }
}`,
    clientFileName: 'NioTestClient.java',
    clientCode: `import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;

/**
 * NioTestClient: Connects using SocketChannel and verifies non-blocking echo.
 */
public class NioTestClient {
    public static void main(String[] args) {
        try (SocketChannel channel = SocketChannel.open(new InetSocketAddress("127.0.0.1", 9000))) {
            System.out.println("Connected to NIO Server!");

            String message = "Hello from NIO Client!";
            ByteBuffer buffer = ByteBuffer.wrap(message.getBytes());
            channel.write(buffer);

            buffer.clear();
            int bytesRead = channel.read(buffer);
            buffer.flip();

            byte[] responseBytes = new byte[bytesRead];
            buffer.get(responseBytes);
            System.out.println("Echo reply: " + new String(responseBytes));

        } catch (Exception e) {
            System.err.println("NIO Client error: " + e.getMessage());
        }
    }
}`,
    keyConcepts: [
      {
        methodOrClass: 'Selector.open() & selector.select()',
        description: 'Multiplexes I/O across hundreds of channels using OS-level polling (epoll on Linux, kqueue on macOS, I/O Completion Ports on Windows) on a single thread.'
      },
      {
        methodOrClass: 'channel.configureBlocking(false)',
        description: 'Switches the channel from blocking mode to non-blocking mode. Necessary before registering with a Selector.'
      },
      {
        methodOrClass: 'ByteBuffer.flip()',
        description: 'Flips buffer from writing mode (filling from socket) to reading mode (draining to socket or array) by setting limit = position and position = 0.'
      }
    ],
    terminalRunInstructions: {
      compile: 'javac NioEchoServer.java NioTestClient.java',
      runServer: 'java NioEchoServer',
      runClient: 'java NioTestClient'
    }
  }
];
