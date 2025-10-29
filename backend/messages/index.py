'''
Business: Отправка и получение сообщений между пользователями
Args: event с httpMethod, body (senderId, receiverId, text) для POST, queryStringParameters (userId, contactId) для GET
Returns: HTTP response с сообщениями или статусом отправки
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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('userId', '')
        contact_id = params.get('contactId', '')
        
        if not user_id or not contact_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'userId and contactId required'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            """SELECT id, sender_id, receiver_id, message_text, created_at, is_read 
               FROM messages 
               WHERE (sender_id = %s AND receiver_id = %s) OR (sender_id = %s AND receiver_id = %s)
               ORDER BY created_at ASC""",
            (int(user_id), int(contact_id), int(contact_id), int(user_id))
        )
        messages = cur.fetchall()
        
        result = []
        for msg in messages:
            result.append({
                'id': str(msg[0]),
                'senderId': str(msg[1]),
                'receiverId': str(msg[2]),
                'text': msg[3],
                'timestamp': msg[4].isoformat() if msg[4] else None,
                'isRead': msg[5]
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        sender_id = body_data.get('senderId', '')
        receiver_id = body_data.get('receiverId', '')
        text = body_data.get('text', '')
        
        if not sender_id or not receiver_id or not text:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'senderId, receiverId and text required'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            "INSERT INTO messages (sender_id, receiver_id, message_text) VALUES (%s, %s, %s) RETURNING id, created_at",
            (int(sender_id), int(receiver_id), text)
        )
        new_msg = cur.fetchone()
        conn.commit()
        
        result = {
            'id': str(new_msg[0]),
            'senderId': sender_id,
            'receiverId': receiver_id,
            'text': text,
            'timestamp': new_msg[1].isoformat(),
            'isRead': False
        }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
