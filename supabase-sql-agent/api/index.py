import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_community.utilities import SQLDatabase
from langchain_openai import ChatOpenAI
from langchain_community.agent_toolkits import create_sql_agent
from langchain.agents.agent_types import AgentType
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuración de recursos
db = SQLDatabase.from_uri(os.getenv("SUPABASE_DB_URL"), sample_rows_in_table_info=3)
llm = ChatOpenAI(
    model="gpt-4o-mini", 
    temperature=0,
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

SQL_PREFIX = """Eres un experto SQL en PostgreSQL. 
Responde siempre en español. 
SOLO realiza operaciones SELECT. 
Máximo 10 resultados."""

agent = create_sql_agent(
    llm=llm,
    db=db,
    prefix=SQL_PREFIX,
    agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=False
)

@app.route("/api/index", methods=["POST"])
def query_agent():
    try:
        data = request.get_json()
        query = data.get("query")
        
        if not query:
            return jsonify({"output": "No se proporcionó ninguna consulta."}), 400

        result = agent.invoke({"input": query})
        
        # Formato exacto requerido por App.tsx
        return jsonify({"output": result["output"]})

    except Exception as e:
        return jsonify({"output": f"Error del servidor: {str(e)}"}), 500
