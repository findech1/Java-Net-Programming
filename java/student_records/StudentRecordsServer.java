/**
 * Java Network Programming Coursework - BIT Curriculum
 * Lab 5: University Student Records Query Server
 * 
 * Application-Layer Protocol Design with status codes:
 * GET_STUDENT <ID>  -> 200_OK|<ID>|<NAME>|<DEGREE>|<GPA>|<STATUS>
 *                   or 404_NOT_FOUND|Record does not exist
 * LIST_IDS          -> 200_OK|<ID1>,<ID2>,...
 * EXIT              -> 200_BYE: Session ended
 * 
 * Compilation: javac StudentRecordsServer.java
 * Execution:   java StudentRecordsServer
 */

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.HashMap;
import java.util.Map;

public class StudentRecordsServer {
    public static final int PORT = 6543;

    record Student(String id, String name, String degree, double gpa, String financialClearance) {}

    private static final Map<String, Student> registry = new HashMap<>();

    static {
        registry.put("BIT-2024-001", new Student("BIT-2024-001", "Alex Chen", "BSc Information Technology", 3.85, "CLEARED"));
        registry.put("BIT-2024-042", new Student("BIT-2024-042", "Sarah Jenkins", "BSc Information Technology", 3.92, "CLEARED"));
        registry.put("BIT-2024-108", new Student("BIT-2024-108", "David O'Connor", "BSc Computer Networks", 3.40, "HOLD_FEES"));
        registry.put("BIT-2024-215", new Student("BIT-2024-215", "Fatima Al-Mansoor", "BSc Cybersecurity", 3.96, "CLEARED"));
    }

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("  BIT Student Records Database Server (Lab 5)     ");
        System.out.println("==================================================");
        System.out.println("[INFO] " + registry.size() + " student records loaded.");

        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            System.out.println("[INFO] Listening on port " + PORT + "...");

            while (true) {
                Socket socket = serverSocket.accept();
                new Thread(() -> handleSession(socket)).start();
            }

        } catch (IOException e) {
            System.err.println("[ERROR] Server error: " + e.getMessage());
        }
    }

    private static void handleSession(Socket socket) {
        try (
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true)
        ) {
            out.println("PROTOCOL_READY: BIT University Registrar Protocol v2.4. Commands: GET_STUDENT <ID>, LIST_IDS, EXIT");

            String line;
            while ((line = in.readLine()) != null) {
                line = line.trim();
                System.out.println("[QUERY from " + socket.getPort() + "]: " + line);

                if ("EXIT".equalsIgnoreCase(line)) {
                    out.println("200_BYE: Session closed cleanly.");
                    break;
                } else if ("LIST_IDS".equalsIgnoreCase(line)) {
                    out.println("200_OK|" + String.join(",", registry.keySet()));
                } else if (line.toUpperCase().startsWith("GET_STUDENT ")) {
                    String id = line.substring("GET_STUDENT ".length()).trim().toUpperCase();
                    Student s = registry.get(id);

                    if (s != null) {
                        out.println("200_OK|" + s.id() + "|" + s.name() + "|" + s.degree() + 
                                    "|GPA:" + s.gpa() + "|" + s.financialClearance());
                    } else {
                        out.println("404_NOT_FOUND|No record matches student ID: " + id);
                    }
                } else {
                    out.println("400_BAD_SYNTAX|Invalid command. Usage: GET_STUDENT <ID> or LIST_IDS");
                }
            }

        } catch (IOException e) {
            System.err.println("[ERROR] Handler error: " + e.getMessage());
        } finally {
            try {
                socket.close();
            } catch (IOException ignored) {}
        }
    }
}
