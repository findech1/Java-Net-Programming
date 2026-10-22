/**
 * Java Network Programming Coursework - BIT Curriculum
 * Lab 3: Multi-User Chat Server with Thread-Safe Broadcasts
 * 
 * Compilation: javac ChatServer.java
 * Execution:   java ChatServer
 */

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ChatServer {
    public static final int PORT = 7777;

    // Concurrent thread-safe map storing username -> PrintWriter stream
    private static final Map<String, PrintWriter> connectedUsers = new ConcurrentHashMap<>();

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("     BIT Network Programming - Group Chat Server  ");
        System.out.println("==================================================");
        System.out.println("[INFO] Server listening on port " + PORT + "...");

        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            while (true) {
                Socket clientSocket = serverSocket.accept();
                System.out.println("[CONNECT] Raw socket from " + clientSocket.getRemoteSocketAddress());
                new Thread(new ClientSession(clientSocket)).start();
            }
        } catch (IOException e) {
            System.err.println("[ERROR] Server error: " + e.getMessage());
        }
    }

    /**
     * Broadcasts a message to all active chat clients
     */
    public static void broadcast(String message) {
        System.out.println("[BROADCAST] " + message);
        for (PrintWriter writer : connectedUsers.values()) {
            writer.println(message);
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

                // Handshake protocol: request username
                out.println("AUTH_REQUIRED: Please enter your chat username:");

                while (true) {
                    username = in.readLine();
                    if (username == null) return;
                    username = username.trim();

                    if (!username.isEmpty() && !connectedUsers.containsKey(username)) {
                        connectedUsers.put(username, out);
                        out.println("AUTH_SUCCESS: Welcome, " + username + "! Commands: /users, /quit");
                        broadcast(">>> [SYSTEM] " + username + " joined the chat. (" + connectedUsers.size() + " online)");
                        break;
                    } else {
                        out.println("AUTH_FAIL: Username is already taken or empty. Try again:");
                    }
                }

                // Chat message loop
                String line;
                while ((line = in.readLine()) != null) {
                    line = line.trim();

                    if ("/quit".equalsIgnoreCase(line)) {
                        out.println(">>> Leaving chat session.");
                        break;
                    } else if ("/users".equalsIgnoreCase(line)) {
                        out.println(">>> Online users (" + connectedUsers.size() + "): " + 
                                    String.join(", ", connectedUsers.keySet()));
                    } else if (!line.isEmpty()) {
                        broadcast("[" + username + "]: " + line);
                    }
                }

            } catch (IOException e) {
                System.out.println("[INFO] Connection dropped for user: " + username);
            } finally {
                if (username != null && connectedUsers.containsKey(username)) {
                    connectedUsers.remove(username);
                    broadcast("<<< [SYSTEM] " + username + " has left the chat. (" + connectedUsers.size() + " online)");
                }
                try {
                    socket.close();
                } catch (IOException ignored) {}
            }
        }
    }
}
