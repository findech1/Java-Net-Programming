/**
 * Java Network Programming Coursework - BIT Curriculum
 * Lab 6: Pure Java HTTP/1.1 Web Server on Raw Sockets
 * 
 * Compilation: javac MiniHttpServer.java
 * Execution:   java MiniHttpServer
 * Test:        Open browser at http://localhost:8000/ or curl http://localhost:8000/api/status
 */

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class MiniHttpServer {
    public static final int PORT = 8000;

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("   BIT Pure Java HTTP/1.1 Socket Web Server       ");
        System.out.println("==================================================");
        System.out.println("[INFO] Point any browser to http://127.0.0.1:" + PORT);

        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            while (true) {
                Socket clientSocket = serverSocket.accept();
                new Thread(() -> handleHttpRequest(clientSocket)).start();
            }
        } catch (IOException e) {
            System.err.println("[ERROR] HTTP Server error: " + e.getMessage());
        }
    }

    private static void handleHttpRequest(Socket socket) {
        try (
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            OutputStream rawOut = socket.getOutputStream()
        ) {
            String requestLine = in.readLine();
            if (requestLine == null || requestLine.isEmpty()) return;

            System.out.println("[HTTP] " + requestLine);
            String[] tokens = requestLine.split(" ");
            String method = tokens.length > 0 ? tokens[0] : "";
            String path = tokens.length > 1 ? tokens[1] : "/";

            // Drain headers until blank line
            String header;
            while ((header = in.readLine()) != null && !header.isEmpty()) {}

            String responseBody;
            int statusCode = 200;
            String statusText = "OK";
            String contentType = "text/html; charset=UTF-8";

            if ("/".equals(path) || "/index.html".equals(path)) {
                responseBody = "<!DOCTYPE html>\n" +
                    "<html>\n" +
                    "<head><title>BIT Java Web Server</title></head>\n" +
                    "<body style=\"font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px;\">\n" +
                    "    <h1 style=\"color: #38bdf8;\">BIT Network Programming - Web Socket Lab</h1>\n" +
                    "    <p>This web page was delivered by a raw Java ServerSocket application!</p>\n" +
                    "    <div style=\"background: #1e293b; padding: 16px; border-radius: 8px; border: 1px solid #334155;\">\n" +
                    "        <p><strong>HTTP Method:</strong> " + method + "</p>\n" +
                    "        <p><strong>Resource Path:</strong> " + path + "</p>\n" +
                    "        <p><strong>Server Timestamp:</strong> " + ZonedDateTime.now().format(DateTimeFormatter.RFC_1123_DATE_TIME) + "</p>\n" +
                    "    </div>\n" +
                    "</body>\n" +
                    "</html>\n";
            } else if ("/api/status".equals(path)) {
                contentType = "application/json";
                responseBody = "{\"status\":\"active\",\"protocol\":\"HTTP/1.1\",\"port\":" + PORT + ",\"engine\":\"Java-Sockets\"}";
            } else {
                statusCode = 404;
                statusText = "Not Found";
                responseBody = "<h1>404 Not Found</h1><p>The requested URL " + path + " was not found on this Java server.</p>";
            }

            byte[] bodyBytes = responseBody.getBytes(StandardCharsets.UTF_8);

            // Construct HTTP response headers
            StringBuilder headers = new StringBuilder();
            headers.append("HTTP/1.1 ").append(statusCode).append(" ").append(statusText).append("\r\n");
            headers.append("Date: ").append(DateTimeFormatter.RFC_1123_DATE_TIME.format(ZonedDateTime.now())).append("\r\n");
            headers.append("Server: BIT-JavaSocketHttp/1.0\r\n");
            headers.append("Content-Type: ").append(contentType).append("\r\n");
            headers.append("Content-Length: ").append(bodyBytes.length).append("\r\n");
            headers.append("Connection: close\r\n");
            headers.append("\r\n");

            rawOut.write(headers.toString().getBytes(StandardCharsets.US_ASCII));
            rawOut.write(bodyBytes);
            rawOut.flush();

        } catch (IOException e) {
            System.err.println("[ERROR] HTTP handler error: " + e.getMessage());
        } finally {
            try {
                socket.close();
            } catch (IOException ignored) {}
        }
    }
}
