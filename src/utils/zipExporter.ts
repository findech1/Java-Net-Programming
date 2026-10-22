import JSZip from 'jszip';
import { JAVA_LABS } from '../data/javaLabs';

export async function exportAllJavaLabsAsZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root README and Makefile
  zip.file(
    'README.md',
    `# BIT Network Programming - Java Client-Server Coursework

This package contains full runnable Java Client-Server implementations
for university network programming coursework.

## Compile all files:
javac */*.java

## Labs:
1. tcp/EchoServer.java & EchoClient.java
2. multithreaded/MultiThreadedServer.java & WorkerClient.java
3. chat/ChatServer.java & ChatClient.java
4. udp/UDPEchoServer.java & UDPEchoClient.java
5. student_records/StudentRecordsServer.java & StudentRecordsClient.java
6. http/MiniHttpServer.java & HttpClientTest.java
7. nio/NioEchoServer.java & NioTestClient.java
`
  );

  zip.file(
    'Makefile',
    `JAVAC = javac
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

clean:
	rm -f */*.class
`
  );

  // Add all lab directories and Java files
  for (const lab of JAVA_LABS) {
    let folderName = 'tcp';
    if (lab.id === 'tcp-multithreaded') folderName = 'multithreaded';
    else if (lab.id === 'tcp-chat-room') folderName = 'chat';
    else if (lab.id === 'udp-datagram') folderName = 'udp';
    else if (lab.id === 'student-records') folderName = 'student_records';
    else if (lab.id === 'mini-http-server') folderName = 'http';
    else if (lab.id === 'java-nio') folderName = 'nio';

    const folder = zip.folder(folderName);
    if (folder) {
      folder.file(lab.serverFileName, lab.serverCode);
      folder.file(lab.clientFileName, lab.clientCode);
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, filename);
}
