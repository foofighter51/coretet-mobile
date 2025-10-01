# Music Collaboration App - Orchestrator Agent System Guide

## Overview

This orchestrator system provides **8 specialized agents** tailored for building your music collaboration mobile app. Each agent is an expert in a specific domain, and the orchestrator intelligently delegates tasks to the right agents.

## 🎯 Agent Roster

### 1. **UIUXAgent** (`uiux`)
**Expertise**: Mobile UI/UX design, music app interfaces, user flows

**Use for**:
- Screen layouts and wireframes
- User interaction patterns
- Navigation flows
- Component design (buttons, players, lists)
- Familiar music app patterns (Spotify-like UX)
- Accessibility and usability
- Dark mode and theming

**Example questions**:
- "Design the main feed screen layout"
- "How should the playlist creation flow work?"
- "What gestures should control the audio player?"

---

### 2. **AudioEngineeringAgent** (`audio`)
**Expertise**: Audio formats, streaming, playback, waveform visualization

**Use for**:
- Audio file format recommendations
- Streaming strategies
- Waveform generation and display
- Audio quality vs. file size trade-offs
- Playback library recommendations
- Handling different DAW exports
- Audio metadata

**Example questions**:
- "What audio format should we use for WIP tracks?"
- "How do I generate waveforms efficiently?"
- "Best approach for background audio playback?"

---

### 3. **BackendArchitectureAgent** (`backend`)
**Expertise**: API design, system architecture, cloud infrastructure

**Use for**:
- REST/GraphQL API design
- System architecture decisions
- Cloud service selection (AWS, GCP, Azure)
- Scalability planning
- Microservices vs. monolithic
- CDN setup for media
- Caching strategies

**Example questions**:
- "Design the API endpoints for track management"
- "How should I architect the backend for scale?"
- "What cloud services do I need?"

---

### 4. **MobileDevAgent** (`mobile`)
**Expertise**: React Native, Flutter, native iOS/Android development

**Use for**:
- Framework selection (React Native vs. Flutter vs. native)
- Mobile code implementation
- State management
- Offline-first patterns
- Background tasks
- Mobile audio libraries
- Platform-specific features

**Example questions**:
- "Should I use React Native or Flutter?"
- "Implement an audio player component"
- "How do I handle offline mode?"

---

### 5. **DataModelingAgent** (`data`)
**Expertise**: Database schema, entity relationships, query optimization

**Use for**:
- Database schema design
- Relationship modeling (users, tracks, versions, playlists)
- SQL vs. NoSQL decisions
- Version tree/graph structures
- Query optimization
- Full-text search implementation

**Example questions**:
- "Design the database schema for tracks and versions"
- "How should I model the version relationship tree?"
- "Optimize queries for the activity feed"

---

### 6. **CollaborationAgent** (`collab`)
**Expertise**: Real-time features, notifications, sharing, social aspects

**Use for**:
- Notification systems (push, in-app, email)
- Activity feeds
- Sharing workflows
- Comment systems
- Real-time updates (WebSocket)
- @mentions and tagging
- Presence indicators

**Example questions**:
- "Design the notification system"
- "How should sharing permissions work?"
- "Implement real-time comment updates"

---

### 7. **SecurityPrivacyAgent** (`security`)
**Expertise**: Authentication, authorization, encryption, privacy

**Use for**:
- Auth system design (OAuth, JWT)
- Permission models
- Encryption (data at rest/transit)
- Secure file sharing
- Privacy compliance (GDPR, CCPA)
- API security
- Protecting unreleased music

**Example questions**:
- "Design the authentication flow"
- "How do I implement secure file sharing?"
- "What permissions system should I use?"

---

### 8. **DevOpsAgent** (`devops`)
**Expertise**: Deployment, CI/CD, monitoring, infrastructure

**Use for**:
- CI/CD pipeline setup
- Cloud infrastructure (Kubernetes, Docker)
- Monitoring and logging
- Database backups
- Auto-scaling
- Cost optimization
- CDN configuration

**Example questions**:
- "Set up a CI/CD pipeline"
- "What monitoring tools should I use?"
- "How do I configure auto-scaling?"

---

## 🎼 When to Use Which Agents

### Feature Development Lifecycle

```
DESIGN → ARCHITECT → IMPLEMENT → SECURE → DEPLOY

uiux → backend/data → mobile/audio → security → devops
```

### Common Task → Agent Mapping

| Task Type | Primary Agent(s) | Supporting Agent(s) |
|-----------|------------------|---------------------|
| **Screen Design** | uiux | mobile |
| **API Design** | backend | data, security |
| **Audio Playback** | audio, mobile | backend (streaming) |
| **Database Schema** | data | backend |
| **User Auth** | security | backend |
| **Sharing Features** | collab, security | backend, uiux |
| **Notifications** | collab | backend, mobile |
| **Version Tracking** | data, uiux | backend, collab |
| **Deployment** | devops | backend, security |
| **Performance** | backend, mobile | audio, devops |

---

## 🚀 Usage Patterns

### Pattern 1: Simple Question (Single Agent)
```python
orchestrator = MusicAppOrchestrator()

# The orchestrator automatically routes to the right agent
response = orchestrator.process_request(
    "What audio format should I use for WIP tracks?"
)
# Routes to: audio agent
```

### Pattern 2: Feature Design (Multiple Agents)
```python
response = orchestrator.process_request(
    """Design the version tracking feature including:
    - UI/UX for displaying version history
    - Database schema for version relationships
    - API endpoints for version management"""
)
# Routes to: uiux → data → backend
```

### Pattern 3: Full Feature Implementation
```python
response = orchestrator.process_request(
    """Implement collaborative playlists with real-time updates.
    I need the complete design, database schema, API, mobile code,
    and deployment considerations."""
)
# Routes to: uiux → data → backend → collab → mobile → devops
```

### Pattern 4: Direct Agent Access
```python
# When you know exactly which agent you need
orchestrator = MusicAppOrchestrator()
audio_agent = orchestrator.agents["audio"]

result = audio_agent.execute(
    "Recommend the best library for waveform visualization in React Native"
)
print(result["result"])
```

### Pattern 5: Iterative Development
```python
orchestrator = MusicAppOrchestrator()

# Initial design
orchestrator.process_request("Design a rating system")

# Refine (maintains context)
orchestrator.process_request("Add separate ratings for songwriting and production")

# Implement (still has context)
orchestrator.process_request("Give me the React Native code for this")

# Reset when switching topics
orchestrator.reset_all()
```

---

## 💡 Best Practices

### 1. **Be Specific About Context**
```python
# ❌ Vague
"How should I implement comments?"

# ✅ Specific
"Implement a comment system for audio tracks with timestamped comments,
@mentions, and replies. Using React Native."
```

### 2. **Request Multiple Perspectives**
```python
"I'm deciding between React Native and Flutter for the mobile app.
Consider: audio playback requirements, offline support, development speed,
and native performance. What do you recommend?"

# This will engage: mobile, audio, and possibly backend agents
```

### 3. **Break Down Complex Features**
```python
# Instead of one massive request:
orchestrator.process_request("Build the entire app")

# Break it down:
orchestrator.process_request("Design the core data model")
orchestrator.reset_all()
orchestrator.process_request("Design the authentication system")
orchestrator.reset_all()
orchestrator.process_request("Design the audio player interface")
```

### 4. **Use Context Effectively**
```python
# Agents maintain conversation history
orchestrator.process_request("Design the playlist screen")
orchestrator.process_request("How does this integrate with the version tracking?")
# Second question has context from first
```

### 5. **Check Task Logs**
```python
response = orchestrator.process_request("...")

# See which agents were used
for task in orchestrator.get_task_log():
    print(f"{task['agent']}: {task['task']}")
```

---

## 🎯 Example Development Workflow

### Week 1: Architecture & Design
```python
orchestrator = MusicAppOrchestrator()

# 1. Define data model
orchestrator.process_request("""
Design the complete database schema for:
- Users and bands
- Audio tracks
- Versions and relationships
- Playlists
- Comments and ratings
""")

# 2. Define API structure
orchestrator.process_request("""
Design the REST API endpoints for all CRUD operations
on the data model we just defined
""")

# 3. Plan security
orchestrator.process_request("""
Design the authentication and permission system
for the API we just designed
""")
```

### Week 2: UI Design
```python
orchestrator.reset_all()

# Design key screens
screens = [
    "Main feed/home screen",
    "Track detail screen with version history",
    "Audio player with waveform",
    "Playlist management screen",
    "User profile and settings"
]

for screen in screens:
    orchestrator.process_request(f"Design the {screen}")
    orchestrator.reset_all()  # Fresh context for each screen
```

### Week 3: Implementation
```python
orchestrator.reset_all()

# Implement core features
orchestrator.process_request("""
Implement the audio player component in React Native with:
- Waveform visualization
- Playback controls
- Background audio support
- Timestamp markers for comments
""")

orchestrator.reset_all()

orchestrator.process_request("""
Implement the version tree visualization showing
relationships between different recordings
""")
```

### Week 4: Deployment
```python
orchestrator.reset_all()

orchestrator.process_request("""
Set up the complete production infrastructure:
- Backend API hosting
- Database
- File storage and CDN
- CI/CD pipeline
- Monitoring
""")
```

---

## 🔧 Customization

### Adding a Custom Agent

```python
from music_app_orchestrator import BaseAgent, ClaudeClient

class AnalyticsAgent(BaseAgent):
    """Handles analytics and user tracking"""
    def __init__(self, claude_client: ClaudeClient):
        super().__init__("AnalyticsAgent", claude_client)
    
    def get_system_prompt(self) -> str:
        return """You are an analytics specialist.
        
        Focus on:
        - User behavior tracking
        - Engagement metrics
        - A/B testing
        - Analytics tools (Mixpanel, Amplitude)
        - Privacy-compliant tracking
        
        Context: Music collaboration app analytics"""

# Add to orchestrator
orchestrator = MusicAppOrchestrator()
orchestrator.agents["analytics"] = AnalyticsAgent(orchestrator.client)
```

### Modifying Agent Behavior

```python
# Adjust an existing agent's system prompt
audio_agent = orchestrator.agents["audio"]

# Add project-specific context
custom_prompt = audio_agent.get_system_prompt() + """

ADDITIONAL CONTEXT:
- We're targeting iOS and Android
- Files will be mostly 24-bit WAV from Logic Pro and Ableton
- Average file size: 50MB
- Expect 100-1000 concurrent users streaming
"""

# Use in execution
result = audio_agent.execute("Recommend streaming strategy", 
                            context={"custom_prompt": custom_prompt})
```

---

## 📊 Agent Communication Patterns

### Sequential (Pipeline)
```
uiux → data → backend → mobile
```
Each agent uses output from previous agent.

**Example**: "Design and implement the playlist feature"

### Parallel (Independent)
```
     ┌→ mobile
     ├→ backend
     └→ devops
```
Agents work independently on different aspects.

**Example**: "I need mobile implementation, API design, and deployment plan"

### Collaborative (Interdependent)
```
collab ←→ security ←→ backend
```
Agents reference each other's work.

**Example**: "Design secure sharing with real-time notifications"

---

## 🎓 Learning Resources

The orchestrator can help you learn:

```python
# Learning questions
orchestrator.process_request("""
I'm new to React Native. Explain the key concepts I need to know
to build a music player app.
""")

orchestrator.process_request("""
Explain how WebSockets work for real-time features, with examples
specific to collaborative music apps.
""")

orchestrator.process_request("""
Compare different approaches to version tracking in databases,
with pros/cons for each.
""")
```

---

## 🐛 Troubleshooting

### Issue: Orchestrator routes to wrong agent
**Solution**: Be more specific in your request
```python
# Instead of: "How do I build this?"
# Say: "Design the UI for..." or "Implement the backend for..."
```

### Issue: Response lacks technical depth
**Solution**: Ask for specific implementation details
```python
"Give me the detailed React Native code with comments"
"Provide SQL schema with indexes and constraints"
```

### Issue: Agents contradict each other
**Solution**: Ask for reconciliation
```python
orchestrator.process_request("""
The backend agent recommended PostgreSQL but the data agent
suggested MongoDB. Help me choose based on our specific needs.
""")
```

---

## 📝 Quick Reference

### Common Commands
```python
# Process request
orchestrator.process_request("Your question")

# Reset context
orchestrator.reset_all()

# View task history
orchestrator.get_task_log()

# Direct agent access
orchestrator.agents["uiux"].execute("Question")

# Disable verbose output
orchestrator.process_request("Question", verbose=False)
```

### Agent Shortcuts
- **uiux**: Design, UI, UX, screens, components
- **audio**: Audio formats, streaming, waveforms, playback
- **backend**: API, architecture, cloud, infrastructure
- **mobile**: React Native, Flutter, iOS, Android, implementation
- **data**: Database, schema, models, queries
- **collab**: Sharing, notifications, real-time, social
- **security**: Auth, permissions, encryption, privacy
- **devops**: Deployment, CI/CD, monitoring, scaling

---

## 🚀 Getting Started Checklist

- [ ] Set `ANTHROPIC_API_KEY` environment variable
- [ ] Run `python music_app_examples.py` to see examples
- [ ] Try interactive mode: choose option 'i'
- [ ] Start with architecture: "Design the data model"
- [ ] Move to UI: "Design the main screens"
- [ ] Implement features: "Build the audio player"
- [ ] Deploy: "Set up production infrastructure"

---

## 💬 Need Help?

The orchestrator itself can help:

```python
orchestrator.process_request("""
I'm stuck on [specific problem]. What approach should I take
and which parts of the system need to be considered?
""")
```

Remember: The orchestrator maintains conversation context, so you can have
back-and-forth discussions to refine ideas and implementations.
