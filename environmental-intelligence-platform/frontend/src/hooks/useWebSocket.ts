import { useState, useEffect, useRef, useCallback } from 'react'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

interface UseWebSocketOptions {
  url?: string
  protocols?: string | string[]
  onOpen?: (event: Event) => void
  onMessage?: (message: WebSocketMessage) => void
  onError?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  shouldReconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

interface WebSocketState {
  socket: WebSocket | null
  lastMessage: WebSocketMessage | null
  readyState: number
  isConnected: boolean
  isConnecting: boolean
  reconnectCount: number
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
    protocols,
    onOpen,
    onMessage,
    onError,
    onClose,
    shouldReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options

  const [state, setState] = useState<WebSocketState>({
    socket: null,
    lastMessage: null,
    readyState: WebSocket.CLOSED,
    isConnected: false,
    isConnecting: false,
    reconnectCount: 0
  })

  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const shouldReconnectRef = useRef(shouldReconnect)
  const reconnectCountRef = useRef(0)

  const connect = useCallback(() => {
    if (state.isConnecting || state.isConnected) {
      return
    }

    setState(prev => ({ ...prev, isConnecting: true }))

    try {
      const socket = new WebSocket(url, protocols)

      socket.onopen = (event) => {
        setState(prev => ({
          ...prev,
          socket,
          readyState: socket.readyState,
          isConnected: true,
          isConnecting: false,
          reconnectCount: 0
        }))
        reconnectCountRef.current = 0
        onOpen?.(event)
      }

      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setState(prev => ({
            ...prev,
            lastMessage: message
          }))
          onMessage?.(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      socket.onerror = (event) => {
        setState(prev => ({
          ...prev,
          isConnecting: false
        }))
        onError?.(event)
      }

      socket.onclose = (event) => {
        setState(prev => ({
          ...prev,
          socket: null,
          readyState: WebSocket.CLOSED,
          isConnected: false,
          isConnecting: false
        }))

        onClose?.(event)

        // Attempt to reconnect if enabled and not at max attempts
        if (shouldReconnectRef.current &&
            reconnectCountRef.current < maxReconnectAttempts &&
            !event.wasClean) {

          reconnectCountRef.current += 1
          setState(prev => ({ ...prev, reconnectCount: reconnectCountRef.current }))

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false
      }))
      console.error('Failed to create WebSocket connection:', error)
    }
  }, [url, protocols, onOpen, onMessage, onError, onClose, reconnectInterval, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (state.socket) {
      state.socket.close(1000, 'Manual disconnect')
    }
  }, [state.socket])

  const sendMessage = useCallback((message: any) => {
    if (state.socket && state.isConnected) {
      try {
        const messageString = typeof message === 'string' ? message : JSON.stringify(message)
        state.socket.send(messageString)
        return true
      } catch (error) {
        console.error('Failed to send WebSocket message:', error)
        return false
      }
    }
    return false
  }, [state.socket, state.isConnected])

  const reconnect = useCallback(() => {
    disconnect()
    shouldReconnectRef.current = true
    reconnectCountRef.current = 0
    setTimeout(connect, 100)
  }, [connect, disconnect])

  useEffect(() => {
    connect()

    return () => {
      shouldReconnectRef.current = false
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (state.socket) {
        state.socket.close()
      }
    }
  }, [])

  return {
    socket: state.socket,
    lastMessage: state.lastMessage,
    readyState: state.readyState,
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    reconnectCount: state.reconnectCount,
    sendMessage,
    connect,
    disconnect,
    reconnect
  }
}