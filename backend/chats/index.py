'''
Business: Получение списка чатов пользователя с последними сообщениями
Args: event с queryStringParameters (userId)
Returns: HTTP response со списком чатов
'''

import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('userId', '')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'userId required'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute(
            """WITH chat_contacts AS (
                   SELECT DISTINCT 
                       CASE 
                           WHEN m.sender_id = %s THEN m.receiver_id 
                           ELSE m.sender_id 
                       END as contact_id
                   FROM messages m
                   WHERE m.sender_id = %s OR m.receiver_id = %s
               )
               SELECT 
                   cc.contact_id,
                   u.username, u.first_name, u.last_name, u.avatar_url, u.role, u.is_friend, u.is_online, u.last_seen,
                   (SELECT message_text FROM messages 
                    WHERE (sender_id = %s AND receiver_id = cc.contact_id) OR (sender_id = cc.contact_id AND receiver_id = %s)
                    ORDER BY created_at DESC LIMIT 1) as last_message,
                   (SELECT created_at FROM messages 
                    WHERE (sender_id = %s AND receiver_id = cc.contact_id) OR (sender_id = cc.contact_id AND receiver_id = %s)
                    ORDER BY created_at DESC LIMIT 1) as last_message_time
               FROM chat_contacts cc
               JOIN users u ON u.id = cc.contact_id
               ORDER BY last_message_time DESC""",
            (int(user_id), int(user_id), int(user_id), int(user_id), int(user_id), int(user_id), int(user_id))
        )
        chats = cur.fetchall()
        
        result = []
        for chat in chats:
            result.append({
                'id': str(chat[0]),
                'userId': str(chat[0]),
                'username': chat[1],
                'firstName': chat[2],
                'lastName': chat[3],
                'avatar': chat[4],
                'role': chat[5],
                'isFriend': chat[6],
                'isOnline': chat[7],
                'lastSeen': chat[8].isoformat() if chat[8] else None,
                'lastMessage': chat[9],
                'lastMessageTime': chat[10].isoformat() if chat[10] else None
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }