/**
 * Java Network Programming Coursework - BIT Curriculum
 * Lab 7: Non-blocking I/O (Java NIO) with Selector
 * 
 * Compilation: javac NioEchoServer.java
 * Execution:   java NioEchoServer
 */

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;
import java.util.Set;

public class NioEchoServer {
    public static final int PORT = 9000;
    private static final int BUFFER_CAPACITY = 1024;

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("  BIT Java NIO Selector Non-Blocking Server       ");
        System.out.println("==================================================");

        try (
            Selector selector = Selector.open();
            ServerSocketChannel serverChannel = ServerSocketChannel.open()
        ) {
            // Put server channel in NON-BLOCKING mode
            serverChannel.configureBlocking(false);
            serverChannel.bind(new InetSocketAddress(PORT));

            // Register channel with selector to listen for OP_ACCEPT
            serverChannel.register(selector, SelectionKey.OP_ACCEPT);
            System.out.println("[INFO] NIO Server listening on port " + PORT + " with single-thread event loop.");

            ByteBuffer buffer = ByteBuffer.allocate(BUFFER_CAPACITY);

            while (true) {
                // Blocks until at least one I/O event is ready on registered channels
                selector.select();

                Set<SelectionKey> selectedKeys = selector.selectedKeys();
                Iterator<SelectionKey> iterator = selectedKeys.iterator();

                while (iterator.hasNext()) {
                    SelectionKey key = iterator.next();
                    iterator.remove(); // Must remove to avoid processing repeatedly

                    if (!key.isValid()) continue;

                    // Event: New client incoming connection
                    if (key.isAcceptable()) {
                        ServerSocketChannel srv = (ServerSocketChannel) key.channel();
                        SocketChannel client = srv.accept();
                        if (client != null) {
                            client.configureBlocking(false);
                            client.register(selector, SelectionKey.OP_READ);
                            System.out.println("[NIO ACCEPT] Client connected: " + client.getRemoteAddress());
                        }
                    } 
                    // Event: Data ready to read from client channel
                    else if (key.isReadable()) {
                        SocketChannel client = (SocketChannel) key.channel();
                        buffer.clear();
                        int bytesRead = client.read(buffer);

                        if (bytesRead == -1) {
                            System.out.println("[NIO CLOSE] Client disconnected: " + client.getRemoteAddress());
                            client.close();
                            key.cancel();
                            continue;
                        }

                        // Flip buffer from write-mode to read-mode
                        buffer.flip();
                        // Echo buffer contents straight back to client
                        client.write(buffer);
                    }
                }
            }

        } catch (IOException e) {
            System.err.println("[ERROR] NIO Server exception: " + e.getMessage());
        }
    }
}
