/**
 * Java Network Programming Coursework - BIT Curriculum
 * Lab 2: Worker Client for Multi-Threaded Server testing
 * 
 * Compilation: javac WorkerClient.java
 * Execution:   java WorkerClient
 */

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class WorkerClient {
    public static final String HOST = "127.0.0.1";
    public static final int PORT = 8080;

    public static void main(String[] args) {
        System.out.println("Connecting to Multi-Threaded Server at " + HOST + ":" + PORT + "...");

        try (
            Socket socket = new Socket(HOST, PORT);
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            BufferedReader stdIn = new BufferedReader(new InputStreamReader(System.in))
        ) {
            System.out.println("Connected! (Local Port: " + socket.getLocalPort() + ")");
            System.out.println("< " + in.readLine());

            String input;
            System.out.print("Client> ");
            while ((input = stdIn.readLine()) != null) {
                out.println(input);
                String response = in.readLine();
                if (response == null) {
                    System.out.println("Server closed connection.");
                    break;
                }
                System.out.println("< " + response);

                if ("QUIT".equalsIgnoreCase(input.trim())) {
                    break;
                }
                System.out.print("Client> ");
            }

        } catch (Exception e) {
            System.err.println("Client error: " + e.getMessage());
        }
    }
}
