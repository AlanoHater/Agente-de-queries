import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Any
from langchain_community.utilities import SQLDatabase
from langchain_openai import ChatOpenAI
from langchain_community.agent_toolkits import create_sql_agent
from langchain.agents.agent_types import AgentType
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuración
SUPABASE_URI = os.getenv("SUPABASE_DB_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Inicialización de DB y LLM
db = SQLDatabase.from_uri(SUPABASE_URI, sample_rows_in_table_info=3)
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    max_tokens=1000,
    openai_api_key=OPENAI_API_KEY
)

SQL_PREFIX = """Eres un experto SQL en PostgreSQL/Supabase con pgvector.
REGLAS Estrictas:
1. SOLO SELECT y COUNT(*). NUNCA INSERT/UPDATE/DELETE/DROP/TRUNCATE
2. SIEMPRE LIMIT 10 máximo
3. Valida ANTES de ejecutar con sql_db_query_checker
4. Empieza con sql_db_list_tables → sql_db_schema de tablas relevantes
5. Si pgvector, usa <-> para similarity
6. Explica query en español al final
Responder en español con tabla formateada."""

def get_agent():
    return create_sql_agent(
        llm=llm,
        db=db,
        prefix=SQL_PREFIX,
        verbose=False,
        agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        max_iterations=6,
        return_intermediate_steps=True
    )

@app.route("/api/index", methods=["POST"])
def query_agent():
    try:
        data = request.json
        user_query = data.get("query")
        
        if not user_query:
            return jsonify({"error": "No query provided"}), 400

        agent = get_agent()
        result = agent.invoke({"input": user_query})
        
        return jsonify({
            "output": result["output"],
            "status": "success"
        })

    except Exception as e:
        return jsonify({
            "output": f"Error: {str(e)}",
            "status": "error"
        }), 500

# Requerido para Vercel
app.debug = False
