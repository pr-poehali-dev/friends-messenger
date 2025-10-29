'''
Business: Получение списка пользователей и контактов
Args: event с httpMethod, queryStringParameters (userId)
Returns: HTTP response со списком пользователей
'''

import json
import os
from typing import Dict, Any
import psycopg2
from datetime import datetime

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
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        current_user_id = params.get('userId', '')
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute(
            "SELECT id, username, first_name, last_name, avatar_url, role, is_friend, is_online, last_seen FROM users ORDER BY is_online DESC, last_seen DESC"
        )
        users = cur.fetchall()
        
        result = []
        for user in users:
            result.append({
                'id': str(user[0]),
                'username': user[1],
                'firstName': user[2],
                'lastName': user[3],
                'avatar': user[4],
                'role': user[5],
                'isFriend': user[6],
                'isOnline': user[7],
                'lastSeen': user[8].isoformat() if user[8] else None
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
