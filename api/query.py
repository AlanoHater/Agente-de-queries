"""
Función serverless para procesar consultas SQL mediante lenguaje natural.
Compatible con Vercel Serverless Functions.
"""

import os
import json
from http.server import BaseHTTPRequestHandler
from langchain_openai import ChatOpenAI
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from sqlalchemy.pool import NullPool

class handler(BaseHTTPRequestHandler):
    """Handler para Vercel Serverless Functions"""
    
    def _set_headers(self, status=200):
        """Configura los headers CORS y el tipo de contenido"""
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        """Maneja las peticiones OPTIONS para CORS preflight"""
        self._set_headers(204)
    
    def do_POST(self):
        """Procesa las peticiones POST con consultas en lenguaje natural"""
        try:
            # Leer el cuerpo de la petición
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            user_query = data.get('query', '').strip()
            
            if not user_query:
                self._set_headers(400)
                response = {
                    'output': 'Error: No se recibió ninguna consulta válida.',
                    'error': True
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return
            
            # Validar variables de entorno
            db_url = os.getenv('SUPABASE_DB_URL')
            api_key = os.getenv('OPENAI_API_KEY')
            
            if not db_url or not api_key:
                self._set_headers(500)
                response = {
                    'output': 'Error de configuración: Faltan variables de entorno necesarias.',
                    'error': True
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return
            
            # Configurar conexión a la base de datos
            db = SQLDatabase.from_uri(
                db_url,
                sample_rows_in_table_info=3,
                engine_args={"poolclass": NullPool}
            )
            
            # Configurar el modelo de lenguaje
            llm = ChatOpenAI(
                model="gpt-5-nano",
                openai_api_key=api_key
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
            
            # Enviar respuesta exitosa
            self._set_headers(200)
            response = {
                'output': result.get('output', 'No se obtuvo respuesta del agente.'),
                'error': False
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            # Manejo de errores
            self._set_headers(500)
            response = {
                'output': f'Error al procesar la consulta: {str(e)}',
                'error': True
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
