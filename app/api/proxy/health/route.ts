import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config-simple';

const BACKEND_URL = config.api.backendUrl;

interface HealthStatus {
  frontend: {
    status: string;
    timestamp: string;
    version: string;
  };
  backend: {
    status: string;
    url: string;
    lastChecked: string;
    response?: any;
    error?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const healthStatus: HealthStatus = {
      frontend: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
      backend: {
        status: 'unknown',
        url: BACKEND_URL,
        lastChecked: new Date().toISOString(),
      },
    };

    if (BACKEND_URL) {
      try {
        const backendUrl = `${BACKEND_URL}/health`;
      console.log('🌐 Checking backend health:', backendUrl);
      
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'HabilitaDev-Frontend/1.0',
        },
        signal: AbortSignal.timeout(5000), // 5 segundos timeout
      });

      if (response.ok) {
        const backendData = await response.json();
        healthStatus.backend = {
          status: 'healthy',
          url: BACKEND_URL,
          lastChecked: new Date().toISOString(),
          response: backendData,
        };
        console.log('✅ Backend is healthy');
      } else {
        healthStatus.backend = {
          status: 'unhealthy',
          url: BACKEND_URL,
          lastChecked: new Date().toISOString(),
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
        console.warn('⚠️ Backend is unhealthy:', response.status);
      }
    } catch (backendError) {
      healthStatus.backend = {
        status: 'unreachable',
        url: BACKEND_URL,
        lastChecked: new Date().toISOString(),
        error: backendError instanceof Error ? backendError.message : 'Unknown error',
      };
      console.warn('⚠️ Backend is unreachable:', backendError instanceof Error ? backendError.message : 'Unknown error');
    }
    } else {
      healthStatus.backend = {
        status: 'not_configured',
        url: '',
        lastChecked: new Date().toISOString(),
        error: 'BACKEND_URL não configurado',
      };
      console.log('ℹ️ BACKEND_URL não configurado, pulando verificação de backend');
    }

    const overallStatus = 
      healthStatus.backend.status === 'healthy' 
        ? 'healthy' 
        : 'degraded';

    return NextResponse.json(
      {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        services: healthStatus,
        message: overallStatus === 'healthy' 
          ? 'All systems operational' 
          : 'Service running with limited functionality',
      },
      {
        status: overallStatus === 'healthy' ? 200 : 503,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );

  } catch (error) {
    console.error('❌ Error in health check:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}