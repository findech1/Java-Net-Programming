/**
 * Java Network Programming Coursework - BIT Curriculum
 * Lab 5: University Student Records Query Client
 * 
 * Compilation: javac StudentRecordsClient.java
 * Execution:   java StudentRecordsClient [optional_host] [optional_port]
 */

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class StudentRecordsClient {
    public static final String DEFAULT_HOST = "127.0.0.1";
    public static final int DEFAULT_PORT = 6543;

    public static void main(String[] args) {
        String host = (args.length > 0) ? args[0] : DEFAULT_HOST;
        int port = (args.length > 1) ? Integer.parseInt(args[1]) : DEFAULT_PORT;

        System.out.println("==================================================");
        System.out.println("   BIT Student Records Query Client (Lab 5)       ");
        System.out.println("==================================================");

        try (
            Socket socket = new Socket(host, port);
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            BufferedReader stdIn = new BufferedReader(new InputStreamReader(System.in))
        ) {
            System.out.println("[CONNECTED] Server: " + host + ":" + port);
            System.out.println("< " + in.readLine());

            String line;
            System.out.print("query> ");
            while ((line = stdIn.readLine()) != null) {
                out.println(line);

                String response = in.readLine();
                if (response == null) {
                    System.out.println("[INFO] Connection closed by server.");
                    break;
                }

                // Parse structured protocol
                if (response.startsWith("200_OK|")) {
                    String[] tokens = response.split("\\\\|");
                    if (tokens.length >= 6) {
                        System.out.println("┌────────────────────────────────────────────────────────┐");
                        System.out.printf("│ Student ID : %-41s │%n", tokens[1]);
                        System.out.printf("│ Full Name  : %-41s │%n", tokens[2]);
                        System.out.printf("│ Program    : %-41s │%n", tokens[3]);
                        System.out.printf("│ Academic   : %-41s │%n", tokens[4]);
                        System.out.printf("│ Financial  : %-41s │%n", tokens[5]);
                        System.out.println("└────────────────────────────────────────────────────────┘");
                    } else {
                        System.out.println("< " + response);
                    }
                } else {
                    System.out.println("< " + response);
                }

                if ("EXIT".equalsIgnoreCase(line.trim())) break;
                System.out.print("query> ");
            }

        } catch (Exception e) {
            System.err.println("[ERROR] Client error: " + e.getMessage());
        }
    }
}
