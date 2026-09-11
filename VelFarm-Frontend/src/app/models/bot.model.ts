export interface BotStatus {
  _id?: string;
  x: number;
  y: number;
  battery: number;
  isMoving: boolean;
  lastUpdate: string;
}

export interface Command {
  _id?: string;
  type: 'move' | 'drop';
  x?: number;
  y?: number;
  executed: boolean;
  createdAt: string;
  executedAt?: string;
}

export interface FertilizerLog {
  _id?: string;
  x: number;
  y: number;
  timestamp: string;
  success: boolean;
  batteryLevel: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  commandId?: string;
}
