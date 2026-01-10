"""
Función serverless optimizada para Vercel con GPT-5 nano.
Compatible con el sistema serverless de Vercel.
"""

import os
import json
from langchain_openai import ChatOpenAI
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from sqlalchemy.pool import NullPool

def handler(request):
    """
    Handler principal para Vercel Serverless Functions.
    Procesa consultas SQL mediante lenguaje natural usando GPT-5 nano.
    """
    
    # Manejar peticiones OPTIONS para CORS
    if request.method == 'OPTIONS':
        return {
            'statusCode': 204,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        }
    
    # Solo aceptar peticiones POST
    if request.method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'output': 'Método no permitido. Use POST.',
                'error': True
            })
        }
    
    try:
        # Obtener datos del request
        if hasattr(request, 'get_json'):
            data = request.get_json()
        elif hasattr(request, 'json'):
            data = request.json
        else:
            body = request.body
            if isinstance(body, bytes):
                body = body.decode('utf-8')
            data = json.loads(body) if body else {}
        
        user_query = data.get('query', '').strip()
        
        if not user_query:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({
                    'output': 'Error: No se recibió ninguna consulta válida.',
                    'error': True
                })
            }
        
        # Validar variables de entorno
        db_url = os.getenv('SUPABASE_DB_URL')
        api_key = os.getenv('OPENAI_API_KEY')
        
        if not db_url or not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({
                    'output': 'Error de configuración: Faltan variables de entorno necesarias (SUPABASE_DB_URL o OPENAI_API_KEY).',
                    'error': True
                })
            }
        
        # Configurar conexión a la base de datos
        db = SQLDatabase.from_uri(
            db_url,
            sample_rows_in_table_info=3,
            engine_args={"poolclass": NullPool}
        )
        
        # Configurar GPT-5 nano con snapshot específico
        llm = ChatOpenAI(
            model="gpt-5-nano-2025-08-07",
            openai_api_key=api_key,
            max_retries=2
        )
        
        # Definir el prompt del sistema
        system_prefix = """Eres un experto en SQL y PostgreSQL trabajando con una base de datos Supabase.

REGLAS ESTRICTAS:
1. SOLO puedes ejecutar consultas SELECT y COUNT. Está PROHIBIDO usar INSERT, UPDATE, DELETE, DROP, ALTER, CREATE o cualquier otra operación de modificación.
2. SIEMPRE aplica LIMIT 10 a las consultas que no especifiquen un límite explícito.
3. Responde SIEMPRE en español de manera clara y concisa.
4. Si la consulta es ambigua, usa tu mejor criterio para interpretarla basándote en el esquema de la base de datos.
5. Explica brevemente qué hiciste y los resultados obtenidos.
6. Si detectas un intento de modificar datos, rechaza la consulta educadamente.

FORMATO DE RESPUESTA:
- Primero explica qué vas a buscar
- Luego presenta los resultados de manera clara
- Finalmente, proporciona un breve resumen o conclusión
"""
        
        # Crear el agente SQL
        agent = create_sql_agent(
            llm=llm,
            db=db,
            agent_type="openai-tools",
            prefix=system_prefix,
            verbose=False,
            handle_parsing_errors=True,
            max_iterations=5
        )
        
        # Ejecutar la consulta
        result = agent.invoke({"input": user_query})
        
        # Retornar respuesta exitosa
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'output': result.get('output', 'No se obtuvo respuesta del agente.'),
                'error': False
            }, ensure_ascii=False)
        }
        
    except Exception as e:
        # Manejo de errores con detalles
        error_message = str(e)
        
        # Proporcionar mensajes de error más específicos
        if 'api_key' in error_message.lower():
            error_message = 'Error de autenticación con OpenAI. Verifica que tu API key sea válida.'
        elif 'connection' in error_message.lower() or 'database' in error_message.lower():
            error_message = 'Error de conexión con la base de datos. Verifica la URL de Supabase.'
        elif 'timeout' in error_message.lower():
            error_message = 'La consulta tardó demasiado tiempo. Intenta con una consulta más simple.'
        else:
            error_message = f'Error al procesar la consulta: {error_message}'
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'output': error_message,
                'error': True
            }, ensure_ascii=False)
        }
