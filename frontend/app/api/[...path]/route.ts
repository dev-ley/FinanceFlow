
import type { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

function getBackendUrl(): string {
  const backendUrl =
    process.env.FINANCEFLOW_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000";

  return backendUrl.replace(/\/+$/, "");
}

async function proxyRequest(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  try {
    const { path } = await context.params;
    const backendUrl = getBackendUrl();
    const incomingUrl = new URL(request.url);

    const endpoint = path.map(encodeURIComponent).join("/");
    const targetUrl = `${backendUrl}/${endpoint}${incomingUrl.search}`;

    const requestHeaders = new Headers(request.headers);

    // O servidor de destino não deve receber cabeçalhos
    // específicos da conexão original com a Vercel.
    requestHeaders.delete("host");
    requestHeaders.delete("connection");
    requestHeaders.delete("content-length");
    requestHeaders.delete("accept-encoding");

    const hasBody = !["GET", "HEAD"].includes(request.method);

    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: requestHeaders,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
    });

    const responseHeaders = new Headers(upstream.headers);

    // O conteúdo já foi processado pelo fetch do servidor.
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("connection");

    // Preserva os cookies individuais enviados pelo backend,
    // incluindo o Set-Cookie do login e do logout.
    const setCookies = upstream.headers.getSetCookie();

    responseHeaders.delete("set-cookie");

    for (const cookie of setCookies) {
      responseHeaders.append("set-cookie", cookie);
    }

    const noResponseBody = [204, 304].includes(upstream.status);

    const responseBody = noResponseBody
      ? null
      : await upstream.arrayBuffer();

    return new Response(responseBody, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      {
        message: "Não foi possível conectar ao servidor do FinanceFlow.",
      },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyRequest(request, context);
}
