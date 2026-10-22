# BIT Network Programming - Java Makefile
# Convenient compilation and execution targets for all labs

JAVAC = javac
JAVA = java

all: compile

compile:
	$(JAVAC) tcp/*.java
	$(JAVAC) multithreaded/*.java
	$(JAVAC) chat/*.java
	$(JAVAC) udp/*.java
	$(JAVAC) student_records/*.java
	$(JAVAC) http/*.java
	$(JAVAC) nio/*.java
	@echo "=========================================="
	@echo "All Java Network Programming Labs compiled!"
	@echo "=========================================="

# Lab 1: TCP Echo
run-echo-server:
	cd tcp && $(JAVA) EchoServer

run-echo-client:
	cd tcp && $(JAVA) EchoClient

# Lab 2: Multi-threaded
run-multi-server:
	cd multithreaded && $(JAVA) MultiThreadedServer

run-worker-client:
	cd multithreaded && $(JAVA) WorkerClient

# Lab 3: Chat Room
run-chat-server:
	cd chat && $(JAVA) ChatServer

run-chat-client:
	cd chat && $(JAVA) ChatClient

# Lab 4: UDP Datagram
run-udp-server:
	cd udp && $(JAVA) UDPEchoServer

run-udp-client:
	cd udp && $(JAVA) UDPEchoClient

# Lab 5: Student Records
run-records-server:
	cd student_records && $(JAVA) StudentRecordsServer

run-records-client:
	cd student_records && $(JAVA) StudentRecordsClient

# Lab 6: Mini HTTP Server
run-http-server:
	cd http && $(JAVA) MiniHttpServer

# Lab 7: Java NIO
run-nio-server:
	cd nio && $(JAVA) NioEchoServer

run-nio-client:
	cd nio && $(JAVA) NioTestClient

clean:
	rm -f tcp/*.class
	rm -f multithreaded/*.class
	rm -f chat/*.class
	rm -f udp/*.class
	rm -f student_records/*.class
	rm -f http/*.class
	rm -f nio/*.class
	@echo "Cleaned all .class binaries."
