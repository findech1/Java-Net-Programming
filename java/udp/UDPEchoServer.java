/**
 * Java Network Programming Coursework - BIT Curriculum
 * Lab 4: Connectionless UDP Datagram Echo Server
 * 
 * Compilation: javac UDPEchoServer.java
 * Execution:   java UDPEchoServer
 */

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;

public class UDPEchoServer {
    public static final int PORT = 9876;
    public static final int BUFFER_SIZE = 1024;

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("     BIT Network Programming - UDP Datagram Server");
        System.out.println("==================================================");

        // Bind DatagramSocket to UDP port 9876
        try (DatagramSocket socket = new DatagramSocket(PORT)) {
            System.out.println("[INFO] UDP Server listening on port " + PORT);
            System.out.println("[INFO] Note: UDP is connectionless - no handshake or accept() needed.");

            byte[] receiveBuffer = new byte[BUFFER_SIZE];

            while (true) {
                // Prepare packet container for incoming datagram
                DatagramPacket receivePacket = new DatagramPacket(receiveBuffer, receiveBuffer.length);

                // Blocks until an incoming UDP datagram packet arrives
                socket.receive(receivePacket);

                String payload = new String(
                    receivePacket.getData(), 
                    0, 
                    receivePacket.getLength()
                ).trim();

                InetAddress senderAddress = receivePacket.getAddress();
                int senderPort = receivePacket.getPort();

                System.out.println("[DATAGRAM RECEIVED] From " + senderAddress.getHostAddress() + 
                                   ":" + senderPort + " (" + receivePacket.getLength() + " bytes) -> '" + payload + "'");

                // Craft response datagram
                String responseText = "UDP_ECHO: " + payload.toUpperCase();
                byte[] sendBuffer = responseText.getBytes();

                DatagramPacket sendPacket = new DatagramPacket(
                    sendBuffer,
                    sendBuffer.length,
                    senderAddress,
                    senderPort
                );

                // Send response back
                socket.send(sendPacket);
                System.out.println("[DATAGRAM SENT] Echoed back to " + senderAddress.getHostAddress() + ":" + senderPort);
            }

        } catch (IOException e) {
            System.err.println("[ERROR] UDP Server error: " + e.getMessage());
        }
    }
}
