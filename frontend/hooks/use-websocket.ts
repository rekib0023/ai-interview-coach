import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
    url: string;
    onMessage?: (message: string) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (event: Event) => void;
    shouldReconnect?: (event: CloseEvent) => boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    enabled?: boolean; // Add ability to disable connection
}

export function useWebSocket({
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    shouldReconnect,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    enabled = true,
}: UseWebSocketOptions) {
    const ws = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const reconnectAttempts = useRef(0);
    const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
    const isIntentionallyClosed = useRef(false);
    const mountedRef = useRef(true);

    // Use refs for callbacks to prevent infinite loops
    const onMessageRef = useRef(onMessage);
    const onOpenRef = useRef(onOpen);
    const onCloseRef = useRef(onClose);
    const onErrorRef = useRef(onError);
    const shouldReconnectRef = useRef(shouldReconnect);

    // Update refs when callbacks change
    useEffect(() => {
        onMessageRef.current = onMessage;
        onOpenRef.current = onOpen;
        onCloseRef.current = onClose;
        onErrorRef.current = onError;
        shouldReconnectRef.current = shouldReconnect;
    }, [onMessage, onOpen, onClose, onError, shouldReconnect]);

    const connect = useCallback(() => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/004d8aa3-6796-41dc-874c-e8886aa08371', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'use-websocket.ts:34', message: 'connect called', data: { url, enabled, intentionallyClosed: isIntentionallyClosed.current, reconnectAttempt: reconnectAttempts.current }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
        // #endregion
        // Don't connect if disabled or intentionally closed
        if (!url || !enabled || isIntentionallyClosed.current) {
            console.log('WebSocket connection skipped', { url, enabled, intentionallyClosed: isIntentionallyClosed.current });
            return;
        }

        // Clean up existing connection if any
        if (ws.current) {
            if (ws.current.readyState === WebSocket.CONNECTING || ws.current.readyState === WebSocket.OPEN) {
                console.log('WebSocket already connecting or connected, skipping');
                return;
            }
            ws.current.close();
            ws.current = null;
        }

        try {
            console.log('Attempting WebSocket connection to:', url);
            const socket = new WebSocket(url);

            socket.onopen = () => {
                if (!mountedRef.current) return;

                console.log('✅ WebSocket connected successfully');
                setIsConnected(true);
                setError(null);
                reconnectAttempts.current = 0;
                onOpenRef.current?.();
            };

            socket.onmessage = (event) => {
                if (!mountedRef.current) return;
                onMessageRef.current?.(event.data);
            };

            socket.onclose = (event) => {
                if (!mountedRef.current) return;

                setIsConnected(false);
                ws.current = null;

                // Normal closure or intentional close
                if (event.code === 1000 || event.code === 1005 || isIntentionallyClosed.current) {
                    console.log('WebSocket closed normally', event.code, event.reason);
                    onCloseRef.current?.();
                    return;
                }

                console.log('WebSocket disconnected unexpectedly', event.code, event.reason);
                onCloseRef.current?.();

                // Determine if should reconnect
                const shouldRetry = shouldReconnectRef.current ? shouldReconnectRef.current(event) : true;
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/004d8aa3-6796-41dc-874c-e8886aa08371', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'use-websocket.ts:103', message: 'shouldReconnect evaluated in onclose', data: { shouldRetry, closeCode: event.code, reconnectAttempts: reconnectAttempts.current, maxAttempts: maxReconnectAttempts, intentionallyClosed: isIntentionallyClosed.current }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
                // #endregion

                if (shouldRetry && reconnectAttempts.current < maxReconnectAttempts && !isIntentionallyClosed.current) {
                    const timeout = Math.min(
                        reconnectInterval * Math.pow(1.5, reconnectAttempts.current),
                        30000
                    );
                    console.log(`⏳ Reconnecting in ${timeout}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})...`);

                    reconnectTimer.current = setTimeout(() => {
                        if (!mountedRef.current) return;
                        reconnectAttempts.current++;
                        connect();
                    }, timeout);
                } else {
                    if (reconnectAttempts.current >= maxReconnectAttempts) {
                        console.error('❌ Max reconnection attempts reached');
                        setError('Failed to reconnect after multiple attempts');
                    }
                }
            };

            socket.onerror = (event) => {
                if (!mountedRef.current) return;

                console.error('❌ WebSocket error:', event);
                setError('Connection error occurred');
                onErrorRef.current?.(event);
            };

            ws.current = socket;
        } catch (err) {
            console.error('❌ WebSocket connection failed:', err);
            setError(`Failed to connect: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    }, [url, reconnectInterval, maxReconnectAttempts, enabled]);

    useEffect(() => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/004d8aa3-6796-41dc-874c-e8886aa08371', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'use-websocket.ts:124', message: 'useEffect triggered', data: { url, enabled, connectDeps: 'connect, enabled, url' }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
        // #endregion
        mountedRef.current = true;
        isIntentionallyClosed.current = false;

        if (enabled && url) {
            connect();
        }

        return () => {
            mountedRef.current = false;
            isIntentionallyClosed.current = true;

            // Clear reconnection timer
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
                reconnectTimer.current = null;
            }

            // Close WebSocket connection
            if (ws.current) {
                if (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING) {
                    ws.current.close(1000, 'Component unmounted');
                }
                ws.current = null;
            }
        };
    }, [connect, enabled, url]);

    const sendMessage = useCallback((message: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            try {
                ws.current.send(message);
                return true;
            } catch (err) {
                console.error('Failed to send message:', err);
                setError('Failed to send message');
                return false;
            }
        } else {
            console.warn('⚠️ WebSocket is not connected. Current state:', ws.current?.readyState);
            setError('Cannot send message: not connected');
            return false;
        }
    }, []);

    const disconnect = useCallback(() => {
        isIntentionallyClosed.current = true;

        if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current);
            reconnectTimer.current = null;
        }

        if (ws.current) {
            ws.current.close(1000, 'Intentional disconnect');
            ws.current = null;
        }

        setIsConnected(false);
    }, []);

    const reconnect = useCallback(() => {
        isIntentionallyClosed.current = false;
        reconnectAttempts.current = 0;
        connect();
    }, [connect]);

    return {
        isConnected,
        sendMessage,
        error,
        disconnect,
        reconnect,
        reconnectAttempts: reconnectAttempts.current
    };
}
