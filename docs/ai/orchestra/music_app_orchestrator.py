"""
Music Collaboration App - Specialized Orchestrator Agent System

Domain-specific agents for building a mobile app where songwriters/bands
share WIP audio files, provide feedback, and track versions.
"""
from typing import Dict, List, Any, Optional
from utils.claude_client import ClaudeClient


class BaseAgent:
    """Base class for all agents"""
    def __init__(self, name: str, claude_client: ClaudeClient):
        self.name = name
        self.client = claude_client
        self.conversation_history: List[Dict[str, str]] = []
    
    def get_system_prompt(self) -> str:
        raise NotImplementedError
    
    def execute(self, task: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Execute a task with optional context"""
        # Add context to task if provided
        if context:
            task_with_context = f"{task}\n\nContext: {context}"
        else:
            task_with_context = task
            
        response, self.conversation_history = self.client.chat(
            user_message=task_with_context,
            conversation_history=self.conversation_history,
            system_prompt=self.get_system_prompt(),
            max_tokens=4000
        )
        
        return {
            "agent": self.name,
            "task": task,
            "result": response,
            "status": "success"
        }
    
    def reset(self):
        self.conversation_history = []


# ===== SPECIALIZED AGENTS FOR MUSIC APP =====

class UIUXAgent(BaseAgent):
    """
    Handles UI/UX design, component design, and user flows
    Expertise: Mobile UI patterns, music app interfaces, user interactions
    """
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("UIUXAgent", claude_client)
    
    def get_system_prompt(self) -> str:
        return """You are a UI/UX design specialist for mobile music applications.

Your expertise:
- Mobile UI design patterns (iOS and Android)
- Music player interfaces (Spotify, Apple Music, SoundCloud patterns)
- User flow design and wireframing
- Component libraries (React Native, Flutter)
- Accessibility and usability standards
- Touch interactions and gestures
- Dark mode and theming

Context: You're working on a music collaboration app where songwriters share WIP audio files,
provide feedback, and track versions. The interface should feel familiar to users of mainstream
music apps but with collaboration features.

When designing:
1. Reference familiar patterns from Spotify/Apple Music
2. Consider mobile-first design
3. Prioritize easy navigation between tracks, versions, and feedback
4. Design for both portrait and landscape orientations
5. Consider offline functionality
6. Make feedback/commenting intuitive and non-intrusive"""


class AudioEngineeringAgent(BaseAgent):
    """
    Handles audio processing, file formats, streaming, and playback
    Expertise: Audio codecs, streaming protocols, waveform visualization
    """
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("AudioEngineeringAgent", claude_client)
    
    def get_system_prompt(self) -> str:
        return """You are an audio engineering and digital audio specialist.

Your expertise:
- Audio file formats (WAV, MP3, FLAC, AAC, OGG)
- Audio compression and quality trade-offs
- Streaming protocols and buffering strategies
- Waveform visualization and audio analysis
- Audio playback SDKs and libraries
- Real-time audio processing
- Audio metadata (ID3 tags, etc.)
- Audio quality preservation for WIP music

Context: This is a collaboration app for sharing work-in-progress music. Quality matters,
but so does reasonable file sizes for mobile sharing.

Focus on:
1. Recommending appropriate formats for WIP vs. final masters
2. Efficient streaming for mobile networks
3. Audio visualization for feedback (waveforms, spectrograms)
4. Handling various input formats from different DAWs
5. Maintaining quality through compression"""


class BackendArchitectureAgent(BaseAgent):
    """
    Handles backend architecture, APIs, database design, and cloud infrastructure
    Expertise: System design, API design, data models, scalability
    """
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("BackendArchitectureAgent", claude_client)
    
    def get_system_prompt(self) -> str:
        return """You are a backend architecture specialist focusing on scalable mobile app backends.

Your expertise:
- RESTful and GraphQL API design
- Database schema design (SQL and NoSQL)
- Cloud storage for media files (S3, GCS, CDN)
- Authentication and authorization
- Real-time features (WebSocket, Server-Sent Events)
- Caching strategies
- Microservices vs. monolithic architecture
- Backend frameworks (Node.js, Python, Go)

Context: Building a music collaboration platform where users:
- Upload and share audio files
- Create playlists of WIP tracks
- Comment and rate tracks
- Track version relationships between files
- Connect with other musicians

Key considerations:
1. Efficient media storage and delivery
2. Relationship modeling (tracks, versions, users, playlists)
3. Real-time collaboration features
4. Scalable file uploads/downloads
5. Permission systems (private vs. shared tracks)"""


class MobileDevAgent(BaseAgent):
    """
    Handles mobile development implementation (React Native, Flutter, native)
    Expertise: Cross-platform development, native features, performance
    """
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("MobileDevAgent", claude_client)
    
    def get_system_prompt(self) -> str:
        return """You are a mobile development specialist with expertise in cross-platform apps.

Your expertise:
- React Native and Flutter development
- Native iOS (Swift/SwiftUI) and Android (Kotlin/Jetpack Compose)
- Mobile audio playback libraries
- Offline-first architecture
- Mobile state management (Redux, MobX, Provider, Bloc)
- File management and caching on mobile
- Background audio playback
- Push notifications
- Mobile CI/CD

Context: Building a music collaboration app similar to Spotify in UX but for sharing WIP tracks.

Focus on:
1. Choosing the right framework (React Native vs. Flutter vs. native)
2. Implementing smooth audio playback
3. Offline support for downloaded tracks
4. Background audio handling
5. Efficient local caching
6. Gesture controls and animations"""


class DataModelingAgent(BaseAgent):
    """
    Handles database schema, relationships, and data structures
    Expertise: Entity relationships, data normalization, query optimization
    """
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("DataModelingAgent", claude_client)
    
    def get_system_prompt(self) -> str:
        return """You are a database and data modeling specialist.

Your expertise:
- Relational database design (PostgreSQL, MySQL)
- NoSQL databases (MongoDB, DynamoDB, Firestore)
- Entity-relationship modeling
- Data normalization and denormalization
- Query optimization
- Indexing strategies
- Graph databases for relationship modeling

Context: Music collaboration app with these key entities:
- Users (songwriters, band members)
- Audio tracks (WIP recordings)
- Versions (different recordings/mixes of same song)
- Playlists (collections of tracks)
- Comments/Feedback
- Ratings
- Connections (track relationships, user connections)

Focus on:
1. Designing efficient schemas for complex relationships
2. Modeling version trees/graphs
3. Optimizing for common queries (feed, version history, playlist loading)
4. Handling permissions and privacy
5. Supporting full-text search"""


class CollaborationAgent(BaseAgent):
    """
    Handles collaboration features, notifications, sharing, and social aspects
    Expertise: Social features, real-time updates, notification systems
    """
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("CollaborationAgent", claude_client)
    
    def get_system_prompt(self) -> str:
        return """You are a collaboration and social features specialist.

Your expertise:
- Real-time collaboration features
- Notification systems (push, in-app, email)
- Activity feeds and timelines
- Sharing and permissions
- Comment systems
- @mentions and tagging
- Presence indicators (who's online/listening)
- Collaborative playlists

Context: Musicians collaborating on WIP tracks need to:
- Share tracks privately or with groups
- Provide timestamped feedback
- Get notified of new versions/comments
- See activity from their collaborators
- Track changes and updates

Focus on:
1. Designing intuitive sharing workflows
2. Notification strategies (when to notify, what to include)
3. Real-time vs. async collaboration patterns
4. Comment threading and timestamping
5. Version update notifications"""


class SecurityPrivacyAgent(BaseAgent):
    """
    Handles security, privacy, authentication, and data protection
    Expertise: Auth systems, encryption, privacy compliance
    """
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("SecurityPrivacyAgent", claude_client)
    
    def get_system_prompt(self) -> str:
        return """You are a security and privacy specialist for mobile applications.

Your expertise:
- Authentication systems (OAuth, JWT, session management)
- Authorization and access control
- Encryption (at rest and in transit)
- Privacy compliance (GDPR, CCPA)
- Secure file storage and sharing
- API security
- Mobile security best practices
- Copyright and IP protection

Context: Musicians sharing unreleased work-in-progress recordings need:
- Secure authentication
- Fine-grained access controls
- Private sharing options
- Protection of unpublished music
- Copyright considerations

Focus on:
1. Secure authentication flows
2. Granular permission systems
3. Encrypted file storage
4. Secure sharing links with expiration
5. Protecting intellectual property"""


class DevOpsAgent(BaseAgent):
    """
    Handles deployment, CI/CD, monitoring, and infrastructure
    Expertise: Cloud platforms, deployment pipelines, monitoring
    """
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("DevOpsAgent", claude_client)
    
    def get_system_prompt(self) -> str:
        return """You are a DevOps and infrastructure specialist.

Your expertise:
- Cloud platforms (AWS, GCP, Azure)
- CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins)
- Container orchestration (Docker, Kubernetes)
- Monitoring and logging (Datadog, Sentry, CloudWatch)
- CDN configuration
- Database management and backups
- Auto-scaling strategies
- Cost optimization

Context: Deploying a media-heavy mobile app backend with:
- Large file storage and delivery
- Real-time features
- High availability requirements
- Variable traffic patterns

Focus on:
1. Choosing appropriate cloud services
2. Setting up efficient CDN for audio delivery
3. Monitoring app performance
4. Database backup strategies
5. Cost-effective scaling"""


# ===== MUSIC APP ORCHESTRATOR =====

class MusicAppOrchestrator:
    """
    Orchestrator specialized for the music collaboration app
    """
    def __init__(self, api_key: Optional[str] = None):
        self.client = ClaudeClient(api_key)
        
        # Initialize domain-specific agents
        self.agents = {
            "uiux": UIUXAgent(self.client),
            "audio": AudioEngineeringAgent(self.client),
            "backend": BackendArchitectureAgent(self.client),
            "mobile": MobileDevAgent(self.client),
            "data": DataModelingAgent(self.client),
            "collab": CollaborationAgent(self.client),
            "security": SecurityPrivacyAgent(self.client),
            "devops": DevOpsAgent(self.client)
        }
        
        self.conversation_history: List[Dict[str, str]] = []
        self.task_log: List[Dict[str, Any]] = []
        self.project_context = self._get_project_context()
    
    def _get_project_context(self) -> str:
        """Project-specific context for all agents"""
        return """
PROJECT: Music Collaboration Mobile App

PURPOSE: Enable songwriters and band members to share work-in-progress audio files,
provide feedback, and track versions.

KEY FEATURES:
1. Audio file sharing (WIP recordings)
2. Playlist creation and management
3. Rating and commenting system
4. Version tracking and relationships
5. User connections (bands, collaborators)
6. Familiar music app interface (Spotify-like)

TARGET USERS: Independent musicians, songwriters, bands

PLATFORM: Mobile-first (iOS and Android)

UNIQUE ASPECTS:
- Focus on WIP/unreleased music
- Version relationship tracking
- Timestamped feedback on audio
- Private sharing and collaboration
"""
    
    def get_orchestrator_prompt(self) -> str:
        return f"""You are the orchestrator for a specialized music collaboration app development team.

{self.project_context}

AVAILABLE AGENTS:
- uiux: UI/UX design, mobile interfaces, user flows, wireframes
- audio: Audio processing, formats, streaming, waveform visualization
- backend: API design, architecture, cloud infrastructure, scalability
- mobile: Mobile app implementation (React Native/Flutter/native)
- data: Database design, schema modeling, relationships
- collab: Collaboration features, notifications, sharing, social features
- security: Authentication, permissions, encryption, privacy
- devops: Deployment, CI/CD, monitoring, infrastructure

DELEGATION GUIDELINES:
1. UI/design questions → uiux
2. Audio format/playback questions → audio
3. API/database/architecture questions → backend + data
4. Mobile implementation → mobile (may need audio for audio libs)
5. Sharing/notification features → collab (may need security)
6. User management/permissions → security + backend
7. Deployment/hosting → devops + backend
8. Complex features → multiple agents (design, implement, secure, deploy)

For user requests, analyze:
1. What aspect of the app is being addressed?
2. Which agents have relevant expertise?
3. Are multiple phases needed? (design → implement → deploy)
4. Dependencies between agents?

Respond with JSON:
{{
  "analysis": "Your understanding of the request",
  "plan": [
    {{
      "agent": "agent_name",
      "task": "specific task description",
      "order": 1,
      "depends_on": [] 
    }}
  ]
}}

For simple questions, respond directly without delegation."""
    
    def analyze_request(self, user_request: str) -> Dict[str, Any]:
        """Analyze request and create execution plan"""
        analysis_prompt = f"""Analyze this request for the music collaboration app:

User Request: {user_request}

Consider:
- Which aspect(s) of the app does this involve?
- Which agents should handle this?
- Should tasks be sequential or can some run in parallel?
- What context do agents need?

Provide your analysis and delegation plan in JSON format."""
        
        response, self.conversation_history = self.client.chat(
            user_message=analysis_prompt,
            conversation_history=self.conversation_history,
            system_prompt=self.get_orchestrator_prompt()
        )
        
        # Parse JSON response
        try:
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            else:
                json_str = response
            
            import json
            plan = json.loads(json_str)
            return plan
        except:
            return {
                "analysis": "Simple request",
                "plan": [],
                "direct_response": response
            }
    
    def execute_plan(self, plan: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Execute the delegation plan"""
        if "direct_response" in plan:
            return [{
                "agent": "orchestrator",
                "result": plan["direct_response"],
                "status": "success"
            }]
        
        results = []
        tasks = sorted(plan.get("plan", []), key=lambda x: x.get("order", 0))
        
        # Build context from previous results
        accumulated_context = {"project": self.project_context}
        
        for task_info in tasks:
            agent_name = task_info.get("agent")
            task_description = task_info.get("task")
            depends_on = task_info.get("depends_on", [])
            
            if agent_name not in self.agents:
                results.append({
                    "agent": agent_name,
                    "task": task_description,
                    "result": f"Error: Unknown agent '{agent_name}'",
                    "status": "error"
                })
                continue
            
            # Add results from dependencies to context
            task_context = accumulated_context.copy()
            if depends_on:
                task_context["previous_results"] = {
                    dep: next((r["result"] for r in results if r["agent"] == dep), None)
                    for dep in depends_on
                }
            
            # Execute task
            agent = self.agents[agent_name]
            result = agent.execute(task_description, context=task_context)
            results.append(result)
            
            # Update accumulated context
            accumulated_context[agent_name] = result["result"]
            
            # Log
            self.task_log.append({
                "agent": agent_name,
                "task": task_description,
                "status": result["status"]
            })
        
        return results
    
    def synthesize_results(self, plan: Dict[str, Any], results: List[Dict[str, Any]]) -> str:
        """Synthesize results into coherent response"""
        if len(results) == 1 and results[0]["agent"] == "orchestrator":
            return results[0]["result"]
        
        synthesis_prompt = f"""Synthesize these agent results into a comprehensive response:

Original Request Analysis: {plan.get('analysis', 'N/A')}

Agent Results:
"""
        for result in results:
            synthesis_prompt += f"\n=== {result['agent'].upper()} ===\n{result['result']}\n"
        
        synthesis_prompt += """
Provide a clear, actionable response that:
1. Directly addresses the user's request
2. Integrates insights from all agents
3. Highlights any important considerations or trade-offs
4. Suggests next steps if applicable
"""
        
        response, _ = self.client.chat(
            user_message=synthesis_prompt,
            conversation_history=[],  # Fresh context for synthesis
            system_prompt="You are synthesizing technical recommendations from specialized agents for a music collaboration app. Create a clear, comprehensive response."
        )
        
        return response
    
    def process_request(self, user_request: str, verbose: bool = True) -> str:
        """Main method to process requests"""
        if verbose:
            print(f"\n🎵 Processing: {user_request}\n")
        
        # Analyze and plan
        if verbose:
            print("📋 Analyzing request...")
        plan = self.analyze_request(user_request)
        
        if verbose:
            print(f"Analysis: {plan.get('analysis', 'Direct response')}")
            if plan.get('plan'):
                print(f"📊 Delegating to {len(plan['plan'])} agent(s)\n")
        
        # Execute
        results = self.execute_plan(plan)
        
        # Synthesize
        if verbose:
            print("✨ Synthesizing results...\n")
        final_response = self.synthesize_results(plan, results)
        
        return final_response
    
    def reset_all(self):
        """Reset all agents"""
        self.conversation_history = []
        self.task_log = []
        for agent in self.agents.values():
            agent.reset()
    
    def get_task_log(self) -> List[Dict[str, Any]]:
        """Get execution log"""
        return self.task_log


if __name__ == "__main__":
    # Example usage
    orchestrator = MusicAppOrchestrator()
    
    # Example request
    request = """
    I need to design the main feed/home screen where users see updates from their
    collaborators - new tracks, comments, and versions. What should this look like
    and how should it work?
    """
    
    response = orchestrator.process_request(request)
    print("\n" + "="*60)
    print("RESPONSE:")
    print("="*60)
    print(response)
