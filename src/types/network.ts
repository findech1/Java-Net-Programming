export type ProtocolType = 'TCP' | 'UDP';

export type ServerState = 'STOPPED' | 'BINDING' | 'LISTENING' | 'ACTIVE';

export type ClientState = 'DISCONNECTED' | 'HANDSHAKING' | 'CONNECTED' | 'ERROR';

export interface Packet {
  id: string;
  timestamp: string;
  protocol: ProtocolType;
  source: string;
  destination: string;
  type: 'SYN' | 'SYN_ACK' | 'ACK' | 'DATA' | 'FIN' | 'FIN_ACK' | 'UDP_DATAGRAM' | 'RESET';
  seq?: number;
  ack?: number;
  flags?: string[];
  payload?: string;
  byteSize: number;
  direction: 'CLIENT_TO_SERVER' | 'SERVER_TO_CLIENT';
}

export interface ClientSession {
  id: string;
  name: string;
  clientPort: number;
  state: ClientState;
  color: string;
  connectedAt?: string;
  messagesSent: number;
  messagesReceived: number;
  bytesTransferred: number;
  consoleHistory: Array<{
    id: string;
    timestamp: string;
    direction: 'IN' | 'OUT' | 'SYS';
    text: string;
  }>;
}

export interface JavaLab {
  id: string;
  title: string;
  category: 'Fundamentals' | 'Concurrency' | 'Protocols' | 'Advanced I/O';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  protocol: ProtocolType;
  description: string;
  objective: string;
  serverFileName: string;
  serverCode: string;
  clientFileName: string;
  clientCode: string;
  keyConcepts: Array<{
    methodOrClass: string;
    description: string;
  }>;
  terminalRunInstructions: {
    compile: string;
    runServer: string;
    runClient: string;
  };
}

export interface StudyQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'TCP vs UDP' | 'Socket API' | 'Streams & Buffers' | 'Concurrency';
}
