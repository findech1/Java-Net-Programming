/**
 * Java Network Programming Coursework - BIT Curriculum
 * Lab 3: Multi-User Chat Client with Dual-Thread Architecture
 * 
 * Thread 1 (Background): Reads incoming broadcast messages from server.
 * Thread 2 (Main Thread): Reads user input from keyboard and writes to socket.
 * 
 * Compilation: javac ChatClient.java
 * Execution:   java ChatClient [optional_host] [optional_port]
 */

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class ChatClient {
    public static final String DEFAULT_HOST = "127.0.0.1";
    public static final int DEFAULT_PORT = 7777;

    public static void main(String[] args) {
        String host = (args.length > 0) ? args[0] : DEFAULT_HOST;
        int port = (args.length > 1) ? Integer.parseInt(args[1]) : DEFAULT_PORT;

        System.out.println("==================================================");
        System.out.println("     BIT Network Programming - Group Chat Client  ");
        System.out.println("==================================================");
        System.out.println("[INFO] Connecting to chat server at " + host + ":" + port + "...");

        try {
            Socket socket = new Socket(host, port);
            System.out.println("[SUCCESS] Connected to chat server! (Local port: " + socket.getLocalPort() + ")");

            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            BufferedReader stdIn = new BufferedReader(new InputStreamReader(System.in));

            // Background thread to listen for server broadcasts
            Thread listenerThread = new Thread(() -> {
                try {
                    String serverMessage;
                    while ((serverMessage = in.readLine()) != null) {
                        System.out.println(serverMessage);
                    }
                } catch (IOException e) {
                    System.out.println("[INFO] Server connection closed.");
                }
            });
            listenerThread.setDaemon(true);
            listenerThread.start();

            // Main console reading loop
            String userInput;
            while ((userInput = stdIn.readLine()) != null) {
                out.println(userInput);
                if ("/quit".equalsIgnoreCase(userInput.trim())) {
                    break;
                }
            }

            socket.close();
            System.out.println("[INFO] Disconnected from chat room.");

        } catch (IOException e) {
            System.err.println("[ERROR] Chat client failed: " + e.getMessage());
        }
    }
}
