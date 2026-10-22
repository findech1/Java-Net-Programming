/**
 * Java Network Programming Coursework - BIT Curriculum
 * Lab 4: Connectionless UDP Datagram Echo Client
 * 
 * Compilation: javac UDPEchoClient.java
 * Execution:   java UDPEchoClient [optional_host] [optional_port]
 */

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketTimeoutException;

public class UDPEchoClient {
    public static final String DEFAULT_HOST = "127.0.0.1";
    public static final int DEFAULT_PORT = 9876;
    public static final int TIMEOUT_MILLIS = 3000;

    public static void main(String[] args) {
        String host = (args.length > 0) ? args[0] : DEFAULT_HOST;
        int port = (args.length > 1) ? Integer.parseInt(args[1]) : DEFAULT_PORT;

        System.out.println("==================================================");
        System.out.println("     BIT Network Programming - UDP Datagram Client");
        System.out.println("==================================================");

        try (DatagramSocket socket = new DatagramSocket()) {
            // Set 3000ms timeout on receive() to avoid hanging forever on dropped packets
            socket.setSoTimeout(TIMEOUT_MILLIS);

            InetAddress serverAddress = InetAddress.getByName(host);
            BufferedReader stdIn = new BufferedReader(new InputStreamReader(System.in));

            System.out.println("[INFO] Bound to local ephemeral UDP port " + socket.getLocalPort());
            System.out.println("[INFO] Target server: " + host + ":" + port);
            System.out.println("Enter messages to transmit (or 'exit'):");

            String line;
            while (true) {
                System.out.print("UDP> ");
                line = stdIn.readLine();
                if (line == null || "exit".equalsIgnoreCase(line.trim())) {
                    break;
                }

                byte[] sendBuffer = line.getBytes();
                DatagramPacket sendPacket = new DatagramPacket(
                    sendBuffer,
                    sendBuffer.length,
                    serverAddress,
                    port
                );

                socket.send(sendPacket);
                System.out.println("[SENT] " + sendBuffer.length + " bytes transmitted.");

                try {
                    byte[] receiveBuffer = new byte[1024];
                    DatagramPacket receivePacket = new DatagramPacket(receiveBuffer, receiveBuffer.length);

                    socket.receive(receivePacket);
                    String reply = new String(receivePacket.getData(), 0, receivePacket.getLength());
                    System.out.println("< [REPLY] " + reply);

                } catch (SocketTimeoutException e) {
                    System.err.println("[TIMEOUT] No datagram received within " + TIMEOUT_MILLIS + 
                                       "ms! (Packet dropped or server not running)");
                }
            }

            System.out.println("[INFO] UDP client exited.");

        } catch (Exception e) {
            System.err.println("[ERROR] UDP client error: " + e.getMessage());
        }
    }
}
