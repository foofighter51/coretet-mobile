#!/usr/bin/env python3
"""
Test if CoreTet Orchestra setup is working
"""
import os
import sys
from dotenv import load_dotenv
from pathlib import Path

# Get the directory of this file
SCRIPT_DIR = Path(__file__).parent.resolve()

# Load .env file from the orchestra directory explicitly
load_dotenv(SCRIPT_DIR / ".env")

print("🔍 CoreTet Orchestra - Setup Test\n")
print("="*60)

# Check 1: API Key
api_key = os.environ.get('ANTHROPIC_API_KEY')
if api_key:
    print(f"✅ API Key found (starts with: {api_key[:10]}...)")
else:
    print("❌ API Key NOT found")
    print("\nTo fix:")
    print("  export ANTHROPIC_API_KEY='your-key-here'")
    print("  OR add to ~/.zshrc:")
    print('  echo \'export ANTHROPIC_API_KEY="your-key"\' >> ~/.zshrc')
    sys.exit(1)

# Check 2: Anthropic package
try:
    import anthropic
    print("✅ anthropic package installed")
except ImportError:
    print("❌ anthropic package NOT installed")
    print("\nTo fix:")
    print("  pip install anthropic")
    sys.exit(1)

# Check 3: Claude client
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    from utils.claude_client import ClaudeClient
    print("✅ ClaudeClient utility loaded")
except Exception as e:
    print(f"❌ ClaudeClient error: {e}")
    sys.exit(1)

# Check 4: Test API call
try:
    print("\n🔌 Testing API connection...")
    client = ClaudeClient()
    response, _ = client.chat("Say 'ready' if you can hear me", max_tokens=100)
    print(f"✅ API working! Response: {response[:50]}...")
except Exception as e:
    print(f"❌ API test failed: {e}")
    sys.exit(1)

# Check 5: Orchestra
try:
    from coretet_orchestrator import CoreTetOrchestrator
    print("✅ CoreTet Orchestra loaded")
except Exception as e:
    print(f"❌ Orchestra error: {e}")
    sys.exit(1)

print("\n" + "="*60)
print("🎉 ALL CHECKS PASSED!")
print("\nYou're ready to use the Orchestra:")
print("  python start_orchestra.py")
print("="*60)
