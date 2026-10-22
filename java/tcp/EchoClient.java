/**
 * Java Network Programming Coursework - BIT Curriculum
 * Lab 1: Classic Single-Client TCP Echo Client
 * 
 * Compilation: javac EchoClient.java
 * Execution:   java EchoClient [optional_host] [optional_port]
 */

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.UnknownHostException;

public class EchoClient {
    public static final String DEFAULT_HOST = "127.0.0.1";
    public static final int DEFAULT_PORT = 5000;

    public static void main(String[] args) {
        String host = (args.length > 0) ? args[0] : DEFAULT_HOST;
        int port = (args.length > 1) ? Integer.parseInt(args[1]) : DEFAULT_PORT;

        System.out.println("==================================================");
        System.out.println("      BIT Network Programming - TCP Echo Client   ");
        System.out.println("==================================================");
        System.out.println("[INFO] Connecting to TCP server at " + host + ":" + port + "...");

        try (
            // Initiates 3-way handshake: SYN -> SYN-ACK -> ACK
            Socket socket = new Socket(host, port);
            // Character stream to send text to server
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            // Character stream to read server responses
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            // Stream to read keyboard input from console
            BufferedReader stdIn = new BufferedReader(new InputStreamReader(System.in))
        ) {
            System.out.println("[SUCCESS] Connected to server!");
            System.out.println("[INFO] Local ephemeral port assigned by OS: " + socket.getLocalPort());

            // Read welcome greeting from server
            String serverBanner = in.readLine();
            System.out.println("< " + serverBanner);

            String userInput;
            System.out.print("Client> ");

            // Read lines from keyboard and send to server
            while ((userInput = stdIn.readLine()) != null) {
                // Send line to server
                out.println(userInput);

                // Read echoed response
                String serverResponse = in.readLine();
                if (serverResponse == null) {
                    System.out.println("[WARNING] Server closed connection unexpectedly.");
                    break;
                }

                System.out.println("< " + serverResponse);

                if ("BYE".equalsIgnoreCase(userInput.trim())) {
                    System.out.println("[INFO] Disconnected from server.");
                    break;
                }

                System.out.print("Client> ");
            }

        } catch (UnknownHostException e) {
            System.err.println("[ERROR] Unknown host: " + host);
        } catch (IOException e) {
            System.err.println("[ERROR] I/O Exception: " + e.getMessage());
        }
    }
}
