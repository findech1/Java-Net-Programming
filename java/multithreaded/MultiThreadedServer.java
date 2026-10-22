/**
 * Java Network Programming Coursework - BIT Curriculum
 * Lab 2: Multi-Threaded TCP Server using ExecutorService ThreadPool
 * 
 * Compilation: javac MultiThreadedServer.java
 * Execution:   java MultiThreadedServer
 */

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

public class MultiThreadedServer {
    public static final int PORT = 8080;
    public static final int MAX_WORKER_THREADS = 10;
    private static final AtomicInteger clientCounter = new AtomicInteger(1);

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("   BIT Network Programming - Multi-Threaded Server");
        System.out.println("==================================================");
        System.out.println("[INFO] Creating ExecutorService pool with " + MAX_WORKER_THREADS + " worker threads...");

        ExecutorService threadPool = Executors.newFixedThreadPool(MAX_WORKER_THREADS);

        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            System.out.println("[INFO] Server listening on port " + PORT);
            System.out.println("[INFO] Ready to accept simultaneous client connections.");

            while (true) {
                // Blocks until any client connects
                Socket clientSocket = serverSocket.accept();
                int clientId = clientCounter.getAndIncrement();

                System.out.println("[ACCEPT] New connection! Client #" + clientId + 
                                   " from " + clientSocket.getRemoteSocketAddress());

                // Hand off client socket to thread pool worker
                threadPool.execute(new ClientHandler(clientSocket, clientId));
            }

        } catch (IOException e) {
            System.err.println("[ERROR] Server socket exception: " + e.getMessage());
        } finally {
            threadPool.shutdown();
        }
    }

    /**
     * Runnable task handling communication for a single client
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
                // Send welcome handshake
                out.println("SERVER: Connected to Multi-Threaded Server. Client ID: " + clientId + 
                            " (Handled by thread: " + threadName + ")");

                String inputLine;
                while ((inputLine = in.readLine()) != null) {
                    System.out.println("[Client #" + clientId + " (" + threadName + ")]: " + inputLine);

                    if ("QUIT".equalsIgnoreCase(inputLine.trim())) {
                        out.println("SERVER: Disconnecting. Goodbye!");
                        break;
                    }

                    // Process request (e.g. string manipulation / calculation)
                    String response = "[Client #" + clientId + " PROCESSED]: Length=" + 
                                      inputLine.length() + " | Upper=" + inputLine.toUpperCase();
                    out.println(response);
                }

            } catch (IOException e) {
                System.err.println("[ERROR] Exception on Client #" + clientId + ": " + e.getMessage());
            } finally {
                try {
                    socket.close();
                    System.out.println("[DISCONNECT] Client #" + clientId + " disconnected and socket closed.");
                } catch (IOException ignored) {}
            }
        }
    }
}
