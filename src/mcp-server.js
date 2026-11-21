import readline from 'node:readline';
import { pathToFileURL } from 'node:url';
import { callTool, toolDefinitions } from './mcp-tools.js';

const SERVER_INFO = { name: 'sparkfolio', version: '1.0.0' };

export function handleRequest(request) {
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  if (!object(request) || request.jsonrpc !== '2.0' || typeof request.method !== 'string' || !request.method ||
      (Object.hasOwn(request, 'id') && !(request.id === null || typeof request.id === 'string' || (typeof request.id === 'number' && Number.isFinite(request.id)))) ||
      (Object.hasOwn(request, 'params') && !object(request.params))) {
    return { jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Invalid Request.' } };
  }
  // Valid notifications have no response, regardless of the method name.
  if (!Object.hasOwn(request, 'id')) return null;
  const { id, method, params = {} } = request;
  if (method === 'initialize') {
    return { jsonrpc: '2.0', id, result: {
      protocolVersion: params.protocolVersion ?? '2025-06-18',
      capabilities: { tools: { listChanged: false } },
      serverInfo: SERVER_INFO,
      instructions: 'Read-only educational evidence and deterministic readiness review. Never present output as personal advice.'
    } };
  }
  if (method === 'ping') return { jsonrpc: '2.0', id, result: {} };
  if (method === 'tools/list') return { jsonrpc: '2.0', id, result: { tools: toolDefinitions } };
  if (method === 'tools/call') {
    try {
      const structuredContent = callTool(params.name, params.arguments === undefined ? {} : params.arguments);
      return { jsonrpc: '2.0', id, result: {
        content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
        structuredContent, isError: false
      } };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid tool request.';
      return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: message }], isError: true } };
    }
  }
  return { jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found.' } };
}

export function serve(input = process.stdin, output = process.stdout) {
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  lines.on('line', line => {
    if (!line.trim()) return;
    let request;
    try { request = JSON.parse(line); }
    catch {
      output.write(`${JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error.' } })}\n`);
      return;
    }
    const response = handleRequest(request);
    if (response !== null) output.write(`${JSON.stringify(response)}\n`);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) serve();
