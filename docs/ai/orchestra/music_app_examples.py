"""
Music App Orchestrator - Example Scenarios and Usage Guide

This demonstrates how to use the orchestrator for different aspects of
building the music collaboration app.
"""
from music_app_orchestrator import MusicAppOrchestrator
import os


def scenario_1_feature_design():
    """
    Scenario: Designing a new feature from scratch
    Agents involved: uiux, collab, data, security
    """
    print("\n" + "="*70)
    print("SCENARIO 1: Designing the Version Tracking Feature")
    print("="*70)
    
    orchestrator = MusicAppOrchestrator()
    
    request = """
    I want to implement version tracking for songs. When someone uploads a new
    recording of the same song, it should be linked to previous versions. Users
    should be able to:
    - See a version history/tree
    - Compare versions side-by-side
    - See what changed (comments from the uploader)
    - Jump between versions easily
    
    How should this feature work from UX, data modeling, and implementation perspectives?
    """
    
    response = orchestrator.process_request(request)
    print(response)
    
    print("\n📊 Agents Used:")
    for task in orchestrator.get_task_log():
        print(f"  - {task['agent']}: {task['task'][:60]}...")
    
    return orchestrator


def scenario_2_technical_implementation():
    """
    Scenario: Implementing specific technical functionality
    Agents involved: mobile, audio, backend
    """
    print("\n" + "="*70)
    print("SCENARIO 2: Implementing Audio Playback with Waveforms")
    print("="*70)
    
    orchestrator = MusicAppOrchestrator()
    
    request = """
    I need to implement the audio player with waveform visualization. Requirements:
    - Display waveform of the entire track
    - Allow users to tap/drag on waveform to jump to that position
    - Support background playback
    - Show timestamps where comments were left
    - Handle both streaming and local playback
    
    What's the best approach for React Native?
    """
    
    response = orchestrator.process_request(request)
    print(response)
    
    orchestrator.reset_all()
    
    # Follow-up question
    followup = """
    Based on that recommendation, can you provide sample code for the waveform
    component with touch interaction?
    """
    
    print("\n" + "-"*70)
    print("FOLLOW-UP:")
    print("-"*70)
    
    followup_response = orchestrator.process_request(followup)
    print(followup_response)
    
    return orchestrator


def scenario_3_architecture_decision():
    """
    Scenario: Making architectural decisions
    Agents involved: backend, data, devops, security
    """
    print("\n" + "="*70)
    print("SCENARIO 3: Choosing Database and Storage Architecture")
    print("="*70)
    
    orchestrator = MusicAppOrchestrator()
    
    request = """
    I need to decide on the database and file storage architecture. Considerations:
    - Store user data, tracks, playlists, comments, ratings, relationships
    - Handle large audio files (10MB - 100MB each)
    - Support complex relationships (version trees, user connections)
    - Need good search capabilities
    - Must scale to thousands of users
    - Keep costs reasonable
    
    What would you recommend for database(s) and file storage?
    """
    
    response = orchestrator.process_request(request)
    print(response)
    
    return orchestrator


def scenario_4_specific_component():
    """
    Scenario: Building a specific UI component
    Agents involved: uiux, mobile
    """
    print("\n" + "="*70)
    print("SCENARIO 4: Building the Comment/Feedback Component")
    print("="*70)
    
    orchestrator = MusicAppOrchestrator()
    
    request = """
    Design and implement the comment system for tracks. It should:
    - Allow timestamped comments (attached to specific points in the audio)
    - Show comments as markers on the waveform
    - Support @mentions of collaborators
    - Allow replies to comments
    - Show comment threads
    - Work offline (queue comments for sync)
    
    What should this look like and how do I build it?
    """
    
    response = orchestrator.process_request(request)
    print(response)
    
    return orchestrator


def scenario_5_security_planning():
    """
    Scenario: Planning security and permissions
    Agents involved: security, backend, collab
    """
    print("\n" + "="*70)
    print("SCENARIO 5: Designing Permission and Sharing System")
    print("="*70)
    
    orchestrator = MusicAppOrchestrator()
    
    request = """
    I need to design the permission system for sharing tracks. Requirements:
    - Tracks can be private, shared with specific users, or shared with groups
    - Users can have different permission levels (view, comment, edit metadata)
    - Need shareable links that can expire
    - Support band/project-level permissions
    - Protect unreleased music from unauthorized access
    
    How should I structure permissions and implement secure sharing?
    """
    
    response = orchestrator.process_request(request)
    print(response)
    
    return orchestrator


def scenario_6_deployment_setup():
    """
    Scenario: Setting up deployment infrastructure
    Agents involved: devops, backend, security
    """
    print("\n" + "="*70)
    print("SCENARIO 6: Setting Up Production Infrastructure")
    print("="*70)
    
    orchestrator = MusicAppOrchestrator()
    
    request = """
    I'm ready to deploy the app to production. Help me set up:
    - Cloud infrastructure for backend API
    - CDN for audio file delivery
    - Database hosting
    - CI/CD pipeline
    - Monitoring and logging
    - Backup strategy
    - SSL/security
    
    I'm starting from scratch. What's the step-by-step plan?
    """
    
    response = orchestrator.process_request(request)
    print(response)
    
    return orchestrator


def scenario_7_cross_cutting_feature():
    """
    Scenario: Feature that touches multiple parts of the system
    Agents involved: Multiple agents working together
    """
    print("\n" + "="*70)
    print("SCENARIO 7: Building the Collaborative Playlist Feature")
    print("="*70)
    
    orchestrator = MusicAppOrchestrator()
    
    request = """
    Implement collaborative playlists where band members can:
    - Create shared playlists
    - Add/remove tracks (with permissions)
    - Reorder tracks
    - See who added what
    - Get notified of changes
    - Add notes/descriptions to playlists
    - Export playlists
    
    This needs design, data modeling, API, mobile implementation, and real-time updates.
    Give me a complete implementation plan.
    """
    
    response = orchestrator.process_request(request)
    print(response)
    
    print("\n📊 Full Agent Coordination:")
    for task in orchestrator.get_task_log():
        print(f"  {task['agent']:10} | {task['task'][:55]}")
    
    return orchestrator


def scenario_8_direct_agent_access():
    """
    Scenario: When you know exactly which agent you need
    """
    print("\n" + "="*70)
    print("SCENARIO 8: Direct Agent Access (No Orchestration)")
    print("="*70)
    
    orchestrator = MusicAppOrchestrator()
    
    # Access specific agent directly
    uiux_agent = orchestrator.agents["uiux"]
    
    print("Asking UI/UX agent directly about button placement...")
    result = uiux_agent.execute(
        "Where should the 'Add Version' button be placed on the track detail screen? "
        "Consider that users need quick access but it shouldn't clutter the player interface."
    )
    
    print(f"\n{result['result']}")
    
    # You can chain direct agent calls
    print("\n" + "-"*70)
    print("Now asking Mobile Dev agent to implement it...")
    
    mobile_agent = orchestrator.agents["mobile"]
    impl_result = mobile_agent.execute(
        f"Based on this design recommendation: {result['result'][:200]}... "
        "Implement the button in React Native with proper styling and animations."
    )
    
    print(f"\n{impl_result['result']}")
    
    return orchestrator


def scenario_9_iterative_refinement():
    """
    Scenario: Iterative development with feedback loops
    """
    print("\n" + "="*70)
    print("SCENARIO 9: Iterative Feature Refinement")
    print("="*70)
    
    orchestrator = MusicAppOrchestrator()
    
    # Initial request
    print("ITERATION 1: Initial Design")
    print("-"*70)
    request1 = "Design a rating system for tracks (1-5 stars)"
    response1 = orchestrator.process_request(request1, verbose=False)
    print(response1[:300] + "...\n")
    
    # Refinement
    print("ITERATION 2: Adding Complexity")
    print("-"*70)
    request2 = """
    Actually, instead of just 1-5 stars, I want separate ratings for:
    - Songwriting/Composition
    - Performance
    - Production Quality
    - Overall
    
    And users should be able to rate different versions differently.
    How does this change the design and data model?
    """
    response2 = orchestrator.process_request(request2, verbose=False)
    print(response2[:300] + "...\n")
    
    # Implementation
    print("ITERATION 3: Implementation Details")
    print("-"*70)
    request3 = "Now give me the React Native component code for this rating interface"
    response3 = orchestrator.process_request(request3, verbose=False)
    print(response3[:300] + "...")
    
    return orchestrator


def interactive_mode():
    """
    Interactive session with the orchestrator
    """
    print("\n" + "="*70)
    print("INTERACTIVE MODE - Music App Development Assistant")
    print("="*70)
    print("\nAsk questions about any aspect of building the app.")
    print("Type 'quit' to exit, 'reset' to clear context, 'log' to see task history.\n")
    
    orchestrator = MusicAppOrchestrator()
    
    while True:
        user_input = input("\n🎵 You: ").strip()
        
        if user_input.lower() in ['quit', 'exit', 'q']:
            print("Goodbye! 🎸")
            break
        
        if user_input.lower() == 'reset':
            orchestrator.reset_all()
            print("✨ Context cleared!")
            continue
        
        if user_input.lower() == 'log':
            print("\n📊 Task History:")
            for i, task in enumerate(orchestrator.get_task_log(), 1):
                print(f"{i}. {task['agent']:10} | {task['task'][:60]}")
            continue
        
        if not user_input:
            continue
        
        response = orchestrator.process_request(user_input, verbose=False)
        print(f"\n🤖 Assistant:\n{response}")


def main():
    """Run example scenarios"""
    
    # Check for API key
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("⚠️  Please set ANTHROPIC_API_KEY environment variable")
        print("   export ANTHROPIC_API_KEY='your-key-here'")
        return
    
    print("""
╔══════════════════════════════════════════════════════════════════╗
║   Music Collaboration App - Orchestrator Agent Examples          ║
║                                                                  ║
║   This demonstrates how to use specialized agents for            ║
║   different aspects of building your music app.                  ║
╚══════════════════════════════════════════════════════════════════╝
    """)
    
    # Choose which scenarios to run
    scenarios = {
        "1": ("Feature Design (Version Tracking)", scenario_1_feature_design),
        "2": ("Technical Implementation (Audio Player)", scenario_2_technical_implementation),
        "3": ("Architecture Decision (Database)", scenario_3_architecture_decision),
        "4": ("UI Component (Comments)", scenario_4_specific_component),
        "5": ("Security Planning (Permissions)", scenario_5_security_planning),
        "6": ("Deployment Setup", scenario_6_deployment_setup),
        "7": ("Complex Feature (Collaborative Playlists)", scenario_7_cross_cutting_feature),
        "8": ("Direct Agent Access", scenario_8_direct_agent_access),
        "9": ("Iterative Refinement", scenario_9_iterative_refinement),
        "i": ("Interactive Mode", interactive_mode)
    }
    
    print("\nAvailable scenarios:")
    for key, (name, _) in scenarios.items():
        print(f"  {key}. {name}")
    print("\nEnter scenario number (or 'all' to run 1-7, 'i' for interactive):")
    
    choice = input("> ").strip().lower()
    
    if choice == 'all':
        for key in ['1', '2', '3', '4', '5', '6', '7']:
            scenarios[key][1]()
            input("\nPress Enter to continue to next scenario...")
    elif choice in scenarios:
        scenarios[choice][1]()
    else:
        print("Invalid choice. Running interactive mode...")
        interactive_mode()


if __name__ == "__main__":
    main()
