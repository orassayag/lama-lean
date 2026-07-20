interface HealthStatus {
  status: string;
  uptime: number;
  timestamp: string;
}

export const getHealthStatus = async (): Promise<HealthStatus> => ({
  status: 'ok',
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
});
