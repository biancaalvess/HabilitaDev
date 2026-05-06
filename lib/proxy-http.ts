import { NextResponse } from 'next/server';
import { missingJavaBackendJson } from '@/lib/config-simple';

export const PROXY_JSON_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

export function noJavaBackendResponse() {
  return NextResponse.json(missingJavaBackendJson(), {
    status: 503,
    headers: PROXY_JSON_HEADERS,
  });
}
