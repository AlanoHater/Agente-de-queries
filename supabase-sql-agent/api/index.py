import os
from langchain_openai import ChatOpenAI
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_community.utilities import SQLDatabase
from langchain_openai import ChatOpenAI
from langchain_community.agent_toolkits import create_sql_agent
from langchain.agents.agent_types import AgentType
from dotenv import load_dotenv

# Carga de variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuración de base de datos Supabase
# Asegúrate de configurar SUPABASE_DB_URL en el dashboard de Vercel
db = SQLDatabase.from_uri(
    os.getenv("SUPABASE_DB_URL"), 
    sample_rows_in_table_info=3
)

# Configuración de GPT-5 Nano
# Modelo optimizado para baja latencia y alta eficiencia
llm = ChatOpenAI(
    model="gpt-5-nano", 
    temperature=0,
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# Definición del comportamiento del agente
SQL_PREFIX = """Eres un experto SQL en PostgreSQL/Supabase.
REGLAS:
1. SOLO SELECT y COUNT(*). Prohibido INSERT, UPDATE, DELETE, DROP.
2. SIEMPRE aplica LIMIT 10 si la consulta no tiene uno.
3. Responde siempre en español.
4. Si se requiere búsqueda semántica, usa operadores de pgvector (<->).
5. Explica brevemente el resultado al final."""

# Inicialización del agente
agent = create_sql_agent(
    llm=llm,
    db=db,
    prefix=SQL_PREFIX,
    agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
    handle_parsing_errors=True
)

@app.route("/api/index", methods=["POST"])
def query_agent():
    """
    Endpoint principal para procesar consultas de lenguaje natural a SQL.
    Coincide con la ruta fetch('/api/index') definida en App.tsx.
    """
    try:
        data = request.get_json()
        user_query = data.get("query")
        
        if not user_query:
            return jsonify({"output": "Error: No se recibió ninguna consulta."}), 400

        # Ejecución del agente
        result = agent.invoke({"input": user_query})
        
        # Estructura de respuesta requerida por el frontend (data.output)
        return jsonify({
            "output": result["output"]
        })

    except Exception as e:
        # Manejo de errores técnicos
        return jsonify({
            "output": f"❌ Error técnico: {str(e)}\nPor favor, verifica la conexión con la base de datos o el estado de la API."
        }), 500

# Requerido para el entorno serverless de Vercel
app.debug = False
