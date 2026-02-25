import requests
import json
import sys
import os

N8N_URL = "https://n8n.olamundodigital.cloud"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3N2IzMWEwMC0yMmI1LTQxZTMtYjZjMy0xNWNkMDUxZTcxNzAiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMzJmZGJjYTQtOTJmYi00ZjkzLTkxOTktODc5ZjY1NzViZWNiIiwiaWF0IjoxNzcyMDU1NzQ3fQ.FCulXPgnQsjvGJ1YVu5EYZozaOR4yUs5QgD5kohGLtc"

def push_workflow(file_path):
    with open(file_path, 'r') as f:
        full_data = json.load(f)
    
    # Filtrar apenas campos aceitos pela API de criação
    workflow_data = {
        "name": full_data.get("name", "Novo Workflow"),
        "nodes": full_data.get("nodes", []),
        "connections": full_data.get("connections", {}),
        "settings": full_data.get("settings", {}),
        "staticData": full_data.get("staticData", None)
    }
    
    headers = {
        "X-N8N-API-KEY": API_KEY,
        "Content-Type": "application/json"
    }
    
    response = requests.post(f"{N8N_URL}/api/v1/workflows", headers=headers, json=workflow_data)
    
    if response.status_code == 200 or response.status_code == 201:
        print(f"✅ Workflow '{workflow_data['name']}' enviado com sucesso!")
        return True
    else:
        print(f"❌ Erro ao enviar workflow: {response.status_code}")
        print(response.text)
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python push_n8n.py <caminho_do_json>")
    else:
        push_workflow(sys.argv[1])
