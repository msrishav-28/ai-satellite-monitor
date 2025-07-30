"""
WebSocket endpoints for real-time data streaming
"""

import asyncio
import logging
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.websocket.manager import connection_manager
from app.services.realtime_data import RealtimeDataService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    client_id: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Main WebSocket endpoint for real-time data streaming
    
    Supports subscriptions to:
    - environmental: Real-time weather and AQI updates
    - hazards: Hazard analysis updates and alerts
    - alerts: Emergency alerts and warnings
    - timelapse_progress: Time-lapse generation progress
    - satellite_updates: New satellite data availability
    """
    connection_id = None
    
    try:
        # Establish connection
        connection_id = await connection_manager.connect(websocket, client_id)
        
        # Start background data streaming if this is the first connection
        if connection_manager.get_connection_count() == 1:
            await connection_manager.start_background_tasks()
            await start_data_streaming(db)
        
        # Handle incoming messages
        while True:
            try:
                # Wait for message with timeout
                message = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                await connection_manager.handle_message(connection_id, message)
                
            except asyncio.TimeoutError:
                # Send ping to check if connection is still alive
                await connection_manager.send_personal_message({
                    'type': 'ping_request',
                    'timestamp': datetime.utcnow().isoformat() + 'Z'
                }, connection_id)
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {connection_id}")
    except Exception as e:
        logger.error(f"WebSocket error for {connection_id}: {e}")
    finally:
        if connection_id:
            connection_manager.disconnect(connection_id)


async def start_data_streaming(db: AsyncSession):
    """Start background data streaming tasks"""
    try:
        realtime_service = RealtimeDataService(db)
        
        # Start environmental data streaming
        asyncio.create_task(stream_environmental_data(realtime_service))
        
        # Start hazard monitoring
        asyncio.create_task(stream_hazard_updates(realtime_service))
        
        # Start alert monitoring
        asyncio.create_task(stream_alerts(realtime_service))
        
        logger.info("Real-time data streaming started")
        
    except Exception as e:
        logger.error(f"Error starting data streaming: {e}")


async def stream_environmental_data(service: RealtimeDataService):
    """Stream real-time environmental data updates"""
    while True:
        try:
            # Check if there are subscribers
            if connection_manager.get_subscription_count('environmental') > 0:
                # Get latest environmental data for popular locations
                updates = await service.get_environmental_updates()
                
                for update in updates:
                    await connection_manager.broadcast_to_subscribers({
                        'type': 'environmental_update',
                        'data': update
                    }, 'environmental')
            
            # Wait 5 minutes before next update
            await asyncio.sleep(300)
            
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in environmental data streaming: {e}")
            await asyncio.sleep(60)  # Wait 1 minute before retry


async def stream_hazard_updates(service: RealtimeDataService):
    """Stream hazard analysis updates and alerts"""
    while True:
        try:
            # Check if there are subscribers
            if connection_manager.get_subscription_count('hazards') > 0:
                # Get latest hazard updates
                updates = await service.get_hazard_updates()
                
                for update in updates:
                    await connection_manager.broadcast_to_subscribers({
                        'type': 'hazard_update',
                        'data': update
                    }, 'hazards')
            
            # Wait 10 minutes before next update
            await asyncio.sleep(600)
            
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in hazard updates streaming: {e}")
            await asyncio.sleep(120)  # Wait 2 minutes before retry


async def stream_alerts(service: RealtimeDataService):
    """Stream emergency alerts and warnings"""
    while True:
        try:
            # Check if there are subscribers
            if connection_manager.get_subscription_count('alerts') > 0:
                # Get latest alerts
                alerts = await service.get_active_alerts()
                
                for alert in alerts:
                    await connection_manager.broadcast_to_subscribers({
                        'type': 'alert',
                        'data': alert
                    }, 'alerts')
            
            # Wait 2 minutes before next check
            await asyncio.sleep(120)
            
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in alerts streaming: {e}")
            await asyncio.sleep(60)  # Wait 1 minute before retry


@router.websocket("/ws/timelapse/{request_id}")
async def timelapse_progress_websocket(
    websocket: WebSocket,
    request_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    WebSocket endpoint for time-lapse generation progress updates
    """
    connection_id = None
    
    try:
        # Establish connection
        connection_id = await connection_manager.connect(websocket, f"timelapse_{request_id}")
        
        # Subscribe to timelapse progress updates
        await connection_manager.subscribe(connection_id, 'timelapse_progress')
        
        # Send initial status
        await connection_manager.send_personal_message({
            'type': 'timelapse_status',
            'request_id': request_id,
            'status': 'monitoring',
            'message': 'Connected to time-lapse progress updates'
        }, connection_id)
        
        # Start monitoring this specific timelapse request
        await monitor_timelapse_progress(request_id, connection_id, db)
        
    except WebSocketDisconnect:
        logger.info(f"Time-lapse WebSocket disconnected: {connection_id}")
    except Exception as e:
        logger.error(f"Time-lapse WebSocket error: {e}")
    finally:
        if connection_id:
            connection_manager.disconnect(connection_id)


async def monitor_timelapse_progress(request_id: str, connection_id: str, db: AsyncSession):
    """Monitor progress of a specific time-lapse generation"""
    try:
        # Simulate time-lapse processing stages
        stages = [
            ("Initializing", 5),
            ("Querying satellite imagery", 15),
            ("Downloading images", 25),
            ("Processing and alignment", 45),
            ("Generating frames", 65),
            ("Creating video", 80),
            ("Finalizing", 95),
            ("Complete", 100)
        ]
        
        for stage_name, progress in stages:
            await connection_manager.send_personal_message({
                'type': 'timelapse_progress',
                'request_id': request_id,
                'stage': stage_name,
                'progress': progress,
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }, connection_id)
            
            # Simulate processing time
            await asyncio.sleep(5)
            
            # Break if connection is closed
            if connection_id not in connection_manager.active_connections:
                break
        
        # Send completion message
        if connection_id in connection_manager.active_connections:
            await connection_manager.send_personal_message({
                'type': 'timelapse_complete',
                'request_id': request_id,
                'video_url': f'https://storage.example.com/timelapses/{request_id}.mp4',
                'thumbnail_url': f'https://storage.example.com/timelapses/{request_id}_thumb.jpg'
            }, connection_id)
        
    except Exception as e:
        logger.error(f"Error monitoring time-lapse progress: {e}")
        if connection_id in connection_manager.active_connections:
            await connection_manager.send_personal_message({
                'type': 'timelapse_error',
                'request_id': request_id,
                'error': str(e)
            }, connection_id)


@router.get("/ws/status")
async def websocket_status():
    """
    Get WebSocket connection status and statistics
    """
    try:
        status = {
            'total_connections': connection_manager.get_connection_count(),
            'subscriptions': {
                subscription_type: connection_manager.get_subscription_count(subscription_type)
                for subscription_type in connection_manager.subscriptions.keys()
            },
            'status': 'operational' if connection_manager.get_connection_count() > 0 else 'idle',
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

        return {
            'success': True,
            'message': 'WebSocket status retrieved successfully',
            'data': status
        }

    except Exception as e:
        logger.error(f"Error getting WebSocket status: {e}")
        return {
            'success': False,
            'error': str(e),
            'data': None
        }
