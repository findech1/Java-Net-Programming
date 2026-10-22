/**
 * Java Network Programming Coursework - BIT Curriculum
 * Lab 7: Non-blocking I/O (Java NIO) Client
 * 
 * Compilation: javac NioTestClient.java
 * Execution:   java NioTestClient
 */

import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;

public class NioTestClient {
    public static void main(String[] args) {
        String host = "127.0.0.1";
        int port = 9000;

        System.out.println("Connecting to Java NIO Server at " + host + ":" + port + "...");

        try (SocketChannel channel = SocketChannel.open(new InetSocketAddress(host, port))) {
            System.out.println("[SUCCESS] SocketChannel connected!");

            String message = "Hello from Java NIO SocketChannel!";
            ByteBuffer buffer = ByteBuffer.wrap(message.getBytes());
            channel.write(buffer);
            System.out.println("[SENT] " + message);

            buffer.clear();
            int bytesRead = channel.read(buffer);
            buffer.flip();

            byte[] responseBytes = new byte[bytesRead];
            buffer.get(responseBytes);
            System.out.println("[REPLY] " + new String(responseBytes));

        } catch (Exception e) {
            System.err.println("[ERROR] NIO Client error: " + e.getMessage());
        }
    }
}
