#!/usr/bin/env python3
import os
import subprocess
import json

def run_command(cmd):
    """Executa comando e retorna resultado"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
        return result.stdout, result.stderr, result.returncode
    except subprocess.TimeoutExpired:
        return "", "Timeout", 1
    except Exception as e:
        return "", str(e), 1

def check_node_environment():
    """Verifica ambiente Node.js"""
    print("🔍 DIAGNÓSTICO DO AMBIENTE NODE.JS")
    print("=" * 50)
    
    # Verificar Node.js
    stdout, stderr, code = run_command("node --version")
    if code == 0:
        print(f"✅ Node.js: {stdout.strip()}")
    else:
        print(f"❌ Node.js não encontrado: {stderr}")
        return False
    
    # Verificar npm
    stdout, stderr, code = run_command("npm --version")
    if code == 0:
        print(f"✅ NPM: {stdout.strip()}")
    else:
        print(f"❌ NPM não encontrado: {stderr}")
        return False
    
    return True

def check_project_structure():
    """Verifica estrutura do projeto"""
    print("\n📁 ESTRUTURA DO PROJETO")
    print("=" * 50)
    
    base_dir = "/workspaces/Whats-17-06"
    
    # Verificar arquivos principais
    files_to_check = [
        "package.json",
        ".env",
        "src/index.js",
        "src/config.js",
        "src/database.js",
        "data/",
        "logs/"
    ]
    
    for file_path in files_to_check:
        full_path = os.path.join(base_dir, file_path)
        if os.path.exists(full_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path}")
    
    # Verificar node_modules
    node_modules = os.path.join(base_dir, "node_modules")
    if os.path.exists(node_modules):
        modules_count = len(os.listdir(node_modules))
        print(f"✅ node_modules/ ({modules_count} módulos)")
    else:
        print("❌ node_modules/ não encontrado")
        return False
    
    return True

def check_env_variables():
    """Verifica variáveis de ambiente"""
    print("\n🔧 VARIÁVEIS DE AMBIENTE")
    print("=" * 50)
    
    env_file = "/workspaces/Whats-17-06/.env"
    if os.path.exists(env_file):
        print("✅ Arquivo .env encontrado")
        try:
            with open(env_file, 'r') as f:
                content = f.read()
                # Procurar por variáveis importantes
                important_vars = ["COMMAND_PREFIX", "ADMIN_WHATSAPP_IDS", "DB_PATH"]
                for var in important_vars:
                    if var in content:
                        print(f"✅ {var} definido")
                    else:
                        print(f"❌ {var} não encontrado")
        except Exception as e:
            print(f"❌ Erro ao ler .env: {e}")
    else:
        print("❌ Arquivo .env não encontrado")

def test_node_execution():
    """Testa execução básica do Node.js"""
    print("\n⚡ TESTE DE EXECUÇÃO NODE.JS")
    print("=" * 50)
    
    os.chdir("/workspaces/Whats-17-06")
    
    # Teste básico
    test_cmd = "node -e \"console.log('Node.js funcionando'); process.exit(0);\""
    stdout, stderr, code = run_command(test_cmd)
    
    if code == 0:
        print("✅ Execução básica do Node.js: OK")
    else:
        print(f"❌ Problema na execução: {stderr}")
        return False
    
    # Teste de carregamento de módulos
    test_dotenv = "node -e \"require('dotenv').config(); console.log('Dotenv carregado');\""
    stdout, stderr, code = run_command(test_dotenv)
    
    if code == 0:
        print("✅ Carregamento dotenv: OK")
    else:
        print(f"❌ Erro dotenv: {stderr}")
    
    # Teste do banco SQLite
    test_sqlite = "node -e \"const sqlite3 = require('sqlite3'); console.log('SQLite3 carregado');\""
    stdout, stderr, code = run_command(test_sqlite)
    
    if code == 0:
        print("✅ SQLite3: OK")
    else:
        print(f"❌ Erro SQLite3: {stderr}")
    
    return True

def main():
    print("🚀 DIAGNÓSTICO COMPLETO DO SISTEMA WHATSAPP BOT")
    print("=" * 60)
    
    try:
        # 1. Verificar ambiente Node.js
        if not check_node_environment():
            print("\n❌ Ambiente Node.js com problemas!")
            return
        
        # 2. Verificar estrutura do projeto
        if not check_project_structure():
            print("\n❌ Estrutura do projeto incompleta!")
        
        # 3. Verificar variáveis de ambiente
        check_env_variables()
        
        # 4. Testar execução
        if not test_node_execution():
            print("\n❌ Problemas na execução do Node.js!")
            return
        
        print("\n✅ DIAGNÓSTICO CONCLUÍDO - Sistema pronto para execução!")
        
    except Exception as e:
        print(f"\n❌ Erro no diagnóstico: {e}")

if __name__ == "__main__":
    main()
