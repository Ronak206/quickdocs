/**
 * Dynamic API Route Handler
 * 
 * This route forwards API requests to the appropriate microservice.
 * It acts as a bridge between the Next.js frontend and the microservices.
 */

import { NextRequest, NextResponse } from 'next/server';

// Service port configuration
const SERVICE_PORTS: Record<string, number> = {
  '3001': 'PDF Generator',
  '3002': 'Template Manager',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string
) {
  try {
    const { path } = await params;
    const searchParams = request.nextUrl.searchParams;
    const port = searchParams.get('XTransformPort');

    if (!port) {
      return NextResponse.json(
        { error: 'XTransformPort parameter is required' },
        { status: 400 }
      );
    }

    // Build the target URL
    const targetPath = path.join('/');
    const targetUrl = `http://localhost:${port}/${targetPath}?${searchParams.toString()}`;

    console.log(`[API Proxy] Forwarding ${method} request to: ${targetUrl}`);

    // Forward the request to the microservice
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // Add body for POST/PUT requests
    if (method === 'POST' || method === 'PUT') {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        try {
          const body = await request.json();
          fetchOptions.body = JSON.stringify(body);
        } catch (e) {
          // No JSON body
        }
      }
    }

    const response = await fetch(targetUrl, fetchOptions);

    // Get the response content type
    const responseContentType = response.headers.get('content-type');

    // Handle different response types
    if (responseContentType?.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else if (responseContentType?.includes('application/pdf')) {
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, {
        status: response.status,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': response.headers.get('content-disposition') || '',
        },
      });
    } else {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: { 'Content-Type': responseContentType || 'text/plain' },
      });
    }
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500 }
    );
  }
}
