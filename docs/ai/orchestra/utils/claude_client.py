"""
Simple Claude API client for CoreTet Orchestra
"""
import os
from typing import List, Dict, Tuple, Optional

try:
    from anthropic import Anthropic
except ImportError:
    print("Warning: anthropic package not installed. Run: pip install anthropic")
    Anthropic = None


class ClaudeClient:
    """Simplified Claude API client"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get('ANTHROPIC_API_KEY')
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment")

        if Anthropic is None:
            raise ImportError("anthropic package required. Run: pip install anthropic")

        self.client = Anthropic(api_key=self.api_key)
        self.model = "claude-sonnet-4-20250514"  # Latest model

    def chat(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        system_prompt: str = "",
        max_tokens: int = 4000
    ) -> Tuple[str, List[Dict[str, str]]]:
        """
        Send a message to Claude and get response

        Returns:
            Tuple of (response_text, updated_conversation_history)
        """
        if conversation_history is None:
            conversation_history = []

        # Build messages list
        messages = conversation_history.copy()
        messages.append({
            "role": "user",
            "content": user_message
        })

        # Call API
        kwargs = {
            "model": self.model,
            "max_tokens": max_tokens,
            "messages": messages
        }

        # Only add system if it's not empty
        if system_prompt:
            kwargs["system"] = system_prompt

        response = self.client.messages.create(**kwargs)

        # Extract response text
        response_text = ""
        for block in response.content:
            if hasattr(block, 'text'):
                response_text += block.text

        # Update conversation history
        messages.append({
            "role": "assistant",
            "content": response_text
        })

        return response_text, messages


if __name__ == "__main__":
    # Test
    try:
        client = ClaudeClient()
        response, _ = client.chat("Hello, can you hear me?")
        print("✅ Client working!")
        print(f"Response: {response[:100]}...")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nTo fix:")
        print("1. pip install anthropic")
        print("2. export ANTHROPIC_API_KEY='your-key'")
