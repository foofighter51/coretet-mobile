#!/usr/bin/env python3
"""
Quick Setup Script for Music App Orchestrator

This script helps you get started with the orchestrator system.
"""
import os
import sys


def check_requirements():
    """Check if required packages are installed"""
    try:
        import anthropic
        print("✅ anthropic package installed")
        return True
    except ImportError:
        print("❌ anthropic package not found")
        print("   Install with: pip install anthropic")
        return False


def check_api_key():
    """Check if API key is set"""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if api_key:
        print("✅ ANTHROPIC_API_KEY is set")
        return True
    else:
        print("❌ ANTHROPIC_API_KEY not found")
        print("   Set it with: export ANTHROPIC_API_KEY='your-key-here'")
        print("   Or add it to your .env file")
        return False


def create_env_file():
    """Create a .env file template"""
    if os.path.exists(".env"):
        print("ℹ️  .env file already exists")
        return
    
    with open(".env", "w") as f:
        f.write("# Anthropic API Configuration\n")
        f.write("ANTHROPIC_API_KEY=your_api_key_here\n")
    
    print("✅ Created .env template")
    print("   Edit .env and add your API key")


def test_orchestrator():
    """Test the orchestrator with a simple request"""
    print("\n" + "="*60)
    print("Testing Orchestrator...")
    print("="*60)
    
    try:
        from music_app_orchestrator import MusicAppOrchestrator
        
        orchestrator = MusicAppOrchestrator()
        
        print("\n🧪 Running test query...")
        response = orchestrator.process_request(
            "What are the key features of our music collaboration app?",
            verbose=False
        )
        
        print(f"\n✅ Orchestrator is working!\n")
        print("Sample response:")
        print("-" * 60)
        print(response[:300] + "...")
        print("-" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error testing orchestrator: {e}")
        return False


def show_quick_start():
    """Show quick start examples"""
    print("\n" + "="*60)
    print("QUICK START EXAMPLES")
    print("="*60)
    
    examples = [
        ("Simple question", 
         'orchestrator.process_request("What audio format should I use?")'),
        
        ("Design a feature",
         'orchestrator.process_request("Design the version tracking feature")'),
        
        ("Get implementation code",
         'orchestrator.process_request("Implement an audio player in React Native")'),
        
        ("Architecture decision",
         'orchestrator.process_request("What database should I use for track metadata?")'),
        
        ("Interactive mode",
         'python music_app_examples.py  # Then choose option "i"')
    ]
    
    for i, (title, code) in enumerate(examples, 1):
        print(f"\n{i}. {title}:")
        print(f"   {code}")
    
    print("\n" + "="*60)
    print("Run 'python music_app_examples.py' for more examples")
    print("See MUSIC_APP_GUIDE.md for comprehensive documentation")
    print("="*60)


def create_sample_script():
    """Create a sample script for users to start with"""
    sample_code = '''#!/usr/bin/env python3
"""
My Music App Development - Custom Script

Use this as a starting point for your development sessions.
"""
from music_app_orchestrator import MusicAppOrchestrator


def main():
    # Initialize orchestrator
    orchestrator = MusicAppOrchestrator()
    
    # Example: Design phase
    print("\\n=== DESIGNING DATA MODEL ===")
    response = orchestrator.process_request("""
        Design the database schema for:
        - User accounts and bands
        - Audio tracks with metadata
        - Version relationships
        - Playlists
        - Comments and ratings
    """)
    print(response)
    
    # Reset for next phase
    orchestrator.reset_all()
    
    # Example: Implementation phase
    print("\\n\\n=== IMPLEMENTING FEATURE ===")
    response = orchestrator.process_request("""
        Implement an audio player component in React Native with:
        - Play/pause controls
        - Seek bar
        - Background audio support
        - Waveform visualization
    """)
    print(response)
    
    # Add your own requests below
    # orchestrator.reset_all()
    # response = orchestrator.process_request("Your question here")
    # print(response)


if __name__ == "__main__":
    main()
'''
    
    filename = "my_development_session.py"
    if os.path.exists(filename):
        print(f"ℹ️  {filename} already exists")
        return
    
    with open(filename, "w") as f:
        f.write(sample_code)
    
    print(f"✅ Created {filename}")
    print(f"   Edit and run with: python {filename}")


def main():
    """Main setup function"""
    print("""
╔══════════════════════════════════════════════════════════════════╗
║   Music Collaboration App - Orchestrator Setup                   ║
╚══════════════════════════════════════════════════════════════════╝
    """)
    
    # Check requirements
    print("Checking requirements...")
    print("-" * 60)
    
    requirements_ok = check_requirements()
    api_key_ok = check_api_key()
    
    print("-" * 60)
    
    if not requirements_ok:
        print("\n⚠️  Please install required packages:")
        print("   pip install anthropic python-dotenv")
        sys.exit(1)
    
    if not api_key_ok:
        print("\n⚠️  Please set your API key before continuing")
        create_env_file()
        sys.exit(1)
    
    print("\n✅ All requirements met!")
    
    # Create helper files
    print("\nSetting up helper files...")
    create_env_file()
    create_sample_script()
    
    # Test orchestrator
    if test_orchestrator():
        show_quick_start()
        
        print("\n" + "="*60)
        print("🎉 Setup complete! You're ready to start building.")
        print("="*60)
        
        print("\nNext steps:")
        print("1. Read MUSIC_APP_GUIDE.md for comprehensive documentation")
        print("2. Run: python music_app_examples.py")
        print("3. Edit and run: python my_development_session.py")
        print("4. Start developing your app!")
    else:
        print("\n⚠️  Setup incomplete. Please check errors above.")


if __name__ == "__main__":
    main()
