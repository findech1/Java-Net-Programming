/**
 * Java Network Programming Coursework - BIT Curriculum
 * Lab 6: Raw Socket HTTP Client
 * 
 * Compilation: javac HttpClientTest.java
 * Execution:   java HttpClientTest
 */

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class HttpClientTest {
    public static void main(String[] args) {
        String host = "127.0.0.1";
        int port = 8000;

        System.out.println("Sending raw HTTP GET request to " + host + ":" + port + "...");

        try (
            Socket socket = new Socket(host, port);
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))
        ) {
            // Send RFC HTTP/1.1 GET request
            out.println("GET / HTTP/1.1");
            out.println("Host: " + host + ":" + port);
            out.println("User-Agent: BIT-RawJavaSocketClient/1.0");
            out.println("Connection: close");
            out.println(); // Mandatory blank line

            // Stream response
            String line;
            System.out.println("--- Server HTTP Response ---");
            while ((line = in.readLine()) != null) {
                System.out.println(line);
            }

        } catch (Exception e) {
            System.err.println("HTTP test client error: " + e.getMessage());
        }
    }
}
