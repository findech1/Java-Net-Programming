/**
 * Java Network Programming Coursework - BIT Curriculum
 * Lab 1: Classic Single-Client TCP Echo Server
 * 
 * Compilation: javac EchoServer.java
 * Execution:   java EchoServer
 */

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

public class EchoServer {
    public static final int PORT = 5000;

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("      BIT Network Programming - TCP Echo Server   ");
        System.out.println("==================================================");
        System.out.println("[INFO] Initializing ServerSocket on port " + PORT + "...");

        // Try-with-resources ensures ServerSocket is automatically closed
        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            System.out.println("[INFO] Server is listening and ready for incoming connections.");
            System.out.println("[INFO] Waiting for client (blocking at serverSocket.accept())...");

            // serverSocket.accept() blocks until a client connects
            try (Socket clientSocket = serverSocket.accept()) {
                String clientIp = clientSocket.getInetAddress().getHostAddress();
                int clientPort = clientSocket.getPort();
                System.out.println("[CONNECT] Client established connection from " + clientIp + ":" + clientPort);

                // Set up I/O character streams
                BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
                // Second parameter 'true' enables auto-flush on println()
                PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);

                // Send greeting to client
                out.println("SERVER 200: Connected to Java TCP Echo Server. Type 'BYE' to exit.");

                String inputLine;
                // Read lines from client until EOF (client disconnects)
                while ((inputLine = in.readLine()) != null) {
                    System.out.println("[RECEIVED from " + clientPort + "]: " + inputLine);

                    if ("BYE".equalsIgnoreCase(inputLine.trim())) {
                        out.println("SERVER: Goodbye! Closing connection.");
                        System.out.println("[DISCONNECT] Client requested session termination.");
                        break;
                    }

                    // Echo transformed message back to client
                    String echoMessage = "ECHO: " + inputLine;
                    out.println(echoMessage);
                    System.out.println("[SENT to " + clientPort + "]: " + echoMessage);
                }
            } // clientSocket closed here automatically

            System.out.println("[INFO] Client session closed. Server shutting down.");

        } catch (IOException e) {
            System.err.println("[ERROR] Server encountered an exception: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
