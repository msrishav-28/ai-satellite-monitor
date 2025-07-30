"""
WebSocket connection manager for real-time data streaming
"""

import json
import asyncio
import logging
from typing import Dict, List, Set, Any
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time data streaming"""
    
    def __init__(self):
        # Active connections by connection ID
        self.active_connections: Dict[str, WebSocket] = {}
        
        # Subscriptions by data type
        self.subscriptions: Dict[str, Set[str]] = {
            'environmental': set(),
            'hazards': set(),
            'alerts': set(),
            'timelapse_progress': set(),
            'satellite_updates': set()
        }
        
        # Connection metadata
        self.connection_metadata: Dict[str, Dict[str, Any]] = {}
        
        # Background tasks
        self.background_tasks: Set[asyncio.Task] = set()
        
    async def connect(self, websocket: WebSocket, client_id: str = None) -> str:
        """Accept a new WebSocket connection"""
        await websocket.accept()
        
        # Generate unique connection ID if not provided
        connection_id = client_id or str(uuid.uuid4())
        
        # Store connection
        self.active_connections[connection_id] = websocket
        self.connection_metadata[connection_id] = {
            'connected_at': datetime.utcnow(),
            'last_ping': datetime.utcnow(),
            'subscriptions': set()
        }
        
        logger.info(f"WebSocket connection established: {connection_id}")
        
        # Send welcome message
        await self.send_personal_message({
            'type': 'connection_established',
            'connection_id': connection_id,
            'timestamp': datetime.utcnow().isoformat(),
            'available_subscriptions': list(self.subscriptions.keys())
        }, connection_id)
        
        return connection_id
    
    def disconnect(self, connection_id: str):
        """Remove a WebSocket connection"""
        if connection_id in self.active_connections:
            # Remove from all subscriptions
            for subscription_type in self.subscriptions:
                self.subscriptions[subscription_type].discard(connection_id)
            
            # Remove connection metadata
            if connection_id in self.connection_metadata:
                del self.connection_metadata[connection_id]
            
            # Remove connection
            del self.active_connections[connection_id]
            
            logger.info(f"WebSocket connection closed: {connection_id}")
    
    async def send_personal_message(self, message: Dict[str, Any], connection_id: str):
        """Send a message to a specific connection"""
        if connection_id in self.active_connections:
            try:
                websocket = self.active_connections[connection_id]
                await websocket.send_text(json.dumps(message, default=str))
            except Exception as e:
                logger.error(f"Error sending message to {connection_id}: {e}")
                self.disconnect(connection_id)
    
    async def broadcast_to_subscribers(self, message: Dict[str, Any], subscription_type: str):
        """Broadcast a message to all subscribers of a specific type"""
        if subscription_type in self.subscriptions:
            subscribers = self.subscriptions[subscription_type].copy()
            
            # Add message metadata
            message.update({
                'subscription_type': subscription_type,
                'timestamp': datetime.utcnow().isoformat(),
                'subscriber_count': len(subscribers)
            })
            
            # Send to all subscribers
            for connection_id in subscribers:
                await self.send_personal_message(message, connection_id)
    
    async def subscribe(self, connection_id: str, subscription_type: str) -> bool:
        """Subscribe a connection to a specific data type"""
        if connection_id not in self.active_connections:
            return False
        
        if subscription_type not in self.subscriptions:
            return False
        
        # Add to subscription
        self.subscriptions[subscription_type].add(connection_id)
        
        # Update connection metadata
        if connection_id in self.connection_metadata:
            self.connection_metadata[connection_id]['subscriptions'].add(subscription_type)
        
        # Send confirmation
        await self.send_personal_message({
            'type': 'subscription_confirmed',
            'subscription_type': subscription_type,
            'timestamp': datetime.utcnow().isoformat()
        }, connection_id)
        
        logger.info(f"Connection {connection_id} subscribed to {subscription_type}")
        return True
    
    async def unsubscribe(self, connection_id: str, subscription_type: str) -> bool:
        """Unsubscribe a connection from a specific data type"""
        if subscription_type in self.subscriptions:
            self.subscriptions[subscription_type].discard(connection_id)
            
            # Update connection metadata
            if connection_id in self.connection_metadata:
                self.connection_metadata[connection_id]['subscriptions'].discard(subscription_type)
            
            # Send confirmation
            await self.send_personal_message({
                'type': 'unsubscription_confirmed',
                'subscription_type': subscription_type,
                'timestamp': datetime.utcnow().isoformat()
            }, connection_id)
            
            logger.info(f"Connection {connection_id} unsubscribed from {subscription_type}")
            return True
        
        return False
    
    async def handle_message(self, connection_id: str, message: str):
        """Handle incoming WebSocket message"""
        try:
            data = json.loads(message)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.handle_ping(connection_id)
            elif message_type == 'subscribe':
                subscription_type = data.get('subscription_type')
                if subscription_type:
                    await self.subscribe(connection_id, subscription_type)
            elif message_type == 'unsubscribe':
                subscription_type = data.get('subscription_type')
                if subscription_type:
                    await self.unsubscribe(connection_id, subscription_type)
            elif message_type == 'get_status':
                await self.send_status(connection_id)
            else:
                await self.send_personal_message({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}',
                    'timestamp': datetime.utcnow().isoformat()
                }, connection_id)
                
        except json.JSONDecodeError:
            await self.send_personal_message({
                'type': 'error',
                'message': 'Invalid JSON format',
                'timestamp': datetime.utcnow().isoformat()
            }, connection_id)
        except Exception as e:
            logger.error(f"Error handling message from {connection_id}: {e}")
            await self.send_personal_message({
                'type': 'error',
                'message': 'Internal server error',
                'timestamp': datetime.utcnow().isoformat()
            }, connection_id)
    
    async def handle_ping(self, connection_id: str):
        """Handle ping message and update last ping time"""
        if connection_id in self.connection_metadata:
            self.connection_metadata[connection_id]['last_ping'] = datetime.utcnow()
        
        await self.send_personal_message({
            'type': 'pong',
            'timestamp': datetime.utcnow().isoformat()
        }, connection_id)
    
    async def send_status(self, connection_id: str):
        """Send connection status information"""
        if connection_id in self.connection_metadata:
            metadata = self.connection_metadata[connection_id]
            
            await self.send_personal_message({
                'type': 'status',
                'connection_id': connection_id,
                'connected_at': metadata['connected_at'].isoformat(),
                'last_ping': metadata['last_ping'].isoformat(),
                'subscriptions': list(metadata['subscriptions']),
                'total_connections': len(self.active_connections),
                'timestamp': datetime.utcnow().isoformat()
            }, connection_id)
    
    def get_connection_count(self) -> int:
        """Get total number of active connections"""
        return len(self.active_connections)
    
    def get_subscription_count(self, subscription_type: str) -> int:
        """Get number of subscribers for a specific type"""
        return len(self.subscriptions.get(subscription_type, set()))
    
    async def cleanup_stale_connections(self):
        """Remove connections that haven't pinged recently"""
        current_time = datetime.utcnow()
        stale_connections = []
        
        for connection_id, metadata in self.connection_metadata.items():
            last_ping = metadata['last_ping']
            if (current_time - last_ping).total_seconds() > 300:  # 5 minutes
                stale_connections.append(connection_id)
        
        for connection_id in stale_connections:
            logger.info(f"Removing stale connection: {connection_id}")
            self.disconnect(connection_id)
    
    async def start_background_tasks(self):
        """Start background maintenance tasks"""
        # Cleanup task
        cleanup_task = asyncio.create_task(self._periodic_cleanup())
        self.background_tasks.add(cleanup_task)
        cleanup_task.add_done_callback(self.background_tasks.discard)
        
        # Heartbeat task
        heartbeat_task = asyncio.create_task(self._periodic_heartbeat())
        self.background_tasks.add(heartbeat_task)
        heartbeat_task.add_done_callback(self.background_tasks.discard)
    
    async def _periodic_cleanup(self):
        """Periodic cleanup of stale connections"""
        while True:
            try:
                await asyncio.sleep(60)  # Run every minute
                await self.cleanup_stale_connections()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in periodic cleanup: {e}")
    
    async def _periodic_heartbeat(self):
        """Send periodic heartbeat to all connections"""
        while True:
            try:
                await asyncio.sleep(30)  # Send every 30 seconds
                
                heartbeat_message = {
                    'type': 'heartbeat',
                    'timestamp': datetime.utcnow().isoformat(),
                    'active_connections': len(self.active_connections)
                }
                
                # Send to all active connections
                for connection_id in list(self.active_connections.keys()):
                    await self.send_personal_message(heartbeat_message, connection_id)
                    
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in periodic heartbeat: {e}")


# Global connection manager instance
connection_manager = ConnectionManager()
